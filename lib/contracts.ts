import { ethers } from 'ethers'

// Full ABI for ARPOAuctionHouse contract
export const AUCTION_HOUSE_ABI = [
    // View functions
    'function auctionCount() view returns (uint256)',
    'function auctions(uint256 auctionId) view returns (uint256 tokenId, address artist, uint256 startTime, uint256 endTime, uint256 reservePrice, uint256 highestBid, address highestBidder, bool settled, bool cancelled, string metadataURI)',
    'function getAuction(uint256 auctionId) view returns (tuple(uint256 tokenId, address artist, uint256 startTime, uint256 endTime, uint256 reservePrice, uint256 highestBid, address highestBidder, bool settled, bool cancelled, string metadataURI))',
    'function getMinBid(uint256 auctionId) view returns (uint256)',
    'function getAuctionEndTime(uint256 auctionId) view returns (uint256)',
    'function isAuctionActive(uint256 auctionId) view returns (bool)',
    'function userBalance(address user) view returns (uint256)',
    'function lockedBalance(address user) view returns (uint256)',
    'function getAvailableBalance(address user) view returns (uint256)',
    'function platformFeeBps() view returns (uint256)',
    'function platformFeeRecipient() view returns (address)',
    'function nftContract() view returns (address)',
    'function owner() view returns (address)',
    'function paused() view returns (bool)',
    'function hooks() view returns (address)', // V4 Hooks

    // Write functions
    'function placeBid(uint256 auctionId) payable',
    'function settleAuction(uint256 auctionId)',
    'function withdraw(uint256 amount)',
    'function createAuction(address artist, uint256 startTime, uint256 duration, uint256 reservePrice, string metadataURI) returns (uint256)',
    'function cancelAuction(uint256 auctionId)',
    'function setPlatformFee(uint256 feeBps)',
    'function setPlatformFeeRecipient(address recipient)',
    'function setHooks(address hooks)', // V4 Hooks
    'function pause()',
    'function unpause()',

    // Events
    'event AuctionCreated(uint256 indexed auctionId, address indexed artist, uint256 startTime, uint256 endTime, uint256 reservePrice, string metadataURI)',
    'event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount, bool extended)',
    'event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 amount, uint256 tokenId)',
    'event AuctionCancelled(uint256 indexed auctionId)',
    'event Withdrawal(address indexed user, uint256 amount)',
    'event DepositReceived(address indexed user, uint256 amount)',
    'event PlatformFeeUpdated(uint256 oldFee, uint256 newFee)',
    'event HooksUpdated(address indexed oldHooks, address indexed newHooks)', // V4 Hooks
]

// Full ABI for ARPONFT contract
export const NFT_ABI = [
    // View functions
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function getArtist(uint256 tokenId) view returns (address)',
    'function tokenArtist(uint256 tokenId) view returns (address)',
    'function auctionHouse() view returns (address)',
    'function owner() view returns (address)',

    // Write functions
    'function setAuctionHouse(address auctionHouse)',
    'function mint(address to, address artist, string metadataURI) returns (uint256)',
    'function approve(address to, uint256 tokenId)',
    'function setApprovalForAll(address operator, bool approved)',
    'function transferFrom(address from, address to, uint256 tokenId)',
    'function safeTransferFrom(address from, address to, uint256 tokenId)',

    // Events
    'event NFTMinted(uint256 indexed tokenId, address indexed artist, string metadataURI)',
    'event AuctionHouseUpdated(address indexed oldAddress, address indexed newAddress)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
]

// Chain configuration
export const CHAINS = {
    'base-sepolia': {
        chainId: 84532,
        name: 'Base Sepolia',
        rpcUrl: 'https://sepolia.base.org',
        blockExplorer: 'https://sepolia.basescan.org',
        faucet: 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
        },
    },
    'sepolia': {
        chainId: 11155111,
        name: 'Sepolia',
        rpcUrl: 'https://rpc.sepolia.org',
        blockExplorer: 'https://sepolia.etherscan.io',
        faucet: 'https://sepoliafaucet.com',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
        },
    },
}

// Contract addresses (set after deployment)
export const CONTRACTS = {
    auctionHouse: process.env.NEXT_PUBLIC_AUCTION_HOUSE_CONTRACT || '',
    nft: process.env.NEXT_PUBLIC_NFT_CONTRACT || '',
}

// Active chain
export const ACTIVE_CHAIN = CHAINS['base-sepolia']

/**
 * Get provider from window.ethereum (ethers v5)
 */
export function getProvider(): ethers.providers.Web3Provider | null {
    if (typeof window === 'undefined' || !window.ethereum) {
        return null
    }
    return new ethers.providers.Web3Provider(window.ethereum)
}

