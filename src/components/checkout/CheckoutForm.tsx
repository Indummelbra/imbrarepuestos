"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { initiatePayment, savePTPRequestId } from '@/app/actions/placetopay';

export default function CheckoutForm() {
  const { items, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Referencia para bloqueo sincrono anti-doble-clic (Guia WC, punto 3.1)
  const isSubmitting = useRef(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: '',
    dni: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bogota',
    state: 'Cundinamarca',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Cargar datos persistidos al montar el componente
  React.useEffect(() => {
    const savedData = localStorage.getItem('imbra_checkout_data');
    if (savedData) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
      } catch (e) {
        console.error('Error parseando datos persistidos:', e);
      }
    }
  }, []);

  // Persistir datos cada vez que cambian
  React.useEffect(() => {
    localStorage.setItem('imbra_checkout_data', JSON.stringify(formData));
  }, [formData]);

  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    // --- LIMPIEZA DE INPUTS EN TIEMPO REAL (REGLA iAnGo) ---
    if (name === 'firstName' || name === 'lastName' || name === 'city' || name === 'state') {
      // Solo letras y espacios
      finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'address') {
      // Letras, números y espacios (muy estricto según solicitud del usuario)
      finalValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'phone') {
      // Solo números
      finalValue = value.replace(/\D/g, '');
    } else if (name === 'dni') {
      // Solo números y guion (para NIT)
      finalValue = value.replace(/[^0-9-]/g, '');
    }

    setFormData({ ...formData, [name]: finalValue });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  /**
   * Valida que el nombre/apellido no contenga números ni caracteres especiales
   */
  const validateName = (text: string) => {
    // Solo letras y espacios (mínimo 2 caracteres)
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return regex.test(text);
  };

  /**
   * Valida el número de documento según el tipo seleccionado (Colombia específico + Global)
   */
  const validateDocument = (type: string, doc: string) => {
    switch (type) {
      case 'CC': // Cedula de Ciudadania: 7-10 digitos
        return /^\d{7,10}$/.test(doc);
      case 'NIT': // NIT: 9 digitos + DV opcional
      case 'RUT':
        return /^\d{9}(-?[\dkK])?$/.test(doc);
      case 'CE': // Cedula de Extranjeria: 6-10 digitos
      case 'TI': // Tarjeta de Identidad: 6-10 digitos
        return /^\d{6,10}$/.test(doc);
      case 'PPN': // Pasaporte: Alfanumerico 6-20
        return /^[a-zA-Z0-9]{6,20}$/.test(doc);
      case 'DNI': // DNI (General): 6-15 digitos
        return /^\d{6,15}$/.test(doc);
      default:
        return doc.length >= 5 && /^[a-zA-Z0-9-]+$/.test(doc); // Solo letras, números y guiones
    }
  };

  /**
   * Valida el formato de email de forma extremadamente estricta (usuario@dominio.ext)
   */
  const validateEmail = (email: string) => {
    // Requiere: texto + @ + dominio(s) con punto + extensión de al menos 2 letras
    const regex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  /**
   * Flujo completo de pago:
   * 1. Validaciones locales
   * 2. Bloqueo anti-doble-clic
   * 3. Obtener IP real del usuario
   * 4. Crear orden en WooCommerce (estado "pending")
   * 5. Crear sesion en PlacetoPay via Server Action
   * 6. Guardar requestId en sessionStorage
   * 7. Redirigir al portal de pagos PlacetoPay
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // VALIDACIONES PREVIAS
    if (!formData.documentType) {
      setErrorMsg('Por favor seleccione un tipo de documento.');
      return;
    }
    if (!validateName(formData.firstName)) {
      setErrorMsg('El nombre no debe contener números ni caracteres especiales.');
      return;
    }
    if (!validateName(formData.lastName)) {
      setErrorMsg('El apellido no debe contener números ni caracteres especiales.');
      return;
    }
    if (!validateDocument(formData.documentType, formData.dni)) {
      setErrorMsg(`El número de documento no es válido para el tipo ${formData.documentType}.`);
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrorMsg('Por favor ingresa un correo electrónico válido (ej: usuario@dominio.com).');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Debes aceptar los términos y condiciones para continuar.');
      return;
    }

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
          { key: '_billing_numero_documento', value: formData.dni },
          { key: '_billing_tipo_documento', value: formData.documentType },
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
          documentType: formData.documentType,
          document: formData.dni,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            country: 'CO',
          }
        },
        ipAddress: clientIp,
        userAgent: navigator.userAgent,
      });

      if (!ptpResult.success || !ptpResult.processUrl) {
        setErrorMsg(ptpResult.error || 'No se pudo iniciar el pago. Intenta de nuevo.');
        return;
      }

      // PASO 4: Guardar requestId para la sonda (Cron) y sesion actual
      if (ptpResult.requestId) {
        // En WooCommerce (metadatos)
        await savePTPRequestId(orderData.orderId, ptpResult.requestId);
        
        // En sessionStorage para la pagina de resultado inmediata
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
              placeholder="Ej: Juan"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full bg-gray-50 border p-3 outline-none font-bold text-sm uppercase ${
                touched.firstName && !validateName(formData.firstName)
                  ? 'border-red-500 text-red-600 focus:border-red-700'
                  : 'border-gray-100 focus:border-primary text-secondary'
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Apellido</label>
            <input
              required
              name="lastName"
              placeholder="Ej: Perez"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full bg-gray-50 border p-3 outline-none font-bold text-sm uppercase ${
                touched.lastName && !validateName(formData.lastName)
                  ? 'border-red-500 text-red-600 focus:border-red-700'
                  : 'border-gray-100 focus:border-primary text-secondary'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary uppercase text-sm"
            >
              <option value="">Seleccione una opción</option>
              <option value="CC">CC - Cédula de Ciudadanía</option>
              <option value="NIT">NIT - Número Identificación Tributaria</option>
              <option value="CE">CE - Cédula de Extranjería</option>
              <option value="TI">TI - Tarjeta de Identidad</option>
              <option value="PPN">PPN - Pasaporte</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Número de Identificación</label>
            <input
              required
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleBlur}
              inputMode="numeric"
              placeholder="Sin puntos ni guiones"
              className={`w-full bg-gray-50 border p-3 outline-none font-bold text-sm uppercase ${
                touched.dni && !validateDocument(formData.documentType, formData.dni)
                  ? 'border-red-500 text-red-600 focus:border-red-700'
                  : 'border-gray-100 focus:border-primary text-secondary'
              }`}
            />
          </div>
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
              onBlur={handleBlur}
              placeholder="ejemplo@correo.com"
              className={`w-full bg-gray-50 border p-3 outline-none font-bold text-sm ${
                touched.email && !validateEmail(formData.email) 
                  ? 'border-red-500 text-red-600 focus:border-red-700' 
                  : 'border-gray-100 focus:border-primary text-secondary'
              }`}
            />
            {touched.email && !validateEmail(formData.email) && (
              <p className="text-[10px] text-red-600 font-bold uppercase italic">
                El correo debe incluir @, dominio y extensión (ej: .com)
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Telefono</label>
            <input
              required
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              inputMode="numeric"
              placeholder="Ej: 3001234567"
              className={`w-full bg-gray-50 border p-3 outline-none font-bold text-sm ${
                touched.phone && formData.phone.length < 7
                  ? 'border-red-500 text-red-600 focus:border-red-700'
                  : 'border-gray-100 focus:border-primary text-secondary'
              }`}
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

        {/* Términos y Condiciones */}
        <div className="mb-6 flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary"
          />
          <label htmlFor="acceptTerms" className="text-[11px] font-bold text-gray-500 uppercase leading-tight cursor-pointer">
            He leído y acepto los <Link href="/legal/terminos-y-condiciones" target="_blank" className="text-secondary border-b border-secondary">términos y condiciones</Link> de compra y la política de tratamiento de datos.
          </label>
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
