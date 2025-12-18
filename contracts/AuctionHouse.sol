// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IHooks.sol";

/**
 * @title ARPONFT
 * @notice ERC-721 NFT contract for ARPO Studio artworks
 * @dev Only the AuctionHouse contract can mint NFTs
 */
contract ARPONFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    address public auctionHouse;
    
    // Mapping from token ID to artist address
    mapping(uint256 => address) public tokenArtist;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed artist, string metadataURI);
    event AuctionHouseUpdated(address indexed oldAddress, address indexed newAddress);
    
    constructor() ERC721("ARPO Studio NFT", "ARPO") Ownable(msg.sender) {}
    
    modifier onlyAuctionHouse() {
        require(msg.sender == auctionHouse, "Only auction house can call");
        _;
    }
    
    /**
     * @notice Set the auction house contract address
     * @param _auctionHouse Address of the AuctionHouse contract
     */
    function setAuctionHouse(address _auctionHouse) external onlyOwner {
        require(_auctionHouse != address(0), "Invalid address");
        address oldAddress = auctionHouse;
        auctionHouse = _auctionHouse;
        emit AuctionHouseUpdated(oldAddress, _auctionHouse);
    }
    
    /**
     * @notice Mint a new NFT (only callable by AuctionHouse)
     * @param to Address to mint the NFT to
     * @param artist Address of the original artist (for royalties)
     * @param metadataURI IPFS URI for the NFT metadata
     * @return tokenId The ID of the minted token
     */
    function mint(
        address to,
        address artist,
        string calldata metadataURI
    ) external onlyAuctionHouse returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        tokenArtist[tokenId] = artist;
        
        emit NFTMinted(tokenId, artist, metadataURI);
        return tokenId;
    }
    
    /**
     * @notice Get the artist of a token
     * @param tokenId The token ID
     * @return The artist address
     */
    function getArtist(uint256 tokenId) external view returns (address) {
        require(tokenId < _tokenIdCounter, "Token does not exist");
        return tokenArtist[tokenId];
    }
    
    /**
     * @notice Get the current token count
     * @return The number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}

/**
 * @title ARPOAuctionHouse
 * @notice V4 Auction house contract for ARPO Studio NFT auctions
 * @dev Handles auction creation, bidding, and settlement with extensible hooks
 */
