"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useEffect } from "react";

export function CartSidebar() {
  const { items, sidebarOpen, closeSidebar, removeItem, updateQuantity, totalPrice, totalItems, isFreeShipping, remainingForFreeShipping, freeShippingThreshold } = useCart();

  /* Bloquear scroll del body cuando está abierto */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  /* Cerrar con ESC */
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") closeSidebar(); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [closeSidebar]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

  const shippingProgress = Math.min((totalPrice / freeShippingThreshold) * 100, 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-[90vw] max-w-[400px] z-[100] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary" />
            <span className="font-black text-secondary uppercase tracking-widest text-[13px]">
              Carrito
            </span>
            {totalItems > 0 && (
              <span className="bg-primary text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeSidebar}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Progreso Envío */}
        {items.length > 0 && (
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 shrink-0">
            {isFreeShipping ? (
              <p className="text-green-600 font-bold text-[12px] text-center mb-2.5">
                ¡Felicidades! Tienes <span className="font-black uppercase tracking-wide">Envío Gratis</span> 🎉
              </p>
            ) : (
              <p className="text-secondary font-bold text-[12px] text-center mb-2.5">
                Te faltan <span className="text-primary font-black">{fmt(remainingForFreeShipping)}</span> para tener <span className="font-black uppercase tracking-wide">Envío Gratis</span>
              </p>
            )}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ease-out ${isFreeShipping ? 'bg-green-500' : 'bg-primary'}`} 
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingCart size={48} className="text-gray-200 mb-4" />
              <p className="text-secondary font-bold text-[15px]">Tu carrito está vacío</p>
              <p className="text-gray-400 text-[13px] mt-1">Agrega productos para continuar</p>
              <button
                onClick={closeSidebar}
                className="mt-6 px-6 py-2.5 bg-secondary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(({ product, quantity }) => {
                const price = parseFloat(product.price);
                return (
                  <li key={product.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                    {/* Imagen */}
                    <div className="w-16 h-16 bg-gray-50 shrink-0 flex items-center justify-center">
                      {(product.images?.[0]?.src || (product as any).image_url) ? (
                        <img src={product.images?.[0]?.src || (product as any).image_url} alt={product.name} className="w-14 h-14 object-contain" />
                      ) : (
                        <ShoppingCart size={20} className="text-gray-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-secondary leading-tight line-clamp-2 mb-1">
                        {product.name}
                      </p>
                      {product.sku && (
                        <p className="text-[10px] text-gray-400 mb-2">SKU: {product.sku}</p>
                      )}
                      <p className="text-[14px] font-black text-primary">{fmt(price * quantity)}</p>

                      {/* Cantidad */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-[12px] font-bold text-secondary w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="shrink-0 text-gray-300 hover:text-red-400 transition-colors self-start mt-0.5"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — solo si hay items */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-gray-100 px-6 py-5 bg-white">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
              <span className="text-[18px] font-black text-secondary">{fmt(totalPrice)}</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-4">Envío e impuestos calculados al finalizar la compra.</p>

            {/* Botón ver carrito */}
            <Link
              href="/cart"
              onClick={closeSidebar}
              className="flex items-center justify-center gap-2 w-full bg-secondary text-white text-[11px] font-black uppercase tracking-widest py-3.5 hover:bg-primary transition-colors mb-2"
            >
              <ShoppingCart size={14} /> Ver carrito
            </Link>
            <button
              onClick={closeSidebar}
              className="w-full text-[11px] font-bold text-gray-400 hover:text-secondary transition-colors py-2 uppercase tracking-widest"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
