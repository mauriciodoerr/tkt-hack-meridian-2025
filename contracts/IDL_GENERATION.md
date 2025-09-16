# 📋 IDL Generation for Soroban Smart Contract

## 🎯 Overview

This document explains how to generate Interface Definition Language (IDL) files for the Event Payment smart contract.

## 🔧 Available Methods

### 1. **Automatic Generation (Recommended)**
```bash
make generate-idl
```
This will:
- Build the contract
- Generate TypeScript bindings using Soroban CLI
- Create JSON schema files

### 2. **Manual Script**
```bash
./generate-idl.sh
```
Runs the IDL generation script directly.

### 3. **Using Soroban CLI Directly**
```bash
# Build first
cargo build --target wasm32-unknown-unknown --release

# Generate TypeScript bindings
soroban contract bindings typescript \
  --wasm target/wasm32-unknown-unknown/release/payment_with_fee.wasm \
  --output-dir ./bindings \
  --overwrite
```

## 📁 Generated Files

### TypeScript Bindings
- **Location**: `./bindings/`
- **Files**:
  - Contract client classes
  - Type definitions
  - Method interfaces

### JSON Schema
- **File**: `payment_with_fee.schema.json`
- **Content**: Complete contract interface documentation

### IDL JSON (Fallback)
- **File**: `payment_with_fee.idl.json`
- **Content**: Function signatures and types

## 🏗️ Contract Interface

### Main Functions

| Function | Description | Inputs | Outputs |
|----------|-------------|--------|---------|
| `initialize` | Initialize contract | admin, fee_rate, token_address | Result<(), Error> |
| `create_event` | Create new event | organizer, name, fee_rate? | Result<u64, Error> |
| `create_event_with_allowance` | Create event + set allowance | organizer, name, fee_rate?, allowance | Result<u64, Error> |
| `register_wallet_for_event` | Register wallet for event | event_id, wallet | Result<(), Error> |
| `event_payment` | Make payment in event | event_id, from, to, amount | Result<(), Error> |
| `withdraw_event_fees` | Withdraw fees (organizer) | event_id | Result<i128, Error> |

### Data Types

#### Event
```rust
struct Event {
    id: u64,
    name: String,
    organizer: Address,
    fee_rate: u32,        // basis points (50 = 5%)
    is_active: bool,
    created_at: u64,
    total_volume: i128,
}
```

#### ContractConfig
```rust
struct ContractConfig {
    default_fee_rate: u32,
    admin: Address,
    next_event_id: u64,
    token_address: Address,
}
```

## 🚀 Usage Examples

### JavaScript/TypeScript Integration
```typescript
import { EventPaymentContractClient } from './bindings';

const client = new EventPaymentContractClient({
  networkPassphrase: Networks.TESTNET,
  contractId: 'CONTRACT_ID_HERE',
});

// Initialize contract
await client.initialize({
  admin: 'ADMIN_ADDRESS',
  default_fee_rate: 50, // 5%
  token_address: 'TOKEN_CONTRACT_ADDRESS'
});

// Create event
const eventId = await client.create_event({
  organizer: 'ORGANIZER_ADDRESS',
  name: 'Music Festival',
  fee_rate: null // Use default fee
});
```

### Rust Integration
```rust
use payment_with_fee::EventPaymentContractClient;

let client = EventPaymentContractClient::new(&env, &contract_address);

// Initialize
client.initialize(&admin, &50, &token_address);

// Create event
let event_id = client.create_event(&organizer, &"Festival".into(), &None);
```

## 🔄 Updating IDL

When you modify the contract:

1. **Update contract code**
2. **Run tests**: `make test`
3. **Regenerate IDL**: `make generate-idl`
4. **Update client applications** with new bindings

## 📊 File Structure

```
contracts/
├── src/lib.rs                     # Contract source
├── bindings/                      # Generated TypeScript bindings
├── payment_with_fee.schema.json   # Detailed schema
├── payment_with_fee.idl.json      # Basic IDL (fallback)
├── generate-idl.sh               # Generation script
└── IDL_GENERATION.md             # This documentation
```

## 🛠️ Troubleshooting

### Soroban CLI Not Found
```bash
# Install Soroban CLI
cargo install soroban-cli

# Or use package manager
brew install soroban-cli
```

### Build Errors
```bash
# Clean and rebuild
make clean
make build
```

### Missing Dependencies
```bash
# Install all dependencies
make install-deps
make deps-check
```

## 📚 Resources

- [Soroban Documentation](https://soroban.stellar.org/)
- [Soroban CLI Reference](https://soroban.stellar.org/docs/tools/cli)
- [TypeScript Integration](https://soroban.stellar.org/docs/tutorials/typescript)