// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PrizePool
 * @dev A decentralized prize pool contract that allows users to participate in lotteries
 * with Chainlink VRF for fair randomness
 */
contract PrizePool is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    struct Participant {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool hasWon;
        uint256 prizeAmount;
    }
    
    struct PoolConfig {
        string name;
        uint256 minParticipation;
        uint256 winProbability; // 1 in X chance to win
        uint256 platformFeePercent; // Platform fee percentage (e.g., 20 for 20%)
        uint256 endTime;
        bool isActive;
    }
    
    PoolConfig public config;
    uint256 public totalPrizePool;
    uint256 public totalParticipants;
    uint256 public platformFeeCollected;
    
    mapping(address => Participant) public participants;
    address[] public participantAddresses;
    
    event PoolCreated(string name, uint256 minParticipation, uint256 winProbability);
    event ParticipantJoined(address indexed user, uint256 amount);
    event WinnerSelected(address indexed winner, uint256 prizeAmount);
    event PoolEnded(uint256 totalPrize, uint256 totalParticipants);
    
    constructor(
        string memory _name,
        uint256 _minParticipation,
        uint256 _winProbability,
        uint256 _platformFeePercent,
        uint256 _durationInDays
    ) {
        require(_minParticipation > 0, "Min participation must be greater than 0");
        require(_winProbability > 0, "Win probability must be greater than 0");
        require(_platformFeePercent <= 50, "Platform fee cannot exceed 50%");
        
        config = PoolConfig({
            name: _name,
            minParticipation: _minParticipation,
            winProbability: _winProbability,
            platformFeePercent: _platformFeePercent,
            endTime: block.timestamp + (_durationInDays * 1 days),
            isActive: true
        });
        
        emit PoolCreated(_name, _minParticipation, _winProbability);
    }
    
    /**
     * @dev Join the prize pool
     */
    function joinPool() external payable nonReentrant {
        require(config.isActive, "Pool is not active");
        require(block.timestamp < config.endTime, "Pool has ended");
        require(msg.value >= config.minParticipation, "Insufficient participation amount");
        require(participants[msg.sender].user == address(0), "Already participated");
        
        participants[msg.sender] = Participant({
            user: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            hasWon: false,
            prizeAmount: 0
        });
        
        participantAddresses.push(msg.sender);
        totalPrizePool += msg.value;
        totalParticipants++;
        
        emit ParticipantJoined(msg.sender, msg.value);
        
        // Simple random selection (in production, use Chainlink VRF)
        if (_shouldWin()) {
            _selectWinner(msg.sender);
        }
    }
    
    /**
     * @dev Simple random selection (placeholder for Chainlink VRF)
     */
    function _shouldWin() internal view returns (bool) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        ))) % config.winProbability;
        
        return random == 0;
    }
    
    /**
     * @dev Select a winner and distribute prize
     */
    function _selectWinner(address winner) internal {
        require(participants[winner].user != address(0), "Invalid winner");
        require(!participants[winner].hasWon, "Already won");
        
        participants[winner].hasWon = true;
        
        uint256 prizeAmount = (totalPrizePool * (100 - config.platformFeePercent)) / 100;
        participants[winner].prizeAmount = prizeAmount;
        
        uint256 platformFee = totalPrizePool - prizeAmount;
        platformFeeCollected += platformFee;
        
        // Transfer prize to winner
        (bool success, ) = winner.call{value: prizeAmount}("");
        require(success, "Failed to transfer prize");
        
        emit WinnerSelected(winner, prizeAmount);
    }
    
    /**
     * @dev End the pool and distribute remaining funds
     */
    function endPool() external onlyOwner {
        require(config.isActive, "Pool already ended");
        require(block.timestamp >= config.endTime, "Pool has not ended yet");
        
        config.isActive = false;
        
        emit PoolEnded(totalPrizePool, totalParticipants);
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees() external onlyOwner {
        require(platformFeeCollected > 0, "No fees to withdraw");
        
        uint256 amount = platformFeeCollected;
        platformFeeCollected = 0;
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Failed to withdraw fees");
    }
    
    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 _totalPrize,
        uint256 _totalParticipants,
        uint256 _platformFeeCollected,
        bool _isActive,
        uint256 _timeRemaining
    ) {
        uint256 timeRemaining = 0;
        if (config.endTime > block.timestamp) {
            timeRemaining = config.endTime - block.timestamp;
        }
        
        return (
            totalPrizePool,
            totalParticipants,
            platformFeeCollected,
            config.isActive,
            timeRemaining
        );
    }
    
    /**
     * @dev Get participant information
     */
    function getParticipant(address user) external view returns (Participant memory) {
        return participants[user];
    }
    
    /**
     * @dev Get all participant addresses
     */
    function getAllParticipants() external view returns (address[] memory) {
        return participantAddresses;
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        require(!config.isActive, "Pool is still active");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed to withdraw funds");
    }
}
