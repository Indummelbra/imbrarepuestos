import { Bike, ChevronRight } from 'lucide-react';

export default function MotoSelector() {
  return (
    <section className="w-full bg-zinc-900 border-b border-zinc-800 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch">
        {/* Title */}
        <div className="bg-black/40 px-8 py-6 flex items-center gap-4 border-r border-zinc-800">
          <Bike className="w-8 h-8 text-brand-yellow" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SELECCIONA</span>
            <span className="text-lg font-black text-white uppercase leading-none">TU MOTO</span>
          </div>
        </div>

        {/* Selectors */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 lg:px-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="bg-white rounded-sm flex items-center px-4 h-12 shadow-inner group">
              <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center mr-3 group-hover:bg-brand-yellow group-hover:text-black transition">
                {step}
              </span>
              <select className="w-full bg-transparent text-sm font-bold text-zinc-900 focus:outline-none cursor-pointer appearance-none">
                <option value="">{['AÑO', 'MARCA', 'MODELO', 'REPUESTO'][step - 1]}</option>
              </select>
              <ChevronRight className="w-4 h-4 text-zinc-300 rotate-90" />
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="p-4 lg:p-0 lg:pr-6 flex items-center">
          <button className="w-full lg:w-auto bg-brand-yellow text-black font-black px-12 h-12 text-sm uppercase flex items-center justify-center gap-2 hover:bg-white transition shadow-xl">
            BUSCAR <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
