import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import MyRentalsClient from '@/components/account/MyRentalsClient';
import { redirect } from 'next/navigation';


export default async function MyRentalsPage() {
  const user = await getCurrentUser();

  // If not logged in, fetch customer with customerId 'cust_01' as default demo customer
  const customerId = user?.customerId || 'cust_01';

  const rentals = await prisma.rental.findMany({
    where: {
      customerId: customerId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { position: 'asc' } },
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
      checklists: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedRentals = rentals.map((r) => ({
    id: r.id,
    code: r.code,
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
      id: i.id,
      productName: i.product.name,
      quantity: i.quantity,
      pricePerDay: i.pricePerDay,
      days: i.days,
      subtotal: i.subtotal,
      image: i.product.images[0]?.url || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      assignedUnitCodes: i.assignedUnits.map((u) => u.unit.code),
    })),
    collateral: r.collaterals[0] ? {
      type: r.collaterals[0].type,
      holderName: r.collaterals[0].holderName,
      status: r.collaterals[0].status,
    } : null,
    fees: r.fees.map((f) => ({
      id: f.id,
      type: f.type,
      amount: f.amount,
      notes: f.notes,
    })),
  }));

  return (
    <div className="bg-bg-light min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MyRentalsClient
          rentals={formattedRentals}
          userName={user?.name || 'Dimas Pratama (Customer)'}
        />
      </div>
    </div>
  );
}
