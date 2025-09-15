#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_event_creation() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);

    // Inicializar contrato
    client.initialize(&admin, &500); // 5% taxa padrão

    // Criar evento
    let event_name = String::from_str(&env, "Rock Festival 2024");
    let event_id = client.create_event(&organizer, &event_name, &None);

    assert_eq!(event_id, 1);

    // Verificar evento criado
    let event = client.get_event(&event_id);
    assert_eq!(event.id, 1);
    assert_eq!(event.name, event_name);
    assert_eq!(event.organizer, organizer);
    assert_eq!(event.fee_rate, 500); // Taxa padrão
    assert_eq!(event.is_active, true);
    assert_eq!(event.total_volume, 0);
}

#[test]
fn test_event_creation_with_custom_fee() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);

    client.initialize(&admin, &500);

    // Criar evento com taxa personalizada de 3%
    let event_name = String::from_str(&env, "Jazz Night");
    let custom_fee = Some(300); // 3%
    let event_id = client.create_event(&organizer, &event_name, &custom_fee);

    let event = client.get_event(&event_id);
    assert_eq!(event.fee_rate, 300);
}

#[test]
fn test_event_deposit_and_balance() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &500);

    // Criar evento
    let event_name = String::from_str(&env, "Music Festival");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Depositar fundos no evento
    client.deposit_for_event(&event_id, &user, &1000);

    // Verificar saldo
    assert_eq!(client.event_balance(&event_id, &user), 1000);
    assert_eq!(client.balance(&user), 0); // Saldo geral deve ser 0
}

#[test]
fn test_event_payment_with_fee() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500); // 5%

    // Criar evento
    let event_name = String::from_str(&env, "Concert");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Depositar fundos
    client.deposit_for_event(&event_id, &sender, &1000);
    client.deposit_for_event(&event_id, &fee_payer, &100);

    // Realizar pagamento de 200 (taxa = 10, líquido = 190)
    client.event_payment_with_fee(&event_id, &sender, &receiver, &fee_payer, &200);

    // Verificar saldos finais
    assert_eq!(client.event_balance(&event_id, &sender), 800);    // 1000 - 200
    assert_eq!(client.event_balance(&event_id, &receiver), 190);  // 200 - 10
    assert_eq!(client.event_balance(&event_id, &fee_payer), 110); // 100 + 10

    // Verificar volume do evento
    let event = client.get_event(&event_id);
    assert_eq!(event.total_volume, 200);
}

#[test]
fn test_multiple_events() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer1 = Address::generate(&env);
    let organizer2 = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &500);

    // Criar dois eventos
    let event1_name = String::from_str(&env, "Event 1");
    let event2_name = String::from_str(&env, "Event 2");

    let event1_id = client.create_event(&organizer1, &event1_name, &Some(300)); // 3%
    let event2_id = client.create_event(&organizer2, &event2_name, &Some(700)); // 7%

    assert_eq!(event1_id, 1);
    assert_eq!(event2_id, 2);

    // Depositar fundos em ambos eventos
    client.deposit_for_event(&event1_id, &user, &500);
    client.deposit_for_event(&event2_id, &user, &300);

    // Verificar isolamento dos saldos
    assert_eq!(client.event_balance(&event1_id, &user), 500);
    assert_eq!(client.event_balance(&event2_id, &user), 300);
    assert_eq!(client.event_balance(&event1_id, &organizer2), 0); // Sem acesso cruzado
}

#[test]
fn test_event_status_management() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);

    client.initialize(&admin, &500);

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

    // Tentar depositar em evento inativo deve falhar
    let user = Address::generate(&env);
    let result = client.try_deposit_for_event(&event_id, &user, &100);
    assert!(result.is_err());
}

#[test]
fn test_event_fee_rate_update() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);

    client.initialize(&admin, &500);

    // Criar evento
    let event_name = String::from_str(&env, "Festival");
    let event_id = client.create_event(&organizer, &event_name, &Some(300)); // 3%

    // Verificar taxa inicial
    let event = client.get_event(&event_id);
    assert_eq!(event.fee_rate, 300);

    // Atualizar taxa para 8%
    client.update_event_fee_rate(&event_id, &800);

    let event = client.get_event(&event_id);
    assert_eq!(event.fee_rate, 800);
}

#[test]
fn test_get_event_by_name() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);

    client.initialize(&admin, &500);

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
fn test_backwards_compatibility() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &400); // 4% taxa padrão

    // Usar funções originais (sem eventos)
    client.deposit(&sender, &1000);
    client.deposit(&fee_payer, &100);

    // Pagamento usando função original
    client.payment_with_third_party_fee(&sender, &receiver, &fee_payer, &250);

    // Verificar saldos (taxa 4% de 250 = 10)
    assert_eq!(client.balance(&sender), 750);    // 1000 - 250
    assert_eq!(client.balance(&receiver), 240);  // 250 - 10
    assert_eq!(client.balance(&fee_payer), 110); // 100 + 10
}