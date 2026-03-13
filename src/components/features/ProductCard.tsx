"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  const mainImage = product.images?.[0]?.src || "/images/placeholder.png";

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <div className="w-full h-full flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-500 relative">
            <Image 
              src={mainImage} 
              alt={product.name} 
              fill
              className="object-contain p-4"
              unoptimized={mainImage.includes('.svg')}
            />
          </div>
        </Link>
        
        {/* Quick Actions Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent flex justify-center space-x-2">
          <button className="bg-white hover:bg-primary hover:text-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors">
            <span className="material-icons text-xl">favorite_border</span>
          </button>
          <Link href={`/product/${product.slug}`} className="bg-white hover:bg-primary hover:text-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors">
            <span className="material-icons text-xl">visibility</span>
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col items-center text-center">
        <span className="imbra-label !text-primary mb-1">
          {product.brand || "IMBRA"}
        </span>
        <h3 className="imbra-h3 !text-sm mb-2 h-10 line-clamp-2 leading-snug hover:text-primary transition-colors uppercase italic">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="flex items-center space-x-2 mb-4">
          <span className="imbra-price text-lg">
            ${parseFloat(product.price).toLocaleString('es-CO')}
          </span>
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="w-full bg-secondary hover:bg-primary text-white imbra-label !text-white py-2.5 flex items-center justify-center transition-all cursor-pointer transform active:scale-95 uppercase"
        >
          <span className="material-icons text-sm mr-2">shopping_cart</span>
          AÑADIR AL CARRITO
        </button>
      </div>
    </div>
  );
}
