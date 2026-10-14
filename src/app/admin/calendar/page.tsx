import React from 'react';
import prisma from '@/lib/prisma';
import CalendarTimeline, { CalendarUnitData } from '@/components/admin/CalendarTimeline';


export default async function AdminCalendarPage() {
  const [units, products] = await Promise.all([
    prisma.productUnit.findMany({
      where: { status: { not: 'INACTIVE' } },
      include: {
        product: true,
        rentalItemUnits: {
          include: {
            rentalItem: {
              include: {
                rental: {
                  include: {
                    customer: {
                      include: { profile: true },
                    },
                  },
                },
              },
            },
          },
        },
        maintenances: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        },
      },
      orderBy: { code: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedUnits: CalendarUnitData[] = units.map((u) => ({
    unitId: u.id,
    code: u.code,
    productName: u.product.name,
    productId: u.productId,
    status: u.status,
    bookings: u.rentalItemUnits.map((riu) => ({
      rentalId: riu.rentalItem.rental.id,
      code: riu.rentalItem.rental.code,
      startDate: riu.rentalItem.rental.startDate.toISOString(),
      endDate: riu.rentalItem.rental.endDate.toISOString(),
      cleaningDays: u.product.cleaningDays,
      status: riu.rentalItem.rental.status,
      customerName: riu.rentalItem.rental.customer.profile.name,
    })),
    maintenances: u.maintenances.map((m) => ({
      id: m.id,
      issue: m.issue,
      startDate: m.startDate.toISOString(),
      expectedReadyDate: m.expectedReadyDate.toISOString(),
      status: m.status,
    })),
  }));

  return (
    <div className="space-y-6">
      <CalendarTimeline units={formattedUnits} products={products} />
    </div>
  );
}
