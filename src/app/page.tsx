'use client';

import { useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { PoolCard } from '@/components/PoolCard';
import { CreatePoolForm } from '@/components/CreatePoolForm';
import { usePrizePools } from '@/hooks/usePrizePools';
import { useUserHistory } from '@/hooks/useUserHistory';
import { useAccount } from 'wagmi';

// Mock factory address for development
const MOCK_FACTORY_ADDRESS = '0x1234567890123456789012345678901234567890';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'pools' | 'create' | 'history'>('pools');
  const { isConnected } = useAccount();
  
  const {
    pools,
    loading: poolsLoading,
    error: poolsError,
    createPool,
    participateInPool,
  } = usePrizePools(MOCK_FACTORY_ADDRESS);

  const { history, loading: historyLoading } = useUserHistory(
    pools.map(pool => ({ address: pool.address, name: pool.name }))
  );

  const handleCreatePool = async (poolData: any) => {
    try {
      await createPool(poolData);
      setActiveTab('pools');
    } catch (error) {
      console.error('Failed to create pool:', error);
    }
  };

  const handleParticipate = async (poolAddress: string, amount: string) => {
    try {
      await participateInPool(poolAddress, amount);
    } catch (error) {
      console.error('Failed to participate:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to LootPot</h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect your wallet to start participating in decentralized prize pools
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">LootPot</h1>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pools')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pools'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Prize Pools ({pools.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Pool
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My History ({history.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'pools' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Prize Pools</h2>
              <button
                onClick={() => setActiveTab('create')}
                className="btn-primary"
              >
                Create New Pool
              </button>
            </div>

            {poolsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading prize pools...</p>
              </div>
            ) : poolsError ? (
              <div className="text-center py-12">
                <p className="text-red-600">{poolsError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-secondary mt-4"
                >
                  Retry
                </button>
              </div>
            ) : pools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No prize pools available yet.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-primary"
                >
                  Create the first pool
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pools.map((pool) => (
                  <PoolCard
                    key={pool.address}
                    pool={pool}
                    onParticipate={handleParticipate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Prize Pool</h2>
            <div className="max-w-2xl">
              <CreatePoolForm
                onSubmit={handleCreatePool}
                isCreating={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Participation History</h2>
            
            {historyLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">You haven't participated in any pools yet.</p>
                <button
                  onClick={() => setActiveTab('pools')}
                  className="btn-primary mt-4"
                >
                  Browse Pools
                </button>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {history.map((entry, index) => (
                    <li key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{entry.poolName}</h3>
                          <p className="text-sm text-gray-500">
                            Participated with {parseFloat(entry.amount) / 1e18} ETH
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(entry.timestamp * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {entry.hasWon ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Won {parseFloat(entry.prizeAmount) / 1e18} ETH
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No Win
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
