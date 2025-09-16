#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contractevent, contracterror, Address, Env, Symbol, String, symbol_short};

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

    /// Inicializa o contrato com taxa padrão e admin
    pub fn initialize(env: Env, admin: Address, default_fee_rate: u32) -> Result<(), ContractError> {
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
        };

        env.storage().instance().set(&CONFIG, &config);
        Ok(())
    }

    /// Consulta configuração do contrato
    pub fn get_config(env: Env) -> ContractConfig {
        env.storage().instance().get(&CONFIG).unwrap_or(ContractConfig {
            default_fee_rate: 500, // 5% padrão
            admin: env.current_contract_address(),
            next_event_id: 1,
        })
    }

    /// Atualiza taxa padrão (apenas admin)
    pub fn update_default_fee_rate(env: Env, new_fee_rate: u32) -> Result<(), ContractError> {
        let mut config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        config.admin.require_auth();

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

    /// Consulta saldo geral de uma carteira
    pub fn balance(env: Env, address: Address) -> i128 {
        let balance_key = Self::balance_key(&address);
        env.storage().temporary().get(&balance_key).unwrap_or(0)
    }

    /// Consulta saldo de uma carteira para um evento específico
    pub fn event_balance(env: Env, event_id: u64, address: Address) -> i128 {
        let balance_key = Self::event_balance_key(event_id, &address);
        env.storage().temporary().get(&balance_key).unwrap_or(0)
    }

    /// Consulta taxas acumuladas de um evento
    pub fn get_event_fees(env: Env, event_id: u64) -> i128 {
        let fee_key = Self::event_fee_key(event_id);
        env.storage().persistent().get(&fee_key).unwrap_or(0)
    }

    /// Consulta o limite autorizado para pagamento de fees
    pub fn get_fee_authorization(env: Env, fee_payer: Address) -> i128 {
        let allowance_key = Self::allowance_key(&fee_payer);
        env.storage().persistent().get(&allowance_key).unwrap_or(0)
    }

    // =====================================
    // FUNÇÕES DE DEPÓSITO
    // =====================================

    /// Deposita fundos no contrato para uma carteira específica (geral)
    pub fn deposit(env: Env, from: Address, amount: i128) -> Result<(), ContractError> {
        from.require_auth();

        if amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        let balance_key = Self::balance_key(&from);
        let current_balance: i128 = env.storage().temporary().get(&balance_key).unwrap_or(0);
        let new_balance = current_balance + amount;

        env.storage().temporary().set(&balance_key, &new_balance);
        Ok(())
    }

    /// Deposita fundos especificamente para um evento
    pub fn deposit_for_event(env: Env, event_id: u64, from: Address, amount: i128) -> Result<(), ContractError> {
        from.require_auth();

        if amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        // Verificar se evento existe e está ativo
        let event = Self::get_event(env.clone(), event_id)?;
        if !event.is_active {
            return Err(ContractError::EventNotActive);
        }

        let balance_key = Self::event_balance_key(event_id, &from);
        let current_balance: i128 = env.storage().temporary().get(&balance_key).unwrap_or(0);
        let new_balance = current_balance + amount;

        env.storage().temporary().set(&balance_key, &new_balance);
        Ok(())
    }

    // =====================================
    // FUNÇÕES DE PAGAMENTO
    // =====================================

    /// Realiza pagamento para um evento específico (organizador recebe as taxas)
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

        // Calcula a taxa usando a taxa específica do evento
        let fee_amount = (amount * event.fee_rate as i128) / 10000;
        let net_amount = amount - fee_amount;

        // Verifica saldo do remetente no evento
        let from_balance_key = Self::event_balance_key(event_id, &from);
        let from_balance: i128 = env.storage().temporary().get(&from_balance_key).unwrap_or(0);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalanceFromSender);
        }

        // Realiza as transferências
        // 1. Deduz valor total do remetente
        env.storage().temporary().set(&from_balance_key, &(from_balance - amount));

        // 2. Credita valor líquido ao destinatário
        let to_balance_key = Self::event_balance_key(event_id, &to);
        let to_balance: i128 = env.storage().temporary().get(&to_balance_key).unwrap_or(0);
        env.storage().temporary().set(&to_balance_key, &(to_balance + net_amount));

        // 3. Taxa fica travada no contrato para o organizador
        let fee_key = Self::event_fee_key(event_id);
        let current_fees: i128 = env.storage().persistent().get(&fee_key).unwrap_or(0);
        env.storage().persistent().set(&fee_key, &(current_fees + fee_amount));

        // 4. Atualizar volume total do evento
        event.total_volume += amount;
        let event_key = Self::event_key(event_id);
        env.storage().persistent().set(&event_key, &event);

        // Emite evento
        PaymentEvent {
            event_id,
            from: from.clone(),
            to: to.clone(),
            fee_payer: event.organizer.clone(), // Organizador é sempre o fee payer
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
        let fee_amount = (amount * config.default_fee_rate as i128) / 10000;
        let net_amount = amount - fee_amount;

        // Verifica saldo geral do remetente
        let from_balance_key = Self::balance_key(&from);
        let from_balance: i128 = env.storage().temporary().get(&from_balance_key).unwrap_or(0);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalanceFromSender);
        }

        // Obter saldo geral do pagador de taxa
        let fee_payer_balance_key = Self::balance_key(&fee_payer);
        let fee_payer_balance: i128 = env.storage().temporary().get(&fee_payer_balance_key).unwrap_or(0);

        // Realiza as transferências
        // 1. Deduz valor total do remetente
        env.storage().temporary().set(&from_balance_key, &(from_balance - amount));

        // 2. Credita valor líquido ao destinatário
        let to_balance_key = Self::balance_key(&to);
        let to_balance: i128 = env.storage().temporary().get(&to_balance_key).unwrap_or(0);
        env.storage().temporary().set(&to_balance_key, &(to_balance + net_amount));

        // 3. Credita taxa ao pagador de taxa como recompensa
        env.storage().temporary().set(&fee_payer_balance_key, &(fee_payer_balance + fee_amount));

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
        let fee_amount = (amount * config.default_fee_rate as i128) / 10000;

        // Verifica se fee_payer tem autorização suficiente
        let allowance_key = Self::allowance_key(&fee_payer);
        let current_allowance: i128 = env.storage().persistent().get(&allowance_key).unwrap_or(0);

        if current_allowance < fee_amount {
            return Err(ContractError::InsufficientAllowance);
        }

        // Verifica saldo do remetente
        let from_balance_key = Self::balance_key(&from);
        let from_balance: i128 = env.storage().temporary().get(&from_balance_key).unwrap_or(0);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalanceFromSender);
        }

        // Realiza as transferências
        let net_amount = amount - fee_amount;

        // 1. Deduz valor total do remetente
        env.storage().temporary().set(&from_balance_key, &(from_balance - amount));

        // 2. Credita valor líquido ao destinatário
        let to_balance_key = Self::balance_key(&to);
        let to_balance: i128 = env.storage().temporary().get(&to_balance_key).unwrap_or(0);
        env.storage().temporary().set(&to_balance_key, &(to_balance + net_amount));

        // 3. Credita taxa ao pagador de taxa como recompensa
        let fee_payer_balance_key = Self::balance_key(&fee_payer);
        let fee_payer_balance: i128 = env.storage().temporary().get(&fee_payer_balance_key).unwrap_or(0);
        env.storage().temporary().set(&fee_payer_balance_key, &(fee_payer_balance + fee_amount));

        // 4. Reduz o allowance
        env.storage().persistent().set(&allowance_key, &(current_allowance - fee_amount));

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

    /// Autoriza o contrato a atuar como fee_payer automaticamente
    pub fn authorize_fee_payments(env: Env, fee_payer: Address, max_fee_amount: i128) -> Result<(), ContractError> {
        fee_payer.require_auth();

        if max_fee_amount <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        let allowance_key = Self::allowance_key(&fee_payer);
        env.storage().persistent().set(&allowance_key, &max_fee_amount);

        Ok(())
    }

    /// Remove autorização para pagamento automático de fees
    pub fn revoke_fee_authorization(env: Env, fee_payer: Address) {
        fee_payer.require_auth();

        let allowance_key = Self::allowance_key(&fee_payer);
        env.storage().persistent().remove(&allowance_key);
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
            // Credita as taxas ao saldo do organizador no evento
            let organizer_balance_key = Self::event_balance_key(event_id, &event.organizer);
            let current_balance: i128 = env.storage().temporary().get(&organizer_balance_key).unwrap_or(0);
            env.storage().temporary().set(&organizer_balance_key, &(current_balance + accumulated_fees));

            // Zera as taxas acumuladas
            env.storage().persistent().remove(&fee_key);
        }

        Ok(accumulated_fees)
    }

    // =====================================
    // FUNÇÕES AUXILIARES
    // =====================================

    // Função auxiliar para gerar chave de saldo geral
    fn balance_key(address: &Address) -> (&'static str, Address) {
        ("balance", address.clone())
    }

    // Função auxiliar para gerar chave de saldo por evento
    fn event_balance_key(event_id: u64, address: &Address) -> (u64, &str, Address) {
        (event_id, "balance", address.clone())
    }

    // Função auxiliar para gerar chave de evento
    fn event_key(event_id: u64) -> (&'static str, u64) {
        ("event", event_id)
    }

    // Função auxiliar para gerar chave de nome de evento
    fn event_name_key(name: &String) -> (&'static str, String) {
        ("event_name", name.clone())
    }

    // Função auxiliar para gerar chave de allowance geral
    fn allowance_key(address: &Address) -> (&'static str, Address) {
        ("allowance", address.clone())
    }

    // Função auxiliar para gerar chave de taxas acumuladas por evento
    fn event_fee_key(event_id: u64) -> (&'static str, u64) {
        ("event_fee", event_id)
    }
}

// mod test; // Testes antigos temporariamente desabilitados
mod test_events;