import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseISO } from 'date-fns';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { unitId, issue, estimatedCost, startDate, expectedReadyDate } = body;

    const maintenance = await prisma.$transaction(async (tx) => {
      const m = await tx.maintenance.create({
        data: {
          unitId,
          issue,
          estimatedCost: Number(estimatedCost) || 0,
          startDate: parseISO(startDate),
          expectedReadyDate: parseISO(expectedReadyDate),
          status: 'OPEN',
        },
      });

      // Update unit status to MAINTENANCE
      await tx.productUnit.update({
        where: { id: unitId },
        data: { status: 'MAINTENANCE' },
      });

      return m;
    });

    return NextResponse.json({ success: true, maintenance });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
