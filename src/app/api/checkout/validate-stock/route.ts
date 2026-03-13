import { NextResponse } from 'next/server';
import { checkProductStock } from '@/lib/woocommerce';

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items invalidos' }, { status: 400 });
    }

    const validationResults = await Promise.all(
      items.map(async (item: { id: number; quantity: number; name: string }) => {
        const stockInfo = await checkProductStock(item.id);
        
        return {
          id: item.id,
          name: item.name,
          requested: item.quantity,
          available: stockInfo.quantity,
          inStock: stockInfo.inStock && (stockInfo.quantity >= item.quantity || stockInfo.status === 'instock' && stockInfo.quantity === 0) 
          // Nota: WooCommerce a veces retorna quantity 0 pero status instock si no se maneja inventario
        };
      })
    );

    const hasErrors = validationResults.some(res => !res.inStock);

    if (hasErrors) {
      return NextResponse.json({
        success: false,
        message: 'Algunos productos no tienen stock suficiente',
        details: validationResults.filter(res => !res.inStock)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock validado correctamente'
    });

  } catch (error: unknown) {
    console.error('Error in validate-stock API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno validando stock';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
