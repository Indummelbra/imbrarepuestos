"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "@/lib/wordpress";

interface HeroProps {
  slides: HeroSlide[];
}

export default function Hero({ slides }: HeroProps) {
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drag / swipe
  const dragRef = useRef({ active: false, startX: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  const goTo = useCallback(
    (idx: number) => {
      setActive((idx + slides.length) % slides.length);
      setAnimKey((k) => k + 1);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Autoplay
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(next, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, slides.length]);

  // Swipe
  const onPointerDown = (e: React.PointerEvent) => {
    // No capturar si el clic es sobre un enlace o botón
    if ((e.target as HTMLElement).closest('a, button')) return;
    dragRef.current = { active: true, startX: e.clientX };
    sectionRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    sectionRef.current?.releasePointerCapture(e.pointerId);
    const delta = dragRef.current.startX - e.clientX;
    if (Math.abs(delta) > 50) { if (delta > 0) { next(); } else { prev(); } }
  };

  const slide = slides[active];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="imbra-content-container">
      <div className="relative h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden select-none">

          {/* ── Slides (stack absoluto, crossfade) ── */}
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
            >
              {/* Imagen con zoom Ken Burns */}
              <div
                className="absolute inset-0"
                style={{
                  animation: i === active ? "hero-kenburns 8s ease-out forwards" : "none",
                }}
              >
                <Image
                  src={s.image}
                  alt={s.title.replace(/<[^>]+>/g, "")}
                  fill
                  className="object-cover object-center"
                  priority={i === 0}
                />
              </div>

              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
            </div>
          ))}

          {/* ── Contenido animado (re-monta con animKey) ── */}
          <div
            key={animKey}
            className="relative z-20 h-full flex items-center px-6 md:px-8 xl:px-12"
          >
            <div className="w-full md:w-1/2 text-left pl-3 md:pl-6">

              {/* Etiqueta */}
              {slide.label && (
                <span
                  className="imbra-label-orange mb-4 block"
                  style={{ animation: "hero-fadedown 0.5s ease both" }}
                >
                  {slide.label}
                </span>
              )}

              {/* Título */}
              <h1
                className="imbra-h1 mb-4 text-white text-balance"
                style={{ animation: "hero-fadeup 0.6s 0.15s ease both" }}
                dangerouslySetInnerHTML={{ __html: slide.title }}
              />

              {/* Subtítulo */}
              {slide.excerpt && (
                <p
                  className="imbra-body mb-8 max-w-lg"
                  style={{ animation: "hero-fadeup 0.5s 0.28s ease both", color: "#ffffff" }}
                >
                  {slide.excerpt}
                </p>
              )}

              {/* CTA + nota */}
              <div
                className="flex flex-col sm:flex-row gap-4 items-start md:items-center"
                style={{ animation: "hero-fadeup 0.5s 0.4s ease both" }}
              >
                {slide.ctaText && (
                  <Link
                    href={slide.ctaUrl || "/tienda"}
                    className="bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-wider px-10 h-14 transition-all active:scale-95 flex items-center justify-center group"
                  >
                    {slide.ctaText}
                    <span className="material-icons ml-2 text-xl group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </Link>
                )}
                {slide.note && (
                  <div
                    className="flex flex-col"
                    style={{ animation: "hero-fadein 0.4s 0.5s ease both" }}
                  >
                    <span className="text-[10px] md:text-xs text-white/50 font-bold uppercase tracking-widest leading-none">
                      {slide.note.includes("/") || slide.note.toUpperCase().includes("VÁLIDO")
                        ? slide.note
                        : slide.note}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Flechas (solo si hay más de 1 slide) ── */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Slide anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-primary text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                style={{ opacity: 0.6 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              >
                <span className="material-icons text-lg">chevron_left</span>
              </button>
              <button
                onClick={next}
                aria-label="Siguiente slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-primary text-white flex items-center justify-center transition-all"
                style={{ opacity: 0.6 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              >
                <span className="material-icons text-lg">chevron_right</span>
              </button>
            </>
          )}

          {/* ── Dots ── */}
          {slides.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ir al slide ${i + 1}`}
                  className="transition-all duration-300"
                  style={{
                    width: i === active ? "28px" : "8px",
                    height: "8px",
                    background: i === active ? "var(--color-primary)" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Barra de progreso ── */}
          {slides.length > 1 && !paused && (
            <div
              key={`progress-${animKey}`}
              className="absolute bottom-0 left-0 h-[3px] bg-primary z-30"
              style={{ animation: "hero-progress 6s linear forwards" }}
            />
          )}
        </div>
      </div>

      {/* Keyframes globales inyectados inline */}
      <style>{`
        @keyframes hero-kenburns {
          from { transform: scale(1.06); }
          to   { transform: scale(1.0); }
        }
        @keyframes hero-fadeup {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-fadedown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hero-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
