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
fn test_event_payment() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.initialize(&admin, &500); // 5%

    // Criar evento
    let event_name = String::from_str(&env, "Concert");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Depositar fundos
    client.deposit_for_event(&event_id, &sender, &1000);

    // Realizar pagamento de 200 (taxa = 10, líquido = 190)
    client.event_payment(&event_id, &sender, &receiver, &200);

    // Verificar saldos finais
    assert_eq!(client.event_balance(&event_id, &sender), 800);    // 1000 - 200
    assert_eq!(client.event_balance(&event_id, &receiver), 190);  // 200 - 10

    // Verificar taxas acumuladas para o organizador
    assert_eq!(client.get_event_fees(&event_id), 10); // Taxa travada no contrato

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

#[test]
fn test_initialize_already_initialized() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    // Primeira inicialização deve funcionar
    client.initialize(&admin, &500);

    // Segunda inicialização deve falhar
    let result = client.try_initialize(&admin, &600);
    assert!(result.is_err());

    // Verificar que a configuração original não foi alterada
    let config = client.get_config();
    assert_eq!(config.default_fee_rate, 500); // Taxa original
    assert_eq!(config.admin, admin);
    assert_eq!(config.next_event_id, 1);
}

#[test]
fn test_event_fee_withdrawal() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let organizer = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);

    client.initialize(&admin, &1000); // 10%

    // Criar evento
    let event_name = String::from_str(&env, "Music Festival");
    let event_id = client.create_event(&organizer, &event_name, &None);

    // Depositar fundos e fazer pagamentos
    client.deposit_for_event(&event_id, &sender, &1000);
    client.event_payment(&event_id, &sender, &receiver, &200); // Taxa: 20
    client.event_payment(&event_id, &sender, &receiver, &300); // Taxa: 30

    // Verificar taxas acumuladas
    assert_eq!(client.get_event_fees(&event_id), 50); // 20 + 30

    // Tentar sacar com evento ativo deve falhar
    let withdraw_result = client.try_withdraw_event_fees(&event_id);
    assert!(withdraw_result.is_err());

    // Desativar evento
    client.set_event_status(&event_id, &false);

    // Agora deve conseguir sacar
    let withdrawn = client.withdraw_event_fees(&event_id);
    assert_eq!(withdrawn, 50);

    // Verificar que organizador recebeu as taxas no saldo do evento
    assert_eq!(client.event_balance(&event_id, &organizer), 50);

    // Verificar que taxas foram zeradas
    assert_eq!(client.get_event_fees(&event_id), 0);

    // Segunda tentativa de saque deve retornar 0
    let second_withdraw = client.withdraw_event_fees(&event_id);
    assert_eq!(second_withdraw, 0);
}