import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("ARPOAuctionHouse", function () {
    let auctionHouse: Contract;
    let nft: Contract;
    let owner: SignerWithAddress;
    let bidder1: SignerWithAddress;
    let bidder2: SignerWithAddress;
    let feeRecipient: SignerWithAddress;

    const ONE_HOUR = 3600;
    const ONE_ETH = ethers.utils.parseEther("1");
    const TWO_ETH = ethers.utils.parseEther("2");

    beforeEach(async function () {
        [owner, bidder1, bidder2, feeRecipient] = await ethers.getSigners();

        // Deploy NFT
        const NFTFactory = await ethers.getContractFactory("ARPONFT");
        nft = await NFTFactory.deploy();
        await nft.deployed();

        // Deploy AuctionHouse
        const AuctionFactory = await ethers.getContractFactory("ARPOAuctionHouse");
        auctionHouse = await AuctionFactory.deploy(nft.address, feeRecipient.address);
        await auctionHouse.deployed();

        // Link contracts
        await nft.setAuctionHouse(auctionHouse.address);
    });

    describe("Deployment", function () {
        it("Should set the correct NFT address", async function () {
            expect(await auctionHouse.nft()).to.equal(nft.address);
        });

        it("Should set the correct fee recipient", async function () {
            expect(await auctionHouse.feeRecipient()).to.equal(feeRecipient.address);
        });

        it("Should start with auction ID 0", async function () {
            expect(await auctionHouse.currentAuctionId()).to.equal(0);
        });
    });

    describe("Create Auction", function () {
        it("Should create an auction with valid parameters", async function () {
            const startTime = Math.floor(Date.now() / 1000) + 60; // Start in 1 minute
            const duration = ONE_HOUR;
            const startingBid = ONE_ETH;

            await expect(
                auctionHouse.createAuction(
                    "ipfs://QmTest",
                    startingBid,
                    startTime,
                    duration,
                    ethers.constants.AddressZero // ETH
                )
            ).to.emit(auctionHouse, "AuctionCreated");

            expect(await auctionHouse.currentAuctionId()).to.equal(1);
        });

        it("Should fail with zero starting bid", async function () {
            const startTime = Math.floor(Date.now() / 1000) + 60;

            await expect(
                auctionHouse.createAuction(
                    "ipfs://QmTest",
                    0,
                    startTime,
                    ONE_HOUR,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Starting bid must be > 0");
        });

        it("Should fail with past start time", async function () {
            const pastTime = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

            await expect(
                auctionHouse.createAuction(
                    "ipfs://QmTest",
                    ONE_ETH,
                    pastTime,
                    ONE_HOUR,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Start time must be in future");
        });

        it("Should only allow owner to create auctions", async function () {
            const startTime = Math.floor(Date.now() / 1000) + 60;

            await expect(
                auctionHouse.connect(bidder1).createAuction(
                    "ipfs://QmTest",
                    ONE_ETH,
                    startTime,
                    ONE_HOUR,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Bidding", function () {
        let auctionId: number;

        beforeEach(async function () {
            // Create an auction that starts immediately
            const startTime = Math.floor(Date.now() / 1000) + 1;
            await auctionHouse.createAuction(
                "ipfs://QmTest",
                ONE_ETH,
                startTime,
                ONE_HOUR,
                ethers.constants.AddressZero
            );
            auctionId = 1;

            // Wait for auction to start
            await ethers.provider.send("evm_increaseTime", [2]);
            await ethers.provider.send("evm_mine", []);
        });

        it("Should accept valid bid", async function () {
            await expect(
                auctionHouse.connect(bidder1).placeBid(auctionId, { value: ONE_ETH })
            ).to.emit(auctionHouse, "BidPlaced");

            const auction = await auctionHouse.getAuction(auctionId);
            expect(auction.highestBidder).to.equal(bidder1.address);
            expect(auction.currentBid).to.equal(ONE_ETH);
        });

        it("Should reject bid below minimum", async function () {
            const lowBid = ethers.utils.parseEther("0.5");

            await expect(
                auctionHouse.connect(bidder1).placeBid(auctionId, { value: lowBid })
            ).to.be.revertedWith("Bid too low");
        });

        it("Should refund previous bidder", async function () {
            // First bid
            await auctionHouse.connect(bidder1).placeBid(auctionId, { value: ONE_ETH });

            const bidder1BalanceBefore = await bidder1.getBalance();

            // Second bid (higher)
            await auctionHouse.connect(bidder2).placeBid(auctionId, { value: TWO_ETH });

            // Check bidder1 has pending refund
            const pendingRefund = await auctionHouse.pendingRefunds(bidder1.address);
            expect(pendingRefund).to.equal(ONE_ETH);
        });

        it("Should extend auction in final 10 seconds", async function () {
            // Fast forward to near end
            await ethers.provider.send("evm_increaseTime", [ONE_HOUR - 5]);
            await ethers.provider.send("evm_mine", []);

            const auctionBefore = await auctionHouse.getAuction(auctionId);
            const endTimeBefore = auctionBefore.endTime;

            // Place bid in final seconds
            await auctionHouse.connect(bidder1).placeBid(auctionId, { value: ONE_ETH });

            const auctionAfter = await auctionHouse.getAuction(auctionId);
            expect(auctionAfter.endTime).to.be.gt(endTimeBefore);
        });
    });

    describe("Settlement", function () {
        let auctionId: number;

        beforeEach(async function () {
            const startTime = Math.floor(Date.now() / 1000) + 1;
            await auctionHouse.createAuction(
                "ipfs://QmTest",
                ONE_ETH,
                startTime,
                ONE_HOUR,
                ethers.constants.AddressZero
            );
            auctionId = 1;

            await ethers.provider.send("evm_increaseTime", [2]);
            await ethers.provider.send("evm_mine", []);

            // Place winning bid
            await auctionHouse.connect(bidder1).placeBid(auctionId, { value: TWO_ETH });

            // End auction
            await ethers.provider.send("evm_increaseTime", [ONE_HOUR + 10]);
            await ethers.provider.send("evm_mine", []);
        });

        it("Should settle auction and transfer NFT", async function () {
            await expect(auctionHouse.settleAuction(auctionId))
                .to.emit(auctionHouse, "AuctionSettled");

            // NFT should be minted to winner
            expect(await nft.ownerOf(auctionId)).to.equal(bidder1.address);
        });

        it("Should transfer funds to fee recipient", async function () {
            const balanceBefore = await feeRecipient.getBalance();

            await auctionHouse.settleAuction(auctionId);

            const balanceAfter = await feeRecipient.getBalance();
            expect(balanceAfter).to.be.gt(balanceBefore);
        });

        it("Should not settle active auction", async function () {
            // Create new auction
            const startTime = Math.floor(Date.now() / 1000) + 1;
            await auctionHouse.createAuction(
                "ipfs://QmTest2",
                ONE_ETH,
                startTime,
                ONE_HOUR,
                ethers.constants.AddressZero
            );

            await expect(auctionHouse.settleAuction(2))
                .to.be.revertedWith("Auction not ended");
        });
    });

    describe("Refunds", function () {
        it("Should allow claiming refund", async function () {
            const startTime = Math.floor(Date.now() / 1000) + 1;
            await auctionHouse.createAuction(
                "ipfs://QmTest",
                ONE_ETH,
                startTime,
                ONE_HOUR,
                ethers.constants.AddressZero
            );

            await ethers.provider.send("evm_increaseTime", [2]);
            await ethers.provider.send("evm_mine", []);

            // Two bids
            await auctionHouse.connect(bidder1).placeBid(1, { value: ONE_ETH });
            await auctionHouse.connect(bidder2).placeBid(1, { value: TWO_ETH });

            // Claim refund
            const balanceBefore = await bidder1.getBalance();
            await auctionHouse.connect(bidder1).claimRefund();
            const balanceAfter = await bidder1.getBalance();

            expect(balanceAfter).to.be.gt(balanceBefore);
        });
    });
});
