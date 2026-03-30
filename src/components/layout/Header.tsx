"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import LiveSearch from "../search/LiveSearch";
import { useState, useRef, useEffect, useCallback } from "react";
import { WOO_CATEGORIES, CATEGORY_GROUPS } from "@/lib/woo-categories";
import {
  Menu, X, ChevronRight, ChevronDown,
  Heart, ShoppingCart, Headphones, ExternalLink, ArrowRight, Search,
  ArrowUp, ArrowDown,
} from "lucide-react";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import StickyHeader from "./StickyHeader";

const MEGA_GROUPS = CATEGORY_GROUPS;

/* ── Fase del mega menú ────────────────────────────────────
   'closed' → oculto
   'col1'   → solo columna A (lista de grupos, delgada)
   'full'   → las 3 columnas completas (cajón 960px)
──────────────────────────────────────────────────────────── */
type MenuPhase = "closed" | "col1" | "full";

export default function Header() {
  const { totalItems, totalPrice, openSidebar } = useCart();
  const [menuPhase, setMenuPhase] = useState<MenuPhase>("closed");
  const [activeGroup, setActiveGroup] = useState("frenos");
  const [helpOpen, setHelpOpen] = useState(false);
  const [nosotrosOpen, setNosotrosOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sidebarIsAtBottom, setSidebarIsAtBottom] = useState(false);
  const [sidebarIsAtTop, setSidebarIsAtTop] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const menuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const helpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nosotrosTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const scrollSidebar = (direction: "top" | "bottom") => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTo({
        top: direction === "top" ? 0 : sidebarRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSidebarScroll = () => {
    if (sidebarRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;

      // Estamos arriba si el scroll es muy bajo
      setSidebarIsAtTop(scrollTop < 15);

      // Estamos abajo si estamos a menos de 15px del final
      const atBottom = scrollTop + clientHeight >= scrollHeight - 15;
      setSidebarIsAtBottom(atBottom);
    }
  };

  /* Helpers de hover con delay anti-sensibilidad */
  const openMenu = () => {
    if (menuTimer.current) clearTimeout(menuTimer.current);
    setMenuPhase((p) => p === "closed" ? "col1" : p);
  };
  const closeMenu = useCallback(() => { menuTimer.current = setTimeout(() => setMenuPhase("closed"), 250); }, []);
  const keepMenu = () => { if (menuTimer.current) clearTimeout(menuTimer.current); };

  const openHelp = () => { if (helpTimer.current) clearTimeout(helpTimer.current); setHelpOpen(true); };
  const closeHelp = () => { helpTimer.current = setTimeout(() => setHelpOpen(false), 200); };
  const openNosotros = () => { if (nosotrosTimer.current) clearTimeout(nosotrosTimer.current); setNosotrosOpen(true); };
  const closeNosotros = () => { nosotrosTimer.current = setTimeout(() => setNosotrosOpen(false), 200); };

  /* Cierre por click fuera + ESC */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const inTrigger = menuRef.current?.contains(e.target as Node);
      const inPanel = megaMenuRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPanel) setMenuPhase("closed");
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuPhase("closed");
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(totalPrice);

  const currentGroup = MEGA_GROUPS.find((g) => g.id === activeGroup)!;
  const currentCats = WOO_CATEGORIES.filter((c) => currentGroup.slugs.includes(c.slug));

  const closeAll = () => setMenuPhase("closed");

  return (
    <>
      <div className="hidden xl:block">
        <StickyHeader
          onOpenMenu={() => setMobileMenuOpen(true)}
          onToggleSearch={() => setMobileSearchOpen(prev => !prev)}
          searchOpen={mobileSearchOpen}
        />
      </div>
      <header className="relative z-50 bg-white border-b border-gray-100">

        {/* ── INFO BAR ── */}
        <div className="bg-gray-100 border-b border-gray-200/50 overflow-hidden">

          {/* ── MOBILE: dos filas ── */}
          <div className="lg:hidden">
            {/* Fila 1: Ticker full width */}
            <div className="overflow-hidden relative h-[22px] py-1">
              <div className="absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-gray-100 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none" />
              <div className="flex items-center animate-ticker whitespace-nowrap">
                {[0, 1].map((i) => (
                  <span key={i} className="inline-flex items-center gap-0 text-[11px] text-gray-600 pr-12">
                    🔧&nbsp;Fabricantes colombianos de repuestos para motos
                    <span className="mx-3 text-gray-300">|</span>
                    Envíos a toda Colombia y Latinoamérica
                    <span className="mx-3 text-gray-300">|</span>
                    Más de 50 años en el mercado
                    <span className="mx-3 text-gray-300">|</span>
                    <strong className="text-gray-700">Compras &gt; $50.000 🏎️ ENVÍO GRATIS en Colombia</strong>
                    <span className="mx-3 text-gray-300">|</span>
                    <strong className="text-gray-700">IMBRA REPUESTOS · INDUMMELBRA S.A.S.</strong>
                    <span className="mx-3 text-gray-300">|</span>
                  </span>
                ))}
              </div>
            </div>
            {/* Fila 2: 3 links equitativos */}
            <div className="flex items-center border-t border-gray-200/60">
              <a
                href="https://imbrarepuestos.com/catalogos/"
                target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center font-black uppercase tracking-widest text-[14px] py-2 bg-primary text-white"
              >
                Catálogo
              </a>
              <Link href="#" className="flex-1 text-center text-[14px] font-semibold text-gray-600 hover:text-primary transition-colors py-2 border-x border-gray-200/60">
                Preguntas Frecuentes
              </Link>
              <Link href="/mis-pedidos" className="flex-1 flex items-center justify-center gap-1.5 text-[14px] font-bold text-secondary hover:text-primary transition-colors py-2">
                <span className="material-icons text-[14px]">receipt_long</span>
                Mis Pedidos
              </Link>
            </div>
          </div>

          {/* ── DESKTOP: una sola fila (original) ── */}
          <div className="hidden lg:block">
            <div className="imbra-content-container">
              <div className="py-2 flex justify-between items-center gap-6">
                {/* Ticker */}
                <div className="flex-1 overflow-hidden relative h-[22px]">
                  <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-gray-100 to-transparent pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none" />
                  <div className="flex items-center animate-ticker whitespace-nowrap">
                    {[0, 1].map((i) => (
                      <span key={i} className="inline-flex items-center gap-0 text-[13px] text-gray-500 pr-16">
                        🔧&nbsp;Somos Fabricantes colombianos de repuestos para motos
                        <span className="mx-4 text-gray-300">|</span>
                        Realizamos Envíos a toda Colombia y a algunos países de Latinoamérica
                        <span className="mx-4 text-gray-300">|</span>
                        Tenemos más de 50 años en el mercado de manufactura de repuestos para motos en Colombia
                        <span className="mx-4 text-gray-300">|</span>
                        <strong className="text-gray-700">por compras superiores a $50.000 Pesos Colombianos 🏎️ Tienes ENVÍO GRATIS a toda Colombia (Exclusivamente en Colombia)</strong>
                        <span className="mx-4 text-gray-300">|</span>
                        <strong className="text-gray-700">SOMOS IMBRA REPUESTOS · INDUMMELBRA S.A.S.</strong>
                        <span className="mx-4 text-gray-300">|</span>
                      </span>
                    ))}
                  </div>
                </div>
                {/* Links */}
                <div className="flex items-center gap-5 text-[11px] shrink-0">
                  <a
                    href="https://imbrarepuestos.com/catalogos/"
                    target="_blank" rel="noopener noreferrer"
                    className="font-black uppercase tracking-widest px-3 py-0.5 bg-primary text-white border border-primary hover:bg-white hover:text-primary transition-colors"
                  >
                    Catálogo
                  </a>
                  <Link href="#" className="text-gray-500 hover:text-primary transition-colors">Preguntas Frecuentes</Link>
                  <Link href="/mis-pedidos" className="flex items-center gap-1.5 font-bold text-secondary hover:text-primary transition-colors">
                    <span className="material-icons text-[15px]">receipt_long</span>
                    <span>Mis Pedidos</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── MAIN NAV BAR ── desktop only */}
        <div className="hidden xl:block w-full bg-white border-b border-gray-100 relative">
          <div className="imbra-content-container">
            <div className="py-10 flex items-center gap-3 xl:gap-8">

              <div className="flex items-center gap-6 shrink-0">
                <Link href="/" className="shrink-0">
                  <Image
                    src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png"
                    alt="Imbra Repuestos" width={140} height={56}
                    className="h-14 w-auto object-contain" unoptimized
                  />
                </Link>

                {/* ── Trigger "Comprar por..." ── */}
                <div
                  ref={menuRef}
                  className="hidden xl:flex"
                  onMouseEnter={openMenu}
                  onMouseLeave={closeMenu}
                >
                  <button
                    className={`flex items-center gap-2 font-bold transition-colors group ${menuPhase !== "closed" ? "text-primary" : "text-secondary hover:text-primary"}`}
                    aria-haspopup="true"
                    aria-expanded={menuPhase !== "closed"}
                  >
                    {menuPhase !== "closed"
                      ? <X size={20} />
                      : <Menu size={20} className="group-hover:scale-110 transition-transform" />}
                  </button>

                </div>
              </div>

              {/* Buscador */}
              <div className="flex-1">
                <LiveSearch />
              </div>

              {/* Derecha */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Centro de Ayuda */}
                <div
                  className="hidden xl:relative xl:flex items-center gap-1.5 cursor-pointer border-r border-gray-200 pr-3"
                  onMouseEnter={openHelp}
                  onMouseLeave={closeHelp}
                >
                  <Headphones size={20} className="text-primary" />
                  <div className="imbra-label !text-[9px] flex items-center gap-0.5">
                    Centro de Ayuda <ChevronDown size={10} />
                  </div>
                  {helpOpen && (
                    <div
                      className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
                      onMouseEnter={openHelp}
                      onMouseLeave={closeHelp}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45" />
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <Headphones size={20} className="text-gray-400" />
                        </div>
                        <div className="leading-snug">
                          <p className="text-secondary text-[13px] font-bold">¿Necesitas ayuda?</p>
                          <p className="text-gray-500 text-[11px] mt-0.5">Llama a nuestro experto</p>
                          <a href="tel:+573228464800" className="text-secondary text-[13px] font-bold mt-1 block hover:text-primary transition-colors">
                            (+57) 322 846 4800
                          </a>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 my-3" />
                      <a
                        href="https://api.whatsapp.com/send?phone=573144693065"
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full border border-primary text-primary text-[11px] py-2 rounded hover:bg-primary/5 transition-colors"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} className="w-3.5 h-3.5" />
                        Chatear con nosotros
                      </a>
                      <div className="border-t border-gray-100 mt-3 mb-2" />
                      <p className="text-gray-400 text-[10px] leading-relaxed">
                        Lunes – Domingos<br />7am – 6pm (hora Colombia)
                      </p>
                    </div>
                  )}
                </div>

                {/* Favoritos + Carrito */}
                <div className="flex items-center gap-3">
                  <Link href="#" className="relative group text-gray-900 hidden sm:inline-flex">
                    <Heart size={22} className="group-hover:text-primary transition-all" />
                    <span className="absolute -top-1 -right-1 bg-primary rounded-full h-3 w-3 border-2 border-white" />
                  </Link>
                  <button onClick={openSidebar} className="flex items-center gap-3 group text-gray-900">
                    <div className="relative">
                      <ShoppingCart size={22} className="group-hover:text-primary transition-all" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
                          {totalItems}
                        </span>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="imbra-label mb-1">Carrito</span>
                      <span className="imbra-price !text-sm">{formattedPrice}</span>
                    </div>
                  </button>
                  {/* Hamburguesa mobile */}
                  <button
                    className="xl:hidden p-1 text-gray-900 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Abrir menú"
                  >
                    <Menu size={24} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ══════════════════════════════════════════════
            MEGA MENÚ — posicionado desde el nav bar completo
        ══════════════════════════════════════════════ */}
          {menuPhase !== "closed" && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-30 bg-black/30" onClick={closeAll} />

              {/* Panel — absolute desde el nav bar (relative), top-full = justo abajo del header) */}
              <div
                ref={megaMenuRef}
                className="absolute left-1/2 -translate-x-1/2 z-40"
                style={{ top: "calc(100% - 40px)" }}
                onMouseEnter={keepMenu}
                onMouseLeave={closeMenu}
              >
                <div
                  className="bg-white shadow-[0_8px_32px_rgba(0,0,0,0.14)] border-t-2 border-primary overflow-hidden transition-all duration-200 flex"
                  style={{
                    width: menuPhase === "full" ? "min(1300px, 100vw)" : "270px",
                    minHeight: "460px",
                  }}
                >
                  {/* ── Col A: Grupos ── */}
                  <div className="w-[270px] shrink-0 bg-white border-r border-gray-100 flex flex-col py-2">
                    {MEGA_GROUPS.map((g) => {
                      const active = activeGroup === g.id && menuPhase === "full";
                      return (
                        <button
                          key={g.id}
                          onMouseEnter={() => { setActiveGroup(g.id); setMenuPhase("full"); }}
                          className={`flex items-center gap-3 px-5 py-3 w-full text-left transition-colors group/g border-b border-gray-100 ${active ? "bg-gray-50 text-primary" : "text-gray-900 hover:bg-gray-50 hover:text-primary"
                            }`}
                        >
                          <Image src={g.image} alt={g.name} width={30} height={30}
                            className="w-[30px] h-[30px] object-contain shrink-0 opacity-80 group-hover/g:opacity-100 transition-opacity"
                            unoptimized />
                          <span className={`text-[14px] flex-1 transition-colors ${active ? "font-black text-primary" : "font-bold"}`}>
                            {g.name}
                          </span>
                          <ChevronRight size={14}
                            className={`shrink-0 transition-colors ${active ? "text-primary" : "text-gray-300 group-hover/g:text-primary"}`} />
                        </button>
                      );
                    })}
                    <div className="mt-auto px-5 py-3 border-t border-gray-100">
                      <Link href="/categorias" onClick={closeAll}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                        <ArrowRight size={11} /> Ver todas
                      </Link>
                    </div>
                  </div>

                  {/* ── Col B + Col C (fase full) ── */}
                  {menuPhase === "full" && (
                    <>
                      {/* Col B: Subcategorías */}
                      <div className="relative flex-1 bg-[#F5F6F8] px-10 py-7 flex flex-col min-w-0 overflow-hidden">
                        <Image src={currentGroup.image} alt="" width={320} height={320}
                          className="absolute bottom-6 right-4 w-[320px] h-[320px] object-contain opacity-10 pointer-events-none select-none"
                          unoptimized />
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                          <Image src={currentGroup.image} alt={currentGroup.name} width={22} height={22}
                            className="w-[22px] h-[22px] object-contain" unoptimized />
                          <h3 className="text-[15px] font-black text-gray-900 uppercase tracking-[1px]">
                            {currentGroup.name}
                          </h3>
                          <div className="h-px flex-1 bg-gray-300/40" />
                          <span className="text-[9px] text-gray-400 uppercase tracking-widest shrink-0">
                            {currentCats.length} {currentCats.length === 1 ? "categoría" : "categorías"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 content-start flex-1">
                          {currentCats.map((cat) => (
                            <Link key={cat.slug} href={`/tienda?woo_cat=${cat.slug}`} onClick={closeAll}
                              className="group/cat relative flex items-center gap-4 px-4 py-4 bg-white transition-all duration-300 hover:-translate-y-[3px] overflow-hidden"
                              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(0,0,0,0.10)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                            >
                              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left scale-x-0 group-hover/cat:scale-x-100 transition-transform duration-300" />
                              <div className="w-14 h-14 flex items-center justify-center shrink-0">
                                {cat.image
                                  ? <Image src={cat.image} alt="" width={48} height={48} className="w-12 h-12 object-contain" unoptimized />
                                  : <ChevronRight size={20} className="text-gray-300" />}
                              </div>
                              <p className="text-[14px] font-semibold text-gray-700 group-hover/cat:text-primary transition-colors leading-tight">
                                {cat.name}
                              </p>
                            </Link>
                          ))}
                        </div>
                        <div className="shrink-0 mt-6 -mx-10 -mb-7 px-10 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                          <Link href="/tienda" onClick={closeAll}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors">
                            <ArrowRight size={11} /> Ir a la tienda
                          </Link>
                          <Link href={`/tienda?woo_cat=${currentCats[0]?.slug ?? ""}`} onClick={closeAll}
                            className="text-[10px] font-bold text-primary hover:text-secondary transition-colors">
                            Ver {currentGroup.name} →
                          </Link>
                        </div>
                      </div>

                      {/* Col C: Productos Destacados */}
                      <div className="w-[380px] shrink-0 bg-white border-l border-gray-100 px-7 py-7 flex flex-col">
                        <FeaturedCarousel onClose={closeAll} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── MOBILE MAIN BAR ── */}
        <div className="xl:hidden bg-white border-b border-gray-100">
          <div className="flex items-center justify-between h-[80px] px-4">

            {/* Logo a la izquierda */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png"
                alt="Imbra Repuestos" width={110} height={44}
                className="h-9 w-auto object-contain"
                unoptimized
              />
            </Link>

            {/* Grupo de acciones a la derecha */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="w-11 h-11 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                aria-label={mobileSearchOpen ? "Cerrar búsqueda" : "Buscar"}
              >
                {mobileSearchOpen ? <X size={22} /> : <Search size={22} />}
              </button>
              <button
                onClick={openSidebar}
                className="relative w-11 h-11 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute top-2 right-1.5 bg-primary text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none shadow-sm border border-white">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-11 h-11 flex items-center justify-center text-secondary hover:text-primary transition-colors ml-0.5"
                aria-label="Abrir menú"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE SEARCH PANEL ── */}
        <div
          className={`xl:hidden absolute left-0 w-full bg-gray-50 border-b border-gray-100 transition-all duration-300 z-[45] shadow-md origin-top ${mobileSearchOpen ? "opacity-100 scale-y-100 visible py-3 px-4" : "opacity-0 scale-y-0 invisible py-0 px-4"}`}
        >
          <LiveSearch />
        </div>

        {/* ── BOTTOM BAR ── */}
        <nav className="hidden xl:block w-full bg-white border-t border-gray-100 font-display">
          <div className="imbra-content-container">
            <div className="flex justify-between items-center py-3">
              <ul className="flex space-x-10 imbra-label !text-[12px] text-secondary">
                <li><Link href="/" className="text-primary hover:text-primary transition-colors">INICIO</Link></li>
                <li><Link href="/tienda" className="hover:text-primary transition-colors">TIENDA</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">BLOG</Link></li>
                <li className="relative" onMouseEnter={openNosotros} onMouseLeave={closeNosotros}>
                  <span className={`cursor-pointer transition-colors flex items-center select-none ${nosotrosOpen ? "text-primary" : "hover:text-primary"}`}>
                    NOSOTROS <ChevronDown size={13} className="ml-1" />
                  </span>
                  {nosotrosOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-100 shadow-lg z-50 py-1"
                      onMouseEnter={openNosotros}
                      onMouseLeave={closeNosotros}
                    >
                      <Link href="/nosotros" className="block px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">Quiénes somos</Link>
                      <Link href="/equipo" className="block px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">Equipo Internacional</Link>
                      <Link href="/fabricacion" className="block px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">Fabricación de Partes</Link>
                      <a href="https://www.nomina.com.co:8181/KioscoDesignerRHN-war/?grupo=GrupoEmpresarial54" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">
                        Nómina Designer <ExternalLink size={11} className="text-gray-300" />
                      </a>
                      <a href="https://mkt.imbrarepuestos.com/wp-content/uploads/2026/03/REGLAMENTO-INTERNO-.-2022-protected.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">
                        Reglamento Interno <ExternalLink size={11} className="text-gray-300" />
                      </a>
                    </div>
                  )}
                </li>
                <li><Link href="/contacto" className="hover:text-primary transition-colors">CONTÁCTENOS</Link></li>
                <li><Link href="/categorias" className="hover:text-primary transition-colors">CATEGORÍAS DE REPUESTOS</Link></li>
              </ul>
              <div className="flex items-center gap-2">
                <a
                  href="https://imbrarepuestos.com/pagos/"
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest px-5 py-1.5 bg-secondary text-white border border-secondary hover:bg-white hover:text-secondary transition-colors"
                >
                  Pagos B2B
                </a>
                <a
                  href="https://tpi.imbrarepuestos.com/imbraweb/"
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest px-5 py-1.5 bg-primary text-white border border-primary hover:bg-white hover:text-primary transition-colors"
                >
                  Imbra Web
                </a>
              </div>
            </div>
          </div>
        </nav>

      </header>

      {/* ── MOBILE DRAWER — premium light sidebar ── */}
      {/* Backdrop */}
      <div
        className={`xl:hidden fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Panel */}
      <div
        ref={sidebarRef}
        onScroll={handleSidebarScroll}
        className={`xl:hidden fixed top-0 left-0 bottom-0 w-[85vw] max-w-[340px] z-[60] bg-white flex flex-col scrollbar-hide transition-transform duration-300 ease-out shadow-2xl ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ overflowY: "auto" }}
      >
        {/* Cabecera Sidebar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
          <Image
            src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png"
            alt="Imbra" width={110} height={44}
            className="h-8 w-auto object-contain"
            unoptimized
          />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-gray-50 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Navegación Principal */}
          <nav className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-1">
              Menú Principal
            </p>
            {[
              { href: "/", label: "Inicio" },
              { href: "/tienda", label: "Tienda Online" },
              { href: "/blog", label: "Blog de Noticias" },
              { href: "/contacto", label: "Contáctenos" },
              { href: "/categorias", label: "Categorías Completas" },
              { href: "/mis-pedidos", label: "Estado de Pedidos" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center justify-between py-4 px-2 text-[13px] font-black text-secondary hover:text-primary uppercase tracking-[0.08em] border-b border-gray-50 last:border-0 transition-colors"
              >
                {label}
                <ChevronRight size={14} className="text-gray-200 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </nav>

          {/* Categorías (Cards Premium) */}
          <div className="px-5 py-6 bg-gray-50/50">
            <div className="flex items-center justify-between mb-5 px-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Directorio de Repuestos
              </p>
              <Link href="/categorias" className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0">Ver todas</Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MEGA_GROUPS.slice(0, 10).map((g) => (
                <Link
                  key={g.id}
                  href={`/tienda?cat=${g.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col gap-3 p-4 bg-white border border-gray-100/80 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.97]"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Image
                      src={g.image} alt=""
                      width={24} height={24}
                      className="w-5 h-5 object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="text-[11px] font-black text-secondary uppercase leading-none tracking-tight">{g.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Ayuda y Soporte */}
          <div className="px-6 py-8 border-t border-gray-100 mt-auto">
            <div className="flex flex-col gap-5">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Atención Directa</p>
                <a
                  href="tel:+573228464800"
                  className="flex items-center gap-3 text-secondary text-[14px] font-black hover:text-primary transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Headphones className="text-primary w-3.5 h-3.5" />
                  </span>
                  (+57) 322 846 4800
                </a>
              </div>

              <a
                href="https://api.whatsapp.com/send?phone=573144693065"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white text-[12px] font-black py-4 uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-emerald-900/10 hover:bg-[#128C7E] transition-all"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                Chatear con técnico
              </a>

              <div className="flex items-center justify-center gap-4 text-[11px] text-black font-black uppercase tracking-widest pt-2">
                <Link href="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link>
                <span className="text-gray-300 font-normal">•</span>
                <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Único de Navegación (Misma posición exacta, máxima estabilidad) */}
        <div
          className="fixed bottom-10 z-[70] transition-all duration-500 pointer-events-none"
          style={{
            left: "clamp(0px, 42.5vw, 170px)",
            transform: `translateX(-50%) ${mobileMenuOpen ? "translateY(0)" : "translateY(40px)"}`,
            opacity: mobileMenuOpen ? 1 : 0
          }}
        >
          <button
            onClick={() => {
              if (sidebarIsAtBottom) scrollSidebar("top");
              else if (sidebarIsAtTop) scrollSidebar("bottom");
            }}
            className={`w-12 h-12 bg-white text-secondary border border-gray-200 rounded-none flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] active:scale-90 transition-all duration-300 pointer-events-auto hover:border-primary hover:text-primary group ${(sidebarIsAtBottom || sidebarIsAtTop)
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-50 translate-y-4 invisible"
              }`}
            aria-label={sidebarIsAtBottom ? "Ir al inicio" : "Ir al final"}
          >
            {sidebarIsAtBottom ? (
              <ArrowUp size={24} className="group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ArrowDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>

      </div>
    </>
  );
}
