use std::fs;
use std::path::Path;

// Script para gerar IDL manualmente
fn main() {
    let idl_content = r#"{
  "functions": [
    {
      "name": "initialize",
      "inputs": [
        {"name": "admin", "type": "address"},
        {"name": "default_fee_rate", "type": "u32"},
        {"name": "token_address", "type": "address"}
      ],
      "outputs": [
        {"type": "result", "ok": "void", "error": "ContractError"}
      ]
    },
    {
      "name": "create_event",
      "inputs": [
        {"name": "organizer", "type": "address"},
        {"name": "name", "type": "string"},
        {"name": "fee_rate", "type": "option", "value": "u32"}
      ],
      "outputs": [
        {"type": "result", "ok": "u64", "error": "ContractError"}
      ]
    },
    {
      "name": "create_event_with_allowance",
      "inputs": [
        {"name": "organizer", "type": "address"},
        {"name": "name", "type": "string"},
        {"name": "fee_rate", "type": "option", "value": "u32"},
        {"name": "max_allowance", "type": "i128"}
      ],
      "outputs": [
        {"type": "result", "ok": "u64", "error": "ContractError"}
      ]
    },
    {
      "name": "register_wallet_for_event",
      "inputs": [
        {"name": "event_id", "type": "u64"},
        {"name": "wallet", "type": "address"}
      ],
      "outputs": [
        {"type": "result", "ok": "void", "error": "ContractError"}
      ]
    },
    {
      "name": "unregister_wallet_from_event",
      "inputs": [
        {"name": "event_id", "type": "u64"},
        {"name": "wallet", "type": "address"}
      ],
      "outputs": [
        {"type": "result", "ok": "void", "error": "ContractError"}
      ]
    },
    {
      "name": "event_payment",
      "inputs": [
        {"name": "event_id", "type": "u64"},
        {"name": "from", "type": "address"},
        {"name": "to", "type": "address"},
        {"name": "amount", "type": "i128"}
      ],
      "outputs": [
        {"type": "result", "ok": "void", "error": "ContractError"}
      ]
    },
    {
      "name": "payment",
      "inputs": [
        {"name": "from", "type": "address"},
        {"name": "to", "type": "address"},
        {"name": "amount", "type": "i128"},
        {"name": "fee_payer", "type": "address"}
      ],
      "outputs": [
        {"type": "result", "ok": "void", "error": "ContractError"}
      ]
    },
    {
      "name": "withdraw_event_fees",
      "inputs": [
        {"name": "event_id", "type": "u64"}
      ],
      "outputs": [
        {"type": "result", "ok": "i128", "error": "ContractError"}
      ]
    },
    {
      "name": "authorize_fee_payments",
      "inputs": [
        {"name": "fee_payer", "type": "address"},
        {"name": "max_fee_amount", "type": "i128"}
      ],
      "outputs": [
        {"type": "result", "ok": "void", "error": "ContractError"}
      ]
    },
    {
      "name": "increase_event_allowance",
      "inputs": [
        {"name": "event_id", "type": "u64"},
        {"name": "additional_allowance", "type": "i128"}
      ],
      "outputs": [
        {"type": "result", "ok": "void", "error": "ContractError"}
      ]
    },
    {
      "name": "get_event",
      "inputs": [
        {"name": "event_id", "type": "u64"}
      ],
      "outputs": [
        {"type": "result", "ok": "Event", "error": "ContractError"}
      ]
    },
    {
      "name": "get_config",
      "inputs": [
        {"name": "admin", "type": "address"}
      ],
      "outputs": [
        {"type": "ContractConfig"}
      ]
    },
    {
      "name": "get_event_fees",
      "inputs": [
        {"name": "event_id", "type": "u64"}
      ],
      "outputs": [
        {"type": "i128"}
      ]
    },
    {
      "name": "get_fee_authorization",
      "inputs": [
        {"name": "fee_payer", "type": "address"}
      ],
      "outputs": [
        {"type": "i128"}
      ]
    },
    {
      "name": "is_wallet_registered",
      "inputs": [
        {"name": "event_id", "type": "u64"},
        {"name": "wallet", "type": "address"}
      ],
      "outputs": [
        {"type": "bool"}
      ]
    }
  ],
  "types": [
    {
      "name": "Event",
      "type": "struct",
      "fields": [
        {"name": "id", "type": "u64"},
        {"name": "name", "type": "string"},
        {"name": "organizer", "type": "address"},
        {"name": "fee_rate", "type": "u32"},
        {"name": "is_active", "type": "bool"},
        {"name": "created_at", "type": "u64"},
        {"name": "total_volume", "type": "i128"}
      ]
    },
    {
      "name": "ContractConfig",
      "type": "struct",
      "fields": [
        {"name": "default_fee_rate", "type": "u32"},
        {"name": "admin", "type": "address"},
        {"name": "next_event_id", "type": "u64"},
        {"name": "token_address", "type": "address"}
      ]
    },
    {
      "name": "ContractError",
      "type": "enum",
      "cases": [
        {"name": "FeeRateExceeds10Percent", "value": 1},
        {"name": "AmountMustBePositive", "value": 2},
        {"name": "ContractNotInitialized", "value": 3},
        {"name": "InsufficientBalanceFromSender", "value": 4},
        {"name": "InsufficientAllowance", "value": 5},
        {"name": "EventNotFound", "value": 6},
        {"name": "EventNotActive", "value": 7},
        {"name": "NotEventOrganizer", "value": 8},
        {"name": "EventNameTooLong", "value": 9},
        {"name": "EventAlreadyExists", "value": 10},
        {"name": "AlreadyInitialized", "value": 11},
        {"name": "EventStillActive", "value": 12},
        {"name": "WalletNotRegistered", "value": 13},
        {"name": "WalletAlreadyRegistered", "value": 14},
        {"name": "OrganizerCannotRegister", "value": 15},
        {"name": "NotAdmin", "value": 16}
      ]
    }
  ],
  "events": [
    {
      "name": "EventCreated",
      "fields": [
        {"name": "event_id", "type": "u64"},
        {"name": "name", "type": "string"},
        {"name": "organizer", "type": "address"},
        {"name": "fee_rate", "type": "u32"}
      ]
    },
    {
      "name": "PaymentEvent",
      "fields": [
        {"name": "event_id", "type": "u64"},
        {"name": "from", "type": "address"},
        {"name": "to", "type": "address"},
        {"name": "fee_payer", "type": "address"},
        {"name": "amount", "type": "i128"},
        {"name": "fee_amount", "type": "i128"},
        {"name": "fee_rate", "type": "u32"}
      ]
    }
  ]
}"#;

    // Escrever IDL para arquivo
    fs::write("payment_with_fee.idl.json", idl_content).expect("Failed to write IDL file");
    println!("✅ IDL generated: payment_with_fee.idl.json");
}