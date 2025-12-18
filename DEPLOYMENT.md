# 🚀 Smart Contract Deployment Guide

## Prerequisites

1. **Wallet with Base Sepolia ETH**
   - Get free testnet ETH from [Coinbase Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
   - Or use the [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia)

2. **Private Key**
   - Export from MetaMask: Settings → Security → Reveal Private Key
   - ⚠️ **NEVER share or commit your private key!**

## Setup

1. Add your private key to `.env.local`:
   ```
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
   ```

2. Ensure RPC is configured:
   ```
   NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
   NEXT_PUBLIC_CHAIN_ID=84532
   ```

## Deployment

Run the deployment script:
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

This will:
1. Deploy `ARPONFT` contract
2. Deploy `ARPOAuctionHouse` contract
3. Link them together
4. Output the contract addresses

## After Deployment

Update `.env.local` with the deployed addresses:
```
NEXT_PUBLIC_NFT_CONTRACT=0x...
NEXT_PUBLIC_AUCTION_HOUSE_CONTRACT=0x...
```

Then restart your dev server:
```bash
npm run dev
```

## Verify Contracts (Optional)

```bash
# Verify NFT contract
npx hardhat verify --network baseSepolia <NFT_ADDRESS>

# Verify AuctionHouse contract
npx hardhat verify --network baseSepolia <AUCTION_HOUSE_ADDRESS> <NFT_ADDRESS> <FEE_RECIPIENT>
```

## Contract Addresses (after deployment)

| Contract | Address |
|----------|---------|
| ARPONFT | `[TO BE FILLED]` |
| ARPOAuctionHouse | `[TO BE FILLED]` |

## Base Sepolia Block Explorer

View your contracts: https://sepolia.basescan.org/
