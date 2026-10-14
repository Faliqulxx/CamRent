import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { StorageService } from '@/lib/storage';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        units: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      categoryId,
      description,
      capacity,
      dimension,
      weightKg,
      pricePerDay,
      cleaningDays,
      includedItems, // string[]
      images, // base64 strings or URLs
      initialUnitCount,
      unitPrefix,
    } = body;

    if (!name || !categoryId || !pricePerDay) {
      return NextResponse.json({ success: false, error: 'Data produk belum lengkap.' }, { status: 400 });
    }

    // Slug generator
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name,
          slug,
          categoryId,
          description: description || '',
          capacity: capacity ? Number(capacity) : null,
          dimension: dimension || '',
          weightKg: weightKg ? Number(weightKg) : null,
          pricePerDay: Number(pricePerDay),
          cleaningDays: cleaningDays ? Number(cleaningDays) : 1,
          includedItems: JSON.stringify(includedItems || []),
          ratingAvg: 5.0,
          ratingCount: 1,
        },
      });

      // Images (PRD 4.2: 1-6 gambar)
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await tx.productImage.create({
            data: {
              productId: p.id,
              url: images[i],
              position: i,
            },
          });
        }
      }

      // Initial physical units creation
      const count = Number(initialUnitCount) || 3;
      const prefix = unitPrefix || name.substring(0, 3).toUpperCase();
      for (let u = 1; u <= count; u++) {
        const code = `${prefix}-${String(u).padStart(3, '0')}`;
        await tx.productUnit.create({
          data: {
            productId: p.id,
            code,
            status: 'AVAILABLE',
          },
        });
      }

      return p;
    });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error('Create product error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
