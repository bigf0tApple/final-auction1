import { ethers } from "hardhat";

async function main() {
    console.log("Deploying contracts to Base Sepolia...");

    // 1. Deploy NFT
    const ARPONFT = await ethers.getContractFactory("ARPONFT");
    const nft = await ARPONFT.deploy();
    await nft.deployed();
    const nftAddress = nft.address;
    console.log(`ARPONFT deployed to: ${nftAddress}`);

    // 2. Deploy AuctionHouse
    const signers = await ethers.getSigners();
    const feeRecipient = signers[0].address; // Admin is deployer
    console.log(`Fee Recipient (Admin): ${feeRecipient}`);

    const ARPOAuctionHouse = await ethers.getContractFactory("ARPOAuctionHouse");
    const auctionHouse = await ARPOAuctionHouse.deploy(nftAddress, feeRecipient);
    await auctionHouse.deployed();
    const auctionHouseAddress = auctionHouse.address;
    console.log(`ARPOAuctionHouse deployed to: ${auctionHouseAddress}`);

    // 3. Link them (Set AuctionHouse in NFT)
    console.log("Linking contracts...");
    try {
        const tx = await nft.setAuctionHouse(auctionHouseAddress);
        await tx.wait();
        console.log("Contracts linked successfully!");
    } catch (e) {
        console.error("Failed to link contracts manually. Check ownership.", e);
    }

    console.log("\nDeployment Complete! Update .env.local with:");
    console.log(`NEXT_PUBLIC_NFT_CONTRACT=${nftAddress}`);
    console.log(`NEXT_PUBLIC_AUCTION_HOUSE_CONTRACT=${auctionHouseAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
