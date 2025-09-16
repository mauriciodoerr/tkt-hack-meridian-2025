# EventCoin Frontend

Frontend built with **Next.js 15** to interact with Soroban/Stellar smart contracts.  
This project was created as part of the **Meridian Hackathon / TKT** solution.

---

## 🚀 Tech Stack

- [Next.js 15](https://nextjs.org/) (with Turbopack)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [@stellar/stellar-sdk](https://github.com/stellar/js-stellar-sdk)
- Soroban contract integration

---

## 📂 Project Structure

```
frontend/
├── app/                # Next.js routes (App Router)
├── components/         # Reusable UI components
├── lib/                # Stellar/Soroban integration (e.g. passkeySoroban.ts)
├── public/             # Static assets
├── styles/             # Global styles (Tailwind)
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

---

## ⚙️ Requirements

- Node.js **20+**
- [pnpm](https://pnpm.io/) or npm
- A funded account on the [Stellar Testnet](https://developers.stellar.org/docs/fundamentals-and-concepts/testnet)

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/eventcoin-frontend.git
cd eventcoin-frontend
pnpm install   # or npm install
```

---

## ▶️ Running Locally

Start the development server:

```bash
pnpm dev
```

By default the app runs on [http://localhost:3000](http://localhost:3000).

Build for production:

```bash
pnpm build
pnpm start
```

---

## 🔑 Stellar / Soroban Integration

- Wallets are derived from **passkeys** (WebAuthn).
- Contracts are called using `@stellar/stellar-sdk` helpers (`TransactionBuilder`, `Contract.call`, etc.).
- Arguments (`ScVal`) are encoded in `lib/passkeySoroban.ts`.

---

## 🛠 Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_CONTRACT_ID=CDIUQ4ST7G5U3SV7MY4QN22LKFJ2QWCNOEU62HUVL3KYPD7IY6PTWDDN
```

---

## 📖 License

MIT
