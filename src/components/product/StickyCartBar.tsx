"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { ShoppingBag } from "lucide-react";

interface StickyCartBarProps {
  product: Product;
}

export default function StickyCartBar({ product }: StickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { addItem } = useCart();

  const hayStock = product.is_comprable === true;
  const precioFormateado = parseFloat(product.price).toLocaleString("es-CO");

  useEffect(() => {
    const handleScroll = () => {
      // 20% pero de la ventana visible (viewport height) para que sea "muy mínimo" como pidió el usuario.
      const targetScroll = window.innerHeight * 0.2;
      
      if (window.scrollY > targetScroll) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleAgregarAlCarrito = () => {
    addItem(product, 1);
  };

  const imageSrc = product.images?.[0]?.src || "/placeholder-product.png";

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-secondary border-t border-gray-800 z-50 transform transition-transform duration-300 ease-in-out shadow-[0_-10px_40px_rgba(0,0,0,0.2)] ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="imbra-content-container">
        <div className="flex items-center justify-between py-3 h-[70px] lg:h-[80px]">
          {/* Lado Izquierdo: Info de Producto */}
          <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-md shrink-0 border border-gray-700 overflow-hidden relative hidden sm:block">
              <Image 
                src={imageSrc} 
                alt={product.name} 
                fill 
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 
                className="text-white text-[10px] lg:text-sm font-black uppercase tracking-widest truncate max-w-full flex items-center gap-2 mb-0.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="truncate">{product.name}</span>
                {parseFloat(product.price) >= 50000 && (
                  <span className="hidden sm:inline-flex bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm tracking-widest shrink-0">
                    ENVÍO GRATIS
                  </span>
                )}
              </h4>
              <p 
                className="text-lg sm:text-3xl lg:text-5xl font-black leading-none flex items-baseline gap-1"
                style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                <span className="text-[10px] sm:text-sm font-bold text-gray-400 mr-0.5">$</span>
                {precioFormateado}
              </p>
            </div>
          </div>

          {/* Lado Derecho: Botón Añadir */}
          <div className="shrink-0 pl-3 sm:pl-4 border-l border-gray-700/50 h-full flex items-center">
            <button
              onClick={handleAgregarAlCarrito}
              disabled={!hayStock}
              className={[
                "px-4 sm:px-10 py-3 lg:py-3.5 h-[44px] sm:h-full lg:h-auto flex items-center justify-center gap-2 font-black uppercase tracking-wider text-[11px] sm:text-[14px] transition-all duration-300 rounded-sm whitespace-nowrap",
                hayStock
                  ? "bg-primary text-black hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] shadow-[0px_0px_15px_rgba(241,135,0,0.3)] active:scale-[0.98]"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed",
              ].join(" ")}
              style={{ fontFamily: "var(--font-display)" }}
            >
              <ShoppingBag size={16} className="hidden xs:block sm:block" />
              <span>{hayStock ? (window.innerWidth < 400 ? "AGREGAR" : "AÑADIR AL CARRITO") : "AGOTADO"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
