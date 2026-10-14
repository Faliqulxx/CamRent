import React from 'react';
import prisma from '@/lib/prisma';
import CatalogClient from '@/components/catalog/CatalogClient';
import { getBulkProductsAvailability } from '@/lib/availability';
import { addDays, format, parseISO } from 'date-fns';


interface CatalogPageProps {
  searchParams: Promise<{
    category?: string;
    start?: string;
    end?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const tomorrow = addDays(new Date(), 1);
  const threeDays = addDays(tomorrow, 2);

  const startStr = params.start || format(tomorrow, 'yyyy-MM-dd');
  const endStr = params.end || format(threeDays, 'yyyy-MM-dd');

  const startDate = parseISO(startStr);
  const endDate = parseISO(endStr);

  // Fetch categories with product counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  // Fetch all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      images: {
        orderBy: { position: 'asc' },
      },
      units: {
        where: { status: { not: 'INACTIVE' } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Bulk check availability for all products on requested dates
  const productIds = products.map((p) => p.id);
  const availMap = await getBulkProductsAvailability(productIds, startDate, endDate);

  const formattedProducts = products.map((p) => {
    const avail = availMap[p.id] || { totalUnits: p.units.length, availableUnits: p.units.length, isAvailable: true };
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      capacity: p.capacity,
      dimension: p.dimension,
      weightKg: p.weightKg,
      pricePerDay: p.pricePerDay,
      cleaningDays: p.cleaningDays,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
      category: {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
      },
      images: p.images.map((img) => ({ url: img.url })),
      totalUnits: avail.totalUnits,
      availableUnits: avail.availableUnits,
    };
  });

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c._count.products,
  }));

  return (
    <div className="bg-bg-light min-h-screen">
      <CatalogClient
        initialProducts={formattedProducts}
        categories={formattedCategories}
        initialCategory={params.category}
        initialStart={startStr}
        initialEnd={endStr}
      />
    </div>
  );
}
