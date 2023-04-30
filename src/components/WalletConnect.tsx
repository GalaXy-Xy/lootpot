'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(
      (connector) => connector instanceof MetaMaskConnector
    );
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            {formatAddress(address!)}
          </div>
          <button
            onClick={handleDisconnect}
            className="btn-secondary text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="btn-primary"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
