# ARPO Studio - Smart Contract Logic Spec

## 🧠 The "Bid Pool" Architecture

To support the vision of **non-rejected transactions** and seamless user refunds ("I'm Out"), the smart contract uses a **Deposit-First** or **Balance-Based** architecture.

### 1. The Bid Pool (User Balances)
Instead of sending funds *only* to bid, users effectively "deposit" into their personal balance on the contract.

*   **Logic:** `mapping(address => uint256) public userBalance;`
*   **When User Bids:**
    1.  Contract adds `msg.value` (new ETH) to `userBalance[msg.sender]`.
    2.  Contract calculates `minBid` (current + 1%) and `maxBid` (current + 10%).
    3.  **If user's available balance >= minBid:**
        *   Bid amount = MIN(available balance, maxBid)
        *   Previous leader's funds are unlocked
        *   New leader is set with capped bid
    4.  **If NOT High Enough:**
        *   Transaction **does not fail**.
        *   Funds are simply deposited to `userBalance[msg.sender]`.
        *   User can try again later with more funds.

### 2. "I'm Out, Thanks" (Withdrawal)
Any user can withdraw their funds at any time, with one exception: **The Current Highest Bidder**.

*   **Function:** `withdraw(uint256 amount)`
*   **Logic:**
    1.  Check `amount <= userBalance[msg.sender]`.
    2.  **Constraint:** If `msg.sender == highestBidder`, they must leave at least `currentBidAmount` in the contract.
        *   *Correction for vision:* Typically, the highest bidder cannot withdraw the bid *amount*, only the excess.
    3.  Transfer ETH to user.
    4.  Update `userBalance`.

### 3. Settlement & Fees
When the auction time ends:

*   **Trigger:** Admin (or anyone) calls `settleAuction()`.
*   **Logic:**
    1.  Identify `highestBidder` and `currentBidAmount`.
    2.  **Platform Fee:** Calculate 10% of `currentBidAmount`.
        *   Send to `platformWallet`.
    3.  **Artist Payment:** Remaining 90%.
        *   Send to `artistWallet`.
    4.  **NFT Transfer:**
        *   Transfer NFT from Contract/Artist to `highestBidder`.
    5.  **Loser Refunds:**
        *   Since this is a Pull pattern, losers simply press "I'm Out" (Withdraw) whenever they want. Their funds were never "spent", just sitting in their `userBalance`.

### 4. Anti-Sniping
*   **Window:** Last 10 seconds of auction.
*   **Trigger:** Any valid leading bid in this window.
*   **Action:** Extend `auctionEndTime` by 10 seconds.

### 5. Bid Increment Rules
| Scenario | Minimum Bid | Maximum Bid |
|----------|-------------|-------------|
| First bid | Reserve price | Reserve price |
| Subsequent | Current + 1% | Current + 10% |

---

## 💻 Technical Methods

### Write Functions (User Interactions)

#### `placeBid()`
*   **Payable**: Yes
*   **Parameters**: `uint256 auctionId`
*   **Behavior**: Adds sent ETH to user's internal balance. Attempts to acquire "Highest Bidder" status. Emits `BidPlaced` or `DepositReceived`.

#### `withdraw()`
*   **Payable**: No
*   **Parameters**: `uint256 amount` (or `withdrawAll`)
*   **Behavior**: Sends ETH back to user. Fails only if user tries to withdraw funds locked by an active winning bid.

### View Functions (Frontend Helpers)

#### `getUserPurchasingPower(address user)`
*   Returns: `userBalance[user]`
*   Use: Shows the user "You have X ETH in the pool available to bid".

#### `getWinningBidder()`
*   Returns: `address` (The "0xblahblah" to display on UI).

---

## 🛡 Security Concerns & Mitigations

1.  **Re-entrancy Attacks**:
    *   *Risk:* User calls withdraw, contract calls back into user wallet, which calls withdraw again before balance updates.
    *   *Fix:* Use `ReentrancyGuard` (nonReentrant modifier) on all Withdraw/Bid functions. Update balances *before* sending ETH.

2.  **Gas Griefing (Settlement)**:
    *   *Risk:* Sending ETH to multiple losers automatically runs out of gas.
    *   *Fix:* **Pull Payment** (The current design). We do NOT send refunds automatically. We let users click "I'm Out". This creates a constant gas cost regardless of bidder count.

3.  **Rejecting Bids**:
    *   The "Bid Pool" design ensures that if you send money but don't win, the transaction succeeds (you successfully deposited). This matches the "No rejected transaction" requirement.

---

## 🪝 V4 Hooks Architecture

The AuctionHouse contract supports **extensible hooks** (inspired by Uniswap V4), allowing external logic to be injected at key points in the auction lifecycle.

### How It Works

1.  **IHooks Interface** (`contracts/interfaces/IHooks.sol`)
    External contracts can implement this interface to add custom logic.
    
    ```solidity
    interface IHooks {
        function beforePlaceBid(uint256 auctionId, address bidder, uint256 amount) external returns (bytes4);
        function afterPlaceBid(uint256 auctionId, address bidder, uint256 amount) external returns (bytes4);
        function beforeSettle(uint256 auctionId, address winner, uint256 amount) external returns (bytes4);
        function afterSettle(uint256 auctionId, address winner, uint256 tokenId) external returns (bytes4);
    }
    ```

2.  **Set Hooks** (Admin Only)
    ```solidity
    function setHooks(address _hooks) external onlyOwner;
    ```
    Pass `address(0)` to disable hooks.

3.  **Hook Execution Points**
    | Hook | When | Use Cases |
    |------|------|-----------|
    | `beforePlaceBid` | Before bid processing | Allowlist checks, KYC, Anti-bot |
    | `afterPlaceBid` | After successful bid | Loyalty rewards, Analytics |
    | `beforeSettle` | Before settlement | Royalty checks, Final approvals |
    | `afterSettle` | After NFT minted | Winner rewards, Notifications |

### Example: Allowlist Hook

```solidity
contract AllowlistHook is IHooks {
    mapping(address => bool) public allowed;
    
    function beforePlaceBid(uint256, address bidder, uint256) external view returns (bytes4) {
        require(allowed[bidder], "Not on allowlist");
        return IHooks.beforePlaceBid.selector;
    }
    
    function afterPlaceBid(uint256, address, uint256) external pure returns (bytes4) {
        return IHooks.afterPlaceBid.selector;
    }
}
```

### Example: Reward Token Hook

```solidity
contract RewardHook is IHooks {
    IERC20 public rewardToken;
    uint256 public rewardAmount = 100 * 10**18; // 100 tokens
    
    function beforePlaceBid(uint256, address, uint256) external pure returns (bytes4) {
        return IHooks.beforePlaceBid.selector;
    }
    
    function afterPlaceBid(uint256, address bidder, uint256) external returns (bytes4) {
        rewardToken.transfer(bidder, rewardAmount);
        return IHooks.afterPlaceBid.selector;
    }
}
```

### Security Notes

*   Hooks are **optional** - if `hooks == address(0)`, no external calls are made.
*   `beforePlaceBid` can **reject** a bid by not returning the correct selector.
*   `afterPlaceBid` runs after state changes, so reverting won't undo the bid.
*   Only the **contract owner** can set hooks, preventing malicious injection.

