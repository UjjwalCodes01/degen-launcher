'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, zksync, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Degen Launcher',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || 'default_project_id_for_development', // Fixed env variable
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base, zksync], // Sepolia first as default
  ssr: true,
});
