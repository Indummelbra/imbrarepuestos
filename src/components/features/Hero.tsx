import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-[600px] w-full overflow-hidden flex items-center">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop" 
          alt="Mecánico Profesional" 
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 border-l-4 border-brand-yellow pl-4 mb-6">
            <span className="text-zinc-400 text-xs font-black tracking-[0.2em] uppercase">IMBRA PERFORMANCE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6 italic tracking-tight uppercase">
            PASIÓN POR LA <br />
            <span className="text-brand-yellow">PRECISIÓN</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-xl font-medium">
            Más de 50 años liderando el mercado de repuestos. Ingeniería avanzada para el rendimiento extremo de tu motocicleta.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-brand-yellow text-black px-10 py-5 font-black uppercase tracking-wider flex items-center gap-3 hover:bg-white transition group shadow-[0_10px_30px_rgba(255,215,0,0.2)]">
              VER CATÁLOGO 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-zinc-800/80 backdrop-blur-md text-white px-10 py-5 font-black uppercase tracking-wider border border-white/10 hover:bg-white hover:text-black transition">
              PRODUCTOS NUEVOS
            </button>
          </div>
        </div>
      </div>

      {/* Stats / Indicators */}
      <div className="absolute bottom-10 right-10 hidden xl:flex gap-10">
        <div className="flex flex-col">
          <span className="text-3xl font-black text-white">50+</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">AÑOS DE EXPERIENCIA</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black text-white">100k+</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">PIEZAS VENDIDAS</span>
        </div>
      </div>
    </section>
  );
}
