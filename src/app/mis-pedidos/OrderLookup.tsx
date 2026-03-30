"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { getOrdersByDocument, CustomerOrder } from "@/app/actions/order-actions";

type View = "form" | "panel";
type PanelSection = "general" | "order-detail";

const DOC_TYPES = [
  { value: "CC",  label: "Cédula de Ciudadanía" },
  { value: "NIT", label: "NIT Empresarial" },
  { value: "CE",  label: "Cédula de Extranjería" },
  { value: "TI",  label: "Tarjeta de Identidad" },
  { value: "PPN", label: "Pasaporte" },
];

const STATUS_COLOR: Record<string, string> = {
  completed:  "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  "on-hold":  "bg-yellow-100 text-yellow-700",
  pending:    "bg-gray-100 text-gray-600",
  cancelled:  "bg-red-100 text-red-600",
  refunded:   "bg-purple-100 text-purple-600",
  failed:     "bg-red-100 text-red-600",
};

const STATUS_DOT: Record<string, string> = {
  completed:  "bg-green-500",
  processing: "bg-blue-500",
  "on-hold":  "bg-yellow-500",
  pending:    "bg-gray-400",
  cancelled:  "bg-red-500",
  refunded:   "bg-purple-500",
  failed:     "bg-red-500",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return iso; }
}

