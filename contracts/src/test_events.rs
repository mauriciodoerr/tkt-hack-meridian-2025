#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, contractimpl, contract};

// Mock Token Contract para testes
#[contract]
pub struct MockToken;

#[contractimpl]
impl MockToken {
    pub fn balance(env: Env, id: Address) -> i128 {
        let key = ("balance", id);
        env.storage().temporary().get(&key).unwrap_or(1000000) // Saldo padrão alto para testes
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        let from_key = ("balance", from.clone());
        let to_key = ("balance", to.clone());

        let from_balance: i128 = env.storage().temporary().get(&from_key).unwrap_or(1000000);
        let to_balance: i128 = env.storage().temporary().get(&to_key).unwrap_or(0);

        env.storage().temporary().set(&from_key, &(from_balance - amount));
        env.storage().temporary().set(&to_key, &(to_balance + amount));
    }

    pub fn approve(env: Env, from: Address, spender: Address, amount: i128, _expiration_ledger: u32) {
        from.require_auth();

        let key = ("allowance", from, spender);
        env.storage().temporary().set(&key, &amount);
    }

    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let key = ("allowance", from, spender);
        env.storage().temporary().get(&key).unwrap_or(0)
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();

        // Verificar allowance
        let allowance_key = ("allowance", from.clone(), spender);
        let current_allowance: i128 = env.storage().temporary().get(&allowance_key).unwrap_or(0);

        if current_allowance < amount {
            panic!("Insufficient allowance");
        }

        // Atualizar allowance
        env.storage().temporary().set(&allowance_key, &(current_allowance - amount));

        // Fazer transferência
        let from_key = ("balance", from.clone());
        let to_key = ("balance", to.clone());

        let from_balance: i128 = env.storage().temporary().get(&from_key).unwrap_or(1000000);
        let to_balance: i128 = env.storage().temporary().get(&to_key).unwrap_or(0);

        env.storage().temporary().set(&from_key, &(from_balance - amount));
        env.storage().temporary().set(&to_key, &(to_balance + amount));
    }
}

// Função auxiliar para configurar testes
fn setup_test<'a>() -> (Env, EventPaymentContractClient<'a>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    // Registrar contrato mock de token
    let token_contract_id = env.register(MockToken, ());

    // Registrar contrato principal
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    // Inicializar contrato com token mock
    client.initialize(&admin, &50, &token_contract_id);

    (env, client, admin, token_contract_id)
}

#[test]
fn test_event_creation() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);

    // Criar evento
    let event_name = String::from_str(&env, "Rock Festival 2024");
    let event_id = client.create_event(&organizer, &event_name, &None);

    assert_eq!(event_id, 1);

    // Verificar evento criado
    let event = client.get_event(&event_id);
    assert_eq!(event.id, 1);
    assert_eq!(event.name, event_name);
    assert_eq!(event.organizer, organizer);
    assert_eq!(event.fee_rate, 50); // Taxa padrão
    assert_eq!(event.is_active, true);
    assert_eq!(event.total_volume, 0);
}

#[test]
fn test_event_creation_with_custom_fee() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);

    // Criar evento com taxa personalizada de 3%
    let event_name = String::from_str(&env, "Jazz Night");
    let custom_fee = Some(30); // 3%
    let event_id = client.create_event(&organizer, &event_name, &custom_fee);

    let event = client.get_event(&event_id);
    assert_eq!(event.fee_rate, 30);
}

#[test]
fn test_wallet_registration() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);
    let user = Address::generate(&env);

    // Criar evento
    let event_name = String::from_str(&env, "Music Festival");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Verificar que carteira não está registrada inicialmente
    assert_eq!(client.is_wallet_registered(&event_id, &user), false);

    // Registrar carteira no evento
    client.register_wallet_for_event(&event_id, &user);

    // Verificar que está registrada agora
    assert_eq!(client.is_wallet_registered(&event_id, &user), true);

    // Tentar registrar novamente deve falhar
    let result = client.try_register_wallet_for_event(&event_id, &user);
    assert!(result.is_err());

    // Organizador não pode se registrar
    let organizer_result = client.try_register_wallet_for_event(&event_id, &organizer);
    assert!(organizer_result.is_err());
}

