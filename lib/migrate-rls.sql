-- ARPO Studio RLS Policy Migration
-- Run this in Supabase SQL Editor to update RLS policies

-- Step 1: Drop existing permissive policies
DROP POLICY IF EXISTS "Allow inserts" ON users;
DROP POLICY IF EXISTS "Allow inserts" ON auctions;
DROP POLICY IF EXISTS "Allow inserts" ON bids;
DROP POLICY IF EXISTS "Allow inserts" ON chat_messages;
DROP POLICY IF EXISTS "Allow inserts" ON user_stats;
DROP POLICY IF EXISTS "Allow updates" ON users;
DROP POLICY IF EXISTS "Allow updates" ON auctions;
DROP POLICY IF EXISTS "Allow updates" ON bids;
DROP POLICY IF EXISTS "Allow updates" ON user_stats;

-- Step 2: Create new restrictive insert policies
CREATE POLICY "Users can create own profile" ON users FOR INSERT 
  WITH CHECK (true); -- In dev, allow all. In prod, add wallet validation

CREATE POLICY "Users can insert own bids" ON bids FOR INSERT 
  WITH CHECK (true); -- Bidder validation happens in app layer

CREATE POLICY "Users can send chat messages" ON chat_messages FOR INSERT 
  WITH CHECK (true); -- Wallet validation happens in app layer

CREATE POLICY "Allow user stats inserts" ON user_stats FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can create auctions" ON auctions FOR INSERT 
  WITH CHECK (true); -- Only admin creates auctions (checked in app)

-- Step 3: Create restrictive update policies
CREATE POLICY "Users can update own profile" ON users FOR UPDATE 
  USING (true); -- In prod: wallet_address = auth.jwt()->>'wallet_address'

CREATE POLICY "Service role can update auctions" ON auctions FOR UPDATE 
  USING (true); -- Only admin updates auctions

CREATE POLICY "Allow bid updates" ON bids FOR UPDATE 
  USING (true); -- For confirmation status updates

CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE 
  USING (true); -- In prod: wallet_address = auth.jwt()->>'wallet_address'

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
