"use client";

export default function MotoSelector() {
  return (
    <section className="px-6 lg:px-8 xl:px-10 mb-0">
      <div className="bg-[#212221] py-3 relative z-20 w-full lg:max-w-[85%] xl:max-w-[70%] mx-auto shadow-2xl">
        <div className="flex flex-col lg:flex-row items-stretch font-display px-6 lg:px-8">
          {/* Label Section */}
          <div className="w-full lg:w-auto flex items-center justify-start space-x-3 py-2 lg:py-0 lg:pr-6">
            <span className="material-icons text-primary text-2xl">two_wheeler</span>
            <div className="flex flex-col text-white">
              <span className="text-xs font-black uppercase tracking-tight leading-none">SELECCIONA</span>
              <span className="text-xs font-normal uppercase tracking-widest leading-none text-white/70">TU VEHÍCULO</span>
            </div>
          </div>

          {/* 4 Steps Section */}
          <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 py-2 lg:py-0">
            {[
              { label: "Elige Año", step: 1 },
              { label: "Marca", step: 2 },
              { label: "Modelo", step: 3 },
              { label: "Repuesto", step: 4 },
            ].map((item) => (
              <div key={item.step} className="bg-white flex items-center px-4 h-12">
                <span className="text-gray-400 text-xs font-bold mr-3 border-r border-gray-200 pr-3">
                  {item.step}
                </span>
                <select className="w-full bg-transparent text-[#212221] text-[13px] font-bold appearance-none border-none focus:ring-0 p-0 cursor-pointer uppercase">
                  <option value="">{item.label}</option>
                </select>
                <span className="material-icons text-gray-400 text-lg pointer-events-none">arrow_drop_down</span>
              </div>
            ))}
          </div>

          {/* Search Button Section */}
          <div className="w-full lg:w-auto mt-2 lg:mt-0 lg:pl-3 flex items-center">
            <button className="w-full lg:w-auto bg-primary hover:bg-orange-600 text-white font-black px-8 h-12 text-sm uppercase flex items-center justify-center transition-all active:scale-95">
              BUSCAR <span className="material-icons text-lg ml-2">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
