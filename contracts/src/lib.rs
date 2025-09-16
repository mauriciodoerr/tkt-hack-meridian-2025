#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contractevent, contracterror, Address, Env, Symbol, String, symbol_short, token};
use token::TokenClient;

// Definir erros do contrato
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    FeeRateExceeds10Percent = 1,
    AmountMustBePositive = 2,
    ContractNotInitialized = 3,
    InsufficientBalanceFromSender = 4,
    InsufficientAllowance = 5,
    EventNotFound = 6,
    EventNotActive = 7,
    NotEventOrganizer = 8,
    EventNameTooLong = 9,
    EventAlreadyExists = 10,
    AlreadyInitialized = 11,
    EventStillActive = 12,
    WalletNotRegistered = 13,
    WalletAlreadyRegistered = 14,
    OrganizerCannotRegister = 15,
}

// Estrutura para representar um evento/festival
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Event {
    pub id: u64,
    pub name: String,
    pub organizer: Address,
    pub fee_rate: u32, // Taxa em basis points (500 = 5%)
    pub is_active: bool,
    pub created_at: u64,
    pub total_volume: i128, // Volume total de transações
}

// Evento emitido quando um evento é criado
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EventCreated {
    pub event_id: u64,
    pub name: String,
    pub organizer: Address,
    pub fee_rate: u32,
}

// Evento emitido quando um pagamento é realizado
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentEvent {
    pub event_id: u64,
    pub from: Address,
    pub to: Address,
    pub fee_payer: Address,
    pub amount: i128,
    pub fee_amount: i128,
    pub fee_rate: u32,
}

// Dados de configuração do contrato
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractConfig {
    pub default_fee_rate: u32, // Taxa padrão em basis points (500 = 5%)
    pub admin: Address,
    pub next_event_id: u64, // Próximo ID disponível para evento
    pub token_address: Address, // Endereço do contrato de token
}

// Chaves para armazenamento de dados
const CONFIG: Symbol = symbol_short!("CONFIG");

#[contract]
pub struct EventPaymentContract;

#[contractimpl]
impl EventPaymentContract {
    // =====================================
    // FUNÇÕES DE INICIALIZAÇÃO E CONFIGURAÇÃO
    // =====================================

    /// Inicializa o contrato com taxa padrão, admin e token
    pub fn initialize(env: Env, admin: Address, default_fee_rate: u32, token_address: Address) -> Result<(), ContractError> {
        admin.require_auth();

        // Verifica se o contrato já foi inicializado
        if env.storage().instance().has(&CONFIG) {
            return Err(ContractError::AlreadyInitialized);
        }

        if default_fee_rate > 1000 {
            return Err(ContractError::FeeRateExceeds10Percent);
        }

        let config = ContractConfig {
            default_fee_rate,
            admin,
            next_event_id: 1,
            token_address,
        };

        env.storage().instance().set(&CONFIG, &config);
        Ok(())
    }

    /// Consulta configuração do contrato (apenas admin)
    pub fn get_config(env: Env, admin: Address) -> Result<ContractConfig, ContractError> {
        admin.require_auth();

        let config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        // Verificar se quem está chamando é realmente o admin
        if admin != config.admin {
            return Err(ContractError::NotEventOrganizer); // Reutilizando erro existente
        }

        Ok(config)
    }

    /// Atualiza taxa padrão (apenas admin)
    pub fn update_default_fee_rate(env: Env, admin: Address, new_fee_rate: u32) -> Result<(), ContractError> {
        admin.require_auth();

        let mut config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        // Verificar se quem está chamando é realmente o admin
        if admin != config.admin {
            return Err(ContractError::NotEventOrganizer); // Reutilizando erro existente
        }

        if new_fee_rate > 1000 {
            return Err(ContractError::FeeRateExceeds10Percent);
        }

        config.default_fee_rate = new_fee_rate;
        env.storage().instance().set(&CONFIG, &config);

        Ok(())
    }

    // =====================================
    // FUNÇÕES DE GESTÃO DE EVENTOS
    // =====================================

