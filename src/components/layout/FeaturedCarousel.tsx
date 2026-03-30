"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getFeaturedProductsForCarousel } from "@/app/actions/vehicle-actions";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";

interface FeaturedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  regular_price: number;
  on_sale: boolean;
  image_url: string | null;
  part_category: string | null;
}

const DOT_LIMIT = 6;

export function FeaturedCarousel({ onClose }: { onClose: () => void }) {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [current, setCurrent]   = useState(0);
  const [liked, setLiked]       = useState<Set<number>>(new Set());
  const [visible, setVisible]   = useState(true);   // para el fade-in por slide
  const [paused, setPaused]     = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch al montar — usa server action con caché 30min ── */
  useEffect(() => {
    getFeaturedProductsForCarousel().then((data) => {
      if (!data || data.length === 0) return;
      setProducts([...data].sort(() => Math.random() - 0.5));
    });
  }, []);

  /* ── Fade-in al cambiar slide ── */
  const goTo = useCallback((index: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 120);
  }, []);

  const next = useCallback(
    () => goTo((current + 1) % products.length),
    [current, products.length, goTo]
  );
  const prev = () => goTo((current - 1 + products.length) % products.length);

  /* ── Auto-play con pauseOnHover ── */
  useEffect(() => {
    if (products.length < 2 || paused) return;
    timerRef.current = setTimeout(next, 3500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, products.length, next, paused]);

  /* ── Loading skeleton ── */
  if (products.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4 shrink-0">
          <p className="text-[14px] text-gray-900 uppercase tracking-[1px] font-display" style={{ fontWeight: 900 }}>
            Productos Destacados
          </p>
          <div className="mt-1 h-[3px] w-10 bg-primary rounded-full" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="h-[180px] bg-gray-100 animate-pulse" />
          <div className="h-3 bg-gray-100 animate-pulse w-3/4" />
          <div className="h-3 bg-gray-100 animate-pulse w-1/2" />
          <div className="h-3 bg-gray-100 animate-pulse w-1/3" />
        </div>
      </div>
    );
  }

  const product = products[current];

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", minimumFractionDigits: 0,
    }).format(n);

  const dotCount  = Math.min(products.length, DOT_LIMIT);
  const activeDot = Math.floor((current / products.length) * dotCount);

  return (
    <div
      className="h-full flex flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Encabezado ── */}
      <div className="mb-5 shrink-0">
        <p className="text-[14px] text-gray-900 uppercase tracking-[1px] font-display" style={{ fontWeight: 900 }}>
          Productos Destacados
        </p>
        <div className="mt-1 h-[3px] w-10 bg-primary rounded-full" />
      </div>

      {/* ── Card con fade-in ── */}
      <Link
        href={`/product/${product.slug}`}
        onClick={onClose}
        className="group/card flex-1 flex flex-col min-h-0"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {/* Imagen */}
        <div className="relative flex items-center justify-center overflow-hidden" style={{ height: "200px" }}>
          {product.on_sale && (
            <span className="absolute top-0 left-0 z-10 bg-primary text-secondary text-[9px] font-black px-2.5 py-1 uppercase tracking-wider">
              Oferta
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation();
              setLiked((w) => { const n = new Set(w); n.has(product.id) ? n.delete(product.id) : n.add(product.id); return n; });
            }}
            className={`absolute top-1 right-1 z-10 p-1.5 transition-colors ${liked.has(product.id) ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
          >
            <Heart size={16} fill={liked.has(product.id) ? "currentColor" : "none"} />
          </button>
          <img
            src={product.image_url!}
            alt={product.name}
            className="max-h-[185px] max-w-full object-contain group-hover/card:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Info */}
        <div className="pt-4 flex flex-col flex-1">
          {/* Precio primero — más visual */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[20px] font-black text-primary font-display">{fmt(product.price)}</span>
            {product.on_sale && product.regular_price > product.price && (
              <span className="text-[12px] text-gray-400 line-through">{fmt(product.regular_price)}</span>
            )}
          </div>

          {/* Nombre */}
          <p className="text-[14px] font-bold text-gray-900 leading-snug mb-1 font-display"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.name}
          </p>

          {/* Categoría */}
          {product.part_category && (
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">{product.part_category}</p>
          )}

          {/* Estrellas */}
          <div className="flex items-center gap-1 mb-4">
            {[1,2,3,4,5].map((s) => <Star key={s} size={11} className="text-yellow-400" fill="currentColor" />)}
            <span className="text-[10px] text-gray-400 ml-1">(5)</span>
          </div>

          {/* CTA */}
          <div className="mt-auto w-full bg-secondary text-white text-[11px] font-black uppercase tracking-widest py-3 text-center hover:bg-primary transition-colors">
            Ver producto
          </div>
        </div>
      </Link>

      {/* ── Navegación: flechas amarillas + dots ── */}
      <div className="flex items-center justify-between mt-4 shrink-0">
        <button
          onClick={prev}
          className="w-9 h-9 flex items-center justify-center bg-primary text-secondary hover:bg-secondary hover:text-white transition-colors rounded-sm"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(Math.round((i / dotCount) * products.length))}
              style={{
                width: i === activeDot ? "20px" : "7px",
                height: "7px",
                borderRadius: "9999px",
                background: i === activeDot ? "var(--color-primary)" : "#e5e7eb",
                transition: "width 0.35s ease, background 0.35s ease",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-9 h-9 flex items-center justify-center bg-primary text-secondary hover:bg-secondary hover:text-white transition-colors rounded-sm"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
