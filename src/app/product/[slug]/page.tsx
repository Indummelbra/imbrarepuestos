import { getProductBySlug, getAdjacentProductsInCategory, getRecentProducts } from "@/lib/woocommerce";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductCTAPanel from "@/components/product/ProductCTAPanel";
import ProductSidebar from "@/components/product/ProductSidebar";
import ProductTabsSection from "@/components/product/ProductTabsSection";
import ProductRelatedSection from "@/components/product/ProductRelatedSection";
import ProductBenefitsBar from "@/components/product/ProductBenefitsBar";
import StickyCartBar from "@/components/product/StickyCartBar";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Tag, Truck } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  /* Carga paralela: producto actual + últimos productos + navegación por categoría */
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoriaSlug = product.categories[0]?.slug || "";

  const [adyacentes] = await Promise.all([
    categoriaSlug ? getAdjacentProductsInCategory(slug, categoriaSlug) : Promise.resolve({ prev: null, next: null }),
    getRecentProducts(5),
  ]);

  const descuento = product.on_sale
    ? Math.round(
        ((parseFloat(product.regular_price) - parseFloat(product.price)) /
          parseFloat(product.regular_price)) *
          100
      )
    : 0;

  const hayStock =
    product.stock_status === "instock" && product.stock_quantity > 0;

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <Header />

      <main className="flex-grow pt-0 overflow-x-hidden">

        {/* ─── BREADCRUMB + NAVEGACION PREV/NEXT ─────────────────── */}
        <div className="bg-[#212221] border-b border-white/10">
          <div className="imbra-content-container">
            <div className="py-2.5 flex items-center justify-between gap-4">
              {/* Breadcrumb */}
              <nav
                className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.15em] uppercase text-primary overflow-hidden"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <Link href="/" className="hover:text-primary/70 transition-colors shrink-0">
                  INICIO
                </Link>
                <ChevronRight size={10} className="text-white shrink-0" />
                {product.categories[0] && (
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Link
                      href={`/tienda?woo_cat=${product.categories[0].slug}`}
                      className="hover:text-primary/70 transition-colors truncate"
                    >
                      {product.categories[0].name.toUpperCase()}
                    </Link>
                    <ChevronRight size={10} className="text-white shrink-0" />
                  </div>
                )}
                <span className="text-primary truncate font-black">
                  {product.name.toUpperCase()}
                </span>
              </nav>

              {/* Navegacion entre productos (Solo Desktop o compacta) */}
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                {adyacentes.prev ? (
                  <Link
                    href={`/product/${adyacentes.prev.slug}`}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white hover:text-primary transition-colors group"
                    title={adyacentes.prev.name}
                  >
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    ANT
                  </Link>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
                    <ChevronLeft size={14} />
                    ANT
                  </span>
                )}
                <span className="text-white">|</span>
                {adyacentes.next ? (
                  <Link
                    href={`/product/${adyacentes.next.slug}`}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white hover:text-primary transition-colors group"
                    title={adyacentes.next.name}
                  >
                    SIG
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
                    SIG
                    <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── LAYOUT PRINCIPAL ────────────────────────────────────── */}
        <section className="py-8 lg:py-14">
          <div className="imbra-content-container">
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-12">

              {/* COLUMNA 1: Sidebar de últimos productos (Solo Desktop) */}
              <ProductSidebar />

              {/* COLUMNA 2: Galería de imágenes */}
              <div className="w-full xl:w-[450px] shrink-0">
                <ProductGallery
                  images={product.images}
                  productName={product.name}
                  discount={descuento}
                  onSale={product.on_sale}
                />
              </div>

              {/* COLUMNA 3: Información del producto */}
              <div className="flex-1 min-w-0">

                {/* ─── Breadcrumbs ─── */}
                <nav className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ fontFamily: "var(--font-display)" }}>
                  <Link href="/" className="hover:text-primary transition-colors">INICIO</Link>
                  <span className="text-gray-300">/</span>
                  <Link href="/tienda" className="hover:text-primary transition-colors">TIENDA</Link>
                  {product.categories[0] && (
                    <>
                      <span className="text-gray-300">/</span>
                      <Link href={`/tienda?woo_cat=${product.categories[0].slug}`} className="hover:text-primary transition-colors line-clamp-1">
                        {product.categories[0].name}
                      </Link>
                    </>
                  )}
                </nav>

                {/* Estado de inventario */}
                <div className="flex items-center gap-2 mb-5">
                  {hayStock ? (
                    <>
                      <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                      <span
                        className="text-[11px] font-black uppercase tracking-widest text-green-600"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        DISPONIBLE PARA ENVÍO
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-red-400 shrink-0" />
                      <span
                        className="text-[11px] font-black uppercase tracking-widest text-red-500"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        TEMPORALMENTE AGOTADO
                      </span>
                    </>
                  )}
                </div>

                {/* Nombre del producto — primeros 62 chars en grande, el resto en subtítulo separado */}
                <h1
                  className="font-black uppercase text-secondary mb-3 break-words"
                  style={{ fontFamily: "var(--font-display)", lineHeight: 1 }}
                >
                  {(() => {
                    const LIMITE = 62;
                    const nombre = product.name;
                    if (nombre.length <= LIMITE) {
                      return (
                        <span className="text-3xl xl:text-4xl block break-words">{nombre}</span>
                      );
                    }
                    const parteGrande = nombre.slice(0, LIMITE).trimEnd();
                    const parteChica  = nombre.slice(LIMITE).trimStart();
                    return (
                      <>
                        <span className="text-3xl xl:text-4xl block leading-none break-words">{parteGrande}</span>
                        {/* Separador decorativo + subtítulo */}
                        <span
                          className="block mt-2 pt-2 border-t text-[13px] xl:text-sm font-bold tracking-wider text-gray-400 leading-snug break-words"
                          style={{ borderColor: "var(--color-primary)", fontFamily: "var(--font-body)", textTransform: "uppercase" }}
                        >
                          {parteChica}
                        </span>
                      </>
                    );
                  })()}
                </h1>

                {/* ─── CTA PANEL EN MÓVIL (Inmediatamente abajo del título para conversión rápida) ─── */}
                <div className="block lg:hidden my-6">
                  <ProductCTAPanel product={product} />
                  <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <Truck size={16} className="text-primary" />
                      <span className="text-[8px] font-black text-gray-400 uppercase">Envío Nacional</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle2 size={16} className="text-primary" />
                      <span className="text-[8px] font-black text-gray-400 uppercase">Garantía Directa</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Tag size={16} className="text-primary" />
                      <span className="text-[8px] font-black text-gray-400 uppercase">Mejor Precio</span>
                    </div>
                  </div>
                </div>

                {/* Marca / Fabricante */}
                {product.categories[0] && (
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Marca:
                    </span>
                    <Link
                      href={`/tienda?woo_cat=${product.categories[0].slug}`}
                      className="text-[11px] font-black text-primary hover:underline uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Imbra Repuestos
                    </Link>
                  </div>
                )}

                {/* SKU */}
                {product.sku && (
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      SKU:
                    </span>
                    <span
                      className="text-[11px] font-black text-primary uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {product.sku}
                    </span>
                  </div>
                )}

                {/* Separador */}
                <div className="h-px bg-gray-100 mb-8" />

                {/* Descripción corta */}
                {(product.short_description || product.description) && (
                  <div
                    className="prose prose-sm max-w-none mb-6"
                    style={{ textAlign: "justify", lineHeight: "1.75", color: "#4b5563" }}
                    dangerouslySetInnerHTML={{
                      __html: product.short_description || product.description,
                    }}
                  />
                )}

                {/* Características del producto (atributos) */}
                {product.attributes.length > 0 && (
                  <div className="mb-6">
                    <h3
                      className="text-[11px] font-black uppercase tracking-widest text-secondary mb-3"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      ESPECIFICACIONES PRINCIPALES
                    </h3>
                    <ul className="space-y-1.5">
                      {product.attributes.map((attr, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-[12px] text-gray-600"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          <span className="text-gray-300 mt-0.5 shrink-0">·</span>
                          <span>
                            <span className="font-bold text-secondary">{attr.name}:</span>{" "}
                            {attr.options.join(", ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Separador */}
                <div className="h-px bg-gray-100 mb-5" />

                {/* Medios de pago */}
                <div className="mb-5">
                  <img
                    src="https://mkt.imbrarepuestos.com/wp-content/uploads/2026/03/Medios_de_Pago_Imbra_Store_Nuevo.webp"
                    alt="Medios de pago aceptados en Imbra Store"
                    className="w-full max-w-xs h-auto object-contain"
                  />
                </div>

                {/* Separador */}
                <div className="h-px bg-gray-100 mb-4" />

                {/* Categorías y etiquetas */}
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Categorías:
                  </span>
                  {product.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/tienda?woo_cat=${cat.slug}`}
                      className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      <Tag size={9} />
                      {cat.name}
                    </Link>
                  ))}
                </div>

              </div>

              {/* COLUMNA 4: Panel CTA (Solo Desktop) */}
              <div className="hidden lg:block w-[300px] shrink-0 sticky top-10 h-fit">
                <ProductCTAPanel product={product} />
              </div>

            </div>
          </div>
        </section>


        {/* TRIGGER PARA STICKY CART */}
        <div id="sticky-cart-trigger" className="w-full h-px invisible" aria-hidden="true" />

        {/* ─── SECCION 4: TABS CON 3 COLUMNAS ─────────────────────── */}
        <ProductTabsSection
          descripcion={product.description}
          atributos={product.attributes}
        />

        {/* ─── SECCION 5: PRODUCTOS RELACIONADOS + DESTACADOS ────── */}
        <ProductRelatedSection
          categoriaSlug={product.categories[0]?.slug || ""}
          categoriaName={product.categories[0]?.name || "Repuestos"}
          productoActualSlug={product.slug}
        />

        {/* ─── SECCION 6: BARRA DE BENEFICIOS ────────────────────── */}
        <ProductBenefitsBar />

      </main>

      <Footer />
      
      {/* ─── STICKY ADD TO CART BAR ──────────────────────────────── */}
      <StickyCartBar product={product} />
    </div>
  );
}
