# StakeForge Smart Contracts

## ⚠️ CRITICAL: DO NOT DEPLOY WITHOUT AUDIT

These contracts handle real user assets (NFTs + ETH). They **MUST** be professionally audited before mainnet deployment.

## Architecture

```
StakeForgeVault.sol
├── NFT staking (ERC-721)
├── 3-tier fee splitting (admin micro-fee, operator %, project %)
├── Soft / Hard / Flexible stake modes
├── Emergency unlock (rug protection)
├── Emergency wallet switch
├── Pausable (circuit breaker)
└── Role-based access (ADMIN, OPERATOR, PROJECT)
```

## Deployment Steps

### 1. Install dependencies
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
npx hardhat init
```

### 2. Compile
```bash
npx hardhat compile
```

### 3. Deploy to Sepolia testnet first
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Get a professional audit
Recommended auditors:
- [OpenZeppelin](https://openzeppelin.com/security-audits)
- [Trail of Bits](https://www.trailofbits.com/)
- [Certik](https://www.certik.com/)
- [Code4rena](https://code4rena.com/) (competitive audit)

### 5. Deploy to mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### 6. Update the frontend
After deploying, update `src/lib/contracts/config.ts` with:
- The deployed contract address
- The correct chain ID

## Constructor Parameters

| Parameter | Description |
|-----------|-------------|
| `_adminWallet` | Your wallet — receives the $0.12 micro-fee |
| `_adminBackupWallet` | Emergency backup wallet |
| `_operatorWallet` | Your employer's wallet — receives operator % fees |
| `_adminMicroFeeWei` | The micro-fee in wei (use price feed to calculate) |

## Fee Flow

```
User stakes NFT + sends ETH micro-fee
    │
    ├── $0.12 equivalent in ETH → Admin wallet (non-negotiable)
    │
    └── On reward distribution:
        ├── Operator fee % → Operator wallet
        ├── Project fee % → Project treasury
        └── Remainder → User
```

## Emergency Functions

| Function | Who | What |
|----------|-----|------|
| `emergencyUnlock()` | Admin | Force-return a single NFT to its owner |
| `emergencyUnlockBulk()` | Admin | Mass return NFTs (rug protection) |
| `emergencyWalletSwitch()` | Admin | Redirect all fees to backup wallet instantly |
| `pause()` | Admin | Freeze all staking/unstaking |
| `unpause()` | Admin | Resume operations |