    /// Cria um novo evento/festival
    pub fn create_event(
        env: Env,
        organizer: Address,
        name: String,
        fee_rate: Option<u32>
    ) -> Result<u64, ContractError> {
        organizer.require_auth();

        // Validar nome do evento
        if name.len() > 50 {
            return Err(ContractError::EventNameTooLong);
        }

        // Verificar se já existe evento com esse nome
        let name_key = Self::event_name_key(&name);
        if env.storage().persistent().has(&name_key) {
            return Err(ContractError::EventAlreadyExists);
        }

        let mut config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        // Usar taxa personalizada ou padrão
        let event_fee_rate = fee_rate.unwrap_or(config.default_fee_rate);
        if event_fee_rate > 1000 {
            return Err(ContractError::FeeRateExceeds10Percent);
        }

        let event_id = config.next_event_id;
        let current_time = env.ledger().timestamp();

        let event = Event {
            id: event_id,
            name: name.clone(),
            organizer: organizer.clone(),
            fee_rate: event_fee_rate,
            is_active: true,
            created_at: current_time,
            total_volume: 0,
        };

        // Armazenar evento
        let event_key = Self::event_key(event_id);
        env.storage().persistent().set(&event_key, &event);

        // Mapear nome para ID
        env.storage().persistent().set(&name_key, &event_id);

        // Atualizar próximo ID
        config.next_event_id += 1;
        env.storage().instance().set(&CONFIG, &config);

        // Emitir evento
        EventCreated {
            event_id,
            name,
            organizer,
            fee_rate: event_fee_rate,
        }.publish(&env);

        Ok(event_id)
    }

    /// Cria um evento e autoriza automaticamente o contrato a gastar tokens do organizador para taxas
    pub fn create_event_with_allowance(
        env: Env,
        organizer: Address,
        name: String,
        fee_rate: Option<u32>,
        max_allowance: i128
    ) -> Result<u64, ContractError> {
        // A autenticação será feita dentro de create_event()

        if max_allowance <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        // Criar o evento primeiro (isso já faz organizer.require_auth())
        let event_id = Self::create_event(env.clone(), organizer.clone(), name, fee_rate)?;

        // Obter configuração para acessar token
        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token = TokenClient::new(&env, &config.token_address);

        // Dar allowance para o contrato gastar tokens do organizador
        token.approve(&organizer, &env.current_contract_address(), &max_allowance, &3110400);

        Ok(event_id)
    }

    /// Ativa ou desativa um evento (apenas organizador)
    pub fn set_event_status(env: Env, event_id: u64, is_active: bool) -> Result<(), ContractError> {
        let mut event = Self::get_event(env.clone(), event_id)?;

        // Apenas organizador do evento pode alterar status
        event.organizer.require_auth();

        event.is_active = is_active;

        let event_key = Self::event_key(event_id);
        env.storage().persistent().set(&event_key, &event);

        Ok(())
    }

    /// Atualiza taxa de um evento específico (apenas organizador)
    /// TODO: Função privada para evitar que seja chamada publicamente neste momento
    fn update_event_fee_rate(env: Env, event_id: u64, new_fee_rate: u32) -> Result<(), ContractError> {
        let mut event = Self::get_event(env.clone(), event_id)?;

        // Apenas organizador do evento pode alterar taxa
        event.organizer.require_auth();

        if new_fee_rate > 1000 {
            return Err(ContractError::FeeRateExceeds10Percent);
        }

        event.fee_rate = new_fee_rate;
        let event_key = Self::event_key(event_id);
        env.storage().persistent().set(&event_key, &event);

        Ok(())
    }

    // =====================================
    // FUNÇÕES DE CONSULTA
    // =====================================

    /// Consulta informações de um evento
    pub fn get_event(env: Env, event_id: u64) -> Result<Event, ContractError> {
        let event_key = Self::event_key(event_id);
        env.storage().persistent().get(&event_key)
            .ok_or(ContractError::EventNotFound)
    }

    /// Consulta evento por nome
    pub fn get_event_by_name(env: Env, name: String) -> Result<Event, ContractError> {
        let name_key = Self::event_name_key(&name);
        let event_id: u64 = env.storage().persistent().get(&name_key)
            .ok_or(ContractError::EventNotFound)?;

        Self::get_event(env, event_id)
    }

