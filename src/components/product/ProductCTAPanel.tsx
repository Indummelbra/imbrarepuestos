"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { ShoppingBag, Shield, Truck, Star, CheckCircle2 } from "lucide-react";

interface ProductCTAPanelProps {
  product: Product;
}

export default function ProductCTAPanel({ product }: ProductCTAPanelProps) {
  const [cantidad, setCantidad] = useState(1);
  const { addItem } = useCart();

  const hayStock =
    product.stock_status === "instock" && product.stock_quantity > 0;

  const handleAgregarAlCarrito = () => {
    addItem(product, cantidad);
  };

  const precioFormateado = parseFloat(product.price).toLocaleString("es-CO");
  const precioRegularFormateado = parseFloat(product.regular_price).toLocaleString("es-CO");

  return (
    <div className="flex flex-col gap-0 border border-gray-100 bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Bloque de precio premium */}
      <div className="px-6 py-6 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-2 mb-2">
          {product.on_sale && (
            <span className="bg-primary text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
              Oferta Especial
            </span>
          )}
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Precio Imbra Store</span>
        </div>
        
        <div className="flex items-baseline gap-3">
          <span
            className="text-4xl font-black leading-none text-secondary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ${precioFormateado}
          </span>
          {product.on_sale && (
            <span
              className="text-lg font-bold line-through text-gray-300"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ${precioRegularFormateado}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
          <CheckCircle2 size={12} />
          <span>IVA Incluido • Envío Seguro</span>
        </div>
      </div>

      {/* Selector de cantidad y Botón */}
      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <p
            className="text-[10px] font-black uppercase tracking-widest text-gray-400"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SELECCIONAR CANTIDAD
          </p>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-10">
            <button
              type="button"
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="w-10 h-full flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors text-secondary"
              aria-label="Reducir cantidad"
            >
              -
            </button>
            <span
              className="w-10 text-center font-black text-secondary text-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => setCantidad(cantidad + 1)}
              className="w-10 h-full flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors text-secondary"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        <button
          id="main-add-to-cart"
          type="button"
          onClick={handleAgregarAlCarrito}
          disabled={!hayStock}
          className={[
            "w-full py-4 flex items-center justify-center gap-3 font-black uppercase tracking-[0.15em] text-[13px] rounded-xl transition-all duration-300 shadow-xl shadow-primary/10",
            hayStock
              ? "bg-primary text-black hover:bg-secondary hover:text-white active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
          ].join(" ")}
          style={{ fontFamily: "var(--font-display)" }}
        >
          <ShoppingBag size={20} />
          {hayStock ? "AÑADIR A MI COMPRA" : "AGOTADO MOMENTÁNEAMENTE"}
        </button>

        {/* Motivador Envío */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Truck size={18} className="text-primary shrink-0" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.05em] leading-snug">
            {parseFloat(product.price) >= 50000 
              ? "Este producto cuenta con envío gratis a nivel nacional."
              : "Recibe en 24-48h. Agregue más productos para envío gratis."}
          </p>
        </div>
      </div>

      {/* Características de Confianza */}
      <div className="px-6 py-6 bg-secondary text-white">
        <ul className="space-y-4">
          {[
            { 
              icon: Shield, 
              titulo: "Garantía Original", 
              sub: "Repuestos Directos de Fábrica"
            },
            { 
              icon: Star, 
              titulo: "Asesoría Técnica", 
              sub: "Soporte experto en tu compra"
            },
          ].map(({ icon: Icono, titulo, sub }) => (
            <li key={titulo} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Icono size={14} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest">{titulo}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{sub}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
