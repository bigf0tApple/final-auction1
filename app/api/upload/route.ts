import { NextRequest, NextResponse } from "next/server"

const PINATA_JWT = process.env.PINATA_JWT

export async function POST(request: NextRequest) {
    if (!PINATA_JWT) {
        return NextResponse.json(
            { error: "Pinata is not configured" },
            { status: 500 }
        )
    }

    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const name = formData.get("name") as string | null

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            )
        }

        // Prepare Pinata request
        const pinataFormData = new FormData()
        pinataFormData.append("file", file)

        if (name) {
            pinataFormData.append(
                "pinataMetadata",
                JSON.stringify({ name })
            )
        }

        const response = await fetch(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${PINATA_JWT}`,
                },
                body: pinataFormData,
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
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        )
    }
}