    /// Lista todos os eventos (limitado para evitar problemas de gas)
    pub fn list_events(env: Env, limit: u32) -> Result<soroban_sdk::Vec<Event>, ContractError> {
        let config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        let mut events = soroban_sdk::Vec::new(&env);
        let max_limit = if limit > 50 { 50 } else { limit };

        for i in 1..config.next_event_id {
            if events.len() >= max_limit {
                break;
            }

            let event_key = Self::event_key(i);
            if let Some(event) = env.storage().persistent().get::<(&str, u64), Event>(&event_key) {
                events.push_back(event);
            }
        }

        Ok(events)
    }


    /// Consulta taxas acumuladas de um evento
    pub fn get_event_fees(env: Env, event_id: u64) -> i128 {
        let fee_key = Self::event_fee_key(event_id);
        env.storage().persistent().get(&fee_key).unwrap_or(0)
    }

    /// Consulta o allowance do fee_payer para o contrato
    pub fn get_fee_authorization(env: Env, fee_payer: Address) -> i128 {
        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token = TokenClient::new(&env, &config.token_address);
        token.allowance(&fee_payer, &env.current_contract_address())
    }

    // =====================================
    // FUNÇÕES DE REGISTRO DE CARTEIRAS
    // =====================================

    /// Registra uma carteira para participar de um evento (organizador paga taxa)
    pub fn register_wallet_for_event(env: Env, event_id: u64, wallet: Address) -> Result<(), ContractError> {
        // Verificar se evento existe e está ativo
        let event = Self::get_event(env.clone(), event_id)?;
        if !event.is_active {
            return Err(ContractError::EventNotActive);
        }

        // Organizador não pode se registrar no próprio evento
        if wallet == event.organizer {
            return Err(ContractError::OrganizerCannotRegister);
        }

        // Organizador autoriza a operação (ele paga a taxa)
        event.organizer.require_auth();

        let registration_key = Self::wallet_registration_key(event_id, &wallet);

        // Verificar se já está registrada
        if env.storage().persistent().has(&registration_key) {
            return Err(ContractError::WalletAlreadyRegistered);
        }

        // Registrar carteira
        env.storage().persistent().set(&registration_key, &true);
        Ok(())
    }

    /// Remove registro de uma carteira de um evento (organizador paga taxa)
    pub fn unregister_wallet_from_event(env: Env, event_id: u64, wallet: Address) -> Result<(), ContractError> {
        // Verificar se evento existe para obter organizador
        let event = Self::get_event(env.clone(), event_id)?;

        // Organizador autoriza a operação (ele paga a taxa)
        event.organizer.require_auth();

        let registration_key = Self::wallet_registration_key(event_id, &wallet);

        // Verificar se está registrada
        if !env.storage().persistent().has(&registration_key) {
            return Err(ContractError::WalletNotRegistered);
        }

        // Remover registro
        env.storage().persistent().remove(&registration_key);
        Ok(())
    }

    /// Verifica se uma carteira está registrada para um evento
    pub fn is_wallet_registered(env: Env, event_id: u64, wallet: Address) -> bool {
        let registration_key = Self::wallet_registration_key(event_id, &wallet);
        env.storage().persistent().has(&registration_key)
    }

    // =====================================
    // FUNÇÕES DE PAGAMENTO
    // =====================================

