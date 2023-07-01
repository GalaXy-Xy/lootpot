const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PoolFactory", function () {
  let PoolFactory, poolFactory, owner, user1, user2;
  let creationFee = ethers.utils.parseEther("0.01");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    PoolFactory = await ethers.getContractFactory("PoolFactory");
    poolFactory = await PoolFactory.deploy();
    await poolFactory.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await poolFactory.owner()).to.equal(owner.address);
    });

    it("Should start with zero pools", async function () {
      expect(await poolFactory.getPoolCount()).to.equal(0);
    });
  });

  describe("Pool Creation", function () {
    it("Should create a new pool with correct parameters", async function () {
      const poolName = "Test Pool";
      const minParticipation = ethers.utils.parseEther("0.02");
      const winProbability = 15;
      const platformFeePercent = 25;
      const durationInDays = 14;

      const tx = await poolFactory.connect(user1).createPool(
        poolName,
        minParticipation,
        winProbability,
        platformFeePercent,
        durationInDays,
        { value: creationFee }
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'PoolCreated');
      
      expect(event).to.not.be.undefined;
      expect(event.args.name).to.equal(poolName);
      expect(event.args.minParticipation).to.equal(minParticipation);

      expect(await poolFactory.getPoolCount()).to.equal(1);
      
      const poolAddress = await poolFactory.getPoolByIndex(0);
      expect(await poolFactory.checkIsPool(poolAddress)).to.be.true;
    });

    it("Should reject pool creation without sufficient fee", async function () {
      const lowFee = ethers.utils.parseEther("0.005");
      
      await expect(
        poolFactory.connect(user1).createPool(
          "Test Pool",
          ethers.utils.parseEther("0.01"),
          10,
          20,
          7,
          { value: lowFee }
        )
      ).to.be.revertedWith("Insufficient creation fee");
    });

    it("Should transfer pool ownership to creator", async function () {
      const tx = await poolFactory.connect(user1).createPool(
        "Test Pool",
        ethers.utils.parseEther("0.01"),
        10,
        20,
        7,
        { value: creationFee }
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'PoolCreated');
      const poolAddress = event.args.poolAddress;

      // Get the PrizePool contract
      const PrizePool = await ethers.getContractFactory("PrizePool");
      const pool = PrizePool.attach(poolAddress);

      expect(await pool.owner()).to.equal(user1.address);
    });
  });

  describe("Pool Management", function () {
    beforeEach(async function () {
      // Create a test pool
      await poolFactory.connect(user1).createPool(
        "Test Pool 1",
        ethers.utils.parseEther("0.01"),
        10,
        20,
        7,
        { value: creationFee }
      );

      await poolFactory.connect(user2).createPool(
        "Test Pool 2",
        ethers.utils.parseEther("0.02"),
        15,
        25,
        14,
        { value: creationFee }
      );
    });

    it("Should return correct pool count", async function () {
      expect(await poolFactory.getPoolCount()).to.equal(2);
    });

    it("Should return correct pool addresses", async function () {
      const pool0 = await poolFactory.getPoolByIndex(0);
      const pool1 = await poolFactory.getPoolByIndex(1);
      
      expect(pool0).to.not.equal(ethers.constants.AddressZero);
      expect(pool1).to.not.equal(ethers.constants.AddressZero);
      expect(pool0).to.not.equal(pool1);
    });

    it("Should reject invalid pool index", async function () {
      await expect(
        poolFactory.getPoolByIndex(2)
      ).to.be.revertedWith("Invalid pool index");
    });

    it("Should correctly identify pools", async function () {
      const pool0 = await poolFactory.getPoolByIndex(0);
      const pool1 = await poolFactory.getPoolByIndex(1);
      
      expect(await poolFactory.checkIsPool(pool0)).to.be.true;
      expect(await poolFactory.checkIsPool(pool1)).to.be.true;
      expect(await poolFactory.checkIsPool(ethers.constants.AddressZero)).to.be.false;
    });

    it("Should return all pools", async function () {
      const allPools = await poolFactory.getAllPools();
      expect(allPools.length).to.equal(2);
    });
  });

  describe("Fee Management", function () {
    beforeEach(async function () {
      // Create a test pool to generate fees
      await poolFactory.connect(user1).createPool(
        "Test Pool",
        ethers.utils.parseEther("0.01"),
        10,
        20,
        7,
        { value: creationFee }
      );
    });

    it("Should collect creation fees", async function () {
      const balance = await ethers.provider.getBalance(poolFactory.address);
      expect(balance).to.equal(creationFee);
    });

    it("Should allow owner to withdraw fees", async function () {
      const initialBalance = await owner.getBalance();
      await poolFactory.withdrawFees();
      const finalBalance = await owner.getBalance();
      
      expect(finalBalance.gt(initialBalance)).to.be.true;
      
      const contractBalance = await ethers.provider.getBalance(poolFactory.address);
      expect(contractBalance).to.equal(0);
    });

    it("Should reject non-owner from withdrawing fees", async function () {
      await expect(
        poolFactory.connect(user1).withdrawFees()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Integration", function () {
    it("Should create functional prize pools", async function () {
      const tx = await poolFactory.connect(user1).createPool(
        "Integration Test Pool",
        ethers.utils.parseEther("0.01"),
        10,
        20,
        7,
        { value: creationFee }
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'PoolCreated');
      const poolAddress = event.args.poolAddress;

      // Get the PrizePool contract
      const PrizePool = await ethers.getContractFactory("PrizePool");
      const pool = PrizePool.attach(poolAddress);

      // Verify the pool is functional
      const config = await pool.config();
      expect(config.name).to.equal("Integration Test Pool");
      expect(config.isActive).to.be.true;

      // Test participation
      const participationAmount = ethers.utils.parseEther("0.02");
      await pool.connect(user2).joinPool({ value: participationAmount });
      
      const participant = await pool.getParticipant(user2.address);
      expect(participant.user).to.equal(user2.address);
      expect(participant.amount).to.equal(participationAmount);
    });
  });
});
