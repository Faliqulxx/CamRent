import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getProductAvailability } from '@/lib/availability';
import { addDays, parseISO } from 'date-fns';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      address,
      collateralType,
      notes,
      startDate,
      endDate,
      items,
      userId,
    } = body;

    if (!fullName || !phone || !address || !collateralType || !startDate || !endDate || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Data pemesanan tidak lengkap.' }, { status: 400 });
    }

    const sDate = parseISO(startDate);
    const eDate = parseISO(endDate);

    // 1. Double-booking check: Verify availability for every product in cart
    for (const item of items) {
      const avail = await getProductAvailability(item.productId, sDate, eDate);
      if (avail.availableUnits < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Peralatan "${item.name}" saat ini hanya tersisa ${avail.availableUnits} unit untuk tanggal tersebut. Mohon kurangi jumlah sewa.`,
          },
          { status: 409 }
        );
      }
    }

    // 2. Find or create customer profile
    let customer = null;
    if (userId) {
      const profile = await prisma.profile.findUnique({
        where: { id: userId },
        include: { customer: true },
      });
      if (profile?.customer) {
        customer = profile.customer;
      }
    }

    if (!customer) {
      // Find customer by phone or create new
      customer = await prisma.customer.findFirst({
        where: { phone },
      });

      if (!customer) {
        const dummyProfileId = 'usr_guest_' + Date.now();
        await prisma.profile.create({
          data: {
            id: dummyProfileId,
            email: `${phone.replace(/\D/g, '')}@customer.camprent.com`,
            name: fullName,
            role: 'CUSTOMER',
          },
        });

        customer = await prisma.customer.create({
          data: {
            profileId: dummyProfileId,
            phone,
            address,
          },
        });
      }
    }

    // 3. Generate booking code format #CR-YYYY-NNNNN (PRD 4.1 & 6.5)
    const currentYear = new Date().getFullYear();
    const countRentalsThisYear = await prisma.rental.count();
    const nextNumber = String(countRentalsThisYear + 101).padStart(5, '0');
    const bookingCode = `#CR-${currentYear}-${nextNumber}`;

    // 4. Calculate subtotal & duration
    const days = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)));
    let subtotal = 0;

    const itemsToCreate: any[] = [];
    for (const item of items) {
      const lineSubtotal = item.pricePerDay * item.quantity * days;
      subtotal += lineSubtotal;
      itemsToCreate.push({
        productId: item.productId,
        quantity: item.quantity,
        pricePerDay: item.pricePerDay,
        days,
        subtotal: lineSubtotal,
      });
    }

    // 5. Expiration date for Waiting Payment (default 24 hours per PRD section 7)
    const expiresAt = addDays(new Date(), 1);

    // 6. Payment Type & DP Calculation (PRD & User Request)
    // DP hanya berlaku jika subtotal > 80.000 dengan nominal minimal 50% (setengah harga)
    const { paymentType = 'FULL', customDpAmount, dpAmount: bodyDpAmount, paymentMethod = 'BCA' } = body;
    let finalPaymentType = 'FULL';
    let dpAmount = 0;
    let remainingAmount = 0;

    if (paymentType === 'DP') {
      if (subtotal <= 80000) {
        return NextResponse.json(
          {
            success: false,
            error: 'Pembayaran DP (Uang Muka) hanya berlaku jika total sewa lebih dari Rp80.000.',
          },
          { status: 400 }
        );
      }

      const minDp = Math.ceil(subtotal * 0.5);
      const requestedDp =
        customDpAmount !== undefined && customDpAmount !== null
          ? Number(customDpAmount)
          : bodyDpAmount !== undefined && bodyDpAmount !== null
          ? Number(bodyDpAmount)
          : minDp;

      if (requestedDp < minDp) {
        return NextResponse.json(
          {
            success: false,
            error: `Nominal DP minimal 50% dari total sewa (Rp${minDp.toLocaleString('id-ID')}).`,
          },
          { status: 400 }
        );
      }

      if (requestedDp >= subtotal) {
        return NextResponse.json(
          {
            success: false,
            error: 'Nominal DP harus lebih kecil dari total sewa. Untuk pembayaran penuh, pilih Bayar Lunas.',
          },
          { status: 400 }
        );
      }

      finalPaymentType = 'DP';
      dpAmount = requestedDp;
      remainingAmount = subtotal - dpAmount;
    }

    const transferAmount = finalPaymentType === 'DP' ? dpAmount : subtotal;
    const finalPaymentMethod = ['DANA', 'GOPAY', 'BCA'].includes(paymentMethod) ? paymentMethod : 'BCA';

    // 7. Database transaction
    const rental = await prisma.$transaction(async (tx) => {
      const r = await tx.rental.create({
        data: {
          code: bookingCode,
          customerId: customer.id,
          startDate: sDate,
          endDate: eDate,
          status: 'WAITING_PAYMENT',
          subtotal,
          extraFees: 0,
          total: subtotal,
          paymentType: finalPaymentType,
          dpAmount,
          remainingAmount,
          isPaidOff: false,
          notes: notes || null,
          expiresAt,
          items: {
            create: itemsToCreate,
          },
          collaterals: {
            create: {
              type: collateralType,
              holderName: fullName,
              status: 'PLANNED',
            },
          },
          payments: {
            create: {
              amount: transferAmount,
              type: finalPaymentType,
              method: finalPaymentMethod,
              status: 'PENDING',
            },
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          collaterals: true,
          payments: true,
        },
      });

      return r;
    });

    return NextResponse.json({
      success: true,
      rental: {
        id: rental.id,
        code: rental.code,
        total: rental.total,
        paymentType: rental.paymentType,
        dpAmount: rental.dpAmount,
        remainingAmount: rental.remainingAmount,
        transferAmount,
        paymentMethod: finalPaymentMethod,
        startDate: rental.startDate,
        endDate: rental.endDate,
        collateralType,
        customerName: fullName,
      },
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
