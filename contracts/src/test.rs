#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_contract_initialization() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let fee_rate = 500; // 5%

    client.initialize(&admin, &fee_rate);

    let config = client.get_config();
    assert_eq!(config.admin, admin);
    assert_eq!(config.fee_rate, 500);
}

#[test]
fn test_deposit_functionality() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &500);

    // Test valid deposit
    client.deposit(&user, &1000);

    let balance = client.balance(&user);
    assert_eq!(balance, 1000);

    // Test deposit adicional
    client.deposit(&user, &500);

    let balance = client.balance(&user);
    assert_eq!(balance, 1500);
}

#[test]
fn test_deposit_invalid_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &500);

    // Test deposit com valor zero
    let result = client.try_deposit(&user, &0);
    assert!(result.is_err());

    // Test deposit com valor negativo
    let result = client.try_deposit(&user, &-100);
    assert!(result.is_err());
}

#[test]
fn test_payment_with_third_party_fee_success() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500); // 5%

    // Setup inicial: depositar funds
    client.deposit(&sender, &1000);      // Remetente tem 1000
    client.deposit(&fee_payer, &100);    // Pagador de fee tem 100

    // Check balances iniciais
    assert_eq!(client.balance(&sender), 1000);
    assert_eq!(client.balance(&receiver), 0);
    assert_eq!(client.balance(&fee_payer), 100);

    // Realizar payment de 200 com fee de 5% (10)
    client.payment_with_third_party_fee(&sender, &receiver, &fee_payer, &200);

    // Check balances finais
    // Sender: 1000 - 200 = 800
    assert_eq!(client.balance(&sender), 800);

    // Receiver: 0 + (200 - 10) = 190 (net value)
    assert_eq!(client.balance(&receiver), 190);

    // Fee payer: 100 + 10 = 110 (recebe 5% como reward)
    assert_eq!(client.balance(&fee_payer), 110);
}

#[test]
fn test_payment_insufficient_sender_balance() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500);

    // Sender tem apenas 50, mas tenta enviar 200
    client.deposit(&sender, &50);
    client.deposit(&fee_payer, &100);

    let result = client.try_payment_with_third_party_fee(&sender, &receiver, &fee_payer, &200);
    assert!(result.is_err());
}


#[test]
fn test_fee_calculation_accuracy() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    // Test com fee de 2.5% (250 basis points)
    client.initialize(&admin, &250);

    client.deposit(&sender, &10000);
    client.deposit(&fee_payer, &1000);

    // Pagamento de 1000 com fee de 2.5% = 25
    client.payment_with_third_party_fee(&sender, &receiver, &fee_payer, &1000);

    // Check calculations precisos
    assert_eq!(client.balance(&sender), 9000);       // 10000 - 1000
    assert_eq!(client.balance(&receiver), 975);      // 1000 - 25 (net value)
    assert_eq!(client.balance(&fee_payer), 1025);    // 1000 + 25 (reward de 2.5%)
}

#[test]
fn test_multiple_transactions() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500); // 5%

    // Setup inicial
    client.deposit(&sender, &5000);
    client.deposit(&fee_payer, &500);

    // Primeira transaction: 1000
    client.payment_with_third_party_fee(&sender, &receiver, &fee_payer, &1000);

    // Check after first transaction
    assert_eq!(client.balance(&sender), 4000);     // 5000 - 1000
    assert_eq!(client.balance(&receiver), 950);    // 1000 - 50
    assert_eq!(client.balance(&fee_payer), 550);   // 500 + 50 (reward)

    // Segunda transaction: 500
    client.payment_with_third_party_fee(&sender, &receiver, &fee_payer, &500);

    // Check after second transaction
    assert_eq!(client.balance(&sender), 3500);     // 4000 - 500
    assert_eq!(client.balance(&receiver), 1425);   // 950 + 475 (500 - 25)
    assert_eq!(client.balance(&fee_payer), 575);   // 550 + 25 (nova reward)
}

#[test]
fn test_update_fee_rate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &500); // 5%

    // Atualizar fee para 10%
    client.update_fee_rate(&1000);

    let config = client.get_config();
    assert_eq!(config.fee_rate, 1000);
}

#[test]
fn test_update_fee_rate_invalid() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &500);

    // Tentar definir fee acima de 100%
    let result = client.try_update_fee_rate(&15000);
    assert!(result.is_err());
}

#[test]
fn test_edge_case_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500);
    client.deposit(&sender, &1000);
    client.deposit(&fee_payer, &100);

    // Tentar payment com valor zero
    let result = client.try_payment_with_third_party_fee(&sender, &receiver, &fee_payer, &0);
    assert!(result.is_err());
}

