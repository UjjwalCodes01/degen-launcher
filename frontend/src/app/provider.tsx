'use client';

import * as React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../lib/walletConfig';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children as any}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              // Default options
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              // Success
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
                style: {
                  background: '#065F46',
                  border: '2px solid #10B981',
                },
              },
              // Error
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                style: {
                  background: '#7F1D1D',
                  border: '2px solid #EF4444',
                },
              },
              // Loading
              loading: {
                iconTheme: {
                  primary: '#3B82F6',
                  secondary: '#fff',
                },
                style: {
                  background: '#1E3A8A',
                  border: '2px solid #3B82F6',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
