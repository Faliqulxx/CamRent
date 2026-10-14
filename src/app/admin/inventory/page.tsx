import React from 'react';
import prisma from '@/lib/prisma';
import InventoryManager, { AdminProductItem } from '@/components/admin/InventoryManager';


export default async function AdminInventoryPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { position: 'asc' }, take: 1 },
        units: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedProducts: AdminProductItem[] = products.map((p) => {
    const totalUnits = p.units.length;
    const availableCount = p.units.filter((u) => u.status === 'AVAILABLE').length;
    const rentedCount = p.units.filter((u) => u.status === 'RENTED').length;
    const cleaningCount = p.units.filter((u) => u.status === 'CLEANING').length;
    const maintenanceCount = p.units.filter((u) => u.status === 'MAINTENANCE').length;
    const reservedCount = p.units.filter((u) => u.status === 'RESERVED').length;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryName: p.category.name,
      categoryId: p.categoryId,
      pricePerDay: p.pricePerDay,
      cleaningDays: p.cleaningDays,
      isActive: p.isActive,
      image: p.images[0]?.url || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      totalUnits,
      availableCount,
      rentedCount,
      cleaningCount,
      maintenanceCount,
      reservedCount,
      units: p.units.map((u) => ({
        id: u.id,
        code: u.code,
        status: u.status,
        notes: u.notes,
      })),
    };
  });

  return (
    <div className="space-y-6">
      <InventoryManager
        products={formattedProducts}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || 'tent',
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
