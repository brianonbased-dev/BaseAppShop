"use client";

import Link from 'next/link';
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { Button } from '@/app/components/DemoComponents';

export function ProductFooter() {
  const openUrl = useOpenUrl();

  return (
    <footer className="border-t border-emerald-200/30 bg-white/95 backdrop-blur-md">
      <div className="w-full max-w-md mx-auto px-4 py-4">
        <div className="flex space-x-2 mb-3">
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              size="md"
              className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
            >
              💪 Continue Shopping
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
            onClick={() => openUrl("https://shop.brianxbase.com")}
          >
            🔗 Full Store
          </Button>
        </div>
        <p className="text-[var(--ock-text-foreground-muted)] text-xs text-center">
          Premium health supplements & coffee
        </p>
      </div>
    </footer>
  );
}
