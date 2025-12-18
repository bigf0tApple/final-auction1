/**
 * Pinata IPFS Utilities
 * For uploading NFT images and metadata to IPFS
 */

const PINATA_JWT = process.env.PINATA_JWT
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud"

interface PinataUploadResponse {
    IpfsHash: string
    PinSize: number
    Timestamp: string
    isDuplicate?: boolean
}

interface NFTMetadata {
    name: string
    description: string
    image: string // IPFS URI
    external_url?: string
    attributes?: Array<{
        trait_type: string
        value: string | number
    }>
    properties?: {
        artist?: string
        category?: string
        royalty_percent?: number
    }
}

/**
 * Upload a file to Pinata IPFS
 * @param file File to upload
 * @param name Optional name for the pin
 * @returns IPFS hash (CID)
 */
export async function uploadFileToPinata(file: File, name?: string): Promise<string> {
    if (!PINATA_JWT) {
        throw new Error("PINATA_JWT environment variable is not set")
    }

    const formData = new FormData()
    formData.append("file", file)

    if (name) {
        formData.append("pinataMetadata", JSON.stringify({ name }))
    }

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Pinata upload failed: ${error}`)
    }

    const data: PinataUploadResponse = await response.json()
    return data.IpfsHash
}

/**
 * Upload JSON metadata to Pinata IPFS
 * @param metadata NFT metadata object
 * @param name Optional name for the pin
 * @returns IPFS hash (CID)
 */
export async function uploadMetadataToPinata(
    metadata: NFTMetadata,
    name?: string
): Promise<string> {
    if (!PINATA_JWT) {
        throw new Error("PINATA_JWT environment variable is not set")
    }

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: name ? { name } : undefined,
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Pinata upload failed: ${error}`)
    }

    const data: PinataUploadResponse = await response.json()
    return data.IpfsHash
}

/**
 * Create a complete NFT upload (image + metadata)
 * @param imageFile Image file to upload
 * @param metadata NFT metadata (without image field)
 * @returns Object with image CID, metadata CID, and full URIs
 */
export async function uploadNFTToPinata(
    imageFile: File,
    metadata: Omit<NFTMetadata, "image">
): Promise<{
    imageCid: string
    metadataCid: string
    imageUri: string
    metadataUri: string
    gatewayImageUrl: string
    gatewayMetadataUrl: string
}> {
    // Step 1: Upload image
    const imageCid = await uploadFileToPinata(imageFile, `${metadata.name}_image`)

    // Step 2: Create metadata with image URI
    const fullMetadata: NFTMetadata = {
        ...metadata,
        image: `ipfs://${imageCid}`,
    }

    // Step 3: Upload metadata
    const metadataCid = await uploadMetadataToPinata(fullMetadata, `${metadata.name}_metadata`)

    return {
        imageCid,
        metadataCid,
        imageUri: `ipfs://${imageCid}`,
        metadataUri: `ipfs://${metadataCid}`,
        gatewayImageUrl: `${PINATA_GATEWAY}/ipfs/${imageCid}`,
        gatewayMetadataUrl: `${PINATA_GATEWAY}/ipfs/${metadataCid}`,
    }
}

/**
 * Get IPFS gateway URL for a CID
 * @param cid IPFS CID
 * @returns Gateway URL
 */
export function getIPFSGatewayUrl(cid: string): string {
    // Handle both ipfs:// URIs and raw CIDs
    if (cid.startsWith("ipfs://")) {
        cid = cid.replace("ipfs://", "")
    }
    return `${PINATA_GATEWAY}/ipfs/${cid}`
}

/**
 * Check if Pinata is configured
 * @returns true if PINATA_JWT is set
 */
export function isPinataConfigured(): boolean {
    return Boolean(PINATA_JWT)
}
