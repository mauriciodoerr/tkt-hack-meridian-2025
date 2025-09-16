# CLI Examples - EventCoin Payment Contract

This document provides practical examples of how to use the EventCoin smart contract via Stellar CLI using `stellar contract invoke`. The contract implements an event-based payment system with automatic fee collection.

## 📋 Prerequisites

### 1. Install Stellar CLI
```bash
# Install Stellar CLI (if not already installed)
cargo install --locked stellar-cli

# Or download from: https://github.com/stellar/stellar-cli
```

### 2. Set Environment Variables
```bash
# Replace with your actual values after deployment
export CONTRACT_ID="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export TOKEN_ADDRESS="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export ADMIN_ADDRESS="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export ORGANIZER_ADDRESS="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export USER_ADDRESS="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export VENDOR_ADDRESS="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export FEE_PAYER_ADDRESS="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 3. Configure Network
```bash
# Add testnet configuration
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# For mainnet (production)
stellar network add mainnet \
  --rpc-url https://mainnet.sorobanrpc.com:443 \
  --network-passphrase "Public Global Stellar Network ; September 2015"
```

## 🚀 1. Contract Initialization

### Initialize contract with 5% default fee rate
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ADMIN_ADDRESS \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS \
  --default_fee_rate 500 \
  --token_address $TOKEN_ADDRESS
```

### Verify initial configuration
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ADMIN_ADDRESS \
  --network testnet \
  -- \
  get_config
```

## 🎪 2. Event Management

### Create a new event with default fee rate
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Rock Festival 2024"
```

### Create event with custom fee rate (3%)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Jazz Night 2024" \
  --fee_rate 300
```

### Create event with automatic allowance
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  create_event_with_allowance \
  --organizer $ORGANIZER_ADDRESS \
  --name "Electronic Festival" \
  --fee_rate 400 \
  --max_allowance 10000
```

### Query event by ID
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  get_event \
  --event_id 1
```

### Query event by name
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  get_event_by_name \
  --name "Rock Festival 2024"
```

### List all events (limit of 10)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  list_events \
  --limit 10
```

### Deactivate an event (organizer only)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  set_event_status \
  --event_id 1 \
  --is_active false
```

## 👥 3. Wallet Registration System

### Register wallet for an event
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  register_wallet_for_event \
  --event_id 1 \
  --wallet $USER_ADDRESS
```

### Unregister wallet from event
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  unregister_wallet_from_event \
  --event_id 1 \
  --wallet $USER_ADDRESS
```

### Check if wallet is registered
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  is_wallet_registered \
  --event_id 1 \
  --wallet $USER_ADDRESS
```

## 💸 4. Event Payment System

### Payment within an event (buying food/drinks)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  event_payment \
  --event_id 1 \
  --from $USER_ADDRESS \
  --to $VENDOR_ADDRESS \
  --amount 200

# Result: User pays 200 tokens, vendor receives 190 tokens (200 - 10 fee)
# Fee (10 tokens) is accumulated for the event organizer
```

### Payment between registered users
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  event_payment \
  --event_id 1 \
  --from $USER_ADDRESS \
  --to $USER2_ADDRESS \
  --amount 50

# Both users must be registered for the event
```

### Traditional payment (without specific event - legacy)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  payment_with_third_party_fee \
  --from $USER_ADDRESS \
  --to $VENDOR_ADDRESS \
  --fee_payer $FEE_PAYER_ADDRESS \
  --amount 100
```

## 🔐 5. Fee Authorization System

### Authorize automatic fee payments (up to 1000)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $FEE_PAYER_ADDRESS \
  --network testnet \
  -- \
  authorize_fee_payments \
  --fee_payer $FEE_PAYER_ADDRESS \
  --max_fee_amount 1000
```

### Payment with pre-authorized fee payer
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  payment_with_auth_fee_payer \
  --from $USER_ADDRESS \
  --to $ORGANIZER_ADDRESS \
  --fee_payer $FEE_PAYER_ADDRESS \
  --amount 150
```