#[test]
fn test_wallet_unregistration() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);
    let user = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Test Event");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Registrar carteira
    client.register_wallet_for_event(&event_id, &user);
    assert_eq!(client.is_wallet_registered(&event_id, &user), true);

    // Desregistrar carteira
    client.unregister_wallet_from_event(&event_id, &user);
    assert_eq!(client.is_wallet_registered(&event_id, &user), false);

    // Tentar desregistrar novamente deve falhar
    let result = client.try_unregister_wallet_from_event(&event_id, &user);
    assert!(result.is_err());
}

#[test]
fn test_wallet_registration_multiple_events() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer1 = Address::generate(&env);
    let organizer2 = Address::generate(&env);
    let user = Address::generate(&env);


    // Criar dois eventos
    let event1_name = String::from_str(&env, "Event 1");
    let event2_name = String::from_str(&env, "Event 2");
    let event1_id = client.create_event(&organizer1, &event1_name, &None);
    let event2_id = client.create_event(&organizer2, &event2_name, &None);

    // Registrar usuário apenas no primeiro evento
    client.register_wallet_for_event(&event1_id, &user);

    // Verificar que está registrado apenas no primeiro
    assert_eq!(client.is_wallet_registered(&event1_id, &user), true);
    assert_eq!(client.is_wallet_registered(&event2_id, &user), false);

    // Registrar no segundo evento também
    client.register_wallet_for_event(&event2_id, &user);
    assert_eq!(client.is_wallet_registered(&event2_id, &user), true);

    // Desregistrar do primeiro, mas manter no segundo
    client.unregister_wallet_from_event(&event1_id, &user);
    assert_eq!(client.is_wallet_registered(&event1_id, &user), false);
    assert_eq!(client.is_wallet_registered(&event2_id, &user), true);
}

#[test]
fn test_wallet_registration_inactive_event() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);
    let user = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Inactive Event");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Registrar usuário enquanto evento está ativo
    client.register_wallet_for_event(&event_id, &user);
    assert_eq!(client.is_wallet_registered(&event_id, &user), true);

    // Desativar evento
    client.set_event_status(&event_id, &false);

    // Tentativas de registro em evento inativo devem falhar
    let user2 = Address::generate(&env);
    let result = client.try_register_wallet_for_event(&event_id, &user2);
    assert!(result.is_err());

    // Mas usuário já registrado ainda deve aparecer como registrado
    assert_eq!(client.is_wallet_registered(&event_id, &user), true);

    // E deve conseguir se desregistrar mesmo com evento inativo
    client.unregister_wallet_from_event(&event_id, &user);
    assert_eq!(client.is_wallet_registered(&event_id, &user), false);
}

#[test]
fn test_organizer_restriction() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Organizer Test");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Organizador não deve conseguir se registrar
    let result = client.try_register_wallet_for_event(&event_id, &organizer);
    assert!(result.is_err());

    // Verificar que organizador não está registrado
    assert_eq!(client.is_wallet_registered(&event_id, &organizer), false);

    // Outros usuários devem conseguir se registrar normalmente
    let user = Address::generate(&env);
    client.register_wallet_for_event(&event_id, &user);
    assert_eq!(client.is_wallet_registered(&event_id, &user), true);
}

#[test]
fn test_payment_requires_registration() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let unregistered = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Payment Test");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Registrar apenas o sender
    client.register_wallet_for_event(&event_id, &sender);

    // Pagamento deve falhar se receiver não estiver registrado
    let result = client.try_event_payment(&event_id, &sender, &receiver, &100);
    assert!(result.is_err());

    // Registrar receiver
    client.register_wallet_for_event(&event_id, &receiver);

    // Agora pagamento deve funcionar
    client.event_payment(&event_id, &sender, &receiver, &100);

    // Pagamento com carteira não registrada como sender deve falhar
    let result = client.try_event_payment(&event_id, &unregistered, &receiver, &50);
    assert!(result.is_err());

    // Pagamento com carteira não registrada como receiver deve falhar
    let result = client.try_event_payment(&event_id, &sender, &unregistered, &50);
    assert!(result.is_err());
}

