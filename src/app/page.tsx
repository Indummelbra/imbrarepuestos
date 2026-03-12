import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/features/Hero";
import MotoSelector from "@/components/features/MotoSelector";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <MotoSelector />
        
        {/* Espacio para el Grid de Productos */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight italic">
                REPUESTOS <span className="text-brand-yellow">DESTACADOS</span>
              </h2>
              <div className="h-1 w-20 bg-brand-yellow mt-2" />
            </div>
            <button className="text-zinc-500 font-bold text-xs uppercase hover:text-brand-yellow transition">
              VER TODO EL CATÁLOGO
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Placeholder para productos */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-square bg-zinc-100 mb-4 overflow-hidden relative">
                  <div className="absolute top-4 left-4 bg-brand-yellow text-black text-[10px] font-black px-2 py-1 uppercase">NUEVO</div>
                  <div className="w-full h-full bg-zinc-200 animate-pulse" />
                </div>
                <h3 className="font-bold text-sm uppercase mb-1 group-hover:text-brand-yellow transition">Kit de Arrastre Premium Imbra</h3>
                <p className="text-zinc-500 text-xs mb-2 italic">Categoría: Tracción</p>
                <div className="flex justify-between items-center">
                  <span className="font-black text-lg">$245.000</span>
                  <button className="bg-zinc-900 text-white p-2 rounded-sm hover:bg-brand-yellow hover:text-black transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      {/* Footer Simple */}
      <footer className="bg-zinc-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div>
            <span className="text-xl font-black tracking-tighter uppercase mb-6 block">
              IMBRA<span className="text-brand-yellow">STORE</span>
            </span>
            <p className="text-zinc-500 leading-relaxed">
              Líderes en fabricación y distribución de repuestos para motocicletas con los más altos estándares de calidad industrial.
            </p>
          </div>
          {/* ... más columnas del footer ... */}
        </div>
      </footer>
    </div>
  );
}