### Query remaining authorization
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  get_fee_authorization \
  --fee_payer $FEE_PAYER_ADDRESS
```

### Revoke authorization
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $FEE_PAYER_ADDRESS \
  --network testnet \
  -- \
  revoke_fee_authorization \
  --fee_payer $FEE_PAYER_ADDRESS
```

### Increase event allowance
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  increase_event_allowance \
  --event_id 1 \
  --additional_allowance 5000
```

## 💰 6. Fee Management

### Query event fees
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  get_event_fees \
  --event_id 1
```

### Withdraw event fees (organizer only, event must be inactive)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  withdraw_event_fees \
  --event_id 1
```

## ⚙️ 7. Administrative Settings

### Update default fee rate to 6% (admin only)
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ADMIN_ADDRESS \
  --network testnet \
  -- \
  update_default_fee_rate \
  --new_fee_rate 600
```

## 🎯 8. Real-World Event Scenarios

### Scenario 1: Music Festival with Multiple Vendors

```bash
# 1. Organizer creates event with 3% fee rate
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Rock Festival 2024" \
  --fee_rate 300

# 2. Register all participants (attendees and vendors)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  register_wallet_for_event \
  --event_id 1 \
  --wallet $USER_ADDRESS

stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  register_wallet_for_event \
  --event_id 1 \
  --wallet $VENDOR_ADDRESS

# 3. Payment within event (buying food)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  event_payment \
  --event_id 1 \
  --from $USER_ADDRESS \
  --to $VENDOR_ADDRESS \
  --amount 100

# Result: User pays 100, vendor receives 97, organizer gets 3 fee

# 4. Check event statistics
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  get_event \
  --event_id 1
```

### Scenario 2: Multi-Event Festival Complex

```bash
# 1. Create Jazz event with 2% fee rate
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Jazz Night" \
  --fee_rate 200

# 2. Create Electronic event with 4% fee rate
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  create_event \
  --organizer $ORGANIZER_ADDRESS \
  --name "Electronic Beats" \
  --fee_rate 400

# 3. Register user for both events
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  register_wallet_for_event \
  --event_id 1 \
  --wallet $USER_ADDRESS

stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  register_wallet_for_event \
  --event_id 2 \
  --wallet $USER_ADDRESS

# 4. Different payments at different events
# Jazz event payment (2% fee)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  event_payment \
  --event_id 1 \
  --from $USER_ADDRESS \
  --to $VENDOR_ADDRESS \
  --amount 50
# Result: 50 paid, 49 received, 1 fee

# Electronic event payment (4% fee)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  event_payment \
  --event_id 2 \
  --from $USER_ADDRESS \
  --to $VENDOR_ADDRESS \
  --amount 50
# Result: 50 paid, 48 received, 2 fee
```

## 📊 9. Monitoring and Auditing

### Check total volume of an event
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  get_event \
  --event_id 1
# The 'total_volume' field shows the total transacted volume
```

### List all events for auditing
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  list_events \
  --limit 50
```

## 🚨 Common Error Handling

### Error: Event not found
```bash
# Check if event exists
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  list_events \
  --limit 10
```

### Error: Wallet not registered
```bash
# Register wallet for the event first
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  register_wallet_for_event \
  --event_id 1 \
  --wallet $USER_ADDRESS
```

### Error: Event not active
```bash
# Reactivate event (organizer only)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  set_event_status \
  --event_id 1 \
  --is_active true
```

### Error: Insufficient allowance
```bash
# Increase allowance for the organizer
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ORGANIZER_ADDRESS \
  --network testnet \
  -- \
  increase_event_allowance \
  --event_id 1 \
  --additional_allowance 10000
```

## 📝 Important Notes

