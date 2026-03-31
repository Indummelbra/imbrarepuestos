"use client";

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, quantity);
    // Podríamos añadir un toast o notificación aquí
  };

  const isInStock = product.is_comprable === true;

  return (
    <div className="space-y-6">
      {/* Controles de Cantidad */}
      <div className="flex items-center space-x-4">
        <label className="imbra-label text-gray-500">CANTIDAD:</label>
        <div className="flex items-center border border-gray-200">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            -
          </button>
          <span className="px-6 py-2 font-mono font-bold">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleAddToCart}
          disabled={!isInStock}
          className={`flex-grow py-4 px-8 flex items-center justify-center font-bold tracking-wider transition-all
            ${isInStock 
              ? 'bg-primary text-secondary hover:bg-secondary hover:text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          <span className="material-icons mr-2">shopping_bag</span>
          AÑADIR AL CARRITO
        </button>
        
        <button className="p-4 border border-gray-200 hover:border-primary transition-colors group">
          <span className="material-icons text-gray-400 group-hover:text-primary">favorite_border</span>
        </button>
      </div>

      {!isInStock && (
        <p className="text-red-500 font-bold flex items-center">
          <span className="material-icons text-sm mr-1">info</span>
          PRODUCTO AGOTADO
        </p>
      )}
    </div>
  );
}
