1. Veripharm is a blockchain‑enabled pharmaceutical traceability and counterfeit‑detection system. It uses an Ethereum smart‑contract backend (Solidity/Hardhat), a Django REST API, and a React frontend to let manufacturers, distributors, pharmacies, and patients track every drug batch from production to purchase.

2. Repository Structure

```
veripharm/
├── contracts/            # Solidity smart contracts
│   └── Veripharm.sol
├── scripts/
│   └── deploy.js         # Deploy scripts for Hardhat (local & Sepolia)
├── test/
│   └── veripharm.test.js # Hardhat unit & integration tests
├── hardhat.config.js     # Hardhat & network config
├── .env          # Environment variables
└── README.md             # this file

```



3. Compile & Test Contracts (Local):
npx hardhat compile
npx hardhat test           # runs contracts’ unit & integration tests

4. Deploy Contracts to local Hardhat Network
To start a local node:
npx hardhat node

In another terminal, deploy:
npx hardhat run scripts/deploy.js --network localhost.
