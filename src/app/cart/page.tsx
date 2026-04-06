"use client";

import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, isFreeShipping, remainingForFreeShipping, freeShippingThreshold } = useCart();

  const shippingProgress = Math.min((totalPrice / freeShippingThreshold) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow">
        {/* Banner de Página - RESTAURADO A ORIGINAL */}
        <section className="bg-secondary py-12">
          <div className="imbra-content-container">
            <h1 className="text-4xl lg:text-5xl font-Archivo font-black text-white italic tracking-tighter uppercase">
              TU PEDIDO <span className="text-primary">[{totalItems}]</span>
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
                <h2 className="text-2xl font-Archivo font-black text-secondary mb-4 uppercase">AÚN NO HAY NADA AQUÍ</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Encuentra el repuesto exacto para tu moto y agrégalo en segundos.</p>
                <Link
                  href="/"
                  className="bg-primary text-secondary px-8 py-4 font-Archivo font-black tracking-widest text-sm hover:bg-secondary hover:text-white transition-all inline-block"
                >
                  IR A BUSCAR MI REPUESTO
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Listado de Productos */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Headers Tabla Desktop - RESTAURADOS */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    <div className="col-span-6">PRODUCTO</div>
                    <div className="col-span-2 text-center">PRECIO</div>
                    <div className="col-span-2 text-center">CANTIDAD</div>
                    <div className="col-span-2 text-right">SUBTOTAL</div>
                  </div>

                  {items.map((item) => (
                    <div key={item.product.id} className="border-b border-gray-100 py-6 group">
                      
                      {/* ── VISTA DESKTOP (RESTAURADA) ── */}
                      <div className="hidden lg:grid grid-cols-12 gap-6 items-center">
                        <div className="col-span-6 flex items-center space-x-4">
                          <div className="relative w-24 aspect-square bg-white border border-gray-100 p-2 overflow-hidden">
                            <Image 
                              src={item.product.images?.[0]?.src || item.product.image_url || "/placeholder.png"}
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

                        <div className="col-span-2 text-center font-Archivo font-bold text-secondary">
                          ${parseFloat(item.product.price).toLocaleString('es-CO')}
                        </div>

                        <div className="col-span-2 flex justify-center">
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

                        <div className="col-span-2 text-right font-Archivo font-black text-secondary text-lg">
                          ${(parseFloat(item.product.price) * item.quantity).toLocaleString('es-CO')}
                        </div>
                      </div>

                      {/* ── VISTA MOBILE (DISEÑO UX MEJORADO APROBADO) ── */}
                      <div className="lg:hidden">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 flex-shrink-0 bg-white border border-gray-100 p-2">
                            <Image 
                              src={item.product.images?.[0]?.src || item.product.image_url || "/placeholder.png"}
                              alt={item.product.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-Archivo font-black text-secondary text-sm uppercase leading-tight italic line-clamp-2">
                                {item.product.name}
                              </h3>
                              <button 
                                onClick={() => removeItem(item.product.id)}
                                className="text-gray-300 hover:text-red-500 outline-none"
                              >
                                <span className="material-icons text-xl">close</span>
                              </button>
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest italic font-Archivo">SKU: {item.product.sku}</p>
                            <p className="text-secondary/60 text-xs font-Archivo font-bold mt-2">
                              ${parseFloat(item.product.price).toLocaleString('es-CO')} c/u
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
                          <div className="flex items-center bg-gray-50 border border-gray-200">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center font-black active:bg-primary transition-colors border-r border-gray-200 text-lg"
                            >
                              -
                            </button>
                            <span className="w-12 h-10 flex items-center justify-center text-sm font-black bg-white">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center font-black active:bg-primary transition-colors border-l border-gray-200 text-lg"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">SUBTOTAL</p>
                            <p className="font-Archivo font-black text-secondary italic tracking-tighter text-lg">
                              ${(parseFloat(item.product.price) * item.quantity).toLocaleString('es-CO')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-8 flex justify-between items-center">
                    <Link 
                      href="/" 
                      className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase flex items-center"
                    >
                      <span className="material-icons text-sm mr-2">arrow_back</span>
                      SEGUIR COMPRANDO
                    </Link>
                    <button 
                      className="text-[10px] font-bold text-gray-300 hover:text-red-500 uppercase flex items-center transition-colors lg:hidden"
                      onClick={() => {
                        if(confirm('¿Vaciar carrito?')) items.forEach(i => removeItem(i.product.id));
                      }}
                    >
                       VACIAR CARRITO
                    </button>
                  </div>
                </div>

                {/* Resumen de Compra - RESTAURADO ESTILO ORIGINAL */}
                <div className="lg:col-span-4">
                  <div className="bg-gray-50 p-8 border border-gray-200 sticky top-[220px]">
                    <h2 className="font-Archivo font-black text-secondary mb-6 tracking-widest text-lg uppercase italic border-l-4 border-primary pl-4">RESUMEN DE TU PEDIDO</h2>
                    
                    {/* Progress Bar Envío Gratis (Diseño Mejorado solicitado) */}
                    <div className="mb-8 p-4 bg-white border border-gray-100 shadow-sm">
                      {isFreeShipping ? (
                        <p className="text-green-600 font-bold text-xs text-center mb-3 uppercase tracking-wide">
                          ¡ENVÍO GRATIS ASEGURADO! 🎉
                        </p>
                      ) : (
                        <p className="text-secondary font-bold text-[10px] text-center mb-3 uppercase tracking-widest">
                          FALTAN PARA ENVÍO GRATIS: <span className="text-primary font-black">${remainingForFreeShipping.toLocaleString('es-CO')}</span>
                        </p>
                      )}
                      <div className="w-full bg-gray-200 h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ease-out ${isFreeShipping ? 'bg-green-500' : 'bg-primary'}`} 
                          style={{ width: `${shippingProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-[11px] font-bold tracking-tight">
                        <span className="text-gray-400 uppercase italic">PRODUCTOS ({totalItems})</span>
                        <span className="text-secondary tracking-tighter">${totalPrice.toLocaleString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold tracking-tight">
                        <span className="text-gray-400 uppercase italic">ENVÍO A TODO COLOMBIA</span>
                        {isFreeShipping ? (
                          <span className="text-green-600 italic">GRATIS</span>
                        ) : (
                          <span className="text-orange-500 italic">POR CALCULAR</span>
                        )}
                      </div>
                      <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                        <span className="font-Archivo font-black text-secondary uppercase text-sm italic">TOTAL A PAGAR</span>
                        <span className="text-3xl font-Archivo font-black text-primary italic tracking-tighter leading-none">
                          ${totalPrice.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-2">IVA INCLUIDO. El envío se calcula al ingresar tu ciudad.</p>
                    </div>

                    <Link 
                      href="/checkout"
                      className="bg-primary text-secondary w-full py-5 flex items-center justify-center font-Archivo font-black tracking-[0.2em] text-sm hover:bg-secondary hover:text-white transition-all active:translate-y-1 block text-center"
                    >
                      PAGAR AHORA SEGURO
                    </Link>

                    <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                      <div className="flex items-center justify-center gap-6">
                        <Image 
                          src="https://static.placetopay.com/placetopay-logo.svg" 
                          alt="PlacetoPay" 
                          width={120}
                          height={30}
                          className="h-6 w-auto" 
                          unoptimized
                        />
                      </div>
                      <p className="text-[8px] text-center text-gray-400 font-bold uppercase tracking-widest px-4">Aceptamos todas las tarjetas y PSE vía PlacetoPay</p>
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
