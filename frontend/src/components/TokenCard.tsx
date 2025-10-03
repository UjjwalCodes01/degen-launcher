'use client';

import Image from 'next/image';

interface TokenCardProps {
  name: string;
  ticker: string;
  creator: string;
  marketCap: string;
  image: string;
  price?: string;
}

export default function TokenCard({ 
  name, 
  ticker, 
  creator, 
  marketCap, 
  image, 
  price 
}: TokenCardProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="token-card">
      {/* Token Image with Glow Effect */}
      <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
        <Image
          src={image}
          alt={`${name} token`}
          fill
          className="object-cover mix-blend-overlay"
        />
        {/* Floating ticker badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-blue-400/30">
          <span className="text-blue-400 font-bold text-xs mono-font">${ticker}</span>
        </div>
      </div>
      
      {/* Enhanced Token Info */}
      <div className="space-y-4">
        {/* Token Name & Creator */}
        <div>
          <h3 className="text-white font-bold text-xl mb-2 leading-tight">{name}</h3>
          <p className="text-gray-400 text-sm mono-font">
            by {truncateAddress(creator)}
          </p>
        </div>
        
        {/* Price & Market Cap - High Contrast */}
        <div className="grid grid-cols-2 gap-4 py-4 px-4 rounded-lg bg-black/40 border border-gray-800 mb-6">
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Market Cap</p>
            <p className="text-green-400 font-bold text-lg mono-font text-glow">${marketCap}</p>
          </div>
          {price && (
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Price</p>
              <p className="text-blue-400 font-bold text-lg mono-font text-glow">${price}</p>
            </div>
          )}
        </div>
        
        {/* Enhanced Trade Button with more spacing */}
        <div className="pt-2">
          <button className="trade-btn w-full">
            <span className="relative z-10">Trade Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}