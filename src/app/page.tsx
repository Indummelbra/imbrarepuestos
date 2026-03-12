import Header from "@/components/layout/Header";
import MotoSelector from "@/components/features/MotoSelector";
import Hero from "@/components/features/Hero";
import PromoBanners from "@/components/features/PromoBanners";
import ProductCard from "@/components/features/ProductCard";

export default function Home() {
  const featuredProducts = [
    { id: 1, name: "Kit de Arrastre Premium Imbra - Yamaha MT09", category: "Tracción", price: 245000, isNew: true },
    { id: 2, name: "Bujía de Iridio NGK - Honda CBR 600", category: "Motor", price: 85000, isNew: false },
    { id: 3, name: "Pastillas de Freno Sinterizadas - Kawasaki Z900", category: "Frenos", price: 125000, isNew: true },
    { id: 4, name: "Filtro de Aceite K&N - Suzuki GSXR", category: "Mantenimiento", price: 45000, isNew: false },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-[200px] bg-white">
        <MotoSelector />
        <Hero />
        <PromoBanners />
        
        {/* Featured Products Section */}
        <section className="container mx-auto px-6 lg:px-8 xl:px-10 py-20 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <span className="h-[2px] w-8 bg-primary"></span>
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Lo mejor para tu moto</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic text-gray-900 dark:text-white leading-tight">
                REPUESTOS <span className="text-primary">DESTACADOS</span>
              </h2>
            </div>
            <button className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-6 py-3 rounded font-bold text-xs uppercase hover:bg-primary hover:text-white transition-all shadow-sm">
              VER TODO EL CATÁLOGO
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </section>

        {/* Confidence Section (Matching Stitch Aesthetic) */}
        <section className="bg-gray-900 py-16">
          <div className="container mx-auto px-6 lg:px-8 xl:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10 group hover:border-primary/50 transition-colors">
                <span className="material-icons text-primary text-4xl group-hover:scale-110 transition-transform">local_shipping</span>
                <div>
                  <h4 className="text-white font-bold uppercase text-sm">Envíos Nacionales</h4>
                  <p className="text-gray-400 text-xs">A todo el país en 48-72h</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10 group hover:border-primary/50 transition-colors">
                <span className="material-icons text-primary text-4xl group-hover:scale-110 transition-transform">verified_user</span>
                <div>
                  <h4 className="text-white font-bold uppercase text-sm">Compra Segura</h4>
                  <p className="text-gray-400 text-xs">Garantía Certificada Imbra</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 p-6 rounded-lg backdrop-blur-sm border border-white/10 group hover:border-primary/50 transition-colors">
                <span className="material-icons text-primary text-4xl group-hover:scale-110 transition-transform">support_agent</span>
                <div>
                  <h4 className="text-white font-bold uppercase text-sm">Asesoría Técnica</h4>
                  <p className="text-gray-400 text-xs">Expertos en cada pieza</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Industrial */}
      <footer className="bg-[#222222] text-white pt-20 pb-10 border-t-4 border-primary">
        <div className="px-6 lg:px-8 xl:px-10 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="material-icons text-primary text-4xl">build_circle</span>
                <span className="text-2xl font-black tracking-tighter uppercase italic">
                  IMBRA<span className="text-primary">REPUESTOS</span>
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Más de 50 años brindando soluciones de ingeniería para motocicletas. Fabricación propia con tecnología de punta.
              </p>
              <div className="flex space-x-4 text-gray-400">
                <span className="material-icons hover:text-primary cursor-pointer transition-colors">facebook</span>
                <span className="material-icons hover:text-primary cursor-pointer transition-colors">whatsapp</span>
                <span className="material-icons hover:text-primary cursor-pointer transition-colors">email</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-black uppercase text-sm mb-6 border-l-4 border-primary pl-4 italic">Enlaces Rápidos</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="hover:text-primary hover:translate-x-2 transition-all cursor-pointer">Nosotros</li>
                <li className="hover:text-primary hover:translate-x-2 transition-all cursor-pointer">Nuestro Catálogo</li>
                <li className="hover:text-primary hover:translate-x-2 transition-all cursor-pointer">Distribuidores</li>
                <li className="hover:text-primary hover:translate-x-2 transition-all cursor-pointer">Contáctanos</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black uppercase text-sm mb-6 border-l-4 border-primary pl-4 italic">Categorías Populares</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="hover:text-primary hover:translate-x-2 transition-all cursor-pointer">Kits de Arrastre</li>
                <li className="hover:text-primary hover:translate-x-2 transition-all cursor-pointer">Sistemas de Frenos</li>
                <li className="hover:text-primary hover:translate-x-2 transition-all cursor-pointer">Suspensión</li>
                <li className="hover:text-primary hover:translate-x-2 transition-all cursor-pointer">Iluminación LED</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black uppercase text-sm mb-6 border-l-4 border-primary pl-4 italic">Suscríbete</h4>
              <p className="text-gray-400 text-sm mb-4">Recibe nuestras novedades y ofertas exclusivas.</p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Tu correo" 
                  className="bg-white/10 border-none px-4 h-12 flex-1 rounded-l text-sm focus:ring-1 focus:ring-primary outline-none"
                />
                <button className="bg-primary px-4 h-12 rounded-r hover:bg-yellow-600 transition-colors">
                  <span className="material-icons">send</span>
                </button>
              </form>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>© 2026 IMBRA REPUESTOS. TODOS LOS DERECHOS RESERVADOS.</span>
            <div className="flex items-center space-x-6">
              <span className="hover:text-gray-300 cursor-pointer">Políticas de Privacidad</span>
              <span className="hover:text-gray-300 cursor-pointer">Términos y Condiciones</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
