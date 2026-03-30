import { getProducts } from "@/lib/woocommerce";
import ProductCard from "./ProductCard";

export default async function ProductShowcase() {
  const products = await getProducts();

  if (!products || products.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="imbra-content-container text-center">
          <h2 className="imbra-h2 mb-4">Nuestros Productos</h2>
          <p className="text-gray-500">No se encontraron productos disponibles en este momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white">
      <div className="imbra-content-container">

        {/* Header */}
        <div className="flex justify-between items-end py-10 px-4 md:px-[40px]">
          <div>
            <h4 className="imbra-label text-primary mb-1">FABRICADOS POR IMBRA</h4>
            <h2 className="imbra-h2">REPUESTOS DE FÁBRICA — LOS MÁS ELEGIDOS</h2>
          </div>
          <a href="/tienda" className="imbra-label text-secondary hover:text-primary transition-colors flex items-center group hidden sm:flex">
            VER CATÁLOGO COMPLETO
            <span className="material-icons ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        </div>

        {/* Grid mosaico — gap-px crea línea de 1px entre cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-white">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