#[test]
fn test_registration_edge_cases() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);
    let user = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Edge Cases Event");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Tentar desregistrar carteira que nunca foi registrada
    let result = client.try_unregister_wallet_from_event(&event_id, &user);
    assert!(result.is_err());

    // Tentar registrar em evento inexistente
    let fake_event_id = 999;
    let result = client.try_register_wallet_for_event(&fake_event_id, &user);
    assert!(result.is_err());

    // Tentar consultar registro em evento inexistente
    assert_eq!(client.is_wallet_registered(&fake_event_id, &user), false);

    // Registrar, desregistrar e tentar registrar novamente (deve funcionar)
    client.register_wallet_for_event(&event_id, &user);
    assert_eq!(client.is_wallet_registered(&event_id, &user), true);

    client.unregister_wallet_from_event(&event_id, &user);
    assert_eq!(client.is_wallet_registered(&event_id, &user), false);

    // Re-registro deve funcionar
    client.register_wallet_for_event(&event_id, &user);
    assert_eq!(client.is_wallet_registered(&event_id, &user), true);
}

#[test]
fn test_event_payment() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Concert");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Registrar carteiras no evento
    client.register_wallet_for_event(&event_id, &sender);
    client.register_wallet_for_event(&event_id, &receiver);

    // Realizar pagamento de 200 (taxa = 10, líquido = 190)
    client.event_payment(&event_id, &sender, &receiver, &200);

    // Verificar taxas acumuladas para o organizador
    assert_eq!(client.get_event_fees(&event_id), 10); // Taxa travada no contrato

    // Verificar volume do evento
    let event = client.get_event(&event_id);
    assert_eq!(event.total_volume, 200);

    // Tentar pagamento com carteira não registrada deve falhar
    let unregistered = Address::generate(&env);
    let result = client.try_event_payment(&event_id, &unregistered, &receiver, &100);
    assert!(result.is_err());
}

#[test]
fn test_multiple_events() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer1 = Address::generate(&env);
    let organizer2 = Address::generate(&env);
    let user = Address::generate(&env);


    // Criar dois eventos
    let event1_name = String::from_str(&env, "Event 1");
    let event2_name = String::from_str(&env, "Event 2");

    let event1_id = client.create_event(&organizer1, &event1_name, &Some(30)); // 3%
    let event2_id = client.create_event(&organizer2, &event2_name, &Some(70)); // 7%

    assert_eq!(event1_id, 1);
    assert_eq!(event2_id, 2);

    // Registrar usuário em ambos eventos
    client.register_wallet_for_event(&event1_id, &user);
    client.register_wallet_for_event(&event2_id, &user);

    // Verificar registros independentes
    assert_eq!(client.is_wallet_registered(&event1_id, &user), true);
    assert_eq!(client.is_wallet_registered(&event2_id, &user), true);
    assert_eq!(client.is_wallet_registered(&event1_id, &organizer2), false); // Sem acesso cruzado
}

#[test]
fn test_event_status_management() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Test Event");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Verificar evento ativo por padrão
    let event = client.get_event(&event_id);
    assert_eq!(event.is_active, true);

    // Desativar evento
    client.set_event_status(&event_id, &false);

    let event = client.get_event(&event_id);
    assert_eq!(event.is_active, false);

    // Tentar registrar em evento inativo deve falhar
    let user = Address::generate(&env);
    let result = client.try_register_wallet_for_event(&event_id, &user);
    assert!(result.is_err());
}

/*
#[test]
fn test_event_fee_rate_update() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Festival");
    let event_id = client.create_event(&organizer, &event_name, &Some(30)); // 3%

    // Verificar taxa inicial
    let event = client.get_event(&event_id);
    assert_eq!(event.fee_rate, 30);

    // Atualizar taxa para 8%
    client.update_event_fee_rate(&event_id, &80);

    let event = client.get_event(&event_id);
    assert_eq!(event.fee_rate, 80);
}
*/

#[test]
fn test_get_event_by_name() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Summer Festival");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Buscar por nome
    let event_by_name = client.get_event_by_name(&event_name);
    let event_by_id = client.get_event(&event_id);

    assert_eq!(event_by_name.id, event_by_id.id);
    assert_eq!(event_by_name.name, event_by_id.name);
}