contract ARPOAuctionHouse is ReentrancyGuard, Ownable, Pausable {
    ARPONFT public nftContract;
    
    // V4 Hooks - External contract for custom logic
    IHooks public hooks;
    
    uint256 public constant MIN_BID_INCREMENT_BPS = 100; // 1%
    uint256 public constant MAX_BID_INCREMENT_BPS = 1000; // 10% (final 10 seconds)
    uint256 public constant ANTI_SNIPE_WINDOW = 10 seconds;
    uint256 public constant ANTI_SNIPE_EXTENSION = 10 seconds;
    uint256 public constant MIN_AUCTION_DURATION = 5 minutes;
    uint256 public constant MAX_AUCTION_DURATION = 7 days;
    
    // Platform fee (10%)
    uint256 public platformFeeBps = 1000;
    address public platformFeeRecipient;
    
    // Auction structure
    struct Auction {
        uint256 tokenId;
        address artist;
        uint256 startTime;
        uint256 endTime;
        uint256 reservePrice;
        uint256 highestBid;
        address highestBidder;
        bool settled;
        bool cancelled;
        string metadataURI;
    }
    
    // Auction storage
    uint256 public auctionCount;
    mapping(uint256 => Auction) public auctions;
    
    // BID POOL - User Balances
    // userBalance tracks the TOTAL funds a user has in the contract (Locked + Available)
    mapping(address => uint256) public userBalance;
    
    // lockedBalance tracks how much of the userBalance is currently actively backing a high bid
    mapping(address => uint256) public lockedBalance;
    
    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed artist,
        uint256 startTime,
        uint256 endTime,
        uint256 reservePrice,
        string metadataURI
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        bool extended
    );

    event DepositReceived(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    event AuctionSettled(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 amount,
        uint256 tokenId
    );
    
    event AuctionCancelled(uint256 indexed auctionId);
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event HooksUpdated(address indexed oldHooks, address indexed newHooks);
    
    constructor(address _nftContract, address _feeRecipient) Ownable(msg.sender) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        nftContract = ARPONFT(_nftContract);
        platformFeeRecipient = _feeRecipient;
    }
    
    // ============ Admin Functions ============
    
    function setPlatformFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high"); // Max 10%
        uint256 oldFee = platformFeeBps;
        platformFeeBps = _feeBps;
        emit PlatformFeeUpdated(oldFee, _feeBps);
    }
    
    function setPlatformFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        platformFeeRecipient = _recipient;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Set the V4 hooks contract (address(0) to disable)
     * @param _hooks Address of the hooks contract
     */
    function setHooks(address _hooks) external onlyOwner {
        address oldHooks = address(hooks);
        hooks = IHooks(_hooks);
        emit HooksUpdated(oldHooks, _hooks);
    }
    
    // ============ Auction Creation ============
    
    function createAuction(
        address artist,
        uint256 startTime,
        uint256 duration,
        uint256 reservePrice,
        string calldata metadataURI
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(artist != address(0), "Invalid artist");
        require(startTime >= block.timestamp, "Start time in past");
        require(duration >= MIN_AUCTION_DURATION, "Duration too short");
        require(duration <= MAX_AUCTION_DURATION, "Duration too long");
        require(reservePrice > 0, "Reserve must be > 0");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        uint256 auctionId = auctionCount;
        auctionCount++;
        
        auctions[auctionId] = Auction({
            tokenId: 0,
            artist: artist,
            startTime: startTime,
            endTime: startTime + duration,
            reservePrice: reservePrice,
            highestBid: 0,
            highestBidder: address(0),
            settled: false,
            cancelled: false,
            metadataURI: metadataURI
        });
        
        emit AuctionCreated(
            auctionId,
            artist,
            startTime,
            startTime + duration,
            reservePrice,
            metadataURI
        );
        
        return auctionId;
    }
    
    // ============ Bid Pool Logic ============
    
    /**
     * @notice Place a bid using new funds + existing balance.
     * Does NOT revert if bid is too low (just deposits funds).
     */
    function placeBid(uint256 auctionId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        // 1. Deposit funds
        if (msg.value > 0) {
            userBalance[msg.sender] += msg.value;
            emit DepositReceived(msg.sender, msg.value);
        }

        // V4 Hook: beforePlaceBid
        if (address(hooks) != address(0)) {
            bytes4 selector = hooks.beforePlaceBid(auctionId, msg.sender, msg.value);
            require(selector == IHooks.beforePlaceBid.selector, "Hook rejected bid");
        }

        Auction storage auction = auctions[auctionId];
        
        // Basic validity checks (still revert for invalid state/timing as that's user error)
        require(!auction.cancelled, "Auction cancelled");
        require(!auction.settled, "Auction settled");
        require(block.timestamp >= auction.startTime, "Auction not started");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.artist, "Artist cannot bid");
        
        uint256 minBid = getMinBid(auctionId);
        
        // 2. Check if user CAN bid
        // Their effective bid capacity is their total balance minus what's locked in OTHER auctions
        // lockedBalance[msg.sender] includes the amount locked for THIS auction if they are already leading it?
        // No, if they are already leading, they are "topping up".
        
        uint256 currentlyLockedForThisAuction = 0;
        if (auction.highestBidder == msg.sender) {
            currentlyLockedForThisAuction = auction.highestBid;
        }

        uint256 availableCapacity = userBalance[msg.sender] - (lockedBalance[msg.sender] - currentlyLockedForThisAuction);
        
        // Calculate max allowed bid (always 10% above current, not just anti-snipe)
        uint256 maxBid = auction.highestBid > 0 
            ? auction.highestBid + (auction.highestBid * MAX_BID_INCREMENT_BPS / 10000)
            : auction.reservePrice;
        
        // Anti-Snipe check
        bool inAntiSnipeWindow = auction.endTime - block.timestamp <= ANTI_SNIPE_WINDOW;

        // If they don't have enough to beat minBid, just deposit (no rejection)
        if (availableCapacity < minBid) {
            return; // Funds deposited, but not enough to lead
        }

        // 3. User becomes new leader
        // Unlock old leader
        address prevBidder = auction.highestBidder;
        uint256 prevBid = auction.highestBid;
        if (prevBidder != address(0)) {
            lockedBalance[prevBidder] -= prevBid;
        }

        // Bid amount is capped: user bids MIN of (their capacity, maxBid)
        // This ensures no one can bid more than 10% above current
        uint256 bidAmount = availableCapacity > maxBid ? maxBid : availableCapacity;
        
        // Ensure bid is at least minBid (already checked above, but safety)
        require(bidAmount >= minBid, "Bid below minimum");

        // Lock new leader
        lockedBalance[msg.sender] += bidAmount;
        
        auction.highestBid = bidAmount;
        auction.highestBidder = msg.sender;
        
        // Anti-sniping extension
        bool extended = false;
        if (inAntiSnipeWindow) {
            auction.endTime += ANTI_SNIPE_EXTENSION;
            extended = true;
        }
        
        emit BidPlaced(auctionId, msg.sender, bidAmount, extended);
        
        // V4 Hook: afterPlaceBid
        if (address(hooks) != address(0)) {
            hooks.afterPlaceBid(auctionId, msg.sender, bidAmount);
        }
    }

    /**
     * @notice Withdraw available funds (Total - Locked)
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(userBalance[msg.sender] >= amount, "Insufficient balance");
        
        uint256 available = userBalance[msg.sender] - lockedBalance[msg.sender];
        require(amount <= available, "Amount is locked in active bids");
        
        userBalance[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }

    // ============ Helper Views ============

    function getAvailableBalance(address user) external view returns (uint256) {
        return userBalance[user] - lockedBalance[user];
    }
    
    function getMinBid(uint256 auctionId) public view returns (uint256) {
        Auction storage auction = auctions[auctionId];
        if (auction.highestBid == 0) return auction.reservePrice;
        return auction.highestBid + (auction.highestBid * MIN_BID_INCREMENT_BPS / 10000);
    }
    
    function isAuctionActive(uint256 auctionId) public view returns (bool) {
        Auction storage auction = auctions[auctionId];
        return !auction.cancelled && 
               !auction.settled && 
               block.timestamp >= auction.startTime && 
               block.timestamp < auction.endTime;
    }
    
    // ============ Settlement ============
    
    function settleAuction(uint256 auctionId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        Auction storage auction = auctions[auctionId];
        
        require(!auction.cancelled, "Auction cancelled");
        require(!auction.settled, "Already settled");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(auction.highestBidder != address(0), "No bids");
        
        // V4 Hook: beforeSettle
        if (address(hooks) != address(0)) {
            bytes4 selector = hooks.beforeSettle(auctionId, auction.highestBidder, auction.highestBid);
            require(selector == IHooks.beforeSettle.selector, "Hook rejected settlement");
        }
        
        auction.settled = true;
        
        // Mint NFT
        uint256 tokenId = nftContract.mint(
            auction.highestBidder,
            auction.artist,
            auction.metadataURI
        );
        auction.tokenId = tokenId;
        
        // Move funds
        uint256 amount = auction.highestBid;
        address winner = auction.highestBidder;
        
        // Deduct from winner's balance permanently
        userBalance[winner] -= amount;
        lockedBalance[winner] -= amount; // No longer locked, now spent
        
        uint256 platformFee = amount * platformFeeBps / 10000;
        uint256 artistPayment = amount - platformFee;
        
        if (platformFee > 0) {
            (bool feeSuccess, ) = platformFeeRecipient.call{value: platformFee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        (bool artistSuccess, ) = auction.artist.call{value: artistPayment}("");
        require(artistSuccess, "Artist payment failed");
        
        emit AuctionSettled(auctionId, winner, amount, tokenId);
        
        // V4 Hook: afterSettle
        if (address(hooks) != address(0)) {
            hooks.afterSettle(auctionId, winner, tokenId);
        }
    }
    
    function cancelAuction(uint256 auctionId) external onlyOwner {
        Auction storage auction = auctions[auctionId];
        require(!auction.settled && !auction.cancelled, "Invalid state");
        require(auction.highestBidder == address(0), "Has bids");
        
        auction.cancelled = true;
        emit AuctionCancelled(auctionId);
    }
    
    // Legacy support for ABI compatibility checks if needed
    function pendingReturns(address) external pure returns (uint256) {
        return 0; // Deprecated, use userBalance
    }
    
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }
    
    function getAuctionEndTime(uint256 auctionId) external view returns (uint256) {
        return auctions[auctionId].endTime;
    }
}
