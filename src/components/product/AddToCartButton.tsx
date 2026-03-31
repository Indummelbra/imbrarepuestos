"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { ShoppingCart } from "lucide-react";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  if (!product.is_comprable) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 text-[10px] font-black uppercase tracking-widest cursor-not-allowed bg-gray-100"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <ShoppingCart size={13} />
        Agotado
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem(product, 1)}
      className="w-full flex items-center justify-center gap-2 py-2 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
      style={{ backgroundColor: "var(--color-secondary)", fontFamily: "var(--font-display)" }}
    >
      <ShoppingCart size={13} />
      Agregar
    </button>
  );
}
