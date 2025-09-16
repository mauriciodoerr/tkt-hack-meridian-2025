# tkt-hack-meridian-2025

**TKT Project for HackMeridian 2025**  
A full-stack solution combining **Next.js frontend** with **Soroban smart contracts** on Stellar, enabling event ticketing and on-chain payments using passkeys.

---

## 📦 Project Structure

```
tkt-hack-meridian-2025/
├── contracts/           # Soroban smart contracts (Rust)
├── frontend/            # Next.js app (React + Tailwind)
├── docker-compose.yml   # Dev environment setup
└── README.md            # Project documentation
```

- **contracts/** → Contains Soroban contracts (Rust, compiled to WASM).
- **frontend/** → React (Next.js 15) application that interacts with contracts.
- **docker-compose.yml** → Local infra helpers for frontend/backend if needed.

---

## 🚀 Tech Stack

- **Frontend**

  - Next.js 15 + Turbopack
  - TailwindCSS
  - TypeScript
  - Stellar SDK (`@stellar/stellar-sdk`)
  - Passkey (WebAuthn) wallet integration

- **Smart Contracts**

  - Soroban (Rust-based WASM contracts)
  - OpenZeppelin for Stellar templates

- **Ecosystem**
  - Stellar Testnet
  - SoroSwap (liquidity + DeFi features)

---

## 🛠 Environment Setup

### Prerequisites

- Node.js **20+**
- pnpm or npm
- Rust + Soroban CLI (`cargo install soroban-cli --locked`)
- Docker (optional, for containerized workflows)
- Stellar Testnet account funded via [friendbot](https://developers.stellar.org/docs/tools/quickstart/getting-started/friendbot)

---

## ▶️ Running Locally

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

App available at: [http://localhost:3000](http://localhost:3000)

### Contracts

```bash
cd contracts
soroban build
soroban deploy   --wasm target/wasm32-unknown-unknown/release/event_payment.wasm   --network testnet   --source <YOUR_ACCOUNT>
```

---

## 🌍 Useful Links

### Stellar

- https://developers.stellar.org/docs/tools/quickstart/getting-started/deploy-smart-contract

### HackMeridian 2025

- https://www.notion.so/HackMeridian-2025-Official-Rules-20ad0985c3a28056bc6fdadd36db015e

---

## 📖 License

MIT
