-- ARPO Studio Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to wallet addresses)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  profile_pic_url TEXT,
  ens_name TEXT,
  bio TEXT,
  twitter TEXT,
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  artist_name TEXT,
  image_ipfs_cid TEXT NOT NULL,
  teaser_ipfs_cid TEXT,
  accepted_token TEXT DEFAULT 'ETH',
  starting_price DECIMAL(18,8) NOT NULL,
  current_bid DECIMAL(18,8),
  highest_bidder TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'settled')),
  winner_wallet TEXT,
  nft_contract TEXT,
  nft_token_id TEXT,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_start_time ON auctions(start_time);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_wallet TEXT NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  tx_hash TEXT,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for auction bid lookups
CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_wallet);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
  user_wallet TEXT NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for chat lookups
CREATE INDEX IF NOT EXISTS idx_chat_auction ON chat_messages(auction_id);

-- User stats (for profiles)
CREATE TABLE IF NOT EXISTS user_stats (
  wallet_address TEXT PRIMARY KEY,
  total_bids INTEGER DEFAULT 0,
  auctions_won INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_stats table
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read for most tables
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON auctions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bids FOR SELECT USING (true);
CREATE POLICY "Public read access" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public read access" ON user_stats FOR SELECT USING (true);

-- Policies: Allow inserts with wallet validation
-- Users can only create their own profile
CREATE POLICY "Users can create own profile" ON users FOR INSERT 
  WITH CHECK (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address' OR current_setting('request.jwt.claims', true) IS NULL);

-- Bids: Bidder can insert their own bids
CREATE POLICY "Users can insert own bids" ON bids FOR INSERT 
  WITH CHECK (bidder_wallet = current_setting('request.jwt.claims')::json->>'wallet_address' OR current_setting('request.jwt.claims', true) IS NULL);

-- Chat: Users can send their own messages  
CREATE POLICY "Users can send chat messages" ON chat_messages FOR INSERT 
  WITH CHECK (user_wallet = current_setting('request.jwt.claims')::json->>'wallet_address' OR current_setting('request.jwt.claims', true) IS NULL);

-- User stats: Auto-created, allow inserts
CREATE POLICY "Allow user stats inserts" ON user_stats FOR INSERT WITH CHECK (true);

-- Auctions: Only admins/service role can create (handled server-side)
CREATE POLICY "Service role can create auctions" ON auctions FOR INSERT WITH CHECK (true);

-- Policies: Restricted updates (users can only update their own data)
-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE 
  USING (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address' OR current_setting('request.jwt.claims', true) IS NULL);

-- Auctions: Only service role/admin can update
CREATE POLICY "Service role can update auctions" ON auctions FOR UPDATE USING (true);

-- Bids: Generally immutable, but allow confirmation updates
CREATE POLICY "Allow bid updates" ON bids FOR UPDATE USING (true);

-- User stats: Users can update their own stats
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE 
  USING (wallet_address = current_setting('request.jwt.claims')::json->>'wallet_address' OR current_setting('request.jwt.claims', true) IS NULL);

-- Note: For development, we allow all operations.
-- In production, use service role for admin operations and 
-- implement proper JWT claims for wallet-based access control.
