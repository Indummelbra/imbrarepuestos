"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

interface WooCat {
  slug: string;
  name: string;
  count: number;
  icon: string;
}

interface SearchSidebarProps {
  categories: WooCat[];
  priceMin: number;
  priceMax: number;
  activeWooCat: string;
  activeMin: number;
  activeMax: number;
  inStock: boolean;
  onSale: boolean;
}

export default function SearchSidebar({
  categories,
  priceMin,
  priceMax,
  activeWooCat,
  activeMin,
  activeMax,
  inStock,
  onSale,
}: SearchSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localMin, setLocalMin] = useState(activeMin);
  const [localMax, setLocalMax] = useState(activeMax);
  const [isOpen, setIsOpen] = useState(false);

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") params.delete(k);
        else params.set(k, v);
      }
      params.delete("page");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams]
  );

  const toggleWooCat = (slug: string) => {
    push({ woo_cat: activeWooCat === slug ? null : slug });
  };

  const applyPrice = () => {
    push({ min: String(localMin), max: String(localMax) });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["woo_cat", "min", "max", "stock", "sale", "page"].forEach((k) =>
      params.delete(k)
    );
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const hasFilters =
    !!activeWooCat ||
    inStock ||
    onSale ||
    activeMin > priceMin ||
    activeMax < priceMax;

  function renderFilterContent() {
    return (
      <>
        {/* Categorías */}
        {categories.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
              Categoría
            </h3>
            <div className="grid grid-cols-1 gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => toggleWooCat(cat.slug)}
                  className={`group w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-all ${
                    activeWooCat === cat.slug
                      ? "bg-secondary text-white shadow-md shadow-gray-200"
                      : "hover:bg-gray-50 text-secondary hover:text-primary"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    activeWooCat === cat.slug ? "bg-white/10" : "bg-gray-100 group-hover:bg-primary/10"
                  }`}>
                    <span className={`material-icons text-[18px] ${
                      activeWooCat === cat.slug ? "text-white" : "text-primary"
                    }`}>
                      {cat.icon}
                    </span>
                  </div>
                  <span className="text-[12px] font-black flex-1 leading-tight uppercase tracking-tight">
                    {cat.name}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${
                    activeWooCat === cat.slug ? "text-white/50" : "text-gray-300"
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Precio */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
            Rango de Precio
          </h3>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex gap-3 items-center mb-4">
              <div className="flex-1">
                <p className="text-[8px] font-black text-gray-400 mb-1 ml-1 uppercase">Mín</p>
                <input
                  type="number"
                  value={localMin}
                  onChange={(e) => setLocalMin(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 px-3 py-2 text-xs text-secondary font-black focus:outline-none focus:border-primary rounded-lg"
                />
              </div>
              <span className="text-gray-300 text-sm mt-4">–</span>
              <div className="flex-1">
                <p className="text-[8px] font-black text-gray-400 mb-1 ml-1 uppercase">Máx</p>
                <input
                  type="number"
                  value={localMax}
                  onChange={(e) => setLocalMax(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 px-3 py-2 text-xs text-secondary font-black focus:outline-none focus:border-primary rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={applyPrice}
              className="w-full bg-secondary text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-primary transition-colors shadow-sm"
            >
              Aplicar Precio
            </button>
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="space-y-4 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Disponibilidad
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => push({ stock: inStock ? null : "1" })}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                inStock ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-gray-100 text-secondary"
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-wider">Solo en Stock</span>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                inStock ? "bg-primary border-primary" : "border-gray-200"
              }`}>
                {inStock && <span className="material-icons text-white text-[14px]">check</span>}
              </div>
            </button>

            <button 
              onClick={() => push({ sale: onSale ? null : "1" })}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                onSale ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-gray-100 text-secondary"
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-wider">Productos en Oferta</span>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                onSale ? "bg-primary border-primary" : "border-gray-200"
              }`}>
                {onSale && <span className="material-icons text-white text-[14px]">check</span>}
              </div>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <aside
      className={`w-full lg:w-60 shrink-0 transition-opacity ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Disparador de Filtros Móvil - Diseño Flotante/Elegante */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between bg-white border border-gray-100 text-secondary py-4 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-icons text-[18px]">tune</span>
            </div>
            <div className="text-left">
              <span className="text-[11px] font-black uppercase tracking-[0.1em] block leading-none mb-0.5">Filtrar</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{hasFilters ? 'Filtros Activos' : 'Personalizar búsqueda'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasFilters && (
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
            <span className="material-icons text-gray-300 text-[18px]">chevron_right</span>
          </div>
        </button>
      </div>

      {/* ── MOBILE DRAWER PARA FILTROS ── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />
      {/* Panel */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-[85vw] max-w-[340px] z-[110] bg-white flex flex-col transition-transform duration-300 ease-out shadow-2xl ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-[14px] font-black uppercase tracking-widest text-secondary">Filtros Avanzados</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-secondary hover:bg-gray-50 rounded-full transition-all"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide">
          {hasFilters && (
            <button
              onClick={() => {
                clearFilters();
                setIsOpen(false);
              }}
              className="w-full py-3 border border-red-50 text-red-500 bg-red-50/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-colors"
            >
              Limpiar todos los filtros
            </button>
          )}

          {renderFilterContent()}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-secondary text-white py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] shadow-lg shadow-gray-200"
          >
            Ver Resultados
          </button>
        </div>
      </div>

      {/* ── DESKTOP VIEW ── */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-secondary uppercase tracking-tighter text-base">
            Filtros
          </h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary font-bold uppercase tracking-wider hover:underline font-display"
            >
              Limpiar todo
            </button>
          )}
        </div>
        <div className="space-y-6">
          {renderFilterContent()}
        </div>
      </div>
    </aside>
  );
}
