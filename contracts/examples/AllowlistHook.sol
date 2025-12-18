// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IHooks.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AllowlistHook
 * @notice Example V4 hook that restricts bidding to allowlisted addresses
 * @dev Deploy this contract and call AuctionHouse.setHooks(address) to enable
 */
contract AllowlistHook is IHooks, Ownable {
    mapping(address => bool) public allowed;
    
    event AddressAdded(address indexed account);
    event AddressRemoved(address indexed account);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Add an address to the allowlist
     */
    function addToAllowlist(address account) external onlyOwner {
        allowed[account] = true;
        emit AddressAdded(account);
    }
    
    /**
     * @notice Remove an address from the allowlist
     */
    function removeFromAllowlist(address account) external onlyOwner {
        allowed[account] = false;
        emit AddressRemoved(account);
    }
    
    /**
     * @notice Batch add addresses to the allowlist
     */
    function addBatchToAllowlist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            allowed[accounts[i]] = true;
            emit AddressAdded(accounts[i]);
        }
    }
    
    // ============ IHooks Implementation ============
    
    function beforePlaceBid(uint256, address bidder, uint256) external view returns (bytes4) {
        require(allowed[bidder], "Not on allowlist");
        return IHooks.beforePlaceBid.selector;
    }
    
    function afterPlaceBid(uint256, address, uint256) external pure returns (bytes4) {
        return IHooks.afterPlaceBid.selector;
    }
    
    function beforeSettle(uint256, address, uint256) external pure returns (bytes4) {
        return IHooks.beforeSettle.selector;
    }
    
    function afterSettle(uint256, address, uint256) external pure returns (bytes4) {
        return IHooks.afterSettle.selector;
    }
}