function formatPrice(total: string) {
  return `$${parseFloat(total).toLocaleString("es-CO")}`;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────

export default function OrderLookup() {
  const [view, setView]             = useState<View>("form");
  const [orders, setOrders]         = useState<CustomerOrder[]>([]);
  const [activeSection, setActiveSection] = useState<PanelSection>("general");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [error, setError]           = useState("");
  const [copied, setCopied]         = useState(false);
  const [isPending, startTransition] = useTransition();

  // Formulario
  const [docType, setDocType] = useState("CC");
  const [docNum, setDocNum]   = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");

  // Cache del header (legacy path)
  useEffect(() => {
    const raw = sessionStorage.getItem("imbra_pedidos_cache");
    if (!raw) return;
    try {
      const { orders: cached, timestamp } = JSON.parse(raw);
      const THIRTY_MIN = 30 * 60 * 1000;
      if (Date.now() - timestamp < THIRTY_MIN && Array.isArray(cached) && cached.length > 0) {
        setOrders(cached);
        setSelectedOrder(cached[0]);
        setView("panel");
      }
    } catch { /* ignorar cache corrupto */ }
    finally { sessionStorage.removeItem("imbra_pedidos_cache"); }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await getOrdersByDocument(email, docNum, phone);
      if (result === null) {
        setError("No encontramos pedidos con esos datos. Verifica tu documento, correo y teléfono.");
        return;
      }
      setOrders(result);
      setSelectedOrder(result[0] ?? null);
      setView("panel");
    });
  };

  const handleExit = () => {
    setView("form");
    setOrders([]);
    setSelectedOrder(null);
    setActiveSection("general");
    setDocNum("");
    setEmail("");
    setPhone("");
    setError("");
  };

  const copyGuide = (guide: string) => {
    navigator.clipboard.writeText(guide).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── FORMULARIO ─────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="min-h-[calc(100vh-175px)] flex flex-col lg:flex-row">

        {/* Panel izquierdo — branding oscuro */}
        <div className="hidden lg:flex lg:w-[42%] bg-secondary flex-col justify-between p-14 relative overflow-hidden">

          {/* Patrón sutil */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
              backgroundSize: "14px 14px",
            }}
          />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/">
              <Image
                src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png"
                alt="Imbra Repuestos" width={140} height={56}
                className="h-12 w-auto object-contain brightness-0 invert"
                unoptimized
              />
            </Link>
          </div>

          {/* Contenido central */}
          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-primary text-[11px] font-black uppercase tracking-[0.25em] mb-3">
                Zona de clientes
              </p>
              <h1 className="text-white text-5xl font-black uppercase italic leading-[1.05] tracking-tighter">
                Tu pedido,<br /><span className="text-primary">bajo control</span>
              </h1>
              <p className="text-gray-300 text-sm mt-4 leading-relaxed max-w-xs">
                Revisa tus compras, consulta el estado de cada envío y obtén tu número de guía al instante. Sin cuentas, sin complicaciones.
              </p>
            </div>

            {/* Beneficios */}
            <div className="space-y-3">
              {[
                { icon: "no_accounts",    text: "Sin cuenta ni contraseñas — acceso inmediato" },
                { icon: "verified_user",  text: "Tus datos, protegidos con verificación triple" },
                { icon: "local_shipping", text: "Guía y transportadora al instante" },
                { icon: "history",        text: "Todo tu historial de compras en un solo lugar" },
              ].map(({ icon, text }) => (
                <div key={icon} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-icons text-primary text-[15px]">{icon}</span>
                  </div>
                  <span className="text-gray-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <p className="relative z-10 text-gray-600 text-[11px]">
            © {new Date().getFullYear()} IMBRA Repuestos · Repuestos originales para tu moto
          </p>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] px-6 py-16 lg:py-0">
          <div className="w-full max-w-[420px]">

            {/* Mobile header */}
            <div className="lg:hidden mb-8 text-center">
              <Link href="/" className="inline-block mb-5">
                <Image
                  src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png"
                  alt="Imbra Repuestos" width={120} height={48}
                  className="h-10 w-auto object-contain mx-auto" unoptimized
                />
              </Link>
              <h1 className="text-2xl font-black text-secondary uppercase italic tracking-tight">
                Tu pedido, <span className="text-primary">bajo control</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">Sin cuenta — solo tus datos de compra</p>
            </div>

            {/* Tarjeta */}
            <div className="bg-white shadow-xl p-8 border border-gray-100">
              <div className="mb-7">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-icons text-primary text-2xl">receipt_long</span>
                </div>
                <h2 className="text-xl font-bold text-secondary leading-tight">¿Dónde está tu pedido?</h2>
                <p className="text-gray-400 text-[13px] mt-1">Ingresa los datos con los que compraste y te mostramos todo al instante</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Tipo de documento
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-[#F4F4F4] border border-transparent px-4 py-3 text-sm font-medium text-secondary focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(241,135,0,0.12)] transition-all appearance-none cursor-pointer"
                  >
                    {DOC_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Número de documento
                  </label>
                  <input
                    type="text" inputMode="numeric" required
                    value={docNum}
                    onChange={(e) => setDocNum(e.target.value.replace(/\D/g, ""))}
                    placeholder="Sin puntos ni espacios"
                    className="w-full bg-[#F4F4F4] border border-transparent px-4 py-3 text-sm text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(241,135,0,0.12)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="el que usaste al comprar"
                    className="w-full bg-[#F4F4F4] border border-transparent px-4 py-3 text-sm text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(241,135,0,0.12)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Teléfono
                  </label>
                  <input
                    type="tel" inputMode="numeric" required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ej: 3001234567"
                    className="w-full bg-[#F4F4F4] border border-transparent px-4 py-3 text-sm text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(241,135,0,0.12)] transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 px-4 py-3">
                    <span className="material-icons text-red-400 text-[16px] mt-0.5 shrink-0">error_outline</span>
                    <p className="text-red-600 text-[12px] leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  type="submit" disabled={isPending}
                  className="w-full mt-2 px-4 py-3.5 text-white font-bold text-[14px] tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 transition-all"
                  style={{ background: "linear-gradient(180deg,#F19500 0%,#E07D00 100%)", boxShadow: "0 4px 18px rgba(241,135,0,0.35)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(180deg,#E07D00 0%,#cc6f00 100%)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(180deg,#F19500 0%,#E07D00 100%)"; }}
                >
                  {isPending
                    ? <><span className="material-icons text-[16px] animate-spin">autorenew</span> Verificando...</>
                    : <><span className="material-icons text-[16px]">search</span> Ver mis compras y envíos</>
                  }
                </button>
              </form>
            </div>

            <p className="text-center text-gray-400 text-[12px] mt-5">
              ¿No encuentras tu pedido?{" "}
              <Link href="/contacto" className="text-primary font-semibold hover:underline">Escríbenos, te ayudamos</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── PANEL DE CLIENTE ───────────────────────────────────────────────────────
  const customer = orders[0]?.billing;
  const initials = customer ? getInitials(customer.firstName, customer.lastName) : "??";

  return (
    <div className="bg-[#f5f5f5] flex flex-col" style={{ height: "calc(100vh - 175px)" }}>

      {/* Nav mobile horizontal */}
      <div className="lg:hidden bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex gap-0 py-0 min-w-max">
          <button
            onClick={() => setActiveSection("general")}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeSection === "general"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-secondary"
            }`}
          >
            <span className="material-icons text-sm">dashboard</span>
            General
          </button>
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => { setSelectedOrder(order); setActiveSection("order-detail"); }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                activeSection === "order-detail" && selectedOrder?.id === order.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-secondary"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[order.status] ?? "bg-gray-400"}`} />
              #{order.number}
            </button>
          ))}
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap ml-auto"
          >
            <span className="material-icons text-sm">logout</span>
            Salir
          </button>
        </div>
      </div>

      {/* Desktop layout — sidebar fijo, contenido derecho con scroll propio */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── SIDEBAR — altura completa, no hace scroll ── */}
        <aside className="hidden lg:flex w-[260px] shrink-0 bg-white border-r border-gray-100 shadow-sm flex-col overflow-y-auto">

          {/* Avatar + datos cliente */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary flex items-center justify-center shrink-0">
                <span className="text-primary font-black text-lg">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-secondary text-sm leading-tight truncate">
                  {customer?.firstName} {customer?.lastName}
                </p>
                <p className="text-gray-400 text-[11px] truncate mt-0.5">{customer?.email}</p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 py-4">

            <p className="px-5 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
              Cuenta
            </p>
            <button
              onClick={() => setActiveSection("general")}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold transition-all text-left border-l-[3px] ${
                activeSection === "general"
                  ? "bg-primary/10 text-primary border-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-secondary border-transparent"
              }`}
            >
              <span className={`material-icons text-base ${activeSection === "general" ? "text-primary" : "text-gray-400"}`}>
                dashboard
              </span>
              General
            </button>

            <p className="px-5 mt-6 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
              Mis Pedidos
            </p>
            {orders.map((order) => {
              const isActive = activeSection === "order-detail" && selectedOrder?.id === order.id;
              return (
                <button
                  key={order.id}
                  onClick={() => { setSelectedOrder(order); setActiveSection("order-detail"); }}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all text-left border-l-[3px] ${
                    isActive
                      ? "bg-primary/10 text-primary border-primary font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-secondary border-transparent font-medium"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[order.status] ?? "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs block">Pedido #{order.number}</span>
                    <span className={`text-[10px] mt-0.5 block ${isActive ? "text-primary/70" : "text-gray-400"}`}>
                      {formatDate(order.dateCreated)}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Salir */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleExit}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-wider"
            >
              <span className="material-icons text-sm">logout</span>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ── CONTENIDO PRINCIPAL — scroll independiente ── */}
        <main className="flex-1 min-w-0 overflow-y-auto px-[50px] py-10 space-y-5">

          {/* ── GENERAL ── */}
          {activeSection === "general" && (
            <>
              {/* Banner bienvenida */}
              <div className="bg-secondary px-8 py-7 flex items-center justify-between">
                <div>
                  <p className="text-primary text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                    Mi zona de compras
                  </p>
                  <h2 className="text-white text-3xl font-black uppercase italic tracking-tight leading-tight">
                    ¡Hola de nuevo,<br />
                    <span className="text-primary">{customer?.firstName}!</span>
                  </h2>
                </div>
                <div className="hidden sm:flex w-16 h-16 bg-primary/20 items-center justify-center">
                  <span className="material-icons text-primary text-3xl">waving_hand</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: "shopping_bag",  label: "Compras realizadas",   value: String(orders.length) },
                  { icon: "event",         label: "Última compra",        value: formatDate(orders[0]?.dateCreated ?? "") },
                  { icon: "payments",      label: "Valor pagado",         value: orders[0] ? formatPrice(orders[0].total) : "—" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-white border border-gray-100 shadow-sm p-5">
                    <span className="material-icons text-primary text-2xl mb-2 block">{icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                    <p className="font-black text-secondary text-lg">{value}</p>
                  </div>
                ))}
              </div>

              {/* Datos de contacto */}
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <span className="material-icons text-primary text-base">contact_page</span>
                  <h3 className="font-black text-secondary text-xs uppercase tracking-widest">Datos de contacto</h3>
                </div>
                <div className="px-6 py-5 grid grid-cols-2 gap-5">
                  {[
                    { label: "Nombre completo",     value: `${customer?.firstName} ${customer?.lastName}` },
                    { label: "Correo electrónico",  value: customer?.email ?? "—" },
                    { label: "Teléfono",            value: customer?.phone || "—" },
                    { label: "Ciudad",              value: customer?.city || "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                      <p className="text-secondary font-medium text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA ver pedidos */}
              {orders.length > 0 && (
                <div className="bg-white border border-gray-100 shadow-sm px-6 py-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-secondary text-sm">Ver mis compras y seguimiento</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Tienes {orders.length} compra{orders.length !== 1 ? "s" : ""} — haz clic para ver el estado y el envío
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedOrder(orders[0]); setActiveSection("order-detail"); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-white text-xs font-black uppercase tracking-wider hover:bg-primary transition-colors shrink-0"
                  >
                    Ver envíos
                    <span className="material-icons text-sm">arrow_forward</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── DETALLE DE PEDIDO ── */}
          {activeSection === "order-detail" && selectedOrder && (() => {
            const s = selectedOrder;
            return (
              <>
                {/* Header */}
                <div className="bg-white border border-gray-100 shadow-sm px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="font-black text-secondary text-xl">Pedido #{s.number}</h2>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 ${STATUS_COLOR[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {s.statusLabel}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">{formatDate(s.dateCreated)}</p>
                  </div>
                  <p className="font-black text-secondary text-2xl">{formatPrice(s.total)}</p>
                </div>

                {/* Selector rápido si hay múltiples pedidos */}
                {orders.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                          s.id === o.id
                            ? "bg-secondary text-white border-secondary"
                            : "border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[o.status] ?? "bg-gray-400"}`} />
                        #{o.number}
                      </button>
                    ))}
                  </div>
                )}

                {/* Card 1: Seguimiento */}
                {s.shipping ? (
                  <div className="bg-white border border-gray-100 shadow-sm" style={{ borderLeft: "4px solid #F18700" }}>
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                      <span className="material-icons text-primary text-base">local_shipping</span>
                      <h3 className="font-black text-secondary text-xs uppercase tracking-widest">Seguimiento de envío</h3>
                    </div>
                    <div className="px-6 py-5">
                      <div className="grid grid-cols-2 gap-6 mb-5">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Transportadora</p>
                          <p className="font-bold text-secondary text-base">{s.shipping.carrierName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Número de guía</p>
                          <p className="font-black text-secondary text-xl tracking-wider">{s.shipping.guide}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => copyGuide(s.shipping!.guide)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                            copied ? "bg-green-500 text-white" : "bg-secondary text-white hover:bg-gray-700"
                          }`}
                        >
                          <span className="material-icons text-sm">{copied ? "check" : "content_copy"}</span>
                          {copied ? "¡Copiado!" : "Copiar guía"}
                        </button>
                        {s.shipping.hasTracking && (
                          <a
                            href={s.shipping.trackingUrl}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-widest bg-primary text-white hover:bg-orange-600 transition-colors"
                          >
                            <span className="material-icons text-sm">open_in_new</span>
                            Rastrear envío
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-3 text-gray-400">
                    <span className="material-icons text-xl">schedule</span>
                    <p className="text-sm">El envío aún no ha sido despachado. Te notificaremos cuando esté en camino.</p>
                  </div>
                )}

                {/* Card 2: Productos */}
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <span className="material-icons text-primary text-base">inventory_2</span>
                    <h3 className="font-black text-secondary text-xs uppercase tracking-widest">Productos del pedido</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {s.items.map((item) => (
                      <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                        {item.image_url && (
                          <div className="w-12 h-12 bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-1" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-secondary text-sm leading-snug">{item.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-black text-secondary text-sm shrink-0">{formatPrice(item.total)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                    <span className="font-black text-secondary text-xs uppercase tracking-widest">Total del pedido</span>
                    <span className="font-black text-secondary text-xl">{formatPrice(s.total)}</span>
                  </div>
                </div>

                {/* Card 3: Facturación */}
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <span className="material-icons text-primary text-base">receipt</span>
                    <h3 className="font-black text-secondary text-xs uppercase tracking-widest">Datos de facturación</h3>
                  </div>
                  <div className="px-6 py-5 grid grid-cols-2 gap-5">
                    {[
                      { label: "Nombre",    value: `${s.billing.firstName} ${s.billing.lastName}` },
                      { label: "Teléfono",  value: s.billing.phone || "—" },
                      { label: "Correo",    value: s.billing.email },
                      { label: "Ciudad",    value: s.billing.city || "—" },
                      { label: "Dirección", value: s.billing.address || "—", full: true },
                    ].map(({ label, value, full }) => (
                      <div key={label} className={full ? "col-span-2" : ""}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                        <p className="text-secondary font-medium text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 4: Dirección de envío */}
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <span className="material-icons text-primary text-base">home</span>
                    <h3 className="font-black text-secondary text-xs uppercase tracking-widest">Dirección de envío</h3>
                  </div>
                  {s.shippingAddress ? (
                    <div className="px-6 py-5 grid grid-cols-2 gap-5">
                      {[
                        { label: "Destinatario", value: `${s.shippingAddress.firstName} ${s.shippingAddress.lastName}`.trim() || `${s.billing.firstName} ${s.billing.lastName}` },
                        { label: "Ciudad",        value: s.shippingAddress.city  || s.billing.city  || "—" },
                        { label: "Departamento",  value: s.shippingAddress.state || "—" },
                        { label: "Dirección",     value: s.shippingAddress.address, full: true },
                      ].map(({ label, value, full }) => (
                        <div key={label} className={full ? "col-span-2" : ""}>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                          <p className="text-secondary font-medium text-sm">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-5">
                      <p className="text-sm text-gray-400">Misma dirección de facturación</p>
                      <p className="text-secondary font-medium text-sm mt-1">{s.billing.address}{s.billing.city ? `, ${s.billing.city}` : ""}</p>
                    </div>
                  )}
                </div>

                {/* Card 5: Pago */}
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <span className="material-icons text-primary text-base">payments</span>
                    <h3 className="font-black text-secondary text-xs uppercase tracking-widest">Información de pago</h3>
                  </div>
                  <div className="px-6 py-5 grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Método de pago</p>
                      <p className="text-secondary font-medium text-sm">{s.paymentMethodTitle || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Total pagado</p>
                      <p className="font-black text-secondary text-lg">
                        {formatPrice(s.total)}{" "}
                        <span className="text-xs font-normal text-gray-400">{s.currency}</span>
                      </p>
                    </div>
                  </div>
                </div>

              </>
            );
          })()}

        </main>
      </div>
    </div>
  );
}
