"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { CATEGORY_GROUPS } from "@/lib/woo-categories";

interface Props {
  groupCounts: Record<string, number>;
}

export default function CategoryCarousel({ groupCounts }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [visible, setVisible] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisible(w < 640 ? 3 : w < 1024 ? 5 : 8);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Construir items con conteos reales de Supabase
  const items = CATEGORY_GROUPS.map((g) => ({
    id:    g.id,
    name:  g.name,
    image: g.image,
    count: groupCounts[g.id] ?? 0,
    href:  `/tienda?cat=${g.id}`,
  }));

  // Triplicar para scroll infinito
  const infinite = [...items, ...items, ...items];
  const N = items.length; // 10

  // Posicionar al inicio del set central
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      const itemW = el.offsetWidth / visible;
      el.scrollLeft = itemW * N;
    }, 80);
    return () => clearTimeout(timer);
  }, [N, visible]);

  // Auto-scroll cada 3s
  useEffect(() => {
    autoRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const itemW = el.offsetWidth / visible;
      el.scrollTo({ left: el.scrollLeft + itemW, behavior: "smooth" });
      setTimeout(() => {
        if (!el) return;
        const setW = itemW * N;
        if (el.scrollLeft >= setW * 2) el.scrollLeft = setW;
      }, 420);
    }, 3000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [visible, N]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // Pausar auto-scroll al interactuar manualmente
    if (autoRef.current) clearInterval(autoRef.current);
    const itemW = el.offsetWidth / visible;
    const step  = itemW * 2;
    el.scrollTo({ left: el.scrollLeft + (dir === "right" ? step : -step), behavior: "smooth" });

    setTimeout(() => {
      const setW = itemW * N;
      if (el.scrollLeft >= setW * 2) el.scrollLeft = setW;
      else if (el.scrollLeft <= 4)   el.scrollLeft = setW;
      // Reanudar auto-scroll después de 5s
      autoRef.current = setInterval(() => {
        const el2 = scrollRef.current;
        if (!el2) return;
        const iW = el2.offsetWidth / visible;
        el2.scrollTo({ left: el2.scrollLeft + iW, behavior: "smooth" });
        setTimeout(() => {
          if (!el2) return;
          const sW = iW * N;
          if (el2.scrollLeft >= sW * 2) el2.scrollLeft = sW;
        }, 420);
      }, 3000);
    }, 420);
  };

  return (
    <section className="w-full py-5 bg-white">
      <div className="imbra-content-container">
        <div className="relative py-4 px-8 md:px-[40px] group">

          {/* Flecha izquierda */}
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="absolute left-0 md:left-8 top-1/2 -translate-y-1/2 z-30 w-7 h-7 md:w-10 md:h-10 bg-white/90 md:bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all"
          >
            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
          </button>

          {/* Track */}
          <div
            ref={scrollRef}
            className="w-full overflow-x-hidden flex items-start scroll-smooth"
          >
            <div className="flex flex-none w-[300%]">
              {infinite.map((cat, idx) => (
                <Link
                  key={`${cat.id}-${idx}`}
                  href={cat.href}
                  className="flex-shrink-0 flex flex-col items-center text-center group/item px-2"
                  style={{ width: `calc(100% / ${visible * 3})` }}
                >
                  {/* Imagen */}
                  <div className="relative w-full aspect-square mb-3 transition-transform duration-300 group-hover/item:-translate-y-1">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain p-3"
                      unoptimized
                    />
                  </div>

                  {/* Nombre */}
                  <span className="text-[11px] font-black uppercase tracking-tight text-secondary group-hover/item:text-primary transition-colors leading-tight">
                    {cat.name}
                  </span>

                  {/* Conteo */}
                  {cat.count > 0 && (
                    <p className="text-gray-400 text-[10px] font-normal mt-0.5">
                      {cat.count.toLocaleString("es-CO")}{" "}
                      {cat.count === 1 ? "producto" : "productos"}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Flecha derecha */}
          <button
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            className="absolute right-0 md:right-8 top-1/2 -translate-y-1/2 z-30 w-7 h-7 md:w-10 md:h-10 bg-white/90 md:bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all"
          >
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>

        </div>
      </div>
    </section>
  );
}
