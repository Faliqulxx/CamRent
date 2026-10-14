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

    const rental = await prisma.rental.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, rental });
  } catch (err: any) {
    console.error('Update rental status error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
