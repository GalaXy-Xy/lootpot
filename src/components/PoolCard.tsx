'use client';

import { useState } from 'react';
import { formatEther } from 'ethers/lib/utils';

interface PoolCardProps {
  pool: {
    address: string;
    name: string;
    totalPrize: string;
    totalParticipants: number;
    winProbability: number;
    minParticipation: string;
    timeRemaining: number;
    isActive: boolean;
  };
  onParticipate: (poolAddress: string, amount: string) => void;
}

export function PoolCard({ pool, onParticipate }: PoolCardProps) {
  const [participationAmount, setParticipationAmount] = useState('');
  const [isParticipating, setIsParticipating] = useState(false);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleParticipate = async () => {
    if (!participationAmount || parseFloat(participationAmount) < parseFloat(formatEther(pool.minParticipation))) {
      alert('Please enter a valid participation amount');
      return;
    }

    setIsParticipating(true);
    try {
      await onParticipate(pool.address, participationAmount);
      setParticipationAmount('');
    } catch (error) {
      console.error('Participation failed:', error);
    } finally {
      setIsParticipating(false);
    }
  };

  const isAmountValid = parseFloat(participationAmount) >= parseFloat(formatEther(pool.minParticipation));

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{pool.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          pool.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {pool.isActive ? 'Active' : 'Ended'}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Prize:</span>
          <span className="font-semibold">{formatEther(pool.totalPrize)} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Participants:</span>
          <span className="font-semibold">{pool.totalParticipants}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Win Chance:</span>
          <span className="font-semibold">1 in {pool.winProbability}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Min Entry:</span>
          <span className="font-semibold">{formatEther(pool.minParticipation)} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Time Left:</span>
          <span className="font-semibold">{formatTime(pool.timeRemaining)}</span>
        </div>
      </div>

      {pool.isActive && (
        <div className="space-y-3">
          <div>
            <label htmlFor={`amount-${pool.address}`} className="block text-sm font-medium text-gray-700 mb-1">
              Participation Amount (ETH)
            </label>
            <input
              id={`amount-${pool.address}`}
              type="number"
              step="0.001"
              min={formatEther(pool.minParticipation)}
              value={participationAmount}
              onChange={(e) => setParticipationAmount(e.target.value)}
              className="input-field"
              placeholder={`Min: ${formatEther(pool.minParticipation)} ETH`}
            />
          </div>
          <button
            onClick={handleParticipate}
            disabled={!isAmountValid || isParticipating}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
              isAmountValid && !isParticipating
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isParticipating ? 'Participating...' : 'Participate Now'}
          </button>
        </div>
      )}
    </div>
  );
}
