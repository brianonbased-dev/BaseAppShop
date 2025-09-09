'use client';

import { useEffect, useState } from 'react';
import { useMiniKit, useIsInMiniApp } from '@coinbase/onchainkit/minikit';
import Image from 'next/image';
import { Icon } from './DemoComponents';

export function ContextWalletButton() {
  const { context, isFrameReady, setFrameReady } = useMiniKit();
  const { isInMiniApp } = useIsInMiniApp();
  const [mounted, setMounted] = useState(false);
  const [showEntryBadge, setShowEntryBadge] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!isFrameReady) {
      setFrameReady();
    }
    // Hide entry badge after 5 seconds
    const timer = setTimeout(() => setShowEntryBadge(false), 5000);
    return () => clearTimeout(timer);
  }, [isFrameReady, setFrameReady]);

  // Don't render until mounted (avoid hydration issues)
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-white border border-emerald-300 rounded-lg animate-pulse">
        <div className="w-6 h-6 bg-emerald-200 rounded-full"></div>
        <div className="w-16 h-4 bg-emerald-200 rounded"></div>
        <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
      </div>
    );
  }

  // If we're in a mini app and have Farcaster context user
  if (isInMiniApp && isFrameReady && context?.user) {
    const contextUser = context.user;
    const { location, client } = context || {};
    
    // Use Farcaster context user data for display
    const displayUser = {
      username: contextUser.username || 'User',
      displayName: contextUser.displayName,
      pfpUrl: contextUser.pfpUrl,
      fid: contextUser.fid
    };
    
    // Determine entry context for badge
    const getEntryBadge = () => {
      if (!showEntryBadge) return null;
      
      switch (location?.type) {
        case 'cast_embed':
          return (
            <div className="absolute -top-1 -left-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1 py-0.5 rounded-full font-semibold animate-pulse shadow-sm">
              🔥
            </div>
          );
        case 'launcher':
          return (
            <div className="absolute -top-1 -left-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-1 py-0.5 rounded-full font-semibold animate-pulse shadow-sm">
              ⭐
            </div>
          );
        case 'notification':
          return (
            <div className="absolute -top-1 -left-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-1 py-0.5 rounded-full font-semibold animate-pulse shadow-sm">
              💬
            </div>
          );
        default:
          return null;
      }
    };
    
    return (
      <div className="relative flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-white border border-emerald-300 rounded-lg hover:from-emerald-100 hover:to-emerald-50 transition-all duration-200">
        {getEntryBadge()}
        {/* User Avatar */}
        <div className="relative w-6 h-6">
          <Image 
            src={displayUser.pfpUrl || '/brian-icon.png'} 
            alt={displayUser.displayName || displayUser.username || 'User avatar'}
            width={24}
            height={24}
            className="rounded-full border border-emerald-300 object-cover"
            onError={(e) => {
              // Show fallback when image fails
              const target = e.currentTarget;
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) {
                target.style.display = 'none';
                fallback.style.display = 'flex';
              }
            }}
          />
          {/* Fallback avatar */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full hidden items-center justify-center text-white text-xs font-bold">
            {(displayUser.username || 'U')[0].toUpperCase()}
          </div>
        </div>
        
        {/* Username/Basename */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-emerald-800 leading-none">
            @{displayUser.username}
          </span>
          {displayUser.displayName && displayUser.displayName !== displayUser.username && (
            <span className="text-xs text-emerald-600 leading-none">
              {displayUser.displayName.length > 12 ? `${displayUser.displayName.slice(0, 12)}...` : displayUser.displayName}
            </span>
          )}
        </div>
        
        {/* Connection Indicator */}
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          {client?.added && (
            <div className="text-xs font-semibold text-emerald-700" title="App saved">
              💾
            </div>
          )}
        </div>
      </div>
    );
  }

  // If we're in mini app but no context user (loading or not authenticated)
  if (isInMiniApp && isFrameReady) {
    return (
      <div className="relative flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-300 rounded-lg transition-all duration-200">
        {/* Loading Icon */}
        <div className="relative w-6 h-6">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
            <Icon name="star" size="sm" className="text-white" />
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-blue-800 leading-none">
            Loading Farcaster...
          </span>
          <span className="text-xs text-blue-600 leading-none">
            Connecting to Frame
          </span>
        </div>
        
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // For web users or when not in Frame context - show minimal placeholder or nothing
  return (
    <div className="relative flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg opacity-50">
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
        <Icon name="minus" size="sm" className="text-gray-500" />
      </div>
      <span className="text-sm text-gray-500">
        Frame Only
      </span>
    </div>
  );
}
