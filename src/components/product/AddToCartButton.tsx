"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { ShoppingCart } from "lucide-react";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

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