    /// Realiza pagamento para um evento específico com organizador pagando taxa
    pub fn event_payment(
        env: Env,
        event_id: u64,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), ContractError> {
        from.require_auth();

        if amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        // Verificar se evento existe e está ativo
        let mut event = Self::get_event(env.clone(), event_id)?;
        if !event.is_active {
            return Err(ContractError::EventNotActive);
        }

        // Verificar se ambas as carteiras estão registradas no evento
        if !Self::is_wallet_registered(env.clone(), event_id, from.clone()) {
            return Err(ContractError::WalletNotRegistered);
        }
        if !Self::is_wallet_registered(env.clone(), event_id, to.clone()) {
            return Err(ContractError::WalletNotRegistered);
        }

        // Obter configuração para acessar token
        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token = TokenClient::new(&env, &config.token_address);

        // Verificar saldo do remetente
        let from_balance = token.balance(&from);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalanceFromSender);
        }

        // Calcula a taxa usando a taxa específica do evento
        let fee_amount = (amount * event.fee_rate as i128) / 1000;
        let net_amount = amount - fee_amount;

        // Verificar se organizador tem allowance suficiente para pagar a taxa
        let organizer_allowance = token.allowance(&event.organizer, &env.current_contract_address());
        if organizer_allowance < fee_amount {
            return Err(ContractError::InsufficientAllowance);
        }

        // Realizar transferências
        // 1. Transfere valor total do remetente para o contrato
        token.transfer(&from, &env.current_contract_address(), &amount);

        // 2. Transfere valor líquido do contrato para o destinatário
        token.transfer(&env.current_contract_address(), &to, &net_amount);

        // 3. Registrar taxa acumulada para posterior saque
        let fee_key = Self::event_fee_key(event_id);
        let current_fees: i128 = env.storage().persistent().get(&fee_key).unwrap_or(0);
        env.storage().persistent().set(&fee_key, &(current_fees + fee_amount));

        // Atualizar volume total do evento
        event.total_volume += amount;
        let event_key = Self::event_key(event_id);
        env.storage().persistent().set(&event_key, &event);

        // Emite evento
        PaymentEvent {
            event_id,
            from: from.clone(),
            to: to.clone(),
            fee_payer: event.organizer.clone(), // Organizador paga a taxa
            amount,
            fee_amount,
            fee_rate: event.fee_rate,
        }.publish(&env);

        Ok(())
    }

    /// Realiza pagamento geral (sem evento específico) - mantém compatibilidade
    pub fn payment_with_third_party_fee(
        env: Env,
        from: Address,
        to: Address,
        fee_payer: Address,
        amount: i128,
    ) -> Result<(), ContractError> {
        from.require_auth();
        fee_payer.require_auth();

        if amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        let config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        // Calcula a taxa usando taxa padrão
        let fee_amount = (amount * config.default_fee_rate as i128) / 1000;
        let net_amount = amount - fee_amount;

        // Criar cliente do token
        let token = TokenClient::new(&env, &config.token_address);

        // Verificar saldo do remetente no token
        let from_balance = token.balance(&from);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalanceFromSender);
        }

        // Realizar as transferências reais
        // 1. Transfere valor total do remetente para o contrato
        token.transfer(&from, &env.current_contract_address(), &amount);

        // 2. Transfere valor líquido do contrato para o destinatário
        token.transfer(&env.current_contract_address(), &to, &net_amount);

        // 3. Transfere taxa do contrato para o pagador de taxa
        token.transfer(&env.current_contract_address(), &fee_payer, &fee_amount);

        // Emite evento (event_id = 0 para pagamentos gerais)
        PaymentEvent {
            event_id: 0,
            from: from.clone(),
            to: to.clone(),
            fee_payer: fee_payer.clone(),
            amount,
            fee_amount,
            fee_rate: config.default_fee_rate,
        }.publish(&env);

        Ok(())
    }

    /// Realiza pagamento com fee_payer pré-autorizado (sem assinatura)
    pub fn payment_with_auth_fee_payer(
        env: Env,
        from: Address,
        to: Address,
        fee_payer: Address,
        amount: i128,
    ) -> Result<(), ContractError> {
        from.require_auth(); // Apenas o remetente precisa assinar

        if amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        let config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        // Calcula a taxa
        let fee_amount = (amount * config.default_fee_rate as i128) / 1000;

        // Criar cliente do token
        let token = TokenClient::new(&env, &config.token_address);

        // Verificar allowance do fee_payer para o contrato
        let current_allowance = token.allowance(&fee_payer, &env.current_contract_address());
        if current_allowance < fee_amount {
            return Err(ContractError::InsufficientAllowance);
        }

        // Verificar saldo do remetente
        let from_balance = token.balance(&from);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalanceFromSender);
        }

        // Realizar as transferências reais
        let net_amount = amount - fee_amount;

        // 1. Transfere valor total do remetente para o contrato
        token.transfer(&from, &env.current_contract_address(), &amount);

        // 2. Transfere valor líquido do contrato para o destinatário
        token.transfer(&env.current_contract_address(), &to, &net_amount);

        // 3. Usa allowance do fee_payer para pagar a taxa como recompensa
        token.transfer_from(&env.current_contract_address(), &fee_payer, &fee_payer, &fee_amount);

        // Emite evento (event_id = 0 para pagamentos com autorização geral)
        PaymentEvent {
            event_id: 0,
            from: from.clone(),
            to: to.clone(),
            fee_payer: fee_payer.clone(),
            amount,
            fee_amount,
            fee_rate: config.default_fee_rate,
        }.publish(&env);

        Ok(())
    }

    // =====================================
    // FUNÇÕES DE AUTORIZAÇÃO
    // =====================================

    /// Autoriza o contrato a usar tokens do usuário para pagar fees
    /// Nota: Esta função chama approve() no contrato de token
    pub fn authorize_fee_payments(env: Env, fee_payer: Address, max_fee_amount: i128) -> Result<(), ContractError> {
        fee_payer.require_auth();

        if max_fee_amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token = TokenClient::new(&env, &config.token_address);

        // Chama approve no token para autorizar o contrato
        token.approve(&fee_payer, &env.current_contract_address(), &max_fee_amount, &3110400);

        Ok(())
    }

    /// Remove autorização para pagamento automático de fees
    pub fn revoke_fee_authorization(env: Env, fee_payer: Address) {
        fee_payer.require_auth();

        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token = TokenClient::new(&env, &config.token_address);

        // Remove allowance do token (zera a autorização)
        token.approve(&fee_payer, &env.current_contract_address(), &0, &1);
    }

    /// Permite ao organizador aumentar o allowance para cobrir mais taxas do evento
    pub fn increase_event_allowance(
        env: Env,
        event_id: u64,
        additional_allowance: i128
    ) -> Result<(), ContractError> {
        if additional_allowance <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        // Verificar se evento existe e obter organizador
        let event = Self::get_event(env.clone(), event_id)?;
        event.organizer.require_auth();

        // Obter configuração para acessar token
        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token = TokenClient::new(&env, &config.token_address);

        // Obter allowance atual
        let current_allowance = token.allowance(&event.organizer, &env.current_contract_address());
        let new_allowance = current_allowance + additional_allowance;

        // Atualizar allowance
        token.approve(&event.organizer, &env.current_contract_address(), &new_allowance, &3110400);

        Ok(())
    }

    // =====================================
    // FUNÇÕES DE SAQUE
    // =====================================

    /// Permite ao organizador sacar taxas acumuladas (apenas se evento estiver inativo)
    pub fn withdraw_event_fees(env: Env, event_id: u64) -> Result<i128, ContractError> {
        let event = Self::get_event(env.clone(), event_id)?;

        // Apenas organizador pode sacar
        event.organizer.require_auth();

        // Evento deve estar inativo para permitir saque
        if event.is_active {
            return Err(ContractError::EventStillActive);
        }

        let fee_key = Self::event_fee_key(event_id);
        let accumulated_fees: i128 = env.storage().persistent().get(&fee_key).unwrap_or(0);

        if accumulated_fees > 0 {
            // Obter configuração para pegar endereço do token
            let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();

            // Transferir tokens reais para o organizador
            let token = TokenClient::new(&env, &config.token_address);
            token.transfer(&env.current_contract_address(), &event.organizer, &accumulated_fees);

            // Zera as taxas acumuladas APENAS após transferência bem-sucedida
            env.storage().persistent().remove(&fee_key);
        }

        Ok(accumulated_fees)
    }

    // =====================================
    // FUNÇÕES AUXILIARES
    // =====================================


    // Função auxiliar para gerar chave de evento
    fn event_key(event_id: u64) -> (&'static str, u64) {
        ("event", event_id)
    }

    // Função auxiliar para gerar chave de nome de evento
    fn event_name_key(name: &String) -> (&'static str, String) {
        ("event_name", name.clone())
    }


    // Função auxiliar para gerar chave de taxas acumuladas por evento
    fn event_fee_key(event_id: u64) -> (&'static str, u64) {
        ("event_fee", event_id)
    }

    // Função auxiliar para gerar chave de registro de carteira em evento
    fn wallet_registration_key(event_id: u64, wallet: &Address) -> (u64, &str, Address) {
        (event_id, "registered", wallet.clone())
    }
}

// mod test; // Testes antigos temporariamente desabilitados
mod test_events;