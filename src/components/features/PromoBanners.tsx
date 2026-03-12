"use client";

import Link from "next/link";

export default function PromoBanners() {
  return (
    <section className="py-12 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-6 lg:px-8 xl:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 h-auto min-h-[500px]">
        {/* Banner 1: Rines (Naranja Corporativo) */}
        <div className="lg:col-span-5 relative group overflow-hidden bg-primary h-[300px] md:h-auto">
          <img 
            src="/banners/rim-yellow.png" 
            alt="Repuestos Originales" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-center items-start z-10">
            <span className="text-secondary font-bold uppercase tracking-widest text-xs mb-2">
              Gran Venta - Hasta 40% Dto
            </span>
            <h3 className="text-secondary">
              REPUESTOS <br /> ORIGINALES
            </h3>
            <p className="text-secondary/80 font-medium mb-8 text-sm md:text-base">
              Trabajamos con las mejores marcas
            </p>
            <Link 
              href="#" 
              className="bg-secondary text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-secondary transition-colors flex items-center group/btn"
            >
              COMPRAR AHORA 
              <span className="material-icons text-sm ml-2 group-hover/btn:translate-x-1 transition-transform">chevron_right</span>
            </Link>
          </div>
        </div>

        {/* Banner 2: Amortiguación (Negro Corporativo) */}
        <div className="lg:col-span-4 relative group overflow-hidden bg-secondary h-[300px] md:h-auto border-l border-white/10">
          <img 
            src="/banners/shock-blue.png" 
            alt="Equipamiento Esencial" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-center items-start z-10 text-white">
            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2">
              El Precio Más Bajo
            </span>
            <h3 className="text-white">
              EQUIPAMIENTO <br /> ESENCIAL
            </h3>
            <p className="text-white/70 font-medium mb-8 text-sm md:text-base">
              Ahorra en más de 80,000 repuestos
            </p>
            <Link 
              href="#" 
              className="bg-primary text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-primary transition-colors flex items-center group/btn"
            >
              COMPRAR AHORA 
              <span className="material-icons text-sm ml-2 group-hover/btn:translate-x-1 transition-transform">chevron_right</span>
            </Link>
          </div>
        </div>

        {/* Banners 3 & 4 (Stacked) */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {/* Banner 3: Llantas */}
          <div className="relative h-1/2 group overflow-hidden bg-primary flex-1 min-h-[250px] border-b border-white/10">
            <img 
              src="/banners/tires-dark.png" 
              alt="Accesorios" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-70 group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-center z-10">
              <h3 className="text-secondary text-2xl md:text-3xl">
                TODO EN REPUESTOS <br /> & ACCESORIOS
              </h3>
              <p className="text-white font-black uppercase text-sm tracking-widest">
                HASTA 25% DTO
              </p>
            </div>
          </div>
          {/* Banner 4: Baterías */}
          <div className="relative h-1/2 group overflow-hidden bg-secondary flex-1 min-h-[250px]">
            <img 
              src="/banners/battery-dark.png" 
              alt="Baterías" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-end text-right z-10 text-white">
              <span className="text-primary font-bold uppercase text-[10px] tracking-[0.2em] mb-2">
                MANTENTE CARGADO
              </span>
              <h3 className="text-white text-2xl md:text-3xl">
                BATERÍAS DE <br /> MÁXIMA CALIDAD
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
