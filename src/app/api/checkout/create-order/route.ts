import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createOrder } from '@/lib/woocommerce';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      billing, 
      shipping, 
      line_items, 
      shipping_lines,
      payment_method, 
      payment_method_title,
      customer_note,
      meta_data 
    } = body;

    // Estructura para WooCommerce
    const orderData = {
      status: 'pending',
      billing,
      shipping: shipping || billing,
      line_items,
      shipping_lines,
      payment_method,
      payment_method_title,
      customer_note,
      set_paid: false,
      meta_data: [
        ...(meta_data || []),
        {
          key: '_created_via',
          value: 'Imbra Headless Store'
        }
      ]
    };

    const order = await createOrder(orderData);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderKey: order.order_key,
      total: order.total
    });

  } catch (error: unknown) {
    console.error('Error creating order in WooCommerce:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al crear el pedido en WooCommerce';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
