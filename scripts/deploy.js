const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy PoolFactory first
  const PoolFactory = await hre.ethers.getContractFactory("PoolFactory");
  const poolFactory = await PoolFactory.deploy();
  await poolFactory.deployed();

  console.log("PoolFactory deployed to:", poolFactory.address);

  // Deploy a sample PrizePool for testing
  const PrizePool = await hre.ethers.getContractFactory("PrizePool");
  const samplePool = await PrizePool.deploy(
    "Sample Prize Pool",
    hre.ethers.utils.parseEther("0.01"), // 0.01 ETH min participation
    10, // 1 in 10 chance to win
    20, // 20% platform fee
    7 // 7 days duration
  );
  await samplePool.deployed();

  console.log("Sample PrizePool deployed to:", samplePool.address);

  // Verify contracts on Etherscan (if not on local network)
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await poolFactory.deployTransaction.wait(6);
    await samplePool.deployTransaction.wait(6);

    console.log("Verifying PoolFactory...");
    try {
      await hre.run("verify:verify", {
        address: poolFactory.address,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("PoolFactory verification failed:", error.message);
    }

    console.log("Verifying Sample PrizePool...");
    try {
      await hre.run("verify:verify", {
        address: samplePool.address,
        constructorArguments: [
          "Sample Prize Pool",
          hre.ethers.utils.parseEther("0.01"),
          10,
          20,
          7,
        ],
      });
    } catch (error) {
      console.log("Sample PrizePool verification failed:", error.message);
    }
  }

  console.log("Deployment completed!");
  console.log("PoolFactory:", poolFactory.address);
  console.log("Sample PrizePool:", samplePool.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
