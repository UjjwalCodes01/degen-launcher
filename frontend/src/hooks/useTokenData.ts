'use client';

import { useReadContract } from 'wagmi';
import { FACTORY_ADDRESS } from '@/contracts/addresses';
import { Abi } from 'viem';
import FactoryABI from '@/contracts/Factory.json';

const factoryAbi = FactoryABI.abi as unknown as Abi;

interface TokenSale {
  name: string;
  token: string;
  creator: string;
  sold: bigint;
  raised: bigint;
  isOpen: boolean;
  image: string;
}

export function useTokenSale(index: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: 'getTokenSale',
    args: [BigInt(index)],
    query: {
      refetchInterval: 2000, // Refetch every 2 seconds
    }
  });

  console.log(`🔍 Fetching token ${index}:`, { data, isLoading, error });

  return {
    tokenSale: data as TokenSale | undefined,
    isLoading,
    error,
    refetch,
  };
}

export function useTokenAddress(index: number) {
  const { data, isLoading, error } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: 'tokens',
    args: [BigInt(index)],
  });

  return {
    address: data as string | undefined,
    isLoading,
    error,
  };
}

export function useTokenBalance(tokenAddress: string | undefined, userAddress: string | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: 'balance', type: 'uint256' }],
      },
    ],
    functionName: 'balanceOf',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!tokenAddress && !!userAddress,
    }
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
  };
}
