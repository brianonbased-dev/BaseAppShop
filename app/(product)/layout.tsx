import Link from 'next/link';
import { ProductFooter } from './components/ProductFooter';

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Simple Back Navigation - Below Global Header */}
      <div className="w-full max-w-md mx-auto px-4 py-3 border-b border-emerald-200/30">
        <Link href="/" className="flex items-center space-x-2 text-[var(--app-foreground)] hover:text-emerald-600 transition-colors">
          <span className="text-lg">←</span>
          <span className="font-medium">Back to Store</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation */}
      <ProductFooter />
    </>
  );
}
