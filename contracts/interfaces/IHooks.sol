// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IHooks
 * @dev Interface for V4 Auction House Hooks
 * allowsexternal contracts to execute logic before/after auction actions.
 */
interface IHooks {
    /**
     * @notice Called before a bid is placed.
     * @param auctionId The ID of the auction
     * @param bidder The address of the bidder
     * @param amount The amount of the bid
     * @return bytes4 The function selector (0x36a9b407) to confirm acceptance
     */
    function beforePlaceBid(uint256 auctionId, address bidder, uint256 amount) external returns (bytes4);

    /**
     * @notice Called after a bid is successfully placed.
     * @param auctionId The ID of the auction
     * @param bidder The address of the bidder
     * @param amount The amount of the bid
     * @return bytes4 The function selector to confirm success
     */
    function afterPlaceBid(uint256 auctionId, address bidder, uint256 amount) external returns (bytes4);

    /**
     * @notice Called before an auction is settled.
     * @param auctionId The ID of the auction
     * @param winner The address of the winning bidder
     * @param amount The winning bid amount
     * @return bytes4 The function selector to confirm acceptance
     */
    function beforeSettle(uint256 auctionId, address winner, uint256 amount) external returns (bytes4);

    /**
     * @notice Called after an auction is successfully settled.
     * @param auctionId The ID of the auction
     * @param winner The address of the winning bidder
     * @param tokenId The minted NFT token ID
     * @return bytes4 The function selector to confirm success
     */
    function afterSettle(uint256 auctionId, address winner, uint256 tokenId) external returns (bytes4);
}
