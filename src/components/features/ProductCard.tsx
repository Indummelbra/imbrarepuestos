"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawImage = product.images?.[0]?.src || (product as any).image_url || "";
  const [imgSrc, setImgSrc] = useState(rawImage || "/images/placeholder.svg");
  const price = parseFloat(product.price);

  return (
    <div className="group bg-white flex flex-col overflow-hidden border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300">

      {/* Imagen — ocupa la mayor parte de la card */}
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden bg-white" style={{ aspectRatio: "1 / 1" }}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-5 group-hover:scale-105 transition-transform duration-500"
          unoptimized
          onError={() => setImgSrc("/images/placeholder.svg")}
        />

        {/* Badge % descuento */}
        {product.on_sale && product.regular_price && parseFloat(product.regular_price) > price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2 py-1 leading-none">
            -{Math.round((1 - price / parseFloat(product.regular_price)) * 100)}% OFF
          </span>
        )}

        {/* Overlay acciones en hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="w-9 h-9 bg-white text-secondary hover:bg-primary hover:text-white rounded-full flex items-center justify-center shadow-md transition-colors">
            <span className="material-icons text-[17px]">visibility</span>
          </span>
        </div>
      </Link>

      {/* Info — compacta y pegada */}
      <div className="flex flex-col px-4 pt-3 pb-4 flex-1">
        <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
          {product.brand || "IMBRA"}
        </span>
        <h3 className="text-[11px] font-bold text-secondary uppercase italic leading-snug line-clamp-2 flex-1 mb-3 hover:text-primary transition-colors">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {product.on_sale && product.regular_price && parseFloat(product.regular_price) > price ? (
              <>
                <span className="text-[10px] text-gray-400 line-through leading-none">
                  ${parseFloat(product.regular_price).toLocaleString("es-CO")}
                </span>
                <span className="text-[15px] font-black text-red-500 leading-tight">
                  ${price.toLocaleString("es-CO")}
                </span>
              </>
            ) : (
              <span className="text-[15px] font-black text-secondary">
                ${price.toLocaleString("es-CO")}
              </span>
            )}
          </div>
          {product.is_comprable ? (
            <button
              onClick={() => addItem(product, 1)}
              title="Añadir al carrito"
              className="w-8 h-8 bg-secondary hover:bg-primary text-white flex items-center justify-center transition-colors active:scale-95"
            >
              <span className="material-icons text-[16px]">add_shopping_cart</span>
            </button>
          ) : (
            <span
              title="Agotado"
              className="w-8 h-8 bg-gray-100 text-gray-300 flex items-center justify-center cursor-not-allowed"
            >
              <span className="material-icons text-[16px]">remove_shopping_cart</span>
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
