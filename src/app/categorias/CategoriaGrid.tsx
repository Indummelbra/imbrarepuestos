"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Filter, ChevronRight, ArrowRight } from "lucide-react";
import { CATEGORY_GROUPS } from "@/lib/woo-categories";

interface CategoryItem {
  slug: string;
  name: string;
  count: number;
  icon?: string;
  image?: string;
}

export default function CategoriaGrid({ categories }: { categories: CategoryItem[] }) {
  const [search, setSearch] = useState("");
  const [soloConStock, setSoloConStock] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const isFiltering = search.length > 0 || soloConStock;

  /* Cuando hay búsqueda activa: flat filtrado */
  const flatFiltered = categories.filter((cat) => {
    const matchName = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchStock = soloConStock ? cat.count > 0 : true;
    return matchName && matchStock;
  });

  /* Grupos con sus categorías (filtradas por grupo activo si aplica) */
  const groups = CATEGORY_GROUPS
    .filter((g) => activeGroup === null || g.id === activeGroup)
    .map((g) => ({
      ...g,
      cats: g.slugs
        .map((slug) => categories.find((c) => c.slug === slug))
        .filter((c): c is CategoryItem => !!c && (!soloConStock || c.count > 0)),
    }))
    .filter((g) => g.cats.length > 0);

  const totalVisible = isFiltering
    ? flatFiltered.length
    : groups.reduce((s, g) => s + g.cats.length, 0);

  return (
    <div>
      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveGroup(null); }}
            placeholder="Buscar categoría..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm text-secondary focus:outline-none focus:border-primary transition-colors bg-white"
          />
        </div>

        <button
          onClick={() => setSoloConStock((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 border text-[11px] font-black uppercase tracking-widest transition-colors ${
            soloConStock
              ? "bg-secondary text-white border-secondary"
              : "border-gray-200 text-gray-500 bg-white hover:border-secondary hover:text-secondary"
          }`}
        >
          <Filter size={13} />
          Solo con productos
        </button>

        <div className="flex items-center text-sm text-gray-400 sm:ml-auto shrink-0">
          <span className="font-black text-secondary">{totalVisible}</span>
          <span className="ml-1">categoría{totalVisible !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* ── Pestañas de grupos (solo cuando no hay búsqueda) ── */}
      {!isFiltering && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveGroup(null)}
            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border transition-colors ${
              activeGroup === null
                ? "bg-secondary text-white border-secondary"
                : "border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary"
            }`}
          >
            Todos
          </button>
          {CATEGORY_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(activeGroup === g.id ? null : g.id)}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 border transition-colors ${
                activeGroup === g.id
                  ? "bg-secondary text-white border-secondary"
                  : "border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary"
              }`}
            >
              <Image src={g.image} alt={g.name} width={14} height={14} className="w-3.5 h-3.5 object-contain" unoptimized />
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Vista: búsqueda activa → flat grid ── */}
      {isFiltering && (
        flatFiltered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flatFiltered.map((cat) => (
              <CategoryCard key={cat.slug} cat={cat} />
            ))}
          </div>
        ) : (
          <Empty />
        )
      )}

      {/* ── Vista: agrupada ── */}
      {!isFiltering && (
        groups.length > 0 ? (
          <div className="flex flex-col gap-14">
            {groups.map((group) => (
              <div key={group.id}>
                {/* Encabezado del grupo */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <Image src={group.image} alt={group.name} width={36} height={36} className="w-9 h-9 object-contain" unoptimized />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Grupo</p>
                    <h2 className="text-lg font-black text-secondary uppercase tracking-tight">{group.name}</h2>
                  </div>
                  <div className="h-px flex-1 bg-gray-100 mx-4" />
                  <Link
                    href={`/tienda?woo_cat=${group.slugs[0]}`}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors shrink-0"
                  >
                    Ver {group.name} <ArrowRight size={11} />
                  </Link>
                </div>

                {/* Cards del grupo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.cats.map((cat) => (
                    <CategoryCard key={cat.slug} cat={cat} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty />
        )
      )}
    </div>
  );
}

/* ── Card individual ── */
function CategoryCard({ cat }: { cat: CategoryItem }) {
  return (
    <div className="group bg-white border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
        {cat.image ? (
          <img
            src={cat.image}
            alt={cat.name}
            className="h-full w-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
            <ChevronRight size={24} className="text-gray-300" />
          </div>
        )}
        <span className="absolute top-3 right-3 bg-white border border-gray-100 text-secondary text-[10px] font-black px-2.5 py-1 shadow-sm">
          {cat.count.toLocaleString("es-CO")} refs.
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-secondary uppercase tracking-tight text-[12px] leading-tight mb-3">
          {cat.name}
        </h3>
        <p className="text-[11px] text-gray-400 mb-4">
          {cat.count > 0
            ? `${cat.count.toLocaleString("es-CO")} producto${cat.count !== 1 ? "s" : ""} disponibles`
            : "Sin productos actualmente"}
        </p>
        <Link
          href={`/tienda?woo_cat=${cat.slug}`}
          className="mt-auto w-full bg-secondary text-white text-[10px] font-black uppercase tracking-widest py-2.5 text-center hover:bg-primary transition-colors flex items-center justify-center gap-2"
        >
          Ver categoría <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="py-24 text-center">
      <p className="text-secondary font-bold text-lg">Sin resultados</p>
      <p className="text-gray-400 text-sm mt-1">Intenta con otro término de búsqueda.</p>
    </div>
  );
}
