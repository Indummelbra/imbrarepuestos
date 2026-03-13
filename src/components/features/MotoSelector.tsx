"use client";

export default function MotoSelector() {
  return (
    <section className="w-full bg-transparent px-3 lg:px-4 xl:px-5 py-0 relative z-20">
      {/* NIVEL 2: Contenedor 1920px con fondo negro imbra (Ahora reducido por el padding del padre) */}
      <div className="max-w-[1920px] mx-auto bg-[#212221] shadow-2xl border border-white/5">

        {/* DIV 3: BLOQUE DE CONTENIDO (Reducido al 80% del Div 2 y centrado) */}
        <div className="max-w-[80%] mx-auto flex flex-col xl:flex-row items-center font-display pt-[32px] pb-[20px] gap-8 xl:gap-6">

          {/* 1. SECCIÓN TÍTULO */}
          <div className="w-full xl:w-auto flex items-center justify-start space-x-4 xl:pr-10 xl:border-r border-white/10 shrink-0">
            <span className="material-icons text-primary text-4xl">two_wheeler</span>
            <div className="flex flex-col text-white min-w-max justify-center">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter leading-none">SELECCIONA</span>
              <span className="text-[10px] md:text-[11px] font-normal uppercase tracking-[0.2em] leading-none text-white/70">TU VEHÍCULO</span>
            </div>
          </div>

          {/* 2. SECCIÓN FILTROS: Los 4 recuadros blancos */}
          <div className="w-full xl:flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xl:gap-3">
            {[
              { label: "Elige Año", step: 1 },
              { label: "Marca", step: 2 },
              { label: "Modelo", step: 3 },
              { label: "Repuesto", step: 4 },
            ].map((item) => (
              <div key={item.step} className="bg-white flex items-center px-4 h-12 rounded-sm shadow-sm group overflow-hidden">
                <span className="text-gray-400 text-[10px] font-black mr-3 border-r border-gray-100 pr-3 min-w-[24px]">
                  0{item.step}
                </span>
                <div className="flex-1 min-w-0">
                  <select className="w-full bg-transparent text-[#212221] text-[12px] font-bold appearance-none border-none focus:ring-0 p-0 cursor-pointer uppercase truncate">
                    <option value="">{item.label}</option>
                  </select>
                </div>
                <span className="material-icons text-gray-400 text-lg group-hover:text-primary transition-colors">keyboard_arrow_down</span>
              </div>
            ))}
          </div>

          {/* 3. SECCIÓN BOTÓN */}
          <div className="w-full xl:w-auto shrink-0">
            <button className="w-full xl:w-[200px] bg-primary hover:bg-orange-600 text-white font-black px-8 h-12 text-sm uppercase flex items-center justify-center transition-all active:scale-95 shadow-lg group">
              BUSCAR <span className="material-icons text-lg ml-2 group-hover:translate-x-1 transition-transform">search</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
