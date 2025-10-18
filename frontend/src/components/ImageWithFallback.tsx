'use client';

import Image from 'next/image';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  loading = 'lazy',
  fallbackSrc = '/placeholder-token.svg'
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    // Try fallback image
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center img-skeleton">
          <LoadingSpinner size="md" />
        </div>
      )}
      
      {/* Error State */}
      {hasError && imgSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto mb-2 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      )}
      
      {/* Actual Image */}
      {fill ? (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={sizes}
          className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
        />
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          loading={loading}
        />
      )}
    </div>
  );
}
