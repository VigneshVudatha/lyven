import { Suspense } from 'react';
import type { Metadata } from 'next';
import ShopClient from './ShopClient';
import { getProducts } from '@/lib/products/data';

export const metadata: Metadata = {
  title: 'All T-Shirts — Men\'s Oversized Streetwear Collection',
  description:
    'Shop the LYVEN collection of 240 GSM French Terry oversized graphic tees. High fashion boxy silhouettes with Cash on Delivery and Pan-India Free Delivery.',
};

interface ShopPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function ShopPageContent({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const initialQuery = resolvedParams.q || '';
  const products = getProducts();

  return <ShopClient initialProducts={products} initialQuery={initialQuery} />;
}

export default function ShopPage(props: ShopPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] bg-[#FAF8F3] text-[#0B0B0D] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading Drops...</p>
        </div>
      }
    >
      <ShopPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}
