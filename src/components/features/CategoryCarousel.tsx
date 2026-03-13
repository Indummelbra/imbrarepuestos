"use client";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useRef, useEffect } from "react";

/**
 * CATEGORY CAROUSEL - IMBRA DESIGN SYSTEM
 * Réplica exacta del screenshot proporcionado.
 * 
 * Estructura de 3 Niveles:
 * DIV 1: Full-width section (bg-white)
 * DIV 2: imbra-content-container (Max 1920px, Padding 20px)
 * DIV 3: Flex-scroll horizontal con flechas de navegación
 */

const categories = [
  { id: 1, name: "Sistemas de Suspensión", count: 2, img: "/categories/suspension.png" },
  { id: 2, name: "Eléctricos", count: 6, img: "/categories/electricos.png" },
  { id: 3, name: "Sistemas de Escape", count: 6, img: "/categories/escape.png" },
  { id: 4, name: "Iluminación", count: 6, img: "/categories/iluminacion.png" },
  { id: 5, name: "Filtros", count: 1, img: "/categories/filtros.png" },
  { id: 6, name: "Rines y Llantas", count: 1, img: "/categories/wheels_tires.png" },
  { id: 7, name: "Sistemas de Frenos", count: 2, img: "/categories/frenos.png" },
  { id: 8, name: "Asientos y Partes", count: 8, img: "/categories/asientos.png" },
];

// Triplicamos los items para el efecto infinito real
const infiniteCategories = [...categories, ...categories, ...categories];

export default function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const initScroll = () => {
        // Un tercio exacto del scrollWidth es el inicio del set central
        const itemWidth = container.offsetWidth / 8;
        container.scrollLeft = itemWidth * 8;
      };
      
      // Esperar a que el layout se asiente
      const timer = setTimeout(initScroll, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const itemWidth = container.offsetWidth / 8;
      const step = itemWidth * 2; // Desplazar de 2 en 2
      
      const target = direction === "left" 
        ? container.scrollLeft - step 
        : container.scrollLeft + step;

      container.scrollTo({ left: target, behavior: "smooth" });

      // Reseteo infinito preciso post-animación
      setTimeout(() => {
        const fullSetWidth = itemWidth * 8;
        if (container.scrollLeft >= fullSetWidth * 2) {
          container.scrollLeft = fullSetWidth;
        } else if (container.scrollLeft <= 5) {
          container.scrollLeft = fullSetWidth;
        }
      }, 500);
    }
  };

  return (
    <section className="w-full py-5 bg-white dark:bg-gray-950">
      {/* DIV 1: Fondo Full Width (Section Wrapper) */}
      
      <div className="imbra-content-container">
        {/* DIV 2: Contenedor Maestro (1920px Centrado) */}
        
        <div className="relative py-4 group px-4 md:px-[40px]">
          {/* DIV 3: BLOQUE DE CONTENIDO (Réplica MotoSelector 80% + Navegación) */}

          <button 
            onClick={() => scroll("left")}
            className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all focus:outline-none shadow-lg"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          </button>

          <div 
            ref={scrollRef}
            className="w-full overflow-x-hidden flex items-start justify-start scroll-smooth"
          >
            <div className="flex flex-none w-[300%]">
              {infiniteCategories.map((cat, index) => (
                <Link 
                  href={`/categoria/${cat.id}`} 
                  key={`${cat.id}-${index}`}
                  className="flex-shrink-0 w-[calc(100%/24)] flex flex-col items-center text-center group/item"
                >
                  <div className="w-full aspect-square mb-3 flex items-center justify-center transition-all duration-500 transform group-hover/item:-translate-y-1 relative">
                    <Image 
                      src={cat.img} 
                      alt={cat.name}
                      fill
                      className="object-contain p-4"
                      unoptimized={cat.img.startsWith('/')}
                    />
                  </div>
                                    <span className="imbra-label !text-secondary group-hover:!text-primary transition-colors text-center leading-tight">
                        {cat.name}
                      </span>
                  <p className="text-gray-400 text-[11px] font-normal normal-case text-center">
                    {cat.count} {cat.count === 1 ? 'producto' : 'productos'}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <button 
            onClick={() => scroll("right")}
            className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all focus:outline-none shadow-lg"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </div>
      </div>
    </section>
  );
}
