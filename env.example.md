# Environment Variables

Copy this file to `.env.local` and fill in the values.

## Blockchain Configuration

```env
# Chain configuration (Base Sepolia)
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.basescan.org

# Contract addresses (set after deployment)
NEXT_PUBLIC_AUCTION_HOUSE_CONTRACT=
NEXT_PUBLIC_NFT_CONTRACT=

# Admin wallet address (for admin panel access)
NEXT_PUBLIC_ADMIN_WALLET=0xYourAdminWalletAddress
```

## Supabase Configuration (Database)

```env
# Supabase - Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Setup Steps:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the URL and anon/service keys
4. Run `lib/schema.sql` in the SQL Editor

## Pinata Configuration (IPFS - Future)

```env
# Pinata - For NFT metadata uploads
PINATA_JWT=your-pinata-jwt
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

## Development Notes

- **Testnet**: The app is configured for Base Sepolia testnet
- **Admin Access**: Only the wallet matching `NEXT_PUBLIC_ADMIN_WALLET` can access the admin panel
- **Demo Mode**: Without contracts deployed, the app runs in demo mode with mock data
- **Get Test ETH**: Use the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
