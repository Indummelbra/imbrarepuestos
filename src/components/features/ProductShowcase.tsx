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
    <section className="py-20 bg-gray-50">
      <div className="imbra-content-container">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h4 className="imbra-label text-primary mb-2">CALIDAD GARANTIZADA</h4>
            <h2 className="imbra-h2">PRODUCTOS DESTACADOS</h2>
          </div>
          <button className="imbra-label text-secondary hover:text-primary transition-colors flex items-center group">
            VER TODOS LOS PRODUCTOS 
            <span className="material-icons ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
