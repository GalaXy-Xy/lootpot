'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useProvider } from 'wagmi';
import { PrizePool__factory } from '@/contracts/types';

interface ParticipationHistory {
  poolAddress: string;
  poolName: string;
  amount: string;
  timestamp: number;
  hasWon: boolean;
  prizeAmount: string;
}

interface UseUserHistoryReturn {
  history: ParticipationHistory[];
  loading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
}

export function useUserHistory(pools: Array<{ address: string; name: string }>): UseUserHistoryReturn {
  const [history, setHistory] = useState<ParticipationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address: userAddress } = useAccount();
  const provider = useProvider();

  const fetchUserHistory = useCallback(async () => {
    if (!userAddress || !pools.length) return;

    try {
      setLoading(true);
      setError(null);

      const historyPromises = pools.map(async (pool) => {
        try {
          const poolContract = PrizePool__factory.connect(pool.address, provider);
          const participant = await poolContract.getParticipant(userAddress);
          
          // Only include if user has participated
          if (participant.user !== '0x0000000000000000000000000000000000000000') {
            return {
              poolAddress: pool.address,
              poolName: pool.name,
              amount: participant.amount.toString(),
              timestamp: participant.timestamp.toNumber(),
              hasWon: participant.hasWon,
              prizeAmount: participant.prizeAmount.toString(),
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching history for pool ${pool.address}:`, err);
          return null;
        }
      });

      const userHistory = await Promise.all(historyPromises);
      const filteredHistory = userHistory.filter(Boolean) as ParticipationHistory[];
      
      // Sort by timestamp (newest first)
      filteredHistory.sort((a, b) => b.timestamp - a.timestamp);
      
      setHistory(filteredHistory);
    } catch (err) {
      console.error('Error fetching user history:', err);
      setError('Failed to fetch user history');
    } finally {
      setLoading(false);
    }
  }, [userAddress, pools, provider]);

  const refreshHistory = useCallback(async () => {
    await fetchUserHistory();
  }, [fetchUserHistory]);

  useEffect(() => {
    fetchUserHistory();
  }, [fetchUserHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory,
  };
}
