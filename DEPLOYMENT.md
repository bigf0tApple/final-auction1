# Smart Contract Deployment Guide

## Overview

This guide explains how to deploy the ARPO Studio smart contracts to Base Sepolia testnet.

**Contracts:**
- **ARPONFT** - ERC-721 NFT contract
- **ARPOAuctionHouse** - Auction logic contract

## Option 1: Deploy via Remix IDE (Recommended)

The easiest way to deploy without local environment setup.

### Step 1: Open Remix IDE

Go to [https://remix.ethereum.org](https://remix.ethereum.org)

### Step 2: Create Contract File

1. In the File Explorer, click the "+" icon
2. Create a new file: `AuctionHouse.sol`
3. Copy the contents from `contracts/AuctionHouse.sol` into Remix

### Step 3: Install OpenZeppelin

1. In Remix, go to Plugin Manager (puzzle icon)
2. Search and install "REMIXD" if you need local file access
3. OpenZeppelin imports will auto-resolve

### Step 4: Compile

1. Go to Solidity Compiler tab (left sidebar)
2. Set compiler version to `0.8.20`
3. Enable optimization (200 runs)
4. Click "Compile AuctionHouse.sol"

### Step 5: Connect to Base Sepolia

1. In MetaMask, switch to Base Sepolia network
2. Get test ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
3. In Remix Deploy tab, select "Injected Provider - MetaMask"

### Step 6: Deploy ARPONFT

1. In the dropdown below "Deploy", select `ARPONFT`
2. Click "Deploy"
3. Confirm in MetaMask
4. **Copy the deployed address!**

### Step 7: Deploy ARPOAuctionHouse

1. Select `ARPOAuctionHouse` from dropdown
2. In the constructor fields, enter:
   - `_nftContract`: The ARPONFT address from Step 6
   - `_feeRecipient`: Your wallet address (for platform fees)
3. Click "Deploy"
4. Confirm in MetaMask
5. **Copy the deployed address!**

### Step 8: Configure ARPONFT

1. Expand the deployed ARPONFT contract
2. Find `setAuctionHouse` function
3. Enter the ARPOAuctionHouse address
4. Click "transact"
5. Confirm in MetaMask

### Step 9: Update Environment

Add to your `.env.local`:

```env
NEXT_PUBLIC_NFT_CONTRACT=<ARPONFT address>
NEXT_PUBLIC_AUCTION_HOUSE_CONTRACT=<ARPOAuctionHouse address>
```

## Option 2: Deploy via Hardhat (Requires Node.js 22+)

If you have Node.js 22+, you can use Hardhat:

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

# Create hardhat config
npx hardhat init

# Deploy
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## Supabase Setup (Required for Profiles & Search)

1. **Create Project**: Go to [Supabase](https://supabase.com) and create a new project.
2. **Database Schema**:
   - Go to "SQL Editor" in Supabase dashboard.
   - Copy content from `lib/schema.sql`.
   - Run the query to set up Users, Auctions, Bids, and Chat tables.
3. **Connect App**:
   - Get your **URL** and **anon Key** from Project Settings -> API.
   - Add them to `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=<your-url>
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
     ```

## Verify on Basescan (Optional)

1. Go to https://sepolia.basescan.org
2. Search for your contract address
3. Go to "Contract" tab
4. Click "Verify and Publish"
5. Select:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: 0.8.20
   - License: MIT
6. Paste the flattened source code
7. Submit

## Contract Addresses (After Deployment)

| Contract | Address |
|----------|---------|
| ARPONFT | `TBD` |
| ARPOAuctionHouse | `TBD` |

---

## Testing Locally

After deployment, test the flow:

1. **Create Auction**
   - Artist wallet calls `createAuction()` with metadata
   
2. **Place Bid**
   - Bidder calls `placeBid()` with ETH

3. **Settle Auction**
   - After time expires, call `settleAuction()`
   - NFT transfers to winner
   - ETH transfers to artist (minus 10% fee)

4. **Claim Refund**
   - Outbid users call `claimRefund()`
