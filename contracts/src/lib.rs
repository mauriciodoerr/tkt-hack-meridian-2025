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
    pub fee_rate: u32, // Fee rate in basis points (500 = 5%)
    pub is_active: bool,
    pub created_at: u64,
    pub total_volume: i128, // Total transaction volume
}

// Event emitted when an event is created
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EventCreated {
    pub event_id: u64,
    pub name: String,
    pub organizer: Address,
    pub fee_rate: u32,
}

// Event emitted when a payment is made
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

// Contract configuration data
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractConfig {
    pub default_fee_rate: u32, // Default fee rate in basis points (500 = 5%)
    pub admin: Address,
    pub next_event_id: u64, // Next available event ID
    pub token_address: Address, // Token contract address
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

    /// Initialize contract with default fee rate, admin and token
    pub fn initialize(env: Env, admin: Address, default_fee_rate: u32, token_address: Address) -> Result<(), ContractError> {
        admin.require_auth();

        // Check if contract has already been initialized
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

    /// Query contract configuration (admin only)
    pub fn get_config(env: Env, admin: Address) -> Result<ContractConfig, ContractError> {
        admin.require_auth();

        let config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        // Verify if caller is actually the admin
        if admin != config.admin {
            return Err(ContractError::NotEventOrganizer); // Reutilizando erro existente
        }

        Ok(config)
    }

    /// Update default fee rate (admin only)
    pub fn update_default_fee_rate(env: Env, admin: Address, new_fee_rate: u32) -> Result<(), ContractError> {
        admin.require_auth();

        let mut config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        // Verify if caller is actually the admin
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

        // Check if event with this name already exists
        let name_key = Self::event_name_key(&name);
        if env.storage().persistent().has(&name_key) {
            return Err(ContractError::EventAlreadyExists);
        }

        let mut config: ContractConfig = env.storage().instance().get(&CONFIG)
            .ok_or(ContractError::ContractNotInitialized)?;

        // Use custom fee rate or default
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

        // Update next ID
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
        // Authentication will be done inside create_event()

        if max_allowance <= 0 {
            return Err(ContractError::AmountMustBePositive);
        }

        // Create event first (this already does organizer.require_auth())
        let event_id = Self::create_event(env.clone(), organizer.clone(), name, fee_rate)?;

        // Get configuration to access token
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

    /// Update fee rate for a specific event (organizer only)
    /// TODO: Private function to prevent public calls at this time
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

    /// Query event information
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
        // Check if event exists and is active
        let event = Self::get_event(env.clone(), event_id)?;
        if !event.is_active {
            return Err(ContractError::EventNotActive);
        }

        // Organizer cannot register for their own event
        if wallet == event.organizer {
            return Err(ContractError::OrganizerCannotRegister);
        }

        // Organizer authorizes the operation (they pay the fee)
        event.organizer.require_auth();

        let registration_key = Self::wallet_registration_key(event_id, &wallet);

        // Check if already registered
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

        // Organizer authorizes the operation (they pay the fee)
        event.organizer.require_auth();

        let registration_key = Self::wallet_registration_key(event_id, &wallet);

        // Check if registered
        if !env.storage().persistent().has(&registration_key) {
            return Err(ContractError::WalletNotRegistered);
        }

        // Remover registro
        env.storage().persistent().remove(&registration_key);
        Ok(())
    }

    /// Check if a wallet is registered for an event
    pub fn is_wallet_registered(env: Env, event_id: u64, wallet: Address) -> bool {
        let registration_key = Self::wallet_registration_key(event_id, &wallet);
        env.storage().persistent().has(&registration_key)
    }

    // =====================================
    // FUNÇÕES DE PAGAMENTO
    // =====================================

    /// Make payment for a specific event with organizer paying fee
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

        // Check if event exists and is active
        let mut event = Self::get_event(env.clone(), event_id)?;
        if !event.is_active {
            return Err(ContractError::EventNotActive);
        }

        // Check if both wallets are registered for the event
        if !Self::is_wallet_registered(env.clone(), event_id, from.clone()) {
            return Err(ContractError::WalletNotRegistered);
        }
        if !Self::is_wallet_registered(env.clone(), event_id, to.clone()) {
            return Err(ContractError::WalletNotRegistered);
        }

        // Get configuration to access token
        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token = TokenClient::new(&env, &config.token_address);

        // Verificar saldo do remetente
        let from_balance = token.balance(&from);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalanceFromSender);
        }

        // Calculate fee using event's specific fee rate
        let fee_amount = (amount * event.fee_rate as i128) / 10000;
        let net_amount = amount - fee_amount;

        // Perform transfers
        // 1. Transfer full amount from sender to contract
        token.transfer(&from, &env.current_contract_address(), &amount);

        // 2. Transfer net amount from contract to recipient
        token.transfer(&env.current_contract_address(), &to, &net_amount);

        // Fee stays in contract for organizer to withdraw later

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

    /// Make general payment (without specific event) - maintains compatibility
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

        // Calculate fee using default rate
        let fee_amount = (amount * config.default_fee_rate as i128) / 10000;
        let net_amount = amount - fee_amount;

        // Criar cliente do token
        let token = TokenClient::new(&env, &config.token_address);

        // Verificar saldo do remetente no token
        let from_balance = token.balance(&from);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalanceFromSender);
        }

        // Perform actual transfers
        // 1. Transfere valor total do remetente para o contrato
        token.transfer(&from, &env.current_contract_address(), &amount);

        // 2. Transfer net amount from contract to recipient
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

    /// Make payment with pre-authorized fee_payer (no signature)
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

        // Perform actual transfers
        let net_amount = amount - fee_amount;

        // 1. Transfere valor total do remetente para o contrato
        token.transfer(&from, &env.current_contract_address(), &amount);

        // 2. Transfer net amount from contract to recipient
        token.transfer(&env.current_contract_address(), &to, &net_amount);

        // 3. Usa allowance do fee_payer para pagar a taxa como recompensa
        token.transfer_from(&env.current_contract_address(), &fee_payer, &fee_payer, &fee_amount);

        // Emit event (event_id = 0 for general authorized payments)
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

    /// Authorize contract to use user's tokens to pay fees
    /// Note: This function calls approve() on token contract
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

    /// Remove authorization for automatic fee payment
    pub fn revoke_fee_authorization(env: Env, fee_payer: Address) {
        fee_payer.require_auth();

        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token = TokenClient::new(&env, &config.token_address);

        // Remove token allowance (zero authorization)
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

        // Get configuration to access token
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
            // Get configuration to get token address
            let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();

            // Transferir tokens reais para o organizador
            let token = TokenClient::new(&env, &config.token_address);
            token.transfer(&env.current_contract_address(), &event.organizer, &accumulated_fees);

            // Zero accumulated fees ONLY after successful transfer
            env.storage().persistent().remove(&fee_key);
        }

        Ok(accumulated_fees)
    }

    // =====================================
    // FUNÇÕES AUXILIARES
    // =====================================


    // Helper function to generate event key
    fn event_key(event_id: u64) -> (&'static str, u64) {
        ("event", event_id)
    }

    // Helper function to generate event name key
    fn event_name_key(name: &String) -> (&'static str, String) {
        ("event_name", name.clone())
    }


    // Helper function to generate accumulated fees key by event
    fn event_fee_key(event_id: u64) -> (&'static str, u64) {
        ("event_fee", event_id)
    }

    // Helper function to generate wallet registration key in event
    fn wallet_registration_key(event_id: u64, wallet: &Address) -> (u64, &str, Address) {
        (event_id, "registered", wallet.clone())
    }
}

// mod test; // Testes antigos temporariamente desabilitados
mod test_events;