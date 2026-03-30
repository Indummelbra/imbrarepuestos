"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { initiatePayment, savePTPRequestId } from '@/app/actions/placetopay';
import { DEPARTAMENTOS, DEPARTAMENTOS_LISTA } from '@/data/departamentos';

// Tipo para las ciudades desde Supabase
interface Ciudad {
  Name: string;
  Code: number;
  State: number;
}

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
    city: '',
    cityCode: 0,
    state: '',
    stateCode: 0,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // --- LÓGICA DE ENVÍO SIMULADO ---
  const [shippingCost, setShippingCost] = useState<number | null>(null);

  // --- Estado para selector cascada Departamento -> Ciudad ---
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Cargar datos persistidos al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem('imbra_checkout_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
        // Si ya tenia ciudad guardada, mostrarla en el campo de busqueda
        if (parsed.city) {
          setCitySearch(parsed.city);
        }
      } catch (e) {
        console.error('Error parseando datos persistidos:', e);
      }
    }
  }, []);

  // Persistir datos cada vez que cambian
  useEffect(() => {
    localStorage.setItem('imbra_checkout_data', JSON.stringify(formData));
  }, [formData]);

  // Cargar ciudades al cambiar el departamento
  useEffect(() => {
    if (!formData.stateCode) {
      setCiudades([]);
      return;
    }

    const cargarCiudades = async () => {
      setLoadingCiudades(true);
      try {
        const res = await fetch(`/api/ciudades?state=${formData.stateCode}`);
        if (res.ok) {
          const data: Ciudad[] = await res.json();
          setCiudades(data);
        } else {
          console.error('Error cargando ciudades:', res.status);
          setCiudades([]);
        }
      } catch (error) {
        console.error('Error de red al cargar ciudades:', error);
        setCiudades([]);
      } finally {
        setLoadingCiudades(false);
      }
    };

    cargarCiudades();
  }, [formData.stateCode]);

  // Cerrar dropdown de ciudades al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular costo de envío basado en selección
  useEffect(() => {
    if (!formData.cityCode || !formData.stateCode) {
      setShippingCost(null);
      return;
    }

    if (totalPrice >= 50000) {
      setShippingCost(0); // Envío Gratis
    } else {
      // Regla simulada: Bogotá (11 - 11001) cuesta 10,000 COP, resto del país 18,000 COP
      if (formData.stateCode === 11 && formData.cityCode === 11001) {
        setShippingCost(10000);
      } else {
        setShippingCost(18000);
      }
    }
  }, [formData.cityCode, formData.stateCode, totalPrice]);

  // Ciudades filtradas por busqueda
  const ciudadesFiltradas = ciudades.filter(c =>
    c.Name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    // --- LIMPIEZA DE INPUTS EN TIEMPO REAL (REGLA iAnGo) ---
    if (name === 'firstName' || name === 'lastName') {
      // Solo letras y espacios
      finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'address') {
      // Letras, numeros y espacios (muy estricto segun solicitud del usuario)
      finalValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'phone') {
      // Solo numeros
      finalValue = value.replace(/\D/g, '');
    } else if (name === 'dni') {
      // Solo numeros y guion (para NIT)
      finalValue = value.replace(/[^0-9-]/g, '');
    }

    setFormData({ ...formData, [name]: finalValue });
  };

  // Handler especifico para el cambio de departamento
  const handleDepartamentoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    const nombre = DEPARTAMENTOS[code] || '';

    setFormData(prev => ({
      ...prev,
      state: nombre,
      stateCode: code,
      // Resetear la ciudad al cambiar de departamento
      city: '',
      cityCode: 0,
    }));
    setCitySearch('');
    setCiudades([]);
  }, []);

  // Handler para seleccionar una ciudad del dropdown
  const handleCitySelect = useCallback((ciudad: Ciudad) => {
    setFormData(prev => ({
      ...prev,
      city: ciudad.Name,
      cityCode: ciudad.Code,
    }));
    setCitySearch(ciudad.Name);
    setShowCityDropdown(false);
  }, []);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  /**
   * Valida que el nombre/apellido no contenga numeros ni caracteres especiales
   */
  const validateName = (text: string) => {
    // Solo letras y espacios (minimo 2 caracteres)
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return regex.test(text);
  };

  /**
   * Valida el numero de documento segun el tipo seleccionado (Colombia especifico + Global)
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
        return doc.length >= 5 && /^[a-zA-Z0-9-]+$/.test(doc); // Solo letras, numeros y guiones
    }
  };

  /**
   * Valida el formato de email de forma extremadamente estricta (usuario@dominio.ext)
   */
  const validateEmail = (email: string) => {
    // Requiere: texto + @ + dominio(s) con punto + extension de al menos 2 letras
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
      setErrorMsg('El nombre no debe contener numeros ni caracteres especiales.');
      return;
    }
    if (!validateName(formData.lastName)) {
      setErrorMsg('El apellido no debe contener numeros ni caracteres especiales.');
      return;
    }
    if (!validateDocument(formData.documentType, formData.dni)) {
      setErrorMsg(`El numero de documento no es valido para el tipo ${formData.documentType}.`);
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrorMsg('Por favor ingresa un correo electronico valido (ej: usuario@dominio.com).');
      return;
    }
    if (!formData.stateCode) {
      setErrorMsg('Por favor selecciona un departamento.');
      return;
    }
    if (!formData.city) {
      setErrorMsg('Por favor selecciona una ciudad.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Debes aceptar los terminos y condiciones para continuar.');
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
      const currentShippingCost = shippingCost || 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const totalToPay = totalPrice + currentShippingCost;

      // Líneas de envío para WooCommerce
      const shipping_lines = currentShippingCost === 0
        ? [
            {
              method_id: 'free_shipping',
              method_title: 'Envío Gratis',
              total: '0'
            }
          ]
        : [
            {
              method_id: 'flat_rate',
              method_title: 'Costo de Envío',
              total: String(currentShippingCost)
            }
          ];

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
          { key: '_billing_city_code', value: String(formData.cityCode) },
          { key: '_billing_state_code', value: String(formData.stateCode) },
        ],
        shipping_lines,
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
          total: Math.round(parseFloat(orderData.total)), // orderData.total viene de WooCommerce con el costo sumado
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
          ¿A QUIÉN LE ENVIAMOS?
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-100 p-3 focus:border-primary outline-none font-bold text-secondary uppercase text-sm"
            >
              <option value="">Seleccione una opcion</option>
              <option value="CC">CC - Cedula de Ciudadania</option>
              <option value="NIT">NIT - Numero Identificacion Tributaria</option>
              <option value="CE">CE - Cedula de Extranjeria</option>
              <option value="TI">TI - Tarjeta de Identidad</option>
              <option value="PPN">PPN - Pasaporte</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Numero de Identificacion</label>
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
              <div className="relative mt-2 animate-in fade-in slide-in-from-top-1">
                {/* Triangulo del tooltip */}
                <div className="absolute -top-1 left-6 w-2 h-2 bg-white border-t border-l border-gray-300 transform rotate-45 z-10"></div>
                
                {/* Cuerpo del badge */}
                <div className="bg-white border border-gray-300 shadow-sm rounded p-2 flex items-center gap-2 w-fit relative z-20">
                  <div className="bg-[#ff9800] text-white w-4 h-4 flex items-center justify-center rounded-sm text-[10px] font-black">
                    !
                  </div>
                  <span className="text-[11px] font-medium text-secondary">
                    Completa este campo bien
                  </span>
                </div>
              </div>
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
          ¿A DÓNDE MANDAMOS TU PEDIDO?
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

        {/* --- SELECTOR CASCADA: DEPARTAMENTO -> CIUDAD --- */}
        <div className="grid grid-cols-2 gap-4">
          {/* Selector de Departamento */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Departamento</label>
            <select
              name="state"
              value={formData.stateCode || ''}
              onChange={handleDepartamentoChange}
              className={`w-full bg-gray-50 border p-3 outline-none font-bold text-sm uppercase ${
                touched.state && !formData.stateCode
                  ? 'border-red-500 text-red-600 focus:border-red-700'
                  : 'border-gray-100 focus:border-primary text-secondary'
              }`}
              onBlur={handleBlur}
            >
              <option value="">Selecciona departamento</option>
              {DEPARTAMENTOS_LISTA.map(dep => (
                <option key={dep.code} value={dep.code}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>

          {/* Autocomplete de Ciudad */}
          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              Ciudad
              {loadingCiudades && (
                <span className="ml-2 text-primary animate-pulse">Cargando...</span>
              )}
            </label>
            <input
              ref={cityInputRef}
              required
              name="city"
              placeholder={
                !formData.stateCode
                  ? 'Selecciona departamento primero'
                  : loadingCiudades
                  ? 'Cargando ciudades...'
                  : 'Escribe para buscar...'
              }
              value={citySearch}
              disabled={!formData.stateCode || loadingCiudades}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCityDropdown(true);
                // Si el usuario borra la busqueda, limpiamos la seleccion
                if (!e.target.value) {
                  setFormData(prev => ({ ...prev, city: '', cityCode: 0 }));
                }
              }}
              onFocus={() => {
                if (formData.stateCode && ciudades.length > 0) {
                  setShowCityDropdown(true);
                }
              }}
              onBlur={(e) => {
                handleBlur(e);
                // Pequeño delay para permitir el click en el dropdown
                setTimeout(() => setShowCityDropdown(false), 200);
              }}
              autoComplete="off"
              className={`w-full bg-gray-50 border p-3 outline-none font-bold text-sm uppercase ${
                !formData.stateCode || loadingCiudades
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : touched.city && !formData.city
                  ? 'border-red-500 text-red-600 focus:border-red-700'
                  : 'border-gray-100 focus:border-primary text-secondary'
              }`}
            />

            {/* Dropdown de ciudades filtradas */}
            {showCityDropdown && ciudadesFiltradas.length > 0 && (
              <div
                ref={cityDropdownRef}
                className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto"
              >
                {ciudadesFiltradas.slice(0, 50).map(ciudad => (
                  <button
                    key={ciudad.Code}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCitySelect(ciudad);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-bold uppercase transition-colors
                      ${formData.cityCode === ciudad.Code
                        ? 'bg-primary/10 text-primary'
                        : 'text-secondary hover:bg-gray-50'
                      }`}
                  >
                    {ciudad.Name}
                  </button>
                ))}
                {ciudadesFiltradas.length > 50 && (
                  <div className="px-3 py-2 text-[10px] text-gray-400 font-bold uppercase text-center border-t">
                    Escribe para filtrar mas resultados...
                  </div>
                )}
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {showCityDropdown && citySearch.length > 0 && ciudadesFiltradas.length === 0 && !loadingCiudades && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg">
                <div className="px-3 py-3 text-xs text-gray-400 font-bold uppercase text-center">
                  No se encontraron ciudades
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Columna resumen y boton de pago */}
      <div className="bg-gray-50 p-4 sm:p-8 border border-gray-200">
        <h3 className="font-Archivo font-black text-secondary uppercase tracking-widest mb-8 text-center border-b-4 border-primary pb-4">
          RESUMEN FINAL
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
            <span className="font-bold text-gray-400 uppercase">ENVIO A {formData.city || '...'}</span>
            <span className={`font-bold uppercase ${shippingCost === 0 ? 'text-green-500' : 'text-secondary'}`}>
              {shippingCost === null 
                ? <span className="text-gray-400 italic">POR CALCULAR</span> 
                : shippingCost === 0 
                  ? 'GRATIS' 
                  : `$${shippingCost.toLocaleString('es-CO')}`}
            </span>
          </div>
          <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
            <span className="font-Archivo font-black text-secondary text-lg uppercase leading-none">TOTAL A PAGAR</span>
            <span className="text-3xl font-Archivo font-black text-primary leading-none">
              ${(totalPrice + (shippingCost || 0)).toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* Terminos y Condiciones */}
        <div className="mb-6 flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary"
          />
          <label htmlFor="acceptTerms" className="text-[11px] font-bold text-gray-500 uppercase leading-tight cursor-pointer">
            Acepto los <Link href="/legal/terminos-y-condiciones" target="_blank" className="text-secondary border-b border-secondary">términos y condiciones</Link> y la política de datos personales.
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
            {loading ? 'PROCESANDO...' : 'CONFIRMAR Y PAGAR CON PLACETOPAY'}
          </span>
          <span className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">
            Pago 100% seguro · PSE, tarjeta de crédito y débito
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
