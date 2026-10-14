import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      unitAssignments, // Array of { rentalItemId, unitId, condition, notes }
      collateralReceived, // boolean
      staffName,
      remainingSettled, // boolean: staff confirms remaining balance paid at store
      settlementMethod = 'CASH', // CASH, QRIS, EDC
    } = body;

    const rental = await prisma.rental.findUnique({
      where: { id },
    });

    if (!rental) {
      return NextResponse.json({ success: false, error: 'Data rental tidak ditemukan.' }, { status: 404 });
    }

    if (!collateralReceived) {
      return NextResponse.json(
        { success: false, error: 'Pickup tidak dapat dikonfirmasi sebelum jaminan identitas asli dicatat diterima di toko.' },
        { status: 400 }
      );
    }

    // Jika rental menggunakan skema DP dan masih ada sisa pembayaran, wajib dilunasi di kasir saat pickup
    if (rental.paymentType === 'DP' && rental.remainingAmount > 0 && !remainingSettled) {
      return NextResponse.json(
        {
          success: false,
          error: `Penyewa wajib melunasi sisa tagihan sebesar Rp${rental.remainingAmount.toLocaleString('id-ID')} di kasir toko sebelum serah terima barang.`,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Assign units & update unit statuses to RENTED
      for (const assignment of unitAssignments) {
        // Delete existing assignment if any
        await tx.rentalItemUnit.deleteMany({
          where: {
            rentalItemId: assignment.rentalItemId,
            unitId: assignment.unitId,
          },
        });

        await tx.rentalItemUnit.create({
          data: {
            rentalItemId: assignment.rentalItemId,
            unitId: assignment.unitId,
          },
        });

        await tx.productUnit.update({
          where: { id: assignment.unitId },
          data: { status: 'RENTED' },
        });

        // Create checklist inspection for pickup
        await tx.checklist.create({
          data: {
            rentalId: id,
            type: 'PICKUP',
            unitId: assignment.unitId,
            condition: assignment.condition || 'GOOD',
            notes: assignment.notes || 'Pengecekan fisik saat pickup.',
            createdBy: staffName || 'Staff CampRent',
          },
        });
      }

      // 2. Update collateral to HELD
      await tx.collateral.updateMany({
        where: { rentalId: id },
        data: {
          status: 'HELD',
          receivedAt: new Date(),
        },
      });

      // 3. Catat pelunasan sisa DP jika ada
      if (rental.paymentType === 'DP' && rental.remainingAmount > 0) {
        await tx.payment.create({
          data: {
            rentalId: id,
            amount: rental.remainingAmount,
            type: 'SETTLEMENT',
            method: settlementMethod,
            status: 'VERIFIED',
            paidAt: new Date(),
          },
        });

        await tx.rental.update({
          where: { id },
          data: {
            status: 'RENTED',
            remainingAmount: 0,
            isPaidOff: true,
          },
        });
      } else {
        // 4. Update rental status to RENTED
        await tx.rental.update({
          where: { id },
          data: {
            status: 'RENTED',
            isPaidOff: true,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Pickup error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
