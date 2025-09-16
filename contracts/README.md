# Stellar Smart Contract - EventCoin

This smart contract implements an event-based payment system on the Stellar network where:
- Events/festivals can be created and managed by organizers
- Wallets register to participate in specific events
- Payments are made between registered participants within events
- Fee collection and withdrawal system for event organizers

## Key Features

### 1. Contract Initialization
```rust
initialize(admin: Address, default_fee_rate: u32, token_address: Address) -> Result<(), ContractError>
```
- Sets the contract administrator and default fee rate (in basis points: 500 = 5%)
- Configures the token contract address for payments

### 2. Event Management

#### Create Event
```rust
create_event(organizer: Address, name: String, fee_rate: Option<u32>) -> Result<u64, ContractError>
```
- Creates a new event with optional custom fee rate
- Returns unique event ID

#### Create Event with Automatic Allowance
```rust
create_event_with_allowance(
    organizer: Address,
    name: String,
    fee_rate: Option<u32>,
    max_allowance: i128
) -> Result<u64, ContractError>
```
- Creates event and automatically sets up organizer allowance for fee payments

#### Event Status Management
```rust
set_event_status(event_id: u64, is_active: bool) -> Result<(), ContractError>
```
- Activate or deactivate events (organizer only)

### 3. Wallet Registration System

#### Register for Event
```rust
register_wallet_for_event(event_id: u64, wallet: Address) -> Result<(), ContractError>
```
- Register a wallet to participate in an event
- **Note**: Organizer pays the transaction fee

#### Check Registration
```rust
is_wallet_registered(event_id: u64, wallet: Address) -> bool
```

### 4. Event Payments
```rust
event_payment(
    event_id: u64,
    from: Address,      // Sender
    to: Address,        // Recipient
    amount: i128        // Amount to send
) -> Result<(), ContractError>
```
- Both sender and recipient must be registered for the event
- Fee is automatically deducted and accumulated for organizer
- **Correct fee calculation**: Uses basis points with 10000 divisor

### 5. Fee Management

#### Query Event Fees
```rust
get_event_fees(event_id: u64) -> i128
```

#### Withdraw Event Fees (Organizer Only)
```rust
withdraw_event_fees(event_id: u64) -> Result<i128, ContractError>
```
- Only available when event is inactive
- Transfers accumulated fees to organizer

### 6. Authorization System

#### Authorize Fee Payments
```rust
authorize_fee_payments(fee_payer: Address, max_fee_amount: i128) -> Result<(), ContractError>
```

#### Increase Event Allowance
```rust
increase_event_allowance(event_id: u64, additional_allowance: i128) -> Result<(), ContractError>
```

### 7. General Payment Functions (Legacy Compatibility)

#### Payment with Third Party Fee
```rust
payment_with_third_party_fee(
    from: Address,
    to: Address,
    fee_payer: Address,
    amount: i128
) -> Result<(), ContractError>
```

#### Payment with Pre-authorized Fee Payer
```rust
payment_with_auth_fee_payer(
    from: Address,
    to: Address,
    fee_payer: Address,
    amount: i128
) -> Result<(), ContractError>
```

## How Event Payments Work

1. **Event Creation**: Organizer creates an event with custom or default fee rate
2. **Registration**: Participants register their wallets for the event
3. **Payment Flow**:
   - Sender transfers full amount to contract
   - Contract transfers net amount (amount - fee) to recipient
   - Fee is accumulated in contract for organizer
   - Organizer can withdraw fees when event becomes inactive

## Fee Calculation (CORRECTED)

The contract now uses **correct basis point calculation**:
- Fee rate 500 = 5% (500/10000 = 0.05)
- For a payment of 200 tokens with 5% fee:
  - Fee amount: 200 × 500 ÷ 10000 = 10 tokens
  - Net amount: 200 - 10 = 190 tokens to recipient
  - Accumulated fee: 10 tokens for organizer

## Example Usage