1. **Authentication**: Always use the correct `--source` for each operation
2. **Network**: Replace `testnet` with `mainnet` for production deployment
3. **Addresses**: Replace example addresses with your actual Stellar addresses
4. **Fee Rates**: Values in basis points (500 = 5%, 1000 = 10%, max 1000 = 10%)
5. **Amounts**: Values in token units (consider token decimals)
6. **Registration**: Both sender and recipient must be registered for event payments
7. **Fee Collection**: Event fees are automatically accumulated and can be withdrawn when event is inactive
8. **Event Status**: Only active events allow payments; inactive events allow fee withdrawals
9. **Organizer Responsibilities**: Organizers pay gas fees for wallet registration
10. **Fee Calculation**: Fees are deducted from payment amount before transfer to recipient

## 🔧 Troubleshooting

### Check if contract is initialized
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $ADMIN_ADDRESS \
  --network testnet \
  -- \
  get_config
```

### Check available events
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  list_events \
  --limit 5
```

### Check wallet registration status
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $USER_ADDRESS \
  --network testnet \
  -- \
  is_wallet_registered \
  --event_id 1 \
  --wallet $USER_ADDRESS
```

## 🎪 Complete Event Lifecycle Example

```bash
# 1. Initialize contract with 5% default fee
stellar contract invoke --id $CONTRACT_ID --source $ADMIN_ADDRESS --network testnet -- \
  initialize --admin $ADMIN_ADDRESS --default_fee_rate 500 --token_address $TOKEN_ADDRESS

# 2. Create event (organizer)
stellar contract invoke --id $CONTRACT_ID --source $ORGANIZER_ADDRESS --network testnet -- \
  create_event --organizer $ORGANIZER_ADDRESS --name "Summer Music Festival"

# 3. Register participants (organizer registers everyone)
stellar contract invoke --id $CONTRACT_ID --source $ORGANIZER_ADDRESS --network testnet -- \
  register_wallet_for_event --event_id 1 --wallet $USER_ADDRESS

stellar contract invoke --id $CONTRACT_ID --source $ORGANIZER_ADDRESS --network testnet -- \
  register_wallet_for_event --event_id 1 --wallet $VENDOR_ADDRESS

# 4. Event payments (users buy from vendors)
stellar contract invoke --id $CONTRACT_ID --source $USER_ADDRESS --network testnet -- \
  event_payment --event_id 1 --from $USER_ADDRESS --to $VENDOR_ADDRESS --amount 100

# Result: User pays 100, vendor gets 95, organizer earns 5 fee

# 5. Check event statistics and fees
stellar contract invoke --id $CONTRACT_ID --source $USER_ADDRESS --network testnet -- \
  get_event --event_id 1

stellar contract invoke --id $CONTRACT_ID --source $USER_ADDRESS --network testnet -- \
  get_event_fees --event_id 1

# 6. End event and withdraw accumulated fees
stellar contract invoke --id $CONTRACT_ID --source $ORGANIZER_ADDRESS --network testnet -- \
  set_event_status --event_id 1 --is_active false

stellar contract invoke --id $CONTRACT_ID --source $ORGANIZER_ADDRESS --network testnet -- \
  withdraw_event_fees --event_id 1

# Result: Organizer receives all accumulated fees from the event
```

## 💡 Pro Tips

1. **Batch Operations**: Register multiple wallets in sequence for large events
2. **Fee Strategy**: Lower fees encourage more transactions, higher fees increase revenue per transaction
3. **Event Management**: Use descriptive names and consider fee rates based on event type
4. **Monitoring**: Regularly check event statistics to track performance
5. **Security**: Always verify addresses before large transactions
6. **Testing**: Test all operations on testnet before mainnet deployment

## 🔗 Related Resources

- [Stellar CLI Documentation](https://developers.stellar.org/docs/smart-contracts/getting-started/setup)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [EventCoin Smart Contract Source](./src/lib.rs)
- [Contract README](./README.md)
- [Optimization Guide](./README.md#building-and-optimization)