'use client';

import { useState, useEffect, useCallback } from 'react';
import { useContract, useProvider, useSigner } from 'wagmi';
import { PoolFactory__factory, PrizePool__factory } from '@/contracts/types';
import { ethers } from 'ethers';

interface Pool {
  address: string;
  name: string;
  totalPrize: string;
  totalParticipants: number;
  winProbability: number;
  minParticipation: string;
  timeRemaining: number;
  isActive: boolean;
}

interface UsePrizePoolsReturn {
  pools: Pool[];
  loading: boolean;
  error: string | null;
  createPool: (poolData: {
    name: string;
    minParticipation: string;
    winProbability: number;
    platformFeePercent: number;
    durationInDays: number;
  }) => Promise<void>;
  participateInPool: (poolAddress: string, amount: string) => Promise<void>;
  refreshPools: () => Promise<void>;
}

export function usePrizePools(factoryAddress?: string): UsePrizePoolsReturn {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = useProvider();
  const { data: signer } = useSigner();

  const factoryContract = useContract({
    address: factoryAddress as `0x${string}`,
    abi: PoolFactory__factory.abi,
    signerOrProvider: signer || provider,
  });

  const fetchPools = useCallback(async () => {
    if (!factoryContract) return;

    try {
      setLoading(true);
      setError(null);

      const poolCount = await factoryContract.getPoolCount();
      const poolPromises = [];

      for (let i = 0; i < poolCount.toNumber(); i++) {
        const poolAddress = await factoryContract.getPoolByIndex(i);
        poolPromises.push(fetchPoolData(poolAddress));
      }

      const poolData = await Promise.all(poolPromises);
      setPools(poolData.filter(Boolean) as Pool[]);
    } catch (err) {
      console.error('Error fetching pools:', err);
      setError('Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  }, [factoryContract]);

  const fetchPoolData = async (poolAddress: string): Promise<Pool | null> => {
    try {
      const poolContract = PrizePool__factory.connect(poolAddress, provider);
      
      const [config, stats] = await Promise.all([
        poolContract.config(),
        poolContract.getPoolStats(),
      ]);

      const timeRemaining = config.endTime.toNumber() - Math.floor(Date.now() / 1000);

      return {
        address: poolAddress,
        name: config.name,
        totalPrize: stats._totalPrize.toString(),
        totalParticipants: stats._totalParticipants.toNumber(),
        winProbability: config.winProbability.toNumber(),
        minParticipation: config.minParticipation.toString(),
        timeRemaining: Math.max(0, timeRemaining),
        isActive: stats._isActive,
      };
    } catch (err) {
      console.error('Error fetching pool data:', err);
      return null;
    }
  };

  const createPool = useCallback(async (poolData: {
    name: string;
    minParticipation: string;
    winProbability: number;
    platformFeePercent: number;
    durationInDays: number;
  }) => {
    if (!factoryContract || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await factoryContract.createPool(
        poolData.name,
        poolData.minParticipation,
        poolData.winProbability,
        poolData.platformFeePercent,
        poolData.durationInDays,
        { value: ethers.utils.parseEther('0.01') } // Creation fee
      );

      await tx.wait();
      await fetchPools();
    } catch (err) {
      console.error('Error creating pool:', err);
      setError('Failed to create pool');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [factoryContract, signer, fetchPools]);

  const participateInPool = useCallback(async (poolAddress: string, amount: string) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const poolContract = PrizePool__factory.connect(poolAddress, signer);
      const tx = await poolContract.joinPool({ value: amount });
      
      await tx.wait();
      await fetchPools();
    } catch (err) {
      console.error('Error participating in pool:', err);
      setError('Failed to participate in pool');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, fetchPools]);

  const refreshPools = useCallback(async () => {
    await fetchPools();
  }, [fetchPools]);

  useEffect(() => {
    if (factoryAddress) {
      fetchPools();
    }
  }, [factoryAddress, fetchPools]);

  return {
    pools,
    loading,
    error,
    createPool,
    participateInPool,
    refreshPools,
  };
}
