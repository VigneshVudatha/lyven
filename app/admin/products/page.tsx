'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ExternalLink,
  Layers,
  Eye,
  RefreshCw,
  Plus,
  Edit2,
  Archive,
  CheckCircle,
  AlertCircle,
  X,
  UploadCloud,
  Check,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';

interface ProductWithMeta extends Product {
  variants?: ProductVariant[];
  totalStock?: number;
}

interface ProductFormImage {
  url: string;
  altText: string;
  imageType: string;
  isPrimary: boolean;
  displayOrder: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithMeta[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalProduct, setDeleteModalProduct] = useState<ProductWithMeta | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');

  // Form states
  const [editingProduct, setEditingProduct] = useState<ProductWithMeta | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    price: string;
    category: string;
    fit: string;
    fabric: string;
    careInstructions: string;
    isPublished: boolean;
    images: ProductFormImage[];
    sizes: Record<string, number>;
  }>({
    name: '',
    slug: '',
    description: '',
    price: '400',
    category: 'Oversized Graphic T-Shirts',
    fit: 'Oversized Boxy Silhouette',
    fabric: '240 GSM French Terry Combed Cotton',
    careInstructions: 'Machine wash cold with like colors inside out. Do not iron directly on graphic print.',
    isPublished: true,
    images: [],
    sizes: {
      S: 20,
      M: 20,
      L: 20,
      XL: 20,
      '2XL': 20,
    },
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to load products' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Network error loading products' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTogglePublish = async (product: ProductWithMeta) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          isPublished: !product.active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          type: 'success',
          text: `Product "${product.name}" is now ${!product.active ? 'Published' : 'Unpublished'}.`,
        });
        fetchProducts();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to toggle status' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error toggling publish state' });
    }
  };

  // Multiple Image Upload Handler
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        fd.append('files', fileList[i]);
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (data.success && data.data?.files) {
        const newImgs: ProductFormImage[] = data.data.files.map((f: any, idx: number) => ({
          url: f.url,
          altText: formData.name || 'LYVEN Apparel',
          imageType: 'front',
          isPrimary: formData.images.length === 0 && idx === 0,
          displayOrder: formData.images.length + idx,
        }));

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImgs],
        }));

        setStatusMsg({
          type: 'success',
          text: `Successfully uploaded ${data.data.files.length} image(s) to Supabase Storage!`,
        });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Image upload failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Error uploading images to storage' });
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!manualImageUrl.trim()) return;
    const url = manualImageUrl.trim();
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url,
          altText: prev.name || 'Product Image',
          imageType: 'front',
          isPrimary: prev.images.length === 0,
          displayOrder: prev.images.length,
        },
      ],
    }));
    setManualImageUrl('');
  };

  const handleSetPrimary = (index: number) => {
    setFormData((prev) => {
      const updated = prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      // Put primary at index 0 for natural display priority
      const primaryImg = updated[index];
      const rest = updated.filter((_, i) => i !== index);
      const reordered = [primaryImg, ...rest].map((img, i) => ({ ...img, displayOrder: i }));
      return { ...prev, images: reordered };
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const filtered = prev.images.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return {
        ...prev,
        images: filtered.map((img, idx) => ({ ...img, displayOrder: idx })),
      };
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setFormData((prev) => {
      const targetIdx = direction === 'left' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.images.length) return prev;
      const copy = [...prev.images];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return {
        ...prev,
        images: copy.map((img, idx) => ({ ...img, displayOrder: idx })),
      };
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      const variantList = Object.entries(formData.sizes).map(([size, quantity]) => ({
        size,
        sku: `LYV-${(formData.slug || formData.name).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${size}`,
        quantity: Number(quantity) || 0,
      }));

      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        price: formData.price,
        fit: formData.fit,
        category: formData.category,
        fabric: formData.fabric,
        careInstructions: formData.careInstructions,
        isPublished: formData.isPublished,
        images: formData.images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || formData.name,
          imageType: img.imageType || 'front',
          displayOrder: idx,
          isPrimary: img.isPrimary,
        })),
        variants: variantList,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Product "${formData.name}" created successfully!` });
        setIsCreateModalOpen(false);
        // Reset form
        setFormData({
          name: '',
          slug: '',
          description: '',
          price: '400',
          category: 'Oversized Graphic T-Shirts',
          fit: 'Oversized Boxy Silhouette',
          fabric: '240 GSM French Terry Combed Cotton',
          careInstructions: 'Machine wash cold with like colors inside out. Do not iron directly on graphic print.',
          isPublished: true,
          images: [],
          sizes: { S: 20, M: 20, L: 20, XL: 20, '2XL': 20 },
        });
        fetchProducts();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to create product' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error creating product' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (p: ProductWithMeta) => {
    setEditingProduct(p);
    const existingImgs: ProductFormImage[] = (p.images || []).map((img, idx) => ({
      url: img.url,
      altText: img.alt || p.name,
      imageType: img.type || 'front',
      isPrimary: Boolean(img.isPrimary) || idx === 0,
      displayOrder: img.order !== undefined ? img.order : idx,
    }));

    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: (p.pricePaise / 100).toString(),
      category: p.category || 'Oversized Graphic T-Shirts',
      fit: p.fit || 'Oversized Boxy Silhouette',
      fabric: '240 GSM French Terry Combed Cotton',
      careInstructions: p.careInstructions || '',
      isPublished: p.active,
      images: existingImgs,
      sizes: { S: 20, M: 20, L: 20, XL: 20, '2XL': 20 },
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);
    setStatusMsg(null);

    try {
      const payload: any = {
        id: editingProduct.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: formData.price,
        fit: formData.fit,
        category: formData.category,
        careInstructions: formData.careInstructions,
        isPublished: formData.isPublished,
        images: formData.images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || formData.name,
          imageType: img.imageType || 'front',
          displayOrder: idx,
          isPrimary: img.isPrimary,
        })),
      };

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Product "${formData.name}" updated successfully!` });
        setIsEditModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to update product' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error updating product' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrArchiveProduct = async (product: ProductWithMeta, permanent: boolean) => {
    try {
      setDeletingProduct(true);
      const res = await fetch(`/api/admin/products?id=${product.id}&permanent=${permanent}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        setDeleteModalProduct(null);
        await fetchProducts();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete/archive product' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Delete operation error' });
    } finally {
      setDeletingProduct(false);
    }
  };

  // Reusable Images Section UI for Modals
  const renderImageManager = () => (
    <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="block text-[11px] font-mono uppercase tracking-wider text-[#C9A45C]">
          Product Image Gallery ({formData.images.length} {formData.images.length === 1 ? 'image' : 'images'})
        </span>
        <span className="text-[10px] font-mono text-neutral-400">
          The first image (or starred) serves as the primary storefront cover.
        </span>
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono uppercase tracking-wider rounded-xl border border-neutral-700 transition-colors">
          <UploadCloud className="w-4 h-4 text-[#C9A45C]" />
          {uploadingImage ? 'Uploading Files...' : 'Upload Image Files (Multi)'}
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp, image/avif"
            onChange={handleMultipleImageUpload}
            disabled={uploadingImage}
            className="hidden"
          />
        </label>

        <span className="text-xs text-neutral-500 font-mono">or paste URL:</span>

        <div className="flex-1 flex items-center gap-1.5 w-full">
          <input
            type="text"
            value={manualImageUrl}
            onChange={(e) => setManualImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddImageUrl();
              }
            }}
            placeholder="https://... or /image.png"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#C9A45C]"
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-mono uppercase tracking-wider"
          >
            Add
          </button>
        </div>
      </div>

      {/* Image Gallery Grid */}
      {formData.images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {formData.images.map((img, idx) => (
            <div
              key={`${img.url}-${idx}`}
              className={`relative rounded-xl overflow-hidden bg-neutral-900 border transition-all ${
                img.isPrimary
                  ? 'border-[#C9A45C] ring-2 ring-[#C9A45C]/30 shadow-md'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Image Preview */}
              <div className="w-full aspect-[4/5] relative bg-black flex items-center justify-center">
                <Image
                  src={img.url}
                  alt={img.altText || `Product Image ${idx + 1}`}
                  fill
                  className="object-contain p-1"
                  unoptimized={img.url.startsWith('data:') || img.url.startsWith('/')}
                />

                {/* Primary Badge */}
                {img.isPrimary && (
                  <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#C9A45C] text-black text-[9px] font-mono font-bold tracking-wider uppercase">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    Cover
                  </span>
                )}

                {/* Position Index */}
                <span className="absolute bottom-1.5 right-1.5 z-10 px-1 py-0.5 rounded bg-black/80 text-neutral-400 text-[9px] font-mono">
                  #{idx + 1}
                </span>
              </div>

              {/* Action Bar */}
              <div className="p-1.5 bg-neutral-950 flex items-center justify-between gap-1 border-t border-neutral-800">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveImage(idx, 'left')}
                    disabled={idx === 0}
                    className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 rounded hover:bg-neutral-800"
                    title="Move earlier"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveImage(idx, 'right')}
                    disabled={idx === formData.images.length - 1}
                    className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 rounded hover:bg-neutral-800"
                    title="Move later"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className="text-[9px] font-mono uppercase text-[#C9A45C] hover:underline"
                  >
                    Set Cover
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40"
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs font-mono">
          No images uploaded yet. Select files or paste URLs above.
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Notifications */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-mono uppercase tracking-wider ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
              : 'bg-red-950/60 border border-red-800 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C]">
            Inventory & Catalogue
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF8F3]">
            Product Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage LYVEN drops, multi-image galleries, cover selections, and safe product archiving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A45C] text-black font-semibold rounded-xl text-xs uppercase tracking-wider hover:bg-[#b8924b] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {products.map((product) => {
          // Primary cover image is always first in the sorted array
          const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
          const imageCount = product.images?.length || 0;
          const totalStock = product.totalStock ?? product.variants?.reduce((acc, v) => acc + v.quantity, 0) ?? 0;

          return (
            <div
              key={product.id}
              className={`bg-neutral-900/60 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
                product.active ? 'border-neutral-800' : 'border-neutral-800/40 opacity-70'
              }`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail / Gallery Indicator */}
                  <div className="w-20 h-24 rounded-lg bg-neutral-950 border border-neutral-800 relative overflow-hidden shrink-0">
                    {primaryImg ? (
                      <Image
                        src={primaryImg}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                        unoptimized={primaryImg.startsWith('data:') || primaryImg.startsWith('/')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600 font-mono">
                        NO IMAGE
                      </div>
                    )}
                    {imageCount > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/85 text-[9px] font-mono px-1 rounded text-white border border-neutral-700">
                        {imageCount} imgs
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A45C]">
                        {product.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                          product.active
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        {product.active ? 'Live' : 'Draft / Hidden'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white mt-1 truncate">{product.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="mt-2 font-mono text-white font-bold text-sm">
                      {formatINR(product.pricePaise)}
                    </div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-neutral-500 block">Silhouette</span>
                    <span className="font-semibold text-neutral-200 truncate block">{product.fit}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-neutral-500 block">Total Stock</span>
                    <span className="font-semibold text-neutral-200 font-mono">{totalStock} units</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-neutral-500 block">Slug</span>
                    <span className="font-semibold text-neutral-400 font-mono truncate block">/{product.slug}</span>
                  </div>
                </div>

                {/* Available Sizes Matrix */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Live Size Availability
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <div
                          key={v.id}
                          className="px-2 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-xs font-mono flex items-center gap-1.5"
                        >
                          <span className="font-bold text-white">{v.size}</span>
                          <span
                            className={
                              v.quantity > 5
                                ? 'text-emerald-400'
                                : v.quantity > 0
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }
                          >
                            {v.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions footer */}
              <div className="p-4 bg-neutral-950/40 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white uppercase tracking-wider font-mono transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <Link
                    href="/admin/inventory"
                    className="inline-flex items-center gap-1.5 text-xs text-[#C9A45C] uppercase tracking-wider font-mono hover:underline"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Stock
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(product)}
                    className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    {product.active ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-1.5 text-neutral-300 hover:text-white rounded-lg bg-neutral-800 hover:bg-neutral-700"
                    title="Edit Product"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteModalProduct(product)}
                    className="p-1.5 text-red-400 hover:text-red-300 rounded-lg bg-neutral-800 hover:bg-red-950/50"
                    title="Delete / Archive Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0B0D] border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Create New Product Drop</h3>
                <p className="text-xs text-neutral-400">Add a new streetwear silhouette with multi-angle imagery.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. LYVEN SAMURAI Oversized T-Shirt"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Slug (Auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. lyven-samurai-oversized-tee"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Retail Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="400"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Silhouette / Fit
                  </label>
                  <input
                    type="text"
                    value={formData.fit}
                    onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Heavyweight French Terry cotton tee engineered for high-density drape and streetwear aesthetic..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              {/* Multi-Image Upload Section */}
              {renderImageManager()}

              {/* Variant Stock Initial Quantities */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Initial Variant Quantities (Units in Stock)
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {(['S', 'M', 'L', 'XL', '2XL'] as const).map((sz) => (
                    <div key={sz}>
                      <label className="block text-center text-xs font-bold text-neutral-300 mb-1">
                        {sz}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sizes[sz]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sizes: { ...formData.sizes, [sz]: parseInt(e.target.value, 10) || 0 },
                          })
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-center text-xs font-mono text-white focus:outline-none focus:border-[#C9A45C]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#C9A45C] text-black font-semibold rounded-xl text-xs uppercase tracking-wider hover:bg-[#b8924b] disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Product Drop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0B0D] border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Product</h3>
                <p className="text-xs text-neutral-400">Modify details, reorder images, or set a new cover for {editingProduct.name}.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formData.isPublished ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'true' })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A45C]"
                  >
                    <option value="true">Published (Storefront Visible)</option>
                    <option value="false">Hidden / Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              {/* Multi-Image Upload Section for Edit */}
              {renderImageManager()}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#C9A45C] text-black font-semibold rounded-xl text-xs uppercase tracking-wider hover:bg-[#b8924b] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE DELETE / ARCHIVE CONFIRMATION MODAL */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0B0D] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Manage Product: {deleteModalProduct.name}</h3>
                <span className="text-[10px] font-mono uppercase text-neutral-400">
                  Slug: /{deleteModalProduct.slug}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2">
              <p className="font-semibold text-white">Choose Deletion or Archiving:</p>
              <ul className="space-y-1.5 list-disc list-inside text-neutral-400">
                <li>
                  <strong className="text-neutral-200">Archive (Recommended):</strong> Hides the product from the storefront while keeping all historical customer orders and revenue reports 100% intact.
                </li>
                <li>
                  <strong className="text-neutral-200">Permanent Delete (Test Data):</strong> Only permitted if this product has <span className="underline font-bold text-white">zero</span> customer orders. If linked to any orders, it will automatically default to safe archiving to preserve order integrity.
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalProduct(null)}
                disabled={deletingProduct}
                className="w-full sm:w-auto px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteOrArchiveProduct(deleteModalProduct, false)}
                disabled={deletingProduct}
                className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono uppercase tracking-wider"
              >
                {deletingProduct ? 'Archiving...' : 'Archive Product (Safe)'}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteOrArchiveProduct(deleteModalProduct, true)}
                disabled={deletingProduct}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs font-mono uppercase tracking-wider"
              >
                {deletingProduct ? 'Processing...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
