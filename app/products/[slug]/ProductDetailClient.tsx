'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Zap,
  Truck,
  Ruler,
  Check,
  MessageCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import type { Product, ProductVariant, Size } from '@/types';
import { useCartStore } from '@/lib/cart/store';
import { formatPriceINR } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  variants: ProductVariant[];
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  variants,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Get available sizes from variants
  const availableSizes = variants.map((v) => ({
    size: v.size,
    available: v.quantity > 0,
    variantId: v.id,
    stock: v.quantity,
    color: v.color,
    sku: v.sku,
  }));

  const selectedVariant = selectedSize
    ? availableSizes.find((v) => v.size === selectedSize)
    : null;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.variantId,
      sku: selectedVariant.sku,
      name: product.name,
      slug: product.slug,
      pricePaise: product.pricePaise,
      size: selectedSize,
      color: selectedVariant.color,
      image: product.images[0]?.url || '',
      quantity,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.variantId,
      sku: selectedVariant.sku,
      name: product.name,
      slug: product.slug,
      pricePaise: product.pricePaise,
      size: selectedSize,
      color: selectedVariant.color,
      image: product.images[0]?.url || '',
      quantity,
    });

    router.push('/checkout');
  };

  const currentImageObj = product.images[activeImageIdx] || product.images[0];
  const currentImageUrl = currentImageObj?.url;
  const currentImageAlt = currentImageObj?.alt || product.name;

  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-screen pt-4 sm:pt-10 pb-36 sm:pb-16 font-sans">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <nav className="flex items-center gap-2 text-xs text-[#6B6E7B] font-sans">
          <Link href="/" className="hover:text-[#0B0B0D] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#0B0B0D] transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#0B0B0D] font-bold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Left: Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image with object-contain to preserve proportions */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F4F3ED] border border-[#E7E5DD] flex items-center justify-center p-4 sm:p-6 shadow-xs select-none">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={currentImageAlt}
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#A1A1AA] text-xs font-mono uppercase tracking-widest">
                  LYVEN Studio
                </div>
              )}

              {/* Fabric Specs Floating Tag */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#E7E5DD] text-xs font-mono uppercase text-[#0B0B0D] font-bold shadow-2xs">
                  <Sparkles size={12} className="text-[#C9A45C]" />
                  240 GSM French Terry
                </span>
              </div>
            </div>

            {/* Thumbnail Switchers with right padding for floating action clear */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pr-14 sm:pr-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View image ${idx + 1}: ${img.alt}`}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden bg-[#F4F3ED] border transition-all cursor-pointer shrink-0 ${
                      activeImageIdx === idx
                        ? 'border-[#C9A45C] ring-2 ring-[#C9A45C]/35 scale-105 shadow-xs'
                        : 'border-[#E7E5DD] opacity-75 hover:opacity-100 hover:border-[#C9A45C]/50'
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-contain p-1" />
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono uppercase bg-[#0B0B0D] text-white px-1 py-0.5 rounded font-bold">
                      {img.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6 bg-white p-4 sm:p-8 rounded-2xl border border-[#E7E5DD] shadow-xs">
            <div>
              <span className="text-xs font-mono text-[#C9A45C] uppercase font-bold tracking-wider">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B0B0D] leading-tight mt-1 font-sans">
                {product.name}
              </h1>
              <div className="mt-2.5 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#0B0B0D]">
                  {formatPriceINR(product.pricePaise)}
                </span>
                <span className="text-xs text-[#15803D] font-mono font-bold bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                  In Stock · Ready to Dispatch
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[#6B6E7B] leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="pt-2 border-t border-[#E7E5DD]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B0B0D] font-mono">
                  Select Size {selectedSize && <span className="text-[#C9A45C]">({selectedSize})</span>}
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
                  className="text-xs text-[#6B6E7B] hover:text-[#0B0B0D] transition-colors flex items-center gap-1 underline font-medium cursor-pointer"
                >
                  <Ruler size={13} /> Size Chart
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {availableSizes.map((v) => (
                  <button
                    key={v.size}
                    type="button"
                    disabled={!v.available}
                    onClick={() => setSelectedSize(v.size)}
                    className={`py-3 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      selectedSize === v.size
                        ? 'bg-[#0B0B0D] text-white border-[#0B0B0D] ring-2 ring-[#C9A45C]/40 shadow-xs'
                        : v.available
                        ? 'bg-white text-[#0B0B0D] border-[#E7E5DD] hover:border-[#C9A45C]'
                        : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed line-through'
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Chart Accordion */}
            {sizeGuideOpen && (
              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E7E5DD] text-xs space-y-2 animate-fadeIn font-sans">
                <div className="font-bold text-[#0B0B0D]">240 GSM Boxy Silhouette (Inches)</div>
                <div className="grid grid-cols-2 gap-2 text-[#6B6E7B] font-mono text-[11px]">
                  <span>Size S: 42&quot; Chest / 27&quot; Length</span>
                  <span>Size M: 44&quot; Chest / 28&quot; Length</span>
                  <span>Size L: 46&quot; Chest / 29&quot; Length</span>
                  <span>Size XL: 48&quot; Chest / 30&quot; Length</span>
                  <span>Size XXL: 50&quot; Chest / 31&quot; Length</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedVariant?.available}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B0B0D] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {addedToCart ? (
                  <>
                    <Check size={16} className="text-[#C9A45C]" /> Added to Shopping Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> {!selectedSize ? 'Select Size to Add' : 'Add to Shopping Bag'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!selectedSize || !selectedVariant?.available}
                className="w-full py-3.5 px-4 rounded-xl bg-[#C9A45C] hover:bg-[#b8934d] text-[#0B0B0D] text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(201,164,92,0.3)] cursor-pointer"
              >
                <Zap size={15} /> Buy Now (Instant Checkout)
              </button>

              {/* Direct WhatsApp Ordering */}
              <a
                href={`https://wa.me/916300107759?text=${encodeURIComponent(
                  `Hi LYVEN! I want to order ${product.name} (Price: ${formatPriceINR(product.pricePaise)})${
                    selectedSize ? `, Size: ${selectedSize}` : ''
                  }.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 text-center shadow-xs"
              >
                <MessageCircle size={15} className="fill-current" /> Order Directly via WhatsApp
              </a>
            </div>

            {/* Craftsmanship & Delivery Specifications */}
            <div className="pt-5 border-t border-[#E7E5DD] grid grid-cols-2 gap-3.5 text-xs text-[#6B6E7B]">
              <div className="flex items-center gap-2">
                <Truck size={15} className="text-[#0B0B0D] shrink-0" />
                <span>Pan-India Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#C9A45C] shrink-0" />
                <span>Bio-Washed Cotton</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pieces */}
      {relatedProducts.length > 0 && (
        <section className="py-14 border-t border-[#E7E5DD] mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B0B0D] mb-6 font-sans">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
