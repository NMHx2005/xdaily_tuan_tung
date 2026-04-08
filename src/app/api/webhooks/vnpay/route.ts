import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyVnpayReturn } from '@/lib/payment/vnpay';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  const isValid = verifyVnpayReturn(query);
  const responseCode = query['vnp_ResponseCode'];
  const orderId = query['vnp_TxnRef'];
  const transactionId = query['vnp_TransactionNo'];

  if (!orderId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isValid && responseCode === '00') {
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paymentTransactionId: transactionId,
        status: 'CONFIRMED',
      },
    });

    return NextResponse.redirect(
      new URL(`/order-confirmation/${order.orderNumber}`, request.url)
    );
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { orderNumber: true },
  });

  if (order) {
    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'FAILED' },
    });
  }

  return NextResponse.redirect(
    new URL(`/checkout?error=payment_failed`, request.url)
  );
}
