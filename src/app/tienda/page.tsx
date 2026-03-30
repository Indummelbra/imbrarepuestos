import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchSidebar from "./SearchSidebar";
import PageHero from "@/components/ui/PageHero";
import MotoSelector from "@/components/features/MotoSelector";
import ProductCard from "@/components/features/ProductCard";
import {
  getWooCategoriesWithCount,
  getPriceRange,
  searchWithFilters,
} from "@/app/actions/vehicle-actions";
import { WOO_CATEGORIES, CATEGORY_GROUPS, getWooCategoryBySlug } from "@/lib/woo-categories";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SortBy = "name" | "price_asc" | "price_desc";

interface SearchParamsShape {
  brand?: string;
  model?: string;
  year?: string;
  cc?: string;
  cat?: string;
  woo_cat?: string;
  min?: string;
  max?: string;
  stock?: string;
  sale?: string;
  sort?: string;
  page?: string;
  q?: string;
}

interface PageProps {
  searchParams: Promise<SearchParamsShape>;
}

function buildUrl(
  base: Record<string, string | undefined>,
  updates: Record<string, string | null>
) {
  const merged = { ...base, ...updates };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v != null && v !== "") params.set(k, v);
  }
  return `/tienda?${params.toString()}`;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { brand, model, year, cc, cat, woo_cat, min, max, stock, sale, sort, page, q } =
    await searchParams;

  const vehicleFilters = {
    vehicleBrand: brand,
    vehicleModel: model,
    vehicleYear: year ? parseInt(year) : undefined,
    ccClass: cc,
  };

  // cat contiene el id del grupo (ej: "motor", "frenos") que coincide
  // directamente con el campo category_slug en Supabase (IMBRA taxonomy).
  const activeCats = cat ? cat.split(",").filter(Boolean) : [];
  const currentPage = page ? parseInt(page) : 1;
  const sortBy: SortBy = (sort as SortBy) || "name";

  const [wooCounts, priceRange, results] = await Promise.all([
    getWooCategoriesWithCount(),
    getPriceRange(vehicleFilters),
    searchWithFilters({
      filters: {
        ...vehicleFilters,
        categories: activeCats.length ? activeCats : undefined,
        wooCategory: woo_cat,
        priceMin: min ? parseInt(min) : undefined,
        priceMax: max ? parseInt(max) : undefined,
        inStockOnly: stock === "1",
        onSaleOnly: sale === "1",
        query: q,
      },
      page: currentPage,
      perPage: 20,
      sortBy,
    }),
  ]);

  const activeMin = min ? parseInt(min) : priceRange.min;
  const activeMax = max ? parseInt(max) : priceRange.max;

  // Merge WOO_CATEGORIES estáticas con conteos reales de DB
  const categories = WOO_CATEGORIES.map((wc) => ({
    slug: wc.slug,
    name: wc.name,
    icon: wc.icon,
    count: wooCounts.find((c) => c.slug === wc.slug)?.count ?? 0,
  })).filter((c) => c.count > 0);

  const baseParams = { brand, model, year, cc, cat, woo_cat, min, max, stock, sale, sort, q };

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: "name", label: "Nombre A–Z" },
    { value: "price_asc", label: "Menor precio" },
    { value: "price_desc", label: "Mayor precio" },
  ];

  const wooCatMeta = woo_cat ? getWooCategoryBySlug(woo_cat) : null;
  const activeGroupMeta = cat ? CATEGORY_GROUPS.find((g) => g.id === cat) : null;

  const heroTitle = q
    ? `Resultados para`
    : activeGroupMeta
    ? `Repuestos: ${activeGroupMeta.name}`
    : woo_cat
    ? wooCatMeta?.name ?? woo_cat.replace(/-/g, " ").toUpperCase()
    : brand
    ? `Repuestos para ${brand}`
    : "Tienda";

  const heroAccent = q
    ? `"${q}"`
    : brand && !woo_cat && !activeGroupMeta
    ? [cc, model].filter(Boolean).join(" · ") || undefined
    : undefined;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <Header />

      <main className="flex-grow bg-[#F8F7F5] min-h-screen">
        <PageHero
          label={q ? "Búsqueda" : activeGroupMeta ? "Grupo de repuestos" : woo_cat ? "Categoría" : (model || brand) ? "Búsqueda por vehículo" : "Catálogo completo"}
          title={heroTitle}
          titleAccent={heroAccent}
          subtitle={`${results.total.toLocaleString("es-CO")} producto${results.total !== 1 ? "s" : ""} encontrado${results.total !== 1 ? "s" : ""}`}
          badge={results.total.toLocaleString("es-CO")}
          badgeLabel="Productos"
        />

        {/* ── Selector de moto ── */}
        <MotoSelector
          initialCat={cat}
          initialBrand={brand}
          initialCC={cc}
          initialYear={year}
        />

        {/* ── Filtros activos (badges removibles) ── */}
        {(brand || cc || year || cat) && (
          <div className="imbra-content-container">
            <div className="flex flex-wrap items-center gap-2 py-3 px-4 md:px-[40px]">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">
                Filtros activos:
              </span>

              {cat && (
                <Link
                  href={buildUrl(baseParams, { cat: null, page: null })}
                  className="inline-flex items-center gap-1.5 bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-red-600 transition-colors"
                >
                  {CATEGORY_GROUPS.find((g) => g.id === cat)?.name ?? cat}
                  <span className="material-icons text-[12px]">close</span>
                </Link>
              )}
              {brand && (
                <Link
                  href={buildUrl(baseParams, { brand: null, cc: null, year: null, page: null })}
                  className="inline-flex items-center gap-1.5 bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-red-600 transition-colors"
                >
                  {brand}
                  <span className="material-icons text-[12px]">close</span>
                </Link>
              )}
              {cc && (
                <Link
                  href={buildUrl(baseParams, { cc: null, year: null, page: null })}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  {cc}
                  <span className="material-icons text-[12px]">close</span>
                </Link>
              )}
              {year && (
                <Link
                  href={buildUrl(baseParams, { year: null, page: null })}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  {year}
                  <span className="material-icons text-[12px]">close</span>
                </Link>
              )}

              <Link
                href="/tienda"
                className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors underline ml-2"
              >
                Limpiar todo
              </Link>
            </div>
          </div>
        )}

        <div className="px-5 pt-10 flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <SearchSidebar
            categories={categories}
            priceMin={priceRange.min}
            priceMax={priceRange.max}
            activeWooCat={woo_cat ?? ""}
            activeMin={activeMin}
            activeMax={activeMax}
            inStock={stock === "1"}
            onSale={sale === "1"}
          />

          {/* Resultados */}
          <div className="flex-1 min-w-0">
            {/* Barra de ordenamiento */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-400">
                {results.pages > 1
                  ? `Página ${currentPage} de ${results.pages}`
                  : `${results.total} resultado${results.total !== 1 ? "s" : ""}`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider hidden sm:block">
                  Ordenar:
                </span>
                <div className="flex gap-1">
                  {sortOptions.map((opt) => (
                    <Link
                      key={opt.value}
                      href={buildUrl(baseParams, {
                        sort: opt.value,
                        page: null,
                      })}
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                        sortBy === opt.value
                          ? "bg-secondary text-white border-secondary"
                          : "border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {results.products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results.products.map((product) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>

                {/* Paginación */}
                {results.pages > 1 && (
                  <div className="flex justify-center gap-1 mt-12">
                    {currentPage > 1 && (
                      <Link
                        href={buildUrl(baseParams, {
                          page: String(currentPage - 1),
                        })}
                        className="px-4 py-2 border border-gray-200 text-sm font-bold text-secondary hover:border-secondary transition-colors"
                      >
                        ‹ Anterior
                      </Link>
                    )}
                    {Array.from({ length: results.pages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === results.pages ||
                          Math.abs(p - currentPage) <= 2
                      )
                      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                          acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="px-3 py-2 text-gray-400"
                          >
                            …
                          </span>
                        ) : (
                          <Link
                            key={p}
                            href={buildUrl(baseParams, { page: String(p) })}
                            className={`px-4 py-2 border text-sm font-bold transition-colors ${
                              p === currentPage
                                ? "bg-secondary text-white border-secondary"
                                : "border-gray-200 text-secondary hover:border-secondary"
                            }`}
                          >
                            {p}
                          </Link>
                        )
                      )}
                    {currentPage < results.pages && (
                      <Link
                        href={buildUrl(baseParams, {
                          page: String(currentPage + 1),
                        })}
                        className="px-4 py-2 border border-gray-200 text-sm font-bold text-secondary hover:border-secondary transition-colors"
                      >
                        Siguiente ›
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <span className="material-icons text-6xl text-gray-200 mb-4 block">
                  search_off
                </span>
                <h2 className="text-xl font-bold text-secondary mb-2">
                  No encontramos repuestos
                </h2>
                <p className="text-gray-500 text-sm">
                  Intenta ajustando los filtros de búsqueda.
                </p>
                <Link
                  href="/tienda"
                  className="inline-block mt-6 bg-secondary text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-primary transition-colors"
                >
                  Ver todo el catálogo
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
