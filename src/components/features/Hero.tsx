"use client";

export default function Hero() {
  return (
    <section className="w-full bg-white overflow-hidden">
      {/* DIV 1: FONDO (Full Width) */}
      
      <div className="imbra-content-container">
        {/* DIV 2: CONTENEDOR (1920px + padding global) */}
        
        <main 
          className="relative h-[450px] md:h-[500px] lg:h-[600px] flex items-center overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        >
          {/* DIV 3: CONTENIDO INTERNO */}
          
          {/* Overlay para asegurar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent z-0"></div>
          
          <div className="relative z-10 w-full pl-4 md:pl-[50px]">
            <div className="w-full md:w-1/2 text-left">
              <span className="imbra-label-orange mb-3">
                PROMOCIÓN DEL DÍA
              </span>
              <h1 className="imbra-h1 mb-4 text-secondary text-balance">
                KIT DE <span className="text-primary italic">ARRASTRE</span> <br />
                IMBRA PROFESIONAL
              </h1>
              <p className="imbra-body mb-8 max-w-lg">
                Descubre nuestra línea de kits de arrastre profesionales. Calidad garantizada para cada kilómetro de tu viaje.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start md:items-center">
                <button className="bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-wider px-10 h-14 transition-all active:scale-95 flex items-center justify-center group">
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
      </div>
    </section>
  );
}