/**
 * Get signer from connected wallet
 */
export async function getSigner(): Promise<ethers.Signer | null> {
    const provider = getProvider()
    if (!provider) return null
    return provider.getSigner()
}

/**
 * Get AuctionHouse contract instance
 */
export function getAuctionHouseContract(signerOrProvider: ethers.Signer | ethers.providers.Provider): ethers.Contract {
    if (!CONTRACTS.auctionHouse) {
        throw new Error('Auction House contract address not configured')
    }
    return new ethers.Contract(CONTRACTS.auctionHouse, AUCTION_HOUSE_ABI, signerOrProvider)
}

/**
 * Get NFT contract instance
 */
export function getNFTContract(signerOrProvider: ethers.Signer | ethers.providers.Provider): ethers.Contract {
    if (!CONTRACTS.nft) {
        throw new Error('NFT contract address not configured')
    }
    return new ethers.Contract(CONTRACTS.nft, NFT_ABI, signerOrProvider)
}

// ============ Auction Functions ============

/**
 * Validate bid amount before sending to contract
 * @param bidAmount Amount in ETH as string
 * @throws Error if validation fails
 */
function validateBidAmount(bidAmount: string): void {
    // Check it's a valid number
    const amount = parseFloat(bidAmount)
    if (isNaN(amount)) {
        throw new Error('Invalid bid amount: not a number')
    }

    // Check it's positive
    if (amount <= 0) {
        throw new Error('Invalid bid amount: must be positive')
    }

    // Check reasonable upper bound (100 ETH max per bid)
    if (amount > 100) {
        throw new Error('Invalid bid amount: exceeds maximum (100 ETH)')
    }

    // Check reasonable precision (max 18 decimals for ETH)
    const parts = bidAmount.split('.')
    if (parts[1] && parts[1].length > 18) {
        throw new Error('Invalid bid amount: too many decimal places')
    }
}

/**
 * Place a bid on an auction
 * @param auctionId The auction to bid on
 * @param bidAmount Amount in ETH (validated before sending)
 */
export async function placeBidOnChain(
    auctionId: number,
    bidAmount: string // In ETH
): Promise<{ hash: string; wait: () => Promise<ethers.providers.TransactionReceipt> }> {
    // Validate auction ID
    if (!Number.isInteger(auctionId) || auctionId < 0) {
        throw new Error('Invalid auction ID')
    }

    // Validate bid amount (security: prevent malformed inputs)
    validateBidAmount(bidAmount)

    const signer = await getSigner()
    if (!signer) throw new Error('No wallet connected')

    const contract = getAuctionHouseContract(signer)
    const tx = await contract.placeBid(auctionId, {
        value: ethers.utils.parseEther(bidAmount),
    })

    return {
        hash: tx.hash,
        wait: () => tx.wait(),
    }
}

/**
 * Get auction details from chain
 */
export async function getAuctionOnChain(auctionId: number) {
    const provider = getProvider()
    if (!provider) throw new Error('No provider available')

    const contract = getAuctionHouseContract(provider)
    const auction = await contract.getAuction(auctionId)

    return {
        tokenId: auction.tokenId.toNumber(),
        artist: auction.artist,
        startTime: new Date(auction.startTime.toNumber() * 1000),
        endTime: new Date(auction.endTime.toNumber() * 1000),
        reservePrice: ethers.utils.formatEther(auction.reservePrice),
        highestBid: ethers.utils.formatEther(auction.highestBid),
        highestBidder: auction.highestBidder,
        settled: auction.settled,
        cancelled: auction.cancelled,
        metadataURI: auction.metadataURI,
    }
}

/**
 * Get minimum bid for an auction
 */
export async function getMinBidOnChain(auctionId: number): Promise<string> {
    const provider = getProvider()
    if (!provider) throw new Error('No provider available')

    const contract = getAuctionHouseContract(provider)
    const minBid = await contract.getMinBid(auctionId)

    return ethers.utils.formatEther(minBid)
}

/**
 * Check if auction is currently active
 */
export async function isAuctionActiveOnChain(auctionId: number): Promise<boolean> {
    const provider = getProvider()
    if (!provider) throw new Error('No provider available')

    const contract = getAuctionHouseContract(provider)
    return contract.isAuctionActive(auctionId)
}

/**
 * Get auction end time (may have been extended)
 */
export async function getAuctionEndTimeOnChain(auctionId: number): Promise<Date> {
    const provider = getProvider()
    if (!provider) throw new Error('No provider available')

    const contract = getAuctionHouseContract(provider)
    const endTime = await contract.getAuctionEndTime(auctionId)

    return new Date(endTime.toNumber() * 1000)
}

