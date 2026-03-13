"use client";

import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow pt-[200px]">
        {/* Banner de Página */}
        <section className="bg-secondary py-12">
          <div className="imbra-content-container">
            <h1 className="text-4xl lg:text-5xl font-Archivo font-black text-white italic tracking-tighter uppercase">
              TU CARRITO <span className="text-primary">[{totalItems}]</span>
            </h1>
            <nav className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-gray-400 mt-4 uppercase">
              <Link href="/" className="hover:text-primary transition-colors">INICIO</Link>
              <span className="material-icons text-xs">chevron_right</span>
              <span className="text-white">CARRITO DE COMPRAS</span>
            </nav>
          </div>
        </section>

        <section className="py-20">
          <div className="imbra-content-container">
            {items.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200">
                <span className="material-icons text-6xl text-gray-300 mb-4">shopping_cart</span>
                <h2 className="text-2xl font-Archivo font-black text-secondary mb-4 uppercase">TU CARRITO ESTÁ VACÍO</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Parece que aún no has añadido nada. Explora nuestros repuestos industriales de alto impacto.</p>
                <Link 
                  href="/" 
                  className="bg-primary text-secondary px-8 py-4 font-Archivo font-black tracking-widest text-sm hover:bg-secondary hover:text-white transition-all inline-block"
                >
                  VOLVER A LA TIENDA
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Listado de Productos */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    <div className="col-span-6">PRODUCTO</div>
                    <div className="col-span-2 text-center">PRECIO</div>
                    <div className="col-span-2 text-center">CANTIDAD</div>
                    <div className="col-span-2 text-right">SUBTOTAL</div>
                  </div>

                  {items.map((item) => (
                    <div key={item.product.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-6 border-b border-gray-100 group">
                      {/* Info Mini */}
                      <div className="lg:col-span-6 flex items-center space-x-4">
                        <div className="relative w-24 aspect-square bg-gray-50 border border-gray-100 p-2 overflow-hidden">
                          <Image 
                            src={item.product.images[0]?.src || "/placeholder.png"} 
                            alt={item.product.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-Archivo font-black text-secondary hover:text-primary transition-colors uppercase leading-tight mb-1">
                            <Link href={`/product/${item.product.slug}`}>{item.product.name}</Link>
                          </h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU: {item.product.sku}</p>
                          <button 
                            onClick={() => removeItem(item.product.id)}
                            className="mt-2 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase flex items-center"
                          >
                            <span className="material-icons text-sm mr-1">delete_outline</span> ELIMINAR
                          </button>
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="lg:col-span-2 text-center font-Archivo font-bold text-secondary">
                        <span className="lg:hidden text-[10px] block text-gray-400 mb-1">PRECIO UNIDAD</span>
                        ${parseFloat(item.product.price).toLocaleString('es-CO')}
                      </div>

                      {/* Cantidad */}
                      <div className="lg:col-span-2 flex justify-center">
                        <div className="flex items-center border border-gray-200">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-sm font-bold min-w-[40px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal Item */}
                      <div className="lg:col-span-2 text-right font-Archivo font-black text-secondary text-lg">
                        <span className="lg:hidden text-[10px] block text-gray-400 mb-1 leading-none">SUBTOTAL</span>
                        ${(parseFloat(item.product.price) * item.quantity).toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}

                  <div className="pt-8">
                    <Link 
                      href="/" 
                      className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase flex items-center"
                    >
                      <span className="material-icons text-sm mr-2">arrow_back</span>
                      CONTINUAR COMPRANDO
                    </Link>
                  </div>
                </div>

                {/* Resumen de Compra */}
                <div className="lg:col-span-4">
                  <div className="bg-gray-50 p-8 border border-gray-200 sticky top-[220px]">
                    <h2 className="font-Archivo font-black text-secondary mb-8 tracking-widest text-lg uppercase">RESUMEN DE COMPRA</h2>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-400 uppercase">PRODUCTOS ({totalItems})</span>
                        <span className="font-bold text-secondary">${totalPrice.toLocaleString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-400 uppercase">ENVÍO</span>
                        <span className="text-green-600 font-bold uppercase italic">POR CALCULAR</span>
                      </div>
                      <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                        <span className="font-Archivo font-black text-secondary uppercase">TOTAL ESTIMADO</span>
                        <span className="text-2xl font-Archivo font-black text-primary">
                          ${totalPrice.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Los impuestos se calculan en el checkout final.</p>
                    </div>

                    <Link 
                      href="/checkout"
                      className="bg-primary text-secondary w-full py-5 flex items-center justify-center font-Archivo font-black tracking-[0.2em] text-sm hover:bg-secondary hover:text-white transition-all shadow-xl shadow-primary/10"
                    >
                      FINALIZAR PEDIDO
                    </Link>

                    <div className="mt-8 flex items-center justify-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                      <Image 
                        src="https://checkout.placetopay.com/images/logos-color.png" 
                        alt="PlacetoPay" 
                        width={120}
                        height={30}
                        className="h-6 w-auto" 
                        unoptimized
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
