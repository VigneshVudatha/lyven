import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchClient from './SearchClient';
import { getAllProducts } from '@/lib/db/repository';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Search Drops & Custom Tees — LYVEN',
  description: 'Search our fan-merch drops or custom typography designs.',
};

export default async function SearchPage() {
  const products = await getAllProducts();

  return (
    <Suspense
      fallback={
        <div className="bg-[#FAF8F3] min-h-[60vh] flex flex-col items-center justify-center font-mono text-xs text-[#6B6E7B]">
          <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mb-3" />
          <span>Searching Drops...</span>
        </div>
      }
    >
      <SearchClient initialProducts={products} />
    </Suspense>
  );
}
