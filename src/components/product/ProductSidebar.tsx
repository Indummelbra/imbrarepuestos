import Link from "next/link";
import { getRecentProducts } from "@/lib/woocommerce";
import ProductImage from "@/components/ui/ProductImage";

/**
 * Sidebar izquierdo de la página de producto.
 * Muestra la lista de los últimos 5 productos ingresados a la tienda.
 */
export default async function ProductSidebar() {
  const productos = await getRecentProducts(5);

  return (
    <aside className="hidden xl:block w-[220px] shrink-0 border-r border-gray-100">
      {/* Encabezado */}
      <div className="px-4 py-5 border-b border-gray-100">
        <h4
          className="text-[11px] font-black tracking-[0.12em] uppercase"
          style={{ color: "var(--color-secondary)", fontFamily: "var(--font-display)" }}
        >
          ULTIMOS PRODUCTOS
        </h4>
      </div>

      {/* Lista de productos */}
      <ul className="divide-y divide-gray-50">
        {productos.map((producto) => (
          <li key={producto.id}>
            <Link
              href={`/product/${producto.slug}`}
              className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors group"
            >
              {/* Miniatura */}
              <div className="relative w-14 h-14 shrink-0 bg-white border border-gray-100 overflow-hidden">
                <ProductImage
                  src={producto.images[0]?.src || "/images/placeholder-imbra.png"}
                  alt={producto.images[0]?.alt || producto.name}
                  fill
                  className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Texto */}
              <div className="min-w-0 flex-1">
                <p
                  className="text-[11px] font-bold leading-tight text-secondary line-clamp-2 group-hover:text-primary transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {producto.name}
                </p>
                <p
                  className="mt-1 text-[13px] font-black"
                  style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}
                >
                  ${parseFloat(producto.price).toLocaleString("es-CO")}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
