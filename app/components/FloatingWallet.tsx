'use client';

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
import { Icon } from "./DemoComponents";

type FloatingWalletProps = {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

export function FloatingWallet({ className = '', position = 'bottom-right' }: FloatingWalletProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <Wallet className="z-50">
        <ConnectWallet>
          <div className="flex items-center justify-center w-12 h-12 bg-white/95 backdrop-blur-md border-2 border-emerald-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Icon name="plus" size="sm" className="text-white" />
            </div>
          </div>
        </ConnectWallet>
        <WalletDropdown className="z-50">
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
