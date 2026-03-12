"use client";

export default function Hero() {
  return (
    <section className="px-6 lg:px-8 xl:px-10">
      <main 
        className="relative h-[450px] md:h-[500px] lg:h-[600px] flex items-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      >
        {/* Overlay para asegurar legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent z-0"></div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="w-full md:w-1/2 text-left">
            <span className="inline-block text-primary font-black uppercase tracking-[0.2em] mb-3 text-xs md:text-sm">
              PROMOCIÓN DEL DÍA
            </span>
            <h1 className="mb-4 text-[#212221] leading-tight font-black uppercase tracking-tighter text-4xl md:text-5xl lg:text-7xl text-balance">
              KIT DE <span className="text-primary italic">ARRASTRE</span> <br />
              IMBRA PROFESIONAL
            </h1>
            <p className="text-base md:text-lg text-gray-700 mb-8 font-medium max-w-md">
              Ahorra hasta un 25% en repuestos seleccionados para tu sistema de tracción. Calidad que se siente en cada aceleración.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start md:items-center">
              <button className="bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-wider px-10 h-14 shadow-xl transition-all active:scale-95 flex items-center justify-center group">
                SABER MÁS <span className="material-icons ml-2 text-xl group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest leading-none">
                  VÁLIDO HASTA EL
                </span>
                <span className="text-sm font-black text-gray-900">31/12/2025</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
