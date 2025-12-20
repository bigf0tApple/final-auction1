import { NextRequest, NextResponse } from "next/server"

const PINATA_JWT = process.env.PINATA_JWT

interface NFTMetadata {
    name: string
    description: string
    image: string
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

export async function POST(request: NextRequest) {
    if (!PINATA_JWT) {
        return NextResponse.json(
            { error: "Pinata is not configured" },
            { status: 500 }
        )
    }

    try {
        const { metadata, name } = await request.json() as {
            metadata: NFTMetadata
            name?: string
        }

        if (!metadata || !metadata.name || !metadata.image) {
            return NextResponse.json(
                { error: "Invalid metadata: name and image are required" },
                { status: 400 }
            )
        }

        const response = await fetch(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${PINATA_JWT}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pinataContent: metadata,
                    pinataMetadata: name ? { name } : undefined,
                }),
            }
        )

        if (!response.ok) {
            const error = await response.text()
            console.error("Pinata error:", error)
            return NextResponse.json(
                { error: `Pinata upload failed: ${error}` },
                { status: 500 }
            )
        }

        const data = await response.json()

        return NextResponse.json({
            success: true,
            cid: data.IpfsHash,
            ipfsUri: `ipfs://${data.IpfsHash}`,
            gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
        })
    } catch (error) {
        console.error("Metadata upload error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        )
    }
}
