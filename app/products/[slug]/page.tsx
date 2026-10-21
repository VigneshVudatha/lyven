import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getVariantsForProduct, getProducts } from '@/lib/products/data';
import { formatPriceINR } from '@/lib/utils';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const variants = getVariantsForProduct(product.id);
  const allProducts = getProducts();
  const relatedProducts = allProducts.filter((p) => p.id !== product.id);

  return (
    <ProductDetailClient
      product={product}
      variants={variants}
      relatedProducts={relatedProducts}
    />
  );
}
