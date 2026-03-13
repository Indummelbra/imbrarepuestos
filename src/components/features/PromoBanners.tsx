"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * PROMOBANNERS - Estructura 3 Niveles
 * DIV 1: Full-width section con fondo adaptable
 * DIV 2: imbra-content-container (Max 1920px centrado)
 * DIV 3: Grid de banners con contenido interno
 */

export default function PromoBanners() {
  return (
    <section className="pt-0 pb-12 bg-white dark:bg-gray-950">
      {/* DIV 1: FONDO (Inherent in section) */}
      
      <div className="imbra-content-container">
        {/* DIV 2: CONTENEDOR (1920px + standard padding) */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 h-auto min-h-[500px]">
          {/* DIV 3: CONTENIDO INTERNO (Banners) */}

          {/* Banner 1: Rines (Naranja Corporativo) */}
          <div className="lg:col-span-5 relative group overflow-hidden bg-primary h-[300px] md:h-auto">
            <Image 
              src="/banners/rim-yellow.png" 
              alt="Repuestos Originales" 
              fill
              className="object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-start z-10">
              <span className="imbra-label !text-white mb-2">
                ¡NUEVA LLEGADA!
              </span>
              <h3 className="imbra-h3 text-white !text-white !text-3xl md:!text-4xl lg:!text-5xl mb-4">
                EXPLORA NUESTROS <br /> RINES REFORZADOS
              </h3>
              <p className="imbra-body !text-white mb-8">
                Calidad superior para cada terreno
              </p>
              <Link 
                href="#" 
                className="bg-secondary !bg-[#212221] text-white !text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white hover:!text-[#212221] transition-all flex items-center group/btn active:scale-95"
              >
                COMPRAR AHORA 
                <span className="material-icons text-sm ml-2 group-hover/btn:translate-x-1 transition-transform">chevron_right</span>
              </Link>
            </div>
          </div>

          {/* Banner 2: Amortiguación (Negro Corporativo) */}
          <div className="lg:col-span-4 relative group overflow-hidden bg-secondary h-[300px] md:h-auto border-l border-white/5">
            <Image 
              src="/banners/shock-blue.png" 
              alt="Equipamiento Esencial" 
              fill
              className="object-cover mix-blend-multiply opacity-60 group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-start z-10">
              <span className="imbra-label-orange mb-2">
                ¡SÓLO ESTA SEMANA!
              </span>
              <h3 className="imbra-h3 text-white !text-white !text-2xl md:!text-3xl lg:!text-4xl mb-4">
                KITS DE <br /> REPARACIÓN
              </h3>
              <p className="imbra-body-bold !text-primary mb-8 !text-sm md:!text-base">
                Mantenimiento profesional al mejor precio
              </p>
              <Link 
                href="#" 
                className="bg-primary !bg-[#F18700] text-white !text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white hover:!text-[#F18700] transition-all flex items-center group/btn active:scale-95"
              >
                COMPRAR AHORA 
                <span className="material-icons text-sm ml-2 group-hover/btn:translate-x-1 transition-transform">chevron_right</span>
              </Link>
            </div>
          </div>

          {/* Banners 3 & 4 (Stacked) */}
          <div className="lg:col-span-3 flex flex-col h-full">
            {/* Banner 3: Llantas */}
            <div className="relative h-1/2 group overflow-hidden bg-primary flex-1 min-h-[250px] border-b border-white/5">
              <Image 
                src="/banners/tires-dark.png" 
                alt="Accesorios" 
                fill
                className="object-cover mix-blend-multiply opacity-70 group-hover:scale-110 transition-transform duration-1000"
                unoptimized
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-center z-10">
                <h3 className="imbra-h3 text-white !text-white !text-xl md:!text-2xl">
                  TODO EN <br /> ACCESORIOS
                </h3>
                <p className="imbra-label !text-white mt-2">
                  HASTA 25% DTO
                </p>
              </div>
            </div>
            {/* Banner 4: Baterías */}
            <div className="relative h-1/2 group overflow-hidden bg-secondary flex-1 min-h-[250px] border-l border-white/5">
              <Image 
                src="/banners/battery-dark.png" 
                alt="Baterías" 
                fill
                className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
                unoptimized
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-center items-end text-right z-10">
                <span className="imbra-label-orange mb-2">
                  MÁXIMA CALIDAD
                </span>
                <h3 className="imbra-h3 text-white !text-white !text-xl md:!text-2xl">
                  BATERÍAS <br /> IMBRA
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
