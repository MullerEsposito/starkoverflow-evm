import { ethers } from "hardhat";

async function main() {
    console.log("Starting deployment...\n");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Deploy MockStarkToken
    console.log("Deploying MockStarkToken...");
    const MockStarkToken = await ethers.getContractFactory("MockStarkToken");
    const starkToken = await MockStarkToken.deploy();
    await starkToken.waitForDeployment();
    const starkTokenAddress = await starkToken.getAddress();
    console.log("MockStarkToken deployed to:", starkTokenAddress);
    console.log("Initial supply minted to deployer\n");

    // Deploy StarkOverflow
    console.log("Deploying StarkOverflow...");
    const StarkOverflow = await ethers.getContractFactory("StarkOverflow");
    const starkOverflow = await StarkOverflow.deploy(deployer.address, starkTokenAddress);
    await starkOverflow.waitForDeployment();
    const starkOverflowAddress = await starkOverflow.getAddress();
    console.log("StarkOverflow deployed to:", starkOverflowAddress);

    console.log("\n=== Deployment Summary ===");
    console.log("MockStarkToken:", starkTokenAddress);
    console.log("StarkOverflow:", starkOverflowAddress);
    console.log("Owner:", deployer.address);
    console.log("========================\n");

    // Verify token balance
    const balance = await starkToken.balanceOf(deployer.address);
    console.log("Deployer STARK token balance:", ethers.formatEther(balance), "STARK");

    return {
        starkToken: starkTokenAddress,
        starkOverflow: starkOverflowAddress,
        deployer: deployer.address
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
