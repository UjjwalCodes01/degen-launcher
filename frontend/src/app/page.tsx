'use client';

import { useState } from 'react';
import TokenCard from '@/components/TokenCard';
import CreateTokenModal from '@/components/CreateTokenModal';
import WalletConnect from '@/components/WalletConnect';

// Mock data for demonstration
const mockTokens = [
  {
    name: "DogeKing",
    ticker: "DKING",
    creator: "0x1234567890abcdef1234567890abcdef12345678",
    marketCap: "1.2M",
    image: "/next.svg",
    price: "0.0012"
  },
  {
    name: "PepeCoin",
    ticker: "PEPE",
    creator: "0xabcdef1234567890abcdef1234567890abcdef12",
    marketCap: "850K",
    image: "/vercel.svg",
    price: "0.0008"
  },
  {
    name: "ShibaInu",
    ticker: "SHIB",
    creator: "0x5678901234abcdef5678901234abcdef56789012",
    marketCap: "2.1M",
    image: "/file.svg",
    price: "0.0015"
  },
  {
    name: "MoonCat",
    ticker: "MCAT",
    creator: "0x9012345678abcdef9012345678abcdef90123456",
    marketCap: "650K",
    image: "/globe.svg",
    price: "0.0005"
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string>('');

  const handleCreateToken = (tokenData: { 
    name: string; 
    ticker: string; 
    description: string; 
    initialSupply: string 
  }) => {
    console.log('Creating token:', tokenData);
    // Here you would integrate with your smart contract
  };

  const handleWalletConnect = (address: string) => {
    setConnectedWallet(address);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Clean Header with Create Token Button */}
      <header className="border-b border-gray-800/50 backdrop-blur-xl sticky top-0 z-50" 
              style={{ background: 'rgba(10, 10, 10, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="pixel-font text-2xl" style={{ color: 'var(--electric-blue)' }}>
            MemePad
          </h1>
          
          <div className="flex items-center gap-10 space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary text-sm px-6 py-2  font-bold"
            >
              Create Token
            </button>
            <WalletConnect 
              onConnect={handleWalletConnect}
              connectedAddress={connectedWallet}
            />
          </div>
        </div>
      </header>

      {/* Main Content - Simplified */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section - Clean */}
        <section className="text-center py-16 mb-24">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Launch Your
            <span className="block text-glow mt-2" style={{ color: 'var(--electric-blue)' }}>
              Meme Coin
            </span>
          </h2>
        </section>

        {/* Tokens Grid - Clean */}
        <section className="pb-16">
          
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockTokens.map((token, index) => (
              <TokenCard
                key={index}
                name={token.name}
                ticker={token.ticker}
                creator={token.creator}
                marketCap={token.marketCap}
                image={token.image}
                price={token.price}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Modal */}
      <CreateTokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateToken}
      />
    </div>
  );
}