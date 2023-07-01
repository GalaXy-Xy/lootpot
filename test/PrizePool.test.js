const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrizePool", function () {
  let PrizePool, prizePool, owner, user1, user2, user3;
  let poolName = "Test Pool";
  let minParticipation = ethers.utils.parseEther("0.01");
  let winProbability = 10;
  let platformFeePercent = 20;
  let durationInDays = 7;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    PrizePool = await ethers.getContractFactory("PrizePool");
    prizePool = await PrizePool.deploy(
      poolName,
      minParticipation,
      winProbability,
      platformFeePercent,
      durationInDays
    );
    await prizePool.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      const config = await prizePool.config();
      expect(config.name).to.equal(poolName);
      expect(config.minParticipation).to.equal(minParticipation);
      expect(config.winProbability).to.equal(winProbability);
      expect(config.platformFeePercent).to.equal(platformFeePercent);
      expect(config.isActive).to.be.true;
    });

    it("Should set the correct owner", async function () {
      expect(await prizePool.owner()).to.equal(owner.address);
    });
  });

  describe("Participation", function () {
    it("Should allow users to join the pool", async function () {
      const participationAmount = ethers.utils.parseEther("0.02");
      
      await prizePool.connect(user1).joinPool({ value: participationAmount });
      
      const participant = await prizePool.getParticipant(user1.address);
      expect(participant.user).to.equal(user1.address);
      expect(participant.amount).to.equal(participationAmount);
      expect(participant.hasWon).to.be.false;
      
      expect(await prizePool.totalParticipants()).to.equal(1);
      expect(await prizePool.totalPrizePool()).to.equal(participationAmount);
    });

    it("Should reject participation below minimum amount", async function () {
      const lowAmount = ethers.utils.parseEther("0.005");
      
      await expect(
        prizePool.connect(user1).joinPool({ value: lowAmount })
      ).to.be.revertedWith("Insufficient participation amount");
    });

    it("Should reject duplicate participation", async function () {
      const amount = ethers.utils.parseEther("0.02");
      
      await prizePool.connect(user1).joinPool({ value: amount });
      
      await expect(
        prizePool.connect(user1).joinPool({ value: amount })
      ).to.be.revertedWith("Already participated");
    });

    it("Should reject participation in inactive pool", async function () {
      // End the pool first
      await ethers.provider.send("evm_increaseTime", [durationInDays * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      
      await prizePool.endPool();
      
      const amount = ethers.utils.parseEther("0.02");
      await expect(
        prizePool.connect(user1).joinPool({ value: amount })
      ).to.be.revertedWith("Pool is not active");
    });
  });

  describe("Prize Distribution", function () {
    it("Should distribute prizes correctly", async function () {
      const participationAmount = ethers.utils.parseEther("0.1");
      const initialBalance = await user1.getBalance();
      
      await prizePool.connect(user1).joinPool({ value: participationAmount });
      
      // Check if user won (this depends on the random function)
      const participant = await prizePool.getParticipant(user1.address);
      
      if (participant.hasWon) {
        const expectedPrize = participationAmount.mul(80).div(100); // 80% after 20% fee
        expect(participant.prizeAmount).to.equal(expectedPrize);
        
        const finalBalance = await user1.getBalance();
        expect(finalBalance.gt(initialBalance)).to.be.true;
      }
    });
  });

  describe("Pool Management", function () {
    it("Should allow owner to end pool", async function () {
      await ethers.provider.send("evm_increaseTime", [durationInDays * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      
      await prizePool.endPool();
      
      const config = await prizePool.config();
      expect(config.isActive).to.be.false;
    });

    it("Should reject ending pool before time", async function () {
      await expect(prizePool.endPool()).to.be.revertedWith("Pool has not ended yet");
    });

    it("Should reject ending pool twice", async function () {
      await ethers.provider.send("evm_increaseTime", [durationInDays * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      
      await prizePool.endPool();
      
      await expect(prizePool.endPool()).to.be.revertedWith("Pool already ended");
    });
  });

  describe("Fee Management", function () {
    it("Should collect platform fees correctly", async function () {
      const participationAmount = ethers.utils.parseEther("0.1");
      
      await prizePool.connect(user1).joinPool({ value: participationAmount });
      
      const platformFees = await prizePool.platformFeeCollected();
      expect(platformFees).to.be.gt(0);
    });

    it("Should allow owner to withdraw fees", async function () {
      const participationAmount = ethers.utils.parseEther("0.1");
      
      await prizePool.connect(user1).joinPool({ value: participationAmount });
      
      const initialBalance = await owner.getBalance();
      await prizePool.withdrawPlatformFees();
      const finalBalance = await owner.getBalance();
      
      expect(finalBalance.gt(initialBalance)).to.be.true;
    });

    it("Should reject non-owner from withdrawing fees", async function () {
      await expect(
        prizePool.connect(user1).withdrawPlatformFees()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      const participationAmount = ethers.utils.parseEther("0.1");
      
      await prizePool.connect(user1).joinPool({ value: participationAmount });
      
      // End the pool first
      await ethers.provider.send("evm_increaseTime", [durationInDays * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      await prizePool.endPool();
      
      const initialBalance = await owner.getBalance();
      await prizePool.emergencyWithdraw();
      const finalBalance = await owner.getBalance();
      
      expect(finalBalance.gt(initialBalance)).to.be.true;
    });

    it("Should reject emergency withdraw on active pool", async function () {
      await expect(
        prizePool.emergencyWithdraw()
      ).to.be.revertedWith("Pool is still active");
    });
  });
});
