import React from 'react';
import prisma from '@/lib/prisma';
import RentalsManager, { AdminRentalData } from '@/components/admin/RentalsManager';


interface AdminRentalsPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AdminRentalsPage({ searchParams }: AdminRentalsPageProps) {
  const { id: selectedId } = await searchParams;

  const rentals = await prisma.rental.findMany({
    include: {
      customer: {
        include: { profile: true },
      },
      items: {
        include: {
          product: {
            include: {
              units: {
                where: { status: { not: 'INACTIVE' } },
              },
            },
          },
          assignedUnits: {
            include: { unit: true },
          },
        },
      },
      collaterals: true,
      payments: true,
      fees: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedRentals: AdminRentalData[] = rentals.map((r) => ({
    id: r.id,
    code: r.code,
    customerName: r.customer.profile.name,
    customerPhone: r.customer.phone,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    status: r.status,
    subtotal: r.subtotal,
    extraFees: r.extraFees,
    total: r.total,
    paymentType: r.paymentType,
    dpAmount: r.dpAmount,
    remainingAmount: r.remainingAmount,
    isPaidOff: r.isPaidOff,
    paymentMethod: r.payments[0]?.method || 'BCA',
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    items: r.items.map((i) => ({
      rentalItemId: i.id,
      productId: i.productId,
      productName: i.product.name,
      quantity: i.quantity,
      pricePerDay: i.pricePerDay,
      days: i.days,
      cleaningDays: i.product.cleaningDays,
      assignedUnits: i.assignedUnits.map((u) => ({
        unitId: u.unit.id,
        code: u.unit.code,
      })),
      availableUnitsList: i.product.units.map((u) => ({
        id: u.id,
        code: u.code,
        status: u.status,
      })),
    })),
    collateral: r.collaterals[0]
      ? {
          type: r.collaterals[0].type,
          holderName: r.collaterals[0].holderName,
          status: r.collaterals[0].status,
        }
      : null,
    payment: r.payments[0]
      ? {
          status: r.payments[0].status,
          amount: r.payments[0].amount,
          method: r.payments[0].method,
        }
      : null,
    fees: r.fees.map((f) => ({
      type: f.type,
      amount: f.amount,
      notes: f.notes,
    })),
  }));

  return (
    <div className="space-y-6">
      <RentalsManager
        initialRentals={formattedRentals}
        selectedIdFromUrl={selectedId}
      />
    </div>
  );
}
