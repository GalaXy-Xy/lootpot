// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PrizePool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PoolFactory
 * @dev Factory contract for creating new prize pools
 */
contract PoolFactory is Ownable {
    PrizePool[] public pools;
    mapping(address => bool) public isPool;
    mapping(address => uint256) public poolIndex;
    
    event PoolCreated(address indexed poolAddress, string name, uint256 minParticipation);
    
    /**
     * @dev Create a new prize pool
     */
    function createPool(
        string memory _name,
        uint256 _minParticipation,
        uint256 _winProbability,
        uint256 _platformFeePercent,
        uint256 _durationInDays
    ) external payable returns (address) {
        require(msg.value >= 0.01 ether, "Insufficient creation fee");
        
        PrizePool newPool = new PrizePool(
            _name,
            _minParticipation,
            _winProbability,
            _platformFeePercent,
            _durationInDays
        );
        
        address poolAddress = address(newPool);
        pools.push(newPool);
        isPool[poolAddress] = true;
        poolIndex[poolAddress] = pools.length - 1;
        
        // Transfer ownership to the creator
        newPool.transferOwnership(msg.sender);
        
        emit PoolCreated(poolAddress, _name, _minParticipation);
        
        return poolAddress;
    }
    
    /**
     * @dev Get all pools
     */
    function getAllPools() external view returns (PrizePool[] memory) {
        return pools;
    }
    
    /**
     * @dev Get pool count
     */
    function getPoolCount() external view returns (uint256) {
        return pools.length;
    }
    
    /**
     * @dev Get pool by index
     */
    function getPoolByIndex(uint256 index) external view returns (address) {
        require(index < pools.length, "Invalid pool index");
        return address(pools[index]);
    }
    
    /**
     * @dev Check if address is a pool
     */
    function checkIsPool(address _address) external view returns (bool) {
        return isPool[_address];
    }
    
    /**
     * @dev Withdraw creation fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed to withdraw fees");
    }
}
