"use client";

import React, { useState, useRef } from 'react';
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { initiatePayment } from '@/app/actions/placetopay';

export default function CheckoutForm() {
  const { items, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Referencia para bloqueo sincrono anti-doble-clic (Guia WC, punto 3.1)
  const isSubmitting = useRef(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bogota',
    state: 'Cundinamarca',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Flujo completo de pago:
   * 1. Bloqueo anti-doble-clic
   * 2. Obtener IP real del usuario
   * 3. Crear orden en WooCommerce (estado "pending")
   * 4. Crear sesion en PlacetoPay via Server Action
   * 5. Guardar requestId en sessionStorage
   * 6. Redirigir al portal de pagos PlacetoPay
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bloqueo sincrono — previene doble envio antes de que React re-renderice (Guia WC, punto 3.1)
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);
    setErrorMsg(null);

    try {
      // PASO 1: Obtener la IP real del cliente (Guia WC, punto 3.5)
      let clientIp = '127.0.0.1';
      try {
        const ipRes = await fetch('/api/user-ip');
        const ipData = await ipRes.json();
        clientIp = ipData.ip || '127.0.0.1';
      } catch {
        // Si falla, usamos fallback — no bloqueamos el pago
        console.warn('No se pudo obtener la IP del cliente, usando fallback.');
      }

      // PASO 2: Crear la orden en WooCommerce con estado "pending"
      const orderPayload = {
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          email: formData.email,
          phone: formData.phone,
          country: 'CO',
        },
        line_items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        payment_method: 'placetopay',
        payment_method_title: 'PlacetoPay (PSE/Tarjetas)',
        meta_data: [
          { key: '_billing_dni', value: formData.dni },
        ],
      };

      const orderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        setErrorMsg(orderData.message || 'Error al crear el pedido. Intenta de nuevo.');
        return;
      }

      // PASO 3: Iniciar sesion de pago en PlacetoPay via Server Action
      const ptpResult = await initiatePayment({
        reference: String(orderData.orderId),
        description: `Pedido Imbra Repuestos #${orderData.orderId}`,
        amount: {
          currency: 'COP',
          total: Math.round(parseFloat(orderData.total)),
        },
        buyer: {
          name: formData.firstName,
          surname: formData.lastName,
          email: formData.email,
          mobile: formData.phone,
          // Tipo y numero de documento (Guia WC, punto 3.5)
          documentType: 'CC',
          document: formData.dni,
        },
        ipAddress: clientIp,
        userAgent: navigator.userAgent,
      });

      if (!ptpResult.success || !ptpResult.processUrl) {
        setErrorMsg(ptpResult.error || 'No se pudo iniciar el pago. Intenta de nuevo.');
        return;
      }

      // PASO 4: Guardar requestId en sessionStorage para que la pagina de resultado
      // pueda consultar el estado con QuerySession sin depender de la URL original
      if (ptpResult.requestId) {
        sessionStorage.setItem('ptp_request_id', String(ptpResult.requestId));
        sessionStorage.setItem('ptp_order_id', String(orderData.orderId));
      }

      // PASO 5: Redirigir al portal de pagos de PlacetoPay
      window.location.href = ptpResult.processUrl;

    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      setErrorMsg('Error de conexion. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* Columna informacion personal */}
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
          <label className="text-[10px] font-bold text-gray-400 uppercase">Cedula / NIT / DNI</label>
          <input
            required
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]+"
            title="Solo numeros"
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
            <label className="text-[10px] font-bold text-gray-400 uppercase">Telefono</label>
            <input
              required
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              inputMode="numeric"
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary text-sm"
            />
          </div>
        </div>

        <h3 className="font-Archivo font-black text-secondary uppercase tracking-widest pt-6 border-b-2 border-primary pb-2 inline-block">
          DIRECCION DE ENVIO
        </h3>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Direccion Completa</label>
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

      {/* Columna resumen y boton de pago */}
      <div className="bg-gray-50 p-8 border border-gray-200">
        <h3 className="font-Archivo font-black text-secondary uppercase tracking-widest mb-8 text-center border-b-4 border-primary pb-4">
          FINALIZAR TU PEDIDO
        </h3>

        {/* Lista de productos en el carrito */}
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

        {/* Totales */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm space-y-4 mb-8">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-400 uppercase">SUBTOTAL</span>
            <span className="font-bold text-secondary">${totalPrice.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-400 uppercase">ENVIO A {formData.city}</span>
            <span className="font-bold text-green-600 uppercase italic">POR CALCULAR</span>
          </div>
          <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
            <span className="font-Archivo font-black text-secondary text-lg uppercase leading-none">TOTAL A PAGAR</span>
            <span className="text-3xl font-Archivo font-black text-primary leading-none">
              ${totalPrice.toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* Mensaje de error */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 uppercase tracking-wide">
            {errorMsg}
          </div>
        )}

        {/* Boton de pago */}
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
          <span className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">
            Pago 100% Seguro por PSE o Tarjetas
          </span>
        </button>

        {/* Logo PlacetoPay (Guia WC, punto 7.4) */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">PROCESADO POR</p>
          <Image
            src="https://static.placetopay.com/placetopay-logo.svg"
            alt="PlacetoPay by Evertec"
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
