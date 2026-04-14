import Link from "next/link";
import Image from "next/image";
import { getProductsByCategory, getFeaturedProducts, getRecentProducts } from "@/lib/woocommerce";
import { Product } from "@/types/product";
import ProductImage from "@/components/common/ProductImage";

interface Props {
  categoriaSlug: string;
  categoriaName: string;
  productoActualSlug: string;
}

/* ─────────────────────────────────────────────────────────────────
   MINI PRODUCT CARD  —  Layout exacto basado en la imagen
───────────────────────────────────────────────────────────────── */
function ProductMiniCard({ product }: { product: Product }) {
  const precio        = parseFloat(product.price || "0");
  const precioRegular = parseFloat(product.regular_price || "0");
  const tieneOferta   = product.on_sale && precioRegular > 0 && precioRegular > precio;
  const descuento     = tieneOferta
    ? Math.round(((precioRegular - precio) / precioRegular) * 100)
    : 0;

  return (
    <div
      className="group relative bg-white border-r border-b border-gray-200 flex flex-col hover:shadow-lg hover:z-10 transition-shadow duration-200"
      style={{ fontSize: "inherit" }}
    >
      {/* ── Área de imagen ─────────────────────────────────────── */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-white"
        style={{ aspectRatio: "1 / 1" }}
      >
        <ProductImage
          src={product.images[0]?.src || "/images/placeholder-imbra.png"}
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge descuento — esquina superior izquierda */}
        {tieneOferta && (
          <span
            className="absolute top-2 left-2 z-10 px-1.5 py-0.5 text-white text-[11px] font-bold"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-display)" }}
          >
            -{descuento}%
          </span>
        )}

        {/* Icono corazón — esquina superior derecha sin caja */}
        <button
          aria-label="Lista de deseos"
          className="absolute top-3 right-3 z-10 p-1 cursor-default text-gray-600 hover:text-primary transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </Link>

      {/* ── Info del producto ──────────────────────────────────── */}
      <div className="px-4 pt-3 pb-5 flex flex-col flex-1">
        
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="text-[18px] font-black"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            ${precio.toLocaleString("es-CO")}
          </span>
          {tieneOferta && (
            <span
              className="text-[13px] font-medium text-gray-400 line-through"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ${precioRegular.toLocaleString("es-CO")}
            </span>
          )}
        </div>

        {/* Nombre */}
        <Link href={`/product/${product.slug}`}>
          <p
            className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-primary transition-colors mb-1.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {product.name}
          </p>
        </Link>

        {/* Categorías */}
        <p
          className="text-[11px] text-gray-500 leading-tight line-clamp-1 mb-2.5"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {product.categories.map((c) => c.name).join(", ") || "Sin categoría"}
        </p>

        {/* Estrellas doradas */}
        <div className="flex items-center gap-0.5 mt-auto">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="11" height="11" viewBox="0 0 12 12">
              <path
                d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 7.82l-2.78 1.73.53-3.09L1.5 4.27l3.11-.45z"
                fill={i < 4 ? "#fbbf24" : "#e5e7eb"}
              />
            </svg>
          ))}
          <span className="text-[11px] text-gray-400 ml-1.5" style={{ fontFamily: "var(--font-body)" }}>
            (5)
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BLOQUE DE GRUPO (título + 4 cards pegadas simulando tabla)
───────────────────────────────────────────────────────────────── */
function ProductGroup({
  titulo,
  productos,
}: {
  titulo: string;
  productos: Product[];
}) {
  return (
    <div className="flex-1 min-w-0">
      {/* Encabezado del grupo */}
      <h2
        className="text-[20px] lg:text-[22px] font-bold text-gray-900 mb-4 tracking-tight uppercase"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {titulo}
      </h2>

      {/* Grid: bg-white + border top/left, y las cards cierran el bottom/right */}
      <div className="grid grid-cols-2 xl:grid-cols-4 bg-white border-l border-t border-gray-200">
        {productos.map((p) => (
          <ProductMiniCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────────────── */
export default async function ProductRelatedSection({
  categoriaSlug,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  categoriaName,
  productoActualSlug,
}: Props) {
  const [relacionados, destacadosInit] = await Promise.all([
    getProductsByCategory(categoriaSlug, 20),
    getFeaturedProducts(12),
  ]);
  let destacados = destacadosInit;

  // Fallback para destacados
  if (!destacados || destacados.length === 0) {
    destacados = await getRecentProducts(12);
  }

  // Barajar array de forma aleatoria (Fisher-Yates)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Filtrar el producto actual y mezclar el resultado para obtener 4 aleatorios
  const relacionadosFiltrados = shuffleArray(
    relacionados.filter((p) => p.slug !== productoActualSlug)
  ).slice(0, 4);

  const destacadosAleatorios = shuffleArray(destacados).slice(0, 4);

  const tieneRelacionados = relacionadosFiltrados.length > 0;
  const tieneDestacados = destacadosAleatorios.length > 0;

  if (!tieneRelacionados && !tieneDestacados) return null;

  return (
    <section className="py-12" style={{ backgroundColor: "#f4f4f2" }}>
      <div className="imbra-content-container">

        {/* Contenedor principal de 2 columnas (2 divs internos) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full max-w-[1600px] mx-auto">

          {/* ── DIV INTERNO 1: Productos Relacionados ─────── */}
          <div>
            {tieneRelacionados && (
              <ProductGroup
                titulo="Productos Relacionados"
                productos={relacionadosFiltrados}
              />
            )}
          </div>

          {/* ── DIV INTERNO 2: Productos Destacados ──────── */}
          <div>
            {tieneDestacados && (
              <ProductGroup
                titulo="Productos Destacados"
                productos={destacadosAleatorios}
              />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
