const hre = require("hardhat");

async function main() {
  console.log("Setting up LootPot project...");

  // Get the contract factory
  const PoolFactory = await hre.ethers.getContractFactory("PoolFactory");
  
  // Deploy the factory
  console.log("Deploying PoolFactory...");
  const poolFactory = await PoolFactory.deploy();
  await poolFactory.deployed();

  console.log("PoolFactory deployed to:", poolFactory.address);

  // Create a sample pool for testing
  console.log("Creating sample prize pool...");
  const samplePoolTx = await poolFactory.createPool(
    "Welcome Pool",
    hre.ethers.utils.parseEther("0.01"), // 0.01 ETH min participation
    10, // 1 in 10 chance to win
    20, // 20% platform fee
    30 // 30 days duration
  );

  await samplePoolTx.wait();
  console.log("Sample pool created successfully!");

  // Get the created pool address
  const poolCount = await poolFactory.getPoolCount();
  const samplePoolAddress = await poolFactory.getPoolByIndex(poolCount.toNumber() - 1);
  
  console.log("Sample pool address:", samplePoolAddress);

  // Verify contracts on Etherscan (if not on local network)
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await poolFactory.deployTransaction.wait(6);

    console.log("Verifying PoolFactory on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: poolFactory.address,
        constructorArguments: [],
      });
      console.log("PoolFactory verified on Etherscan!");
    } catch (error) {
      console.log("PoolFactory verification failed:", error.message);
    }
  }

  console.log("\n🎉 LootPot setup completed successfully!");
  console.log("PoolFactory:", poolFactory.address);
  console.log("Sample Pool:", samplePoolAddress);
  console.log("\nNext steps:");
  console.log("1. Update your frontend with the factory address");
  console.log("2. Test the application with the sample pool");
  console.log("3. Create more pools and invite users to participate");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
