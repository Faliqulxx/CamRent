import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, icon } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    // Generate clean slug
    let baseSlug = trimmedName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      baseSlug = `cat-${Date.now()}`;
    }

    // Check for unique slug
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
        slug: uniqueSlug,
        icon: icon && typeof icon === 'string' ? icon.trim() : 'tent',
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      category: newCategory,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kategori baru.' },
      { status: 500 }
    );
  }
}