#[test]
fn test_initialize_already_initialized() {
    let (_env, client, admin, token_address) = setup_test();

    // Setup já fez a primeira inicialização, então segunda deve falhar
    let result = client.try_initialize(&admin, &600, &token_address);
    assert!(result.is_err());

    // Verificar que a configuração original não foi alterada
    let config = client.get_config(&admin);
    assert_eq!(config.default_fee_rate, 50); // Taxa original
    assert_eq!(config.admin, admin);
    assert_eq!(config.next_event_id, 1);
}

#[test]
fn test_event_fee_withdrawal() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);


    // Criar evento
    let event_name = String::from_str(&env, "Music Festival");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Registrar carteiras e fazer pagamentos
    client.register_wallet_for_event(&event_id, &sender);
    client.register_wallet_for_event(&event_id, &receiver);

    client.event_payment(&event_id, &sender, &receiver, &200); // Taxa: 10 (5% de 200)
    client.event_payment(&event_id, &sender, &receiver, &300); // Taxa: 15 (5% de 300)

    // Verificar taxas acumuladas
    assert_eq!(client.get_event_fees(&event_id), 25); // 10 + 15

    // Tentar sacar com evento ativo deve falhar
    let withdraw_result = client.try_withdraw_event_fees(&event_id);
    assert!(withdraw_result.is_err());

    // Desativar evento
    client.set_event_status(&event_id, &false);

    // Agora deve conseguir sacar
    let withdrawn = client.withdraw_event_fees(&event_id);
    assert_eq!(withdrawn, 25);

    // Verificar que taxas foram zeradas
    assert_eq!(client.get_event_fees(&event_id), 0);

    // Segunda tentativa de saque deve retornar 0
    let second_withdraw = client.withdraw_event_fees(&event_id);
    assert_eq!(second_withdraw, 0);
}

#[test]
fn test_create_event_with_allowance() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);

    // Criar evento com allowance automático
    let event_name = String::from_str(&env, "Festival with Allowance");
    let max_allowance = 1000;
    let event_id = client.create_event_with_allowance(&organizer, &event_name, &None, &max_allowance);

    assert_eq!(event_id, 1);

    // Verificar se o evento foi criado corretamente
    let event = client.get_event(&event_id);
    assert_eq!(event.organizer, organizer);
    assert_eq!(event.name, event_name);

    // Verificar se o allowance foi definido
    let allowance = client.get_fee_authorization(&organizer);
    assert_eq!(allowance, max_allowance);
}

#[test]
fn test_increase_event_allowance() {
    let (env, client, _admin, _token_address) = setup_test();
    let organizer = Address::generate(&env);

    // Criar evento primeiro
    let event_name = String::from_str(&env, "Festival");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Dar allowance inicial
    client.authorize_fee_payments(&organizer, &500);
    assert_eq!(client.get_fee_authorization(&organizer), 500);

    // Aumentar allowance
    client.increase_event_allowance(&event_id, &300);

    // Verificar novo allowance
    let new_allowance = client.get_fee_authorization(&organizer);
    assert_eq!(new_allowance, 800); // 500 + 300
}

#[test]
fn test_admin_only_functions() {
    let (env, client, admin, _token_address) = setup_test();
    let non_admin = Address::generate(&env);


    // Admin deve conseguir acessar get_config
    let config = client.get_config(&admin);
    assert_eq!(config.default_fee_rate, 50);
    assert_eq!(config.admin, admin);

    // Admin deve conseguir atualizar taxa padrão
    client.update_default_fee_rate(&admin, &30);
    let updated_config = client.get_config(&admin);
    assert_eq!(updated_config.default_fee_rate, 30);

    // Non-admin não deve conseguir acessar get_config
    let get_config_result = client.try_get_config(&non_admin);
    assert!(get_config_result.is_err());

    // Non-admin não deve conseguir atualizar taxa padrão
    let update_result = client.try_update_default_fee_rate(&non_admin, &400);
    assert!(update_result.is_err());

    // Verificar que taxa não foi alterada por non-admin
    let final_config = client.get_config(&admin);
    assert_eq!(final_config.default_fee_rate, 30); // Ainda deve ser 30
}