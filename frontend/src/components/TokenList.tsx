'use client';

import { CometCard } from '@/components/ui/comet-card';
import { useTokenSale, useTokenBalance } from '@/hooks/useTokenData';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAccount } from 'wagmi';

interface TokenCardProps {
  index: number;
  onBuy: (tokenAddress: string, amount: string) => void;
}

function TokenCard({ index, onBuy }: TokenCardProps) {
  const { address: userAddress } = useAccount();
  const { tokenSale, isLoading } = useTokenSale(index);
  const { balance: userBalance } = useTokenBalance(tokenSale?.token, userAddress);
  const [buyAmount, setBuyAmount] = useState('1');

  const alreadyOwnsToken = userBalance ? userBalance > BigInt(0) : false;

  if (isLoading) {
    return (
      <CometCard>
        <div className="w-60 p-4 animate-pulse">
          <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
          <div className="bg-gray-700 h-4 rounded mb-2"></div>
          <div className="bg-gray-700 h-4 rounded w-3/4"></div>
        </div>
      </CometCard>
    );
  }

  if (!tokenSale) return null;

  return (
    <CometCard>
      <div className="w-35 bg-[#1F2121] rounded-[16px] p-3 cursor-pointer">
        <div className="relative aspect-[3/4] w-35">
          <img
            loading="lazy"
            className="w-full rounded-[16px] object-cover"
            alt={tokenSale.name}
            src={tokenSale.image || "/monkey.png"}
            style={{
              boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
            }}
          />
        </div>
        <div className="space-y-1">
          <div>
            <h3 className="text-white font-bold text-lg truncate">{tokenSale.name}</h3>
            <p className="text-gray-400 text-xs">Creator: {tokenSale.creator.slice(0, 6)}...{tokenSale.creator.slice(-4)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-400">Sold</p>
              <p className="text-white font-semibold">{formatEther(tokenSale.sold)} T</p>
            </div>
            <div>
              <p className="text-gray-400">Raised</p>
              <p className="text-green-400 font-semibold">{formatEther(tokenSale.raised)} ETH</p>
            </div>
          </div>
          <div className={`text-xs font-semibold ${tokenSale.isOpen ? 'text-green-400' : 'text-red-400'}`}>
            {tokenSale.isOpen ? '🟢 Open for Sale' : '🔴 Sale Closed'}
          </div>
          {tokenSale.isOpen ? (
            <div className="space-y-2 pt-2 border-t border-gray-700">
              {alreadyOwnsToken ? (
                <div className="text-center py-3">
                  <p className="text-yellow-400 text-xs font-semibold">✋ You already own this token</p>
                  <p className="text-gray-400 text-xs mt-1">Balance: {userBalance ? formatEther(userBalance) : '0'} tokens</p>
                </div>
              ) : (
                <>
                  <Input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="Amount in ETH"
                    className="bg-gray-800 text-white border-gray-600 text-sm py-2"
                    step="0.01"
                    min="0.01"
                  />
                  <Button
                    onClick={() => onBuy(tokenSale.token, buyAmount)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white font-bold py-2 text-sm"
                  >
                    Buy Tokens
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-3 border-t border-gray-700">
              <p className="text-red-400 text-xs font-semibold">Sale has ended</p>
            </div>
          )}
        </div>
      </div>
    </CometCard>
  );
}

interface TokenListProps {
  totalTokens: number;
  onBuy: (tokenAddress: string, amount: string) => void;
}

export default function TokenList({ totalTokens, onBuy }: TokenListProps) {
  const tokenIndexes = Array.from({ length: totalTokens }, (_, i) => i);

  if (totalTokens === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No tokens created yet. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center items-start gap-8 py-6">
      {tokenIndexes.map((index) => (
        <TokenCard key={index} index={index} onBuy={onBuy} />
      ))}
    </div>
  );
}
