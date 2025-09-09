'use client';

import { useEffect, useState } from 'react';
import { useMiniKit, useIsInMiniApp } from '@coinbase/onchainkit/minikit';
import Image from 'next/image';
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Icon } from './DemoComponents';

export function ContextWalletButton() {
  const { context, isFrameReady } = useMiniKit();
  const { isInMiniApp } = useIsInMiniApp();
  const [mounted, setMounted] = useState(false);
  const [showEntryBadge, setShowEntryBadge] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Hide entry badge after 5 seconds
    const timer = setTimeout(() => setShowEntryBadge(false), 5000);
    return () => clearTimeout(timer);
  }, []);

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

  // If we're in a mini app and have context with user data
  if (isInMiniApp && isFrameReady && context?.user) {
    const { user, location, client } = context;
    
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
      <Wallet className="z-50">
        <ConnectWallet>
          <div className="relative flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-white border border-emerald-300 rounded-lg hover:from-emerald-100 hover:to-emerald-50 transition-all duration-200 cursor-pointer">
            {getEntryBadge()}
            {/* User Avatar */}
            <div className="relative w-6 h-6">
              <Image 
                src={user.pfpUrl || '/brian-icon.png'} 
                alt={user.displayName || user.username || 'User avatar'}
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
                {(user.username || user.displayName || 'U')[0].toUpperCase()}
              </div>
            </div>
            
            {/* Username/Basename */}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-800 leading-none">
                @{user.username}
              </span>
              {user.displayName && user.displayName !== user.username && (
                <span className="text-xs text-emerald-600 leading-none">
                  {user.displayName.length > 12 ? `${user.displayName.slice(0, 12)}...` : user.displayName}
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
        </ConnectWallet>
        <WalletDropdown className="z-50 wallet-dropdown">
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            {/* Enhanced user info in dropdown */}
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-emerald-200">
              <div className="relative w-12 h-12">
                <Image 
                  src={user.pfpUrl || '/brian-icon.png'} 
                  alt={user.displayName || user.username || 'User avatar'}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-emerald-300 object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      target.style.display = 'none';
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full hidden items-center justify-center text-white font-bold">
                  {(user.username || user.displayName || 'U')[0].toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-emerald-900 truncate">@{user.username}</div>
                {user.displayName && (
                  <div className="text-sm text-emerald-700 truncate">{user.displayName}</div>
                )}
                <div className="text-xs text-emerald-600">FID: {user.fid}</div>
              </div>
            </div>
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    );
  }

  // Fallback for web or when context isn't available
  return (
    <Wallet className="z-50">
      <ConnectWallet>
        <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-white border border-emerald-300 rounded-lg hover:from-emerald-100 hover:to-emerald-50 transition-all duration-200 cursor-pointer">
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <Icon name="plus" size="sm" className="text-white" />
          </div>
          <span className="text-sm font-semibold text-emerald-800">
            Connect Wallet
          </span>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </ConnectWallet>
      <WalletDropdown className="z-50 wallet-dropdown">
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}