```rust
// Initialize contract with 5% default fee rate
client.initialize(&admin, &500, &token_address);

// Create event
let event_id = client.create_event(&organizer, &"Rock Festival 2024", &None);

// Register participants
client.register_wallet_for_event(&event_id, &alice);
client.register_wallet_for_event(&event_id, &bob);

// Make payment within event (200 tokens, 5% fee = 10 tokens)
client.event_payment(&event_id, &alice, &bob, &200);

// Result:
// - Alice: paid 200 tokens
// - Bob: received 190 tokens (200 - 10 fee)
// - Contract: accumulated 10 tokens fee for organizer
// - Event total volume: 200 tokens

// When event ends, organizer can withdraw fees
client.set_event_status(&event_id, &false);  // Deactivate event
let fees = client.withdraw_event_fees(&event_id);  // Withdraws 10 tokens
```

## Contract Events

The contract emits the following events:

### EventCreated
- event_id, name, organizer, fee_rate

### PaymentEvent
- event_id, from, to, fee_payer, amount, fee_amount, fee_rate

## Testing

The project includes comprehensive tests covering:

1. **Event creation and management**
2. **Wallet registration system**
3. **Event payment functionality**
4. **Fee calculation accuracy**
5. **Authorization and allowance system**
6. **Event fee withdrawal**
7. **Edge cases and error handling**
8. **Admin-only functions**
9. **Multiple events interaction**
10. **Registration restrictions**

### Run Tests

```bash
cargo test
```

All 18 tests pass, ensuring:
- Correct fee calculations (5% of 200 = 10 tokens, not 100)
- Proper event flow management
- Security validations
- Registration requirements

## Building and Optimization

### Standard Build
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Optimized Build (Recommended for Production)

The project includes an optimization script that reduces WASM file size significantly:

```bash
./optimize.sh
```

**What the optimization script does:**

1. **Compiles** the contract in release mode
2. **Shows** original WASM file size
3. **Optimizes** using `wasm-opt` with maximum optimization flags:
   - `-Oz`: Optimize for size
   - `--enable-bulk-memory`: Enable bulk memory operations
4. **Displays** size comparison and reduction percentage
5. **Outputs** optimized WASM to `payment_with_fee_optimized.wasm`

**Prerequisites:**
- Install `wasm-opt`:
  ```bash
  # macOS
  brew install binaryen

  # Linux
  sudo apt-get install binaryen

  # Or download from: https://github.com/WebAssembly/binaryen
  ```

**Expected Results:**
- Typical size reduction: 30-50%
- Faster deployment and execution
- Lower transaction costs on Stellar network

**Example output:**
```
🔧 Compiling contrato with optimizations...
📦 Original WASM size: 45K
✨ Size after optimization: 28K
🎯 Reduction: 37.8%
✅ Optimized WASM saved to: target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm
```

**Deployment:**
Use the optimized WASM file for deployment:
```bash
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/payment_with_fee_optimized.wasm --source YOUR_SECRET_KEY --network testnet
```

## Project Structure

```
contracts/
├── Cargo.toml              # Project configuration
├── optimize.sh             # WASM optimization script
├── src/
│   ├── lib.rs              # Main contract implementation
│   ├── test_events.rs      # Event-related tests
│   ├── test.rs            # General contract tests
│   └── main.rs            # Entry point
├── target/                 # Build output directory
│   └── wasm32-unknown-unknown/release/
│       ├── payment_with_fee.wasm           # Standard build
│       └── payment_with_fee_optimized.wasm # Optimized build (after running optimize.sh)
└── README.md              # This documentation
```

## Security Features

- Authentication required for all operations
- Balance validation before transfers
- Registration requirements for event participation
- Organizer-only functions for event management
- Protection against negative or zero amounts
- Fee rate limits (max 10%)
- Event status controls for fee withdrawals
- Proper error handling with custom error types

## Error Types

- `EventNotFound` - Event doesn't exist
- `EventNotActive` - Event is inactive
- `WalletNotRegistered` - Wallet not registered for event
- `InsufficientAllowance` - Not enough allowance for fees
- `InsufficientBalanceFromSender` - Sender has insufficient balance
- `FeeRateExceeds10Percent` - Fee rate above maximum
- `AmountMustBePositive` - Invalid amount
- And more...

## Token Integration

The contract integrates with Stellar token contracts supporting:
- `balance()` - Check token balance
- `transfer()` - Transfer tokens
- `approve()` - Approve allowances
- `allowance()` - Check allowances
- `transfer_from()` - Transfer from allowances