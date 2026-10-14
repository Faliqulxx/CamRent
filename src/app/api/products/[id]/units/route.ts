import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { code, status, notes } = body;

    const unit = await prisma.productUnit.create({
      data: {
        productId: id,
        code,
        status: status || 'AVAILABLE',
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, unit });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { unitId, status, notes } = body;

    const unit = await prisma.productUnit.update({
      where: { id: unitId },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, unit });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get('unitId');

    if (!unitId) {
      return NextResponse.json({ success: false, error: 'unitId required' }, { status: 400 });
    }

    await prisma.productUnit.delete({
      where: { id: unitId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
