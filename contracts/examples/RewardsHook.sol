// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IHooks.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RewardsHook
 * @notice Example V4 hook that rewards bidders with ERC20 tokens
 * @dev Deploy this contract, fund it with reward tokens, then call AuctionHouse.setHooks(address)
 */
contract RewardsHook is IHooks, Ownable {
    IERC20 public rewardToken;
    
    uint256 public rewardPerBid = 10 * 10**18;      // 10 tokens per bid
    uint256 public rewardPerWin = 100 * 10**18;    // 100 tokens for winning
    
    event RewardSent(address indexed recipient, uint256 amount, string reason);
    event RewardAmountUpdated(string rewardType, uint256 oldAmount, uint256 newAmount);
    
    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @notice Update reward per bid
     */
    function setRewardPerBid(uint256 amount) external onlyOwner {
        uint256 oldAmount = rewardPerBid;
        rewardPerBid = amount;
        emit RewardAmountUpdated("bid", oldAmount, amount);
    }
    
    /**
     * @notice Update reward per win
     */
    function setRewardPerWin(uint256 amount) external onlyOwner {
        uint256 oldAmount = rewardPerWin;
        rewardPerWin = amount;
        emit RewardAmountUpdated("win", oldAmount, amount);
    }
    
    /**
     * @notice Withdraw remaining tokens (admin)
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        rewardToken.transfer(msg.sender, amount);
    }
    
    // ============ IHooks Implementation ============
    
    function beforePlaceBid(uint256, address, uint256) external pure returns (bytes4) {
        // No restrictions - just pass through
        return IHooks.beforePlaceBid.selector;
    }
    
    function afterPlaceBid(uint256, address bidder, uint256) external returns (bytes4) {
        // Reward the bidder
        if (rewardToken.balanceOf(address(this)) >= rewardPerBid) {
            rewardToken.transfer(bidder, rewardPerBid);
            emit RewardSent(bidder, rewardPerBid, "bid");
        }
        return IHooks.afterPlaceBid.selector;
    }
    
    function beforeSettle(uint256, address, uint256) external pure returns (bytes4) {
        return IHooks.beforeSettle.selector;
    }
    
    function afterSettle(uint256, address winner, uint256) external returns (bytes4) {
        // Bonus reward for the winner
        if (rewardToken.balanceOf(address(this)) >= rewardPerWin) {
            rewardToken.transfer(winner, rewardPerWin);
            emit RewardSent(winner, rewardPerWin, "win");
        }
        return IHooks.afterSettle.selector;
    }
}
