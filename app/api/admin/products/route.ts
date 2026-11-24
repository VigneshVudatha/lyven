import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAuthenticatedAdmin } from '@/lib/admin/auth';
import {
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct,
  deleteProductPermanently,
  getVariantsForProduct,
} from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await getAllProductsAdmin();
    // Attach variants for full admin management view
    const productsWithVariants = await Promise.all(
      products.map(async (p) => {
        const variants = await getVariantsForProduct(p.id);
        const totalStock = variants.reduce((acc, v) => acc + (v.quantity || 0), 0);
        return {
          ...p,
          variants,
          totalStock,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: productsWithVariants,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      slug,
      description,
      pricePaise,
      price,
      compareAtPricePaise,
      fit,
      category,
      fabric,
      careInstructions,
      isPublished,
      images,
      variants,
    } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Calculate pricePaise safely
    let finalPricePaise = pricePaise;
    if (finalPricePaise === undefined && price !== undefined) {
      finalPricePaise = Math.round(parseFloat(price) * 100);
    }
    if (!finalPricePaise || isNaN(finalPricePaise) || finalPricePaise <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid price is required' },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const safeSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    // Default sizes if none provided
    const defaultSizes = ['S', 'M', 'L', 'XL', '2XL'];
    const finalVariants =
      variants && variants.length > 0
        ? variants
        : defaultSizes.map((s) => ({
            size: s,
            sku: `LYV-${safeSlug.toUpperCase()}-${s}`,
            quantity: 20,
          }));

    const newProduct = await createProduct({
      name,
      slug: safeSlug,
      description,
      pricePaise: finalPricePaise,
      compareAtPricePaise,
      fit: fit || 'Oversized Boxy Silhouette',
      category: category || 'Oversized Graphic T-Shirts',
      fabric: fabric || '240 GSM French Terry Combed Cotton',
      careInstructions,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      images: images || [],
      variants: finalVariants,
    });

    // Invalidate public storefront caches
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/search');
      if (newProduct?.slug) {
        revalidatePath(`/products/${newProduct.slug}`);
      }
    } catch (revalErr) {
      console.warn('[Cache Revalidation] Failed in POST /api/admin/products:', revalErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (err: any) {
    console.error('Failed to create product:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, isPublished, active, ...rest } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Support toggle active/published
    const publishState = isPublished !== undefined ? Boolean(isPublished) : active !== undefined ? Boolean(active) : undefined;

    let updatedPricePaise = rest.pricePaise;
    if (updatedPricePaise === undefined && rest.price !== undefined) {
      updatedPricePaise = Math.round(parseFloat(rest.price) * 100);
    }

    const updated = await updateProduct(id, {
      ...rest,
      pricePaise: updatedPricePaise,
      isPublished: publishState,
    });

    // Invalidate public storefront caches
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/search');
      if (updated?.slug) {
        revalidatePath(`/products/${updated.slug}`);
      }
      if (existing?.slug && existing.slug !== updated?.slug) {
        revalidatePath(`/products/${existing.slug}`);
      }
    } catch (revalErr) {
      console.warn('[Cache Revalidation] Failed in PATCH /api/admin/products:', revalErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (err: any) {
    console.error('Failed to update product:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    let message = 'Product archived successfully. Historical order data remains intact.';
    let permanentlyDeleted = false;
    let archived = false;

    if (permanent) {
      const res = await deleteProductPermanently(id);
      message = res.message;
      permanentlyDeleted = res.deleted;
      archived = res.archived;
    } else {
      const isArchived = await archiveProduct(id);
      if (!isArchived) {
        return NextResponse.json({ success: false, error: 'Failed to archive product' }, { status: 500 });
      }
      archived = true;
    }

    // Invalidate public storefront caches
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/search');
      if (existing?.slug) {
        revalidatePath(`/products/${existing.slug}`);
      }
    } catch (revalErr) {
      console.warn('[Cache Revalidation] Failed in DELETE /api/admin/products:', revalErr);
    }

    return NextResponse.json({
      success: true,
      message,
      permanentlyDeleted,
      archived,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process product deletion' },
      { status: 500 }
    );
  }
}
