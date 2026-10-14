import React from 'react';
import prisma from '@/lib/prisma';
import PaymentsManager, { PaymentItem } from '@/components/admin/PaymentsManager';


export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      rental: {
        include: {
          customer: {
            include: { profile: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedPayments: PaymentItem[] = payments.map((p) => ({
    id: p.id,
    rentalId: p.rentalId,
    rentalCode: p.rental.code,
    customerName: p.rental.customer.profile.name,
    amount: p.amount,
    method: p.method,
    type: p.type || 'FULL',
    paymentType: p.rental.paymentType,
    remainingAmount: p.rental.remainingAmount,
    status: p.status,
    proofUrl: p.proofUrl,
    paidAt: p.paidAt?.toISOString() || null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PaymentsManager initialPayments={formattedPayments} />
    </div>
  );
}