#[test]
fn test_comprehensive_balance_validation() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500); // 5%

    // Test with specific values for complete validation
    let initial_sender = 10000;
    let initial_fee_payer = 1000;
    let payment_amount = 2000;
    let expected_fee = (payment_amount * 500) / 10000; // 100

    client.deposit(&sender, &initial_sender);
    client.deposit(&fee_payer, &initial_fee_payer);

    // Capturar balances antes da transaction
    let sender_before = client.balance(&sender);
    let receiver_before = client.balance(&receiver);
    let fee_payer_before = client.balance(&fee_payer);

    assert_eq!(sender_before, initial_sender);
    assert_eq!(receiver_before, 0);
    assert_eq!(fee_payer_before, initial_fee_payer);

    // Realizar transaction
    client.payment_with_third_party_fee(&sender, &receiver, &fee_payer, &payment_amount);

    // Capture balances after transaction
    let sender_after = client.balance(&sender);
    let receiver_after = client.balance(&receiver);
    let fee_payer_after = client.balance(&fee_payer);

    // Detailed validations
    assert_eq!(sender_after, initial_sender - payment_amount);
    assert_eq!(receiver_after, payment_amount - expected_fee);
    assert_eq!(fee_payer_after, initial_fee_payer + expected_fee); // Recebe reward

    // Validate that total funds remain the same
    let total_before = sender_before + receiver_before + fee_payer_before;
    let total_after = sender_after + receiver_after + fee_payer_after;
    assert_eq!(total_before, total_after);
}

#[test]
fn test_fee_authorization_system() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500); // 5%

    // Setup inicial
    client.deposit(&sender, &1000);
    client.deposit(&fee_payer, &100);

    // Fee payer authorizes payment up to 500 in fees
    client.authorize_fee_payments(&fee_payer, &500);

    // Check authorization
    assert_eq!(client.get_fee_authorization(&fee_payer), 500);

    // Realizar payment com authorization (sem assinatura do fee_payer)
    client.payment_with_auth_fee_payer(&sender, &receiver, &fee_payer, &200);

    // Check balances
    assert_eq!(client.balance(&sender), 800);    // 1000 - 200
    assert_eq!(client.balance(&receiver), 190);  // 200 - 10
    assert_eq!(client.balance(&fee_payer), 110); // 100 + 10

    // Check que allowance foi reduzido
    assert_eq!(client.get_fee_authorization(&fee_payer), 490); // 500 - 10
}

#[test]
fn test_insufficient_allowance() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500); // 5%

    client.deposit(&sender, &1000);
    client.deposit(&fee_payer, &100);

    // Fee payer autoriza apenas 5 em fees, mas transaction de 200 precisaria de 10
    client.authorize_fee_payments(&fee_payer, &5);

    // Tentativa de payment deve falhar
    let result = client.try_payment_with_auth_fee_payer(&sender, &receiver, &fee_payer, &200);
    assert!(result.is_err());

    // Saldos devem permanecer inalterados
    assert_eq!(client.balance(&sender), 1000);
    assert_eq!(client.balance(&receiver), 0);
    assert_eq!(client.balance(&fee_payer), 100);
}

#[test]
fn test_revoke_authorization() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500);

    // Autorizar payments
    client.authorize_fee_payments(&fee_payer, &1000);
    assert_eq!(client.get_fee_authorization(&fee_payer), 1000);

    // Revogar authorization
    client.revoke_fee_authorization(&fee_payer);
    assert_eq!(client.get_fee_authorization(&fee_payer), 0);
}

#[test]
fn test_multiple_authorized_payments() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EventPaymentContract, ());
    let client = EventPaymentContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let fee_payer = Address::generate(&env);

    client.initialize(&admin, &500); // 5%

    client.deposit(&sender, &2000);
    client.deposit(&fee_payer, &100);

    // Autorizar 100 em fees
    client.authorize_fee_payments(&fee_payer, &100);

    // Primeira transaction: 400 (fee = 20)
    client.payment_with_auth_fee_payer(&sender, &receiver, &fee_payer, &400);
    assert_eq!(client.get_fee_authorization(&fee_payer), 80); // 100 - 20

    // Segunda transaction: 600 (fee = 30)
    client.payment_with_auth_fee_payer(&sender, &receiver, &fee_payer, &600);
    assert_eq!(client.get_fee_authorization(&fee_payer), 50); // 80 - 30

    // Check balances finais
    assert_eq!(client.balance(&sender), 1000);    // 2000 - 400 - 600
    assert_eq!(client.balance(&receiver), 950);   // (400-20) + (600-30)
    assert_eq!(client.balance(&fee_payer), 150);  // 100 + 20 + 30
}