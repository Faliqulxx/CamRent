import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addDays } from 'date-fns';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      unitReturns, // Array of { unitId, condition, notes, cleaningDays }
      fees, // Array of { type: 'CLEANING' | 'DAMAGE' | 'LATE', amount: number, notes: string }
      collateralReturned, // boolean
      staffName,
    } = body;

    if (!collateralReturned) {
      return NextResponse.json(
        { success: false, error: 'Rental tidak dapat diselesaikan sebelum jaminan identitas ditandai dikembalikan ke customer.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Process each unit returned condition & post-return status (PRD 6.11)
      for (const ur of unitReturns) {
        const isDamaged = ur.condition === 'DAMAGED';
        const cleanDays = ur.cleaningDays || 1;
        const availableAfter = addDays(new Date(), cleanDays);

        if (isDamaged) {
          // Damaged -> Maintenance
          await tx.productUnit.update({
            where: { id: ur.unitId },
            data: {
              status: 'MAINTENANCE',
              notes: `Kerusakan saat return: ${ur.notes || 'Perlu perbaikan'}`,
            },
          });

          // Create maintenance record
          await tx.maintenance.create({
            data: {
              unitId: ur.unitId,
              issue: ur.notes || 'Kerusakan fisik saat pengembalian rental',
              estimatedCost: 50000,
              startDate: new Date(),
              expectedReadyDate: addDays(new Date(), 3),
              status: 'OPEN',
            },
          });
        } else {
          // Good / Dirty / Minor Damage -> Cleaning
          await tx.productUnit.update({
            where: { id: ur.unitId },
            data: {
              status: cleanDays > 0 ? 'CLEANING' : 'AVAILABLE',
              availableAfter: cleanDays > 0 ? availableAfter : null,
              notes: ur.notes || null,
            },
          });
        }

        // Checklist record for Return
        await tx.checklist.create({
          data: {
            rentalId: id,
            type: 'RETURN',
            unitId: ur.unitId,
            condition: ur.condition,
            notes: ur.notes || 'Pengecekan fisik saat pengembalian.',
            createdBy: staffName || 'Staff CampRent',
          },
        });
      }

      // 2. Add extra fees if any
      let totalExtraFees = 0;
      if (fees && fees.length > 0) {
        for (const f of fees) {
          if (f.amount > 0) {
            totalExtraFees += f.amount;
            await tx.fee.create({
              data: {
                rentalId: id,
                type: f.type,
                amount: f.amount,
                notes: f.notes || null,
              },
            });
          }
        }
      }

      // 3. Mark collateral returned
      await tx.collateral.updateMany({
        where: { rentalId: id },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
        },
      });

      // 4. Update rental to COMPLETED and update total with fees
      const currentRental = await tx.rental.findUnique({ where: { id } });
      const newTotal = (currentRental?.subtotal || 0) + totalExtraFees;

      await tx.rental.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          extraFees: totalExtraFees,
          total: newTotal,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Return error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
