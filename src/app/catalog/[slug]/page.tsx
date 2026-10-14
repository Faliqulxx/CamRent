import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from '@/components/catalog/ProductDetailClient';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { calculateBlockedRange, isDateRangeOverlapping } from '@/lib/availability';


interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { position: 'asc' },
      },
      units: {
        where: { status: { not: 'INACTIVE' } },
        include: {
          rentalItemUnits: {
            include: {
              rentalItem: {
                include: {
                  rental: true,
                },
              },
            },
          },
          maintenances: {
            where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          },
        },
      },
      rentalItems: {
        include: {
          rental: true,
          assignedUnits: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Pre-calculate daily bookings for the current month
  const now = new Date();
  const daysInCurrentMonth = eachDayOfInterval({
    start: startOfMonth(now),
    end: endOfMonth(now),
  });

  const dailyBookings = daysInCurrentMonth.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    let bookedCount = 0;
    let maintenanceCount = 0;

    for (const unit of product.units) {
      // Check maintenance
      const hasMaint = unit.maintenances.some((m) =>
        isDateRangeOverlapping(day, day, m.startDate, m.expectedReadyDate)
      );
      if (hasMaint) {
        maintenanceCount++;
        continue;
      }

      // Check assigned rentals
      const isAssignedBooked = unit.rentalItemUnits.some((riu) => {
        const r = riu.rentalItem.rental;
        if (!['WAITING_PAYMENT', 'CONFIRMED', 'READY_FOR_PICKUP', 'RENTED', 'RETURNING', 'OVERDUE'].includes(r.status)) {
          return false;
        }
        const { blockStart, blockEnd } = calculateBlockedRange(r.startDate, r.endDate, product.cleaningDays);
        return isDateRangeOverlapping(day, day, blockStart, blockEnd);
      });

      if (isAssignedBooked) {
        bookedCount++;
      }
    }

    return {
      date: dateStr,
      bookedCount,
      maintenanceCount,
    };
  });

  return (
    <div className="bg-bg-light min-h-screen">
      <ProductDetailClient
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          capacity: product.capacity,
          dimension: product.dimension,
          weightKg: product.weightKg,
          pricePerDay: product.pricePerDay,
          cleaningDays: product.cleaningDays,
          includedItems: product.includedItems,
          ratingAvg: product.ratingAvg,
          ratingCount: product.ratingCount,
          category: {
            name: product.category.name,
            slug: product.category.slug,
          },
          images: product.images.map((img) => ({ url: img.url })),
          totalUnits: product.units.length,
        }}
        dailyBookings={dailyBookings}
      />
    </div>
  );
}
