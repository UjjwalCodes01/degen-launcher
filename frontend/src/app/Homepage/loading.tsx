'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomepageLoading() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Hide loading after a short delay
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!showLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <LoadingSpinner size="xl" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">Loading Degen Launcher...</h3>
          <p className="text-gray-400 text-sm">Fetching tokens from Sepolia</p>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
