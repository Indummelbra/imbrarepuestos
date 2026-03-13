"use client";

import React, { useState } from 'react';
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bogotá',
    state: 'Cundinamarca'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Validar Stock Real-Time (Opcional pero recomendado)
      // await fetch('/api/checkout/validate-stock', { ... })

      // 2. Crear Orden en WooCommerce
      const orderPayload = {
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          email: formData.email,
          phone: formData.phone,
          country: 'CO'
        },
        line_items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        payment_method: 'placetopay',
        payment_method_title: 'PlacetoPay (PSE/Tarjetas)',
        meta_data: [
          { key: '_billing_dni', value: formData.dni }
        ]
      };

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (data.success) {
        // En una implementación real aquí redirigiríamos a PlacetoPay
        // console.log("Redirigiendo a pago para orderId:", data.orderId);
        
        // Simulación:
        alert("¡Pedido creado con éxito en WooCommerce! ID: " + data.orderId);
        clearCart();
        router.push('/'); 
      } else {
        alert("Error al crear el pedido: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al procesar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Columna Info Personal */}
      <div className="space-y-6">
        <h3 className="font-Archivo font-black text-secondary uppercase tracking-widest border-b-2 border-primary pb-2 inline-block">
          DATOS DEL CLIENTE
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre</label>
            <input 
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary uppercase text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Apellido</label>
            <input 
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary uppercase text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Cédula / NIT / DNI</label>
          <input 
            required
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary uppercase text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
            <input 
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Teléfono</label>
            <input 
              required
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary text-sm"
            />
          </div>
        </div>

        <h3 className="font-Archivo font-black text-secondary uppercase tracking-widest pt-6 border-b-2 border-primary pb-2 inline-block">
          DIRECCIÓN DE ENVÍO
        </h3>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Dirección Completa</label>
          <input 
            required
            name="address"
            placeholder="Calle, Carrera, Edificio, Apto..."
            value={formData.address}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary uppercase text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Ciudad</label>
            <input 
              required
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary uppercase text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Departamento</label>
            <input 
              required
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary uppercase text-sm"
            />
          </div>
        </div>
      </div>

      {/* Columna Resumen y Pago */}
      <div className="bg-gray-50 p-8 border border-gray-200">
        <h3 className="font-Archivo font-black text-secondary uppercase tracking-widest mb-8 text-center border-b-4 border-primary pb-4">
          FINALIZAR TU PEDIDO
        </h3>

        <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map(item => (
            <div key={item.product.id} className="flex justify-between items-center text-xs pb-3 border-b border-gray-200">
              <div className="flex-grow pr-4 uppercase">
                <span className="font-bold text-secondary">{item.product.name}</span>
                <span className="text-gray-400 block tracking-widest mt-1">CANT: {item.quantity}</span>
              </div>
              <span className="font-Archivo font-black text-secondary">
                ${(parseFloat(item.product.price) * item.quantity).toLocaleString('es-CO')}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4 mb-8">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-400 uppercase">SUBTOTAL</span>
            <span className="font-bold text-secondary">${totalPrice.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-400 uppercase">ENVÍO A {formData.city}</span>
            <span className="font-bold text-green-600 uppercase italic">POR CALCULAR</span>
          </div>
          <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
            <span className="font-Archivo font-black text-secondary text-lg uppercase leading-none">TOTAL A PAGAR</span>
            <span className="text-3xl font-Archivo font-black text-primary leading-none">
              ${totalPrice.toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || items.length === 0}
          className={`w-full py-6 flex flex-col items-center justify-center transition-all shadow-xl
            ${loading 
              ? 'bg-gray-200 cursor-wait' 
              : 'bg-primary text-secondary hover:bg-secondary hover:text-white shadow-primary/10'
            }`}
        >
          <span className="font-Archivo font-black text-lg tracking-[0.2em]">
            {loading ? 'PROCESANDO...' : 'PAGAR CON PLACETOPAY'}
          </span>
          <span className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">Pago 100% Seguro por PSE o Tarjetas</span>
        </button>

        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center space-y-4">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">PROCESADO POR</p>
           <Image 
            src="https://checkout.placetopay.com/images/logos-color.png" 
            alt="PlacetoPay" 
            width={120}
            height={32}
            className="h-8 w-auto"
            unoptimized
          />
        </div>
      </div>
    </form>
  );
}
