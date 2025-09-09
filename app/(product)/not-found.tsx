import Link from 'next/link';
import { Button } from '@/app/components/DemoComponents';

export default function ProductNotFound() {
  return (
    <div className="px-4 py-12 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">🔍</span>
      </div>
      
      <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">
        Product Not Found
      </h1>
      
      <p className="text-[var(--app-foreground-muted)] mb-8">
        Sorry, we couldn&apos;t find the product you&apos;re looking for. It may have been moved or is no longer available.
      </p>
      
      <div className="space-y-3">
        <Link href="/">
          <Button
            variant="primary"
            size="md"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            💪 Back to Store
          </Button>
        </Link>
        
        <p className="text-sm text-[var(--app-foreground-muted)]">
          Or browse our full collection of premium health supplements & coffee
        </p>
      </div>
    </div>
  );
}