// ============ Settlement Functions ============

/**
 * Settle an ended auction
 */
export async function settleAuctionOnChain(auctionId: number): Promise<{ hash: string }> {
    const signer = await getSigner()
    if (!signer) throw new Error('No wallet connected')

    const contract = getAuctionHouseContract(signer)
    const tx = await contract.settleAuction(auctionId)

    await tx.wait()

    return { hash: tx.hash }
}

/**
 * Withdraw available funds (claim refund)
 * @note Renamed from claimRefund to match new logic, but keeps signature for frontend
 */
export async function claimRefundOnChain(): Promise<{ hash: string }> {
    const signer = await getSigner()
    if (!signer) throw new Error('No wallet connected')

    const contract = getAuctionHouseContract(signer)

    // Get full available balance first to withdraw everything
    const available = await contract.getAvailableBalance(await signer.getAddress())
    if (available.eq(0)) throw new Error('No funds available to withdraw')

    const tx = await contract.withdraw(available)

    await tx.wait()

    return { hash: tx.hash }
}

/**
 * Get pending refund amount (available balance)
 */
export async function getPendingRefundOnChain(address: string): Promise<string> {
    const provider = getProvider()
    if (!provider) throw new Error('No provider available')

    const contract = getAuctionHouseContract(provider)
    const amount = await contract.getAvailableBalance(address)

    return ethers.utils.formatEther(amount)
}

// ============ Event Listeners ============

/**
 * Listen for bid events on an auction
 */
export function onBidPlaced(
    auctionId: number,
    callback: (bidder: string, amount: string, extended: boolean) => void
): () => void {
    const provider = getProvider()
    if (!provider) return () => { }

    const contract = getAuctionHouseContract(provider)

    const filter = contract.filters.BidPlaced(auctionId)

    const listener = (
        auctionIdEvent: ethers.BigNumber,
        bidder: string,
        amount: ethers.BigNumber,
        extended: boolean
    ) => {
        callback(bidder, ethers.utils.formatEther(amount), extended)
    }

    contract.on(filter, listener)

    return () => {
        contract.off(filter, listener)
    }
}

/**
 * Listen for auction settlement
 */
export function onAuctionSettled(
    auctionId: number,
    callback: (winner: string, amount: string, tokenId: number) => void
): () => void {
    const provider = getProvider()
    if (!provider) return () => { }

    const contract = getAuctionHouseContract(provider)

    const filter = contract.filters.AuctionSettled(auctionId)

    const listener = (
        auctionIdEvent: ethers.BigNumber,
        winner: string,
        amount: ethers.BigNumber,
        tokenId: ethers.BigNumber
    ) => {
        callback(winner, ethers.utils.formatEther(amount), tokenId.toNumber())
    }

    contract.on(filter, listener)

    return () => {
        contract.off(filter, listener)
    }
}

// ============ Utility Functions ============

/**
 * Get user's ETH balance
 */
export async function getBalance(address: string): Promise<string> {
    const provider = getProvider()
    if (!provider) throw new Error('No provider available')

    const balance = await provider.getBalance(address)
    return ethers.utils.formatEther(balance)
}

/**
 * Switch to the correct network
 */
export async function switchToBaseSepolia(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
        return false
    }

    const chainId = '0x14a34' // 84532 in hex

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
        })
        return true
    } catch (switchError: unknown) {
        // Chain not added, try to add it
        if ((switchError as { code?: number })?.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId,
                        chainName: ACTIVE_CHAIN.name,
                        nativeCurrency: ACTIVE_CHAIN.nativeCurrency,
                        rpcUrls: [ACTIVE_CHAIN.rpcUrl],
                        blockExplorerUrls: [ACTIVE_CHAIN.blockExplorer],
                    }],
                })
                return true
            } catch {
                return false
            }
        }
        return false
    }
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Check if wallet is connected and on correct network
 */
export async function checkWalletConnection(): Promise<{
    connected: boolean
    address: string | null
    correctNetwork: boolean
}> {
    const provider = getProvider()
    if (!provider) {
        return { connected: false, address: null, correctNetwork: false }
    }

    try {
        const accounts = await provider.listAccounts()
        if (accounts.length === 0) {
            return { connected: false, address: null, correctNetwork: false }
        }

        const network = await provider.getNetwork()
        const correctNetwork = network.chainId === ACTIVE_CHAIN.chainId

        return {
            connected: true,
            address: accounts[0],
            correctNetwork,
        }
    } catch {
        return { connected: false, address: null, correctNetwork: false }
    }
}
