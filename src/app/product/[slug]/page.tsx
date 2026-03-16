import { getProductBySlug } from "@/lib/woocommerce";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductActions from "@/components/product/ProductActions";
import ProductShowcase from "@/components/features/ProductShowcase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const discount = product.on_sale 
    ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.price)) / parseFloat(product.regular_price)) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow pt-[200px]">
        {/* Breadcrumbs */}
        <div className="bg-gray-50 py-4 border-b border-gray-100">
          <div className="imbra-content-container">
            <nav className="flex items-center space-x-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
              <Link href="/" className="hover:text-primary transition-colors">INICIO</Link>
              <span className="material-icons text-sm">chevron_right</span>
              <span className="text-gray-600">{product.categories[0]?.name || "PRODUCTOS"}</span>
              <span className="material-icons text-sm">chevron_right</span>
              <span className="text-secondary">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Inner */}
        <section className="py-12 lg:py-20">
          <div className="imbra-content-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
              
              {/* Div 1: Imágenes */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-white border border-gray-100 overflow-hidden group">
                  <Image 
                    src={product.images[0]?.src || "/placeholder.png"} 
                    alt={product.images[0]?.alt || product.name}
                    fill
                    className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.on_sale && (
                    <div className="absolute top-6 left-6 bg-secondary text-white px-3 py-1 font-Archivo font-black text-sm italic tracking-tighter">
                      AHORRA {discount}%
                    </div>
                  )}
                </div>
                
                {/* Miniaturas */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.slice(0, 4).map((img, i) => (
                      <div key={i} className="aspect-square bg-white border border-gray-100 cursor-pointer hover:border-primary transition-colors p-2 relative">
                        <Image 
                          src={img.src} 
                          alt={img.alt || product.name} 
                          fill 
                          className="object-contain p-1" 
                          unoptimized={img.src.includes('.svg')}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Div 2: Info de Producto */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <h4 className="imbra-label text-primary mb-2">COD: {product.sku || "N/A"}</h4>
                  <h1 className="text-4xl lg:text-5xl font-Archivo font-black text-secondary leading-none mb-4 uppercase">
                    {product.name}
                  </h1>
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="flex text-primary">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-icons text-sm">star</span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-400">(15 VALORACIONES)</span>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-gray-50 border-l-4 border-primary">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-4xl font-Archivo font-black text-secondary">
                      ${parseFloat(product.price).toLocaleString('es-CO')}
                    </span>
                    {product.on_sale && (
                      <span className="text-xl font-bold text-gray-400 line-through">
                        ${parseFloat(product.regular_price).toLocaleString('es-CO')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Precios incluyen IVA si aplica</p>
                </div>

                <div className="prose prose-sm text-gray-600 mb-10 max-w-none" 
                     dangerouslySetInnerHTML={{ __html: product.short_description || product.description }} 
                />

                <ProductActions product={product} />

                {/* Tags / Info adicional */}
                <div className="mt-12 pt-8 border-t border-gray-100 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    <span className="text-secondary">CATEGORÍA:</span> {product.categories.map(c => c.name).join(', ')}
                  </p>
                  <div className="flex items-center space-x-6 pt-4">
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-primary">verified_user</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Garantía Original</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-primary">local_shipping</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Envíos a Nivel Nacional</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Tabs / Descripción Larga */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="imbra-content-container">
            <div className="flex space-x-12 border-b border-gray-200 mb-12">
              <button className="pb-4 border-b-2 border-primary font-Archivo font-black text-secondary tracking-widest text-sm uppercase">
                DESCRIPCIÓN TÉCNICA
              </button>
              <button className="pb-4 font-Archivo font-bold text-gray-400 tracking-widest text-sm uppercase hover:text-secondary transition-colors">
                ATRIBUTOS
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 prose prose-sm max-w-none text-gray-600" 
                   dangerouslySetInnerHTML={{ __html: product.description }} 
              />
              <div className="bg-white p-8 border border-gray-200">
                <h5 className="font-Archivo font-black text-secondary mb-6 tracking-widest uppercase">FICHA TÉCNICA</h5>
                <ul className="space-y-4">
                  {product.attributes.map((attr, i) => (
                    <li key={i} className="flex justify-between items-center text-xs pb-2 border-b border-gray-50">
                      <span className="font-bold text-gray-400 uppercase">{attr.name}</span>
                      <span className="font-bold text-secondary uppercase">{attr.options.join(', ')}</span>
                    </li>
                  ))}
                  {product.attributes.length === 0 && (
                    <li className="text-xs text-gray-400 italic">No hay atributos específicos para este producto.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <ProductShowcase />
      </main>

      <Footer />
    </div>
  );
}
