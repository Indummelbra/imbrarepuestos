"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import LiveSearch from "../search/LiveSearch";
import { useState, useRef, useEffect, useCallback } from "react";
import { WOO_CATEGORIES, CATEGORY_GROUPS } from "@/lib/woo-categories";
import {
  Menu, X, ChevronRight, ChevronDown, ShoppingCart, ArrowRight, ExternalLink, Search
} from "lucide-react";
import { FeaturedCarousel } from "./FeaturedCarousel";

const STICKY_H   = 60;   // px — altura de la barra sticky
const SCROLL_THR = 175;  // px — a partir de cuánto scroll se activa

type MenuPhase = "closed" | "col1" | "full";

export default function StickyHeader({
  onOpenMenu,
  onToggleSearch,
  searchOpen
}: {
  onOpenMenu?: () => void;
  onToggleSearch?: () => void;
  searchOpen?: boolean;
}) {
  const { totalItems, totalPrice, openSidebar } = useCart();

  const [visible,        setVisible]        = useState(false);
  const [menuPhase,      setMenuPhase]       = useState<MenuPhase>("closed");
  const [activeGroup,    setActiveGroup]     = useState("frenos");
  const [menuTop,        setMenuTop]         = useState(STICKY_H);
  const [nosotrosOpen,   setNosotrosOpen]    = useState(false);

  const menuRef       = useRef<HTMLDivElement>(null);
  const menuTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nosotrosTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNosotros  = () => { if (nosotrosTimer.current) clearTimeout(nosotrosTimer.current); setNosotrosOpen(true); };
  const closeNosotros = () => { nosotrosTimer.current = setTimeout(() => setNosotrosOpen(false), 200); };

  /* ── Scroll listener ── */
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SCROLL_THR);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Mega menú helpers ── */
  const openMenu = () => {
    if (menuTimer.current) clearTimeout(menuTimer.current);
    if (menuPhase === "closed" && menuRef.current) {
      setMenuTop(menuRef.current.getBoundingClientRect().bottom);
    }
    setMenuPhase((p) => (p === "closed" ? "col1" : p));
  };
  const closeMenu = useCallback(() => {
    menuTimer.current = setTimeout(() => setMenuPhase("closed"), 250);
  }, []);
  const keepMenu = () => { if (menuTimer.current) clearTimeout(menuTimer.current); };
  const closeAll = () => setMenuPhase("closed");

  /* ── Click fuera / ESC ── */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPhase("closed");
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuPhase("closed");
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown",   onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown",   onEsc);
    };
  }, []);

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(totalPrice);

  const currentGroup = CATEGORY_GROUPS.find((g) => g.id === activeGroup)!;
  const currentCats  = WOO_CATEGORIES.filter((c) => currentGroup.slugs.includes(c.slug));

  return (
    <>
    <div
      className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-200 shadow-md"
      style={{
        height:     `${STICKY_H}px`,
        transform:  visible ? "translateY(0)"    : "translateY(-100%)",
        opacity:    visible ? 1                  : 0,
        transition: "transform 400ms ease-in-out, opacity 400ms ease-in-out",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="imbra-content-container h-full">
        {/* ── MOBILE BAR ── */}
        <div className="xl:hidden flex items-center justify-between h-[56px] px-4">
          {/* Logo a la izquierda */}
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png"
              alt="Imbra Repuestos" width={90} height={36}
              className="h-8 w-auto object-contain"
              unoptimized
            />
          </Link>

          {/* Grupo de acciones a la derecha */}
          <div className="flex items-center">
            <button
              onClick={onToggleSearch}
              className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors"
              aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar"}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <button
              onClick={openSidebar}
              className="relative w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute top-2 right-1 bg-primary text-white text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none shadow-sm border border-white">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={onOpenMenu}
              className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors ml-0.5"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ── DESKTOP BAR ── */}
        <div className="hidden xl:flex items-center gap-6 h-full">

          {/* Logo */}
          <Link href="/" onClick={closeAll} className="shrink-0">
            <Image
              src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png"
              alt="Imbra Repuestos" width={110} height={44}
              className="h-8 w-auto object-contain"
              unoptimized
            />
          </Link>

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          {/* Comprar por... + mega menú */}
          <div
            ref={menuRef}
            className="relative shrink-0"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
          >
            <button
              className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-colors group ${
                menuPhase !== "closed" ? "text-primary" : "text-secondary hover:text-primary"
              }`}
              aria-haspopup="true"
              aria-expanded={menuPhase !== "closed"}
            >
              {menuPhase !== "closed"
                ? <X size={15} />
                : <Menu size={15} className="group-hover:scale-110 transition-transform" />
              }
              <span>Comprar por...</span>
            </button>

            {menuPhase !== "closed" && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-30 bg-black/30"
                  style={{ top: `${STICKY_H}px` }}
                  onClick={closeAll}
                />

                {/* Cajón mega menú */}
                <div
                  className="fixed z-40"
                  style={{ top: menuTop, left: "calc(50vw - 650px)" }}
                  onMouseEnter={keepMenu}
                  onMouseLeave={closeMenu}
                >
                  <div
                    className="bg-white shadow-[0_8px_32px_rgba(0,0,0,0.14)] border-t-2 border-primary overflow-hidden transition-all duration-200 flex"
                    style={{
                      width:     menuPhase === "full" ? "1300px" : "270px",
                      minHeight: "460px",
                    }}
                  >
                    {/* Col A: Grupos */}
                    <div className="w-[270px] shrink-0 bg-white border-r border-gray-100 flex flex-col py-2">
                      {CATEGORY_GROUPS.map((g) => {
                        const active = activeGroup === g.id && menuPhase === "full";
                        return (
                          <button
                            key={g.id}
                            onMouseEnter={() => { setActiveGroup(g.id); setMenuPhase("full"); }}
                            className={`flex items-center gap-3 px-5 py-3 w-full text-left transition-colors group/g border-b border-gray-100 ${
                              active ? "bg-gray-50 text-primary" : "text-gray-900 hover:bg-gray-50 hover:text-primary"
                            }`}
                          >
                            <Image
                              src={g.image} alt={g.name}
                              width={30} height={30}
                              className="w-[30px] h-[30px] object-contain shrink-0 opacity-80 group-hover/g:opacity-100 transition-opacity"
                              unoptimized
                            />
                            <span className={`text-[14px] flex-1 transition-colors ${active ? "font-black text-primary" : "font-bold"}`}>
                              {g.name}
                            </span>
                            <ChevronRight
                              size={14}
                              className={`shrink-0 transition-colors ${active ? "text-primary" : "text-gray-300 group-hover/g:text-primary"}`}
                            />
                          </button>
                        );
                      })}
                      <div className="mt-auto px-5 py-3 border-t border-gray-100">
                        <Link
                          href="/categorias" onClick={closeAll}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                        >
                          <ArrowRight size={11} /> Ver todas
                        </Link>
                      </div>
                    </div>

                    {/* Col B + C */}
                    {menuPhase === "full" && (
                      <>
                        {/* Col B: Subcategorías */}
                        <div className="relative flex-1 bg-[#F5F6F8] px-10 py-7 flex flex-col min-w-0 overflow-hidden">
                          <Image
                            src={currentGroup.image} alt=""
                            width={320} height={320}
                            className="absolute bottom-6 right-4 w-[320px] h-[320px] object-contain opacity-10 pointer-events-none select-none"
                            unoptimized
                          />
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
                              <Link
                                key={cat.slug}
                                href={`/tienda?woo_cat=${cat.slug}`}
                                onClick={closeAll}
                                className="group/cat relative flex items-center gap-4 px-4 py-4 bg-white transition-all duration-300 hover:-translate-y-[3px] overflow-hidden"
                                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 18px rgba(0,0,0,0.10)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                              >
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left scale-x-0 group-hover/cat:scale-x-100 transition-transform duration-300" />
                                <div className="w-14 h-14 flex items-center justify-center shrink-0">
                                  {cat.image
                                    ? <Image src={cat.image} alt="" width={48} height={48} className="w-12 h-12 object-contain" unoptimized />
                                    : <ChevronRight size={20} className="text-gray-300" />
                                  }
                                </div>
                                <p className="text-[14px] font-semibold text-gray-700 group-hover/cat:text-primary transition-colors leading-tight">
                                  {cat.name}
                                </p>
                              </Link>
                            ))}
                          </div>
                          <div className="shrink-0 mt-6 -mx-10 -mb-7 px-10 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                            <Link href="/tienda" onClick={closeAll}
                              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                            >
                              <ArrowRight size={11} /> Ir a la tienda
                            </Link>
                            <Link href={`/tienda?woo_cat=${currentCats[0]?.slug ?? ""}`} onClick={closeAll}
                              className="text-[10px] font-bold text-primary hover:text-secondary transition-colors"
                            >
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

          {/* Nav links — ocupa el espacio libre del centro */}
          <nav className="hidden xl:flex flex-1 items-center justify-evenly">
            <Link href="/" className="text-[11px] font-bold uppercase tracking-wider text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/tienda" className="text-[11px] font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
              Tienda
            </Link>
            <Link href="/blog" className="text-[11px] font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
              Blog
            </Link>
            <div className="relative" onMouseEnter={openNosotros} onMouseLeave={closeNosotros}>
              <span className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none transition-colors ${nosotrosOpen ? "text-primary" : "text-secondary hover:text-primary"}`}>
                Nosotros <ChevronDown size={11} />
              </span>
              {nosotrosOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-100 shadow-lg z-50 py-1"
                  onMouseEnter={openNosotros}
                  onMouseLeave={closeNosotros}
                >
                  <Link href="/nosotros" className="block px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">Quiénes somos</Link>
                  <Link href="/equipo" className="block px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">Equipo Internacional</Link>
                  <Link href="/fabricacion" className="block px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">Fabricación de Partes</Link>
                  <a href="https://www.nomina.com.co:8181/KioscoDesignerRHN-war/?grupo=GrupoEmpresarial54" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">
                    Nómina Designer <ExternalLink size={11} className="text-gray-300" />
                  </a>
                  <a href="https://mkt.imbrarepuestos.com/wp-content/uploads/2026/03/REGLAMENTO-INTERNO-.-2022-protected.pdf" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 text-[11px] text-secondary hover:bg-gray-50 hover:text-primary transition-colors">
                    Reglamento Interno <ExternalLink size={11} className="text-gray-300" />
                  </a>
                </div>
              )}
            </div>
            <Link href="/contacto" className="text-[11px] font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
              Contáctenos
            </Link>
          </nav>

          {/* Buscador */}
          <div className="w-[280px] shrink-0">
            <LiveSearch />
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Mis Pedidos */}
            <Link
              href="/mis-pedidos"
              className="hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-primary text-secondary border border-primary hover:bg-secondary hover:text-primary transition-colors"
            >
              <span className="material-icons text-[14px]">receipt_long</span>
              Ver mis pedidos
            </Link>

            {/* Pagar */}
            <a
              href="https://imbrarepuestos.com/pagos/"
              target="_blank" rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-secondary text-white border border-secondary hover:bg-white hover:text-secondary transition-colors"
            >
              Pagos B2B
            </a>

            {/* Imbra Web */}
            <a
              href="https://tpi.imbrarepuestos.com/imbraweb/"
              target="_blank" rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-primary text-white border border-primary hover:bg-white hover:text-primary transition-colors"
            >
              Imbra Web
            </a>

            {/* Carrito */}
            <button onClick={openSidebar} className="flex items-center gap-2 group text-gray-900 pl-1">
              <div className="relative">
                <ShoppingCart size={20} className="group-hover:text-primary transition-all" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Carrito</span>
                <span className="text-[12px] font-black text-secondary">{formattedPrice}</span>
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* ── MOBILE SEARCH PANEL (Sticky) ── */}
      <div 
        className={`xl:hidden absolute top-full left-0 w-full bg-gray-50 border-b border-gray-100 transition-all duration-300 z-[45] shadow-md origin-top ${searchOpen ? "opacity-100 scale-y-100 visible py-3 px-4" : "opacity-0 scale-y-0 invisible py-0 px-4"}`}
        style={{ pointerEvents: searchOpen ? "auto" : "none" }}
      >
        <LiveSearch />
      </div>

    </div>
    </>
  );
}
