import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const maintenance = await prisma.$transaction(async (tx) => {
      const m = await tx.maintenance.update({
        where: { id },
        data: { status },
      });

      // If marked DONE, restore unit status to AVAILABLE
      if (status === 'DONE') {
        await tx.productUnit.update({
          where: { id: m.unitId },
          data: { status: 'AVAILABLE', availableAfter: null, notes: null },
        });
      }

      return m;
    });

    return NextResponse.json({ success: true, maintenance });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
