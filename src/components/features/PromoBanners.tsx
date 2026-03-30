import Link from "next/link";
import Image from "next/image";

/**
 * PromoBanners — 4 banners editoriales con links a categorías reales.
 * Layout: [Grande 5col] [Mediano 4col] [2 pequeños apilados 3col]
 *
 * Imágenes → categorías IMBRA:
 *   rim-yellow  → /tienda?cat=ruedas
 *   shock-blue  → /tienda?cat=suspension
 *   tires-dark  → /tienda?cat=ruedas  (cauchos)
 *   battery     → /tienda?cat=electricos
 */
export default function PromoBanners() {
  return (
    <section className="w-full bg-white py-12">
      <div className="imbra-content-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 min-h-[500px]">

          {/* ── Banner 1: Rines y Llantas (grande) ───────────────── */}
          <Link
            href="/tienda?cat=ruedas"
            className="lg:col-span-5 relative group overflow-hidden bg-primary h-[300px] md:h-auto block"
          >
            <Image
              src="/banners/rim-yellow.png"
              alt="Rines y Llantas"
              fill
              className="object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-start z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white mb-2">
                RUEDAS Y LLANTAS
              </span>
              <h3 className="font-black text-white text-3xl md:text-4xl lg:text-5xl uppercase leading-tight mb-4">
                EL AGARRE<br />QUE TU<br />MOTO MERECE
              </h3>
              <p className="text-white text-sm mb-8">
                Rines y cauchos seleccionados para cada terreno y cada moto.
              </p>
              <span className="bg-[#212221] text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-[#212221] transition-all flex items-center gap-2 group-hover:gap-3">
                VER RUEDAS Y LLANTAS
                <span className="material-icons text-sm">chevron_right</span>
              </span>
            </div>
          </Link>

          {/* ── Banner 2: Suspensión (mediano) ───────────────────── */}
          <Link
            href="/tienda?cat=suspension"
            className="lg:col-span-4 relative group overflow-hidden bg-secondary h-[300px] md:h-auto border-l border-white/5 block"
          >
            <Image
              src="/banners/shock-blue.png"
              alt="Kits de Suspensión"
              fill
              className="object-cover mix-blend-multiply opacity-60 group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-start z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                SUSPENSIÓN
              </span>
              <h3 className="font-black text-white text-2xl md:text-3xl lg:text-4xl uppercase leading-tight mb-4">
                VIAJA SIN<br />GOLPES,<br />LLEGA ENTERO
              </h3>
              <p className="text-primary font-bold text-sm mb-8">
                Kits de amortiguación para calles, barrios y carreteras.
              </p>
              <span className="bg-primary text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-primary transition-all flex items-center gap-2 group-hover:gap-3">
                VER SUSPENSIÓN IMBRA
                <span className="material-icons text-sm">chevron_right</span>
              </span>
            </div>
          </Link>

          {/* ── Banners 3 y 4 apilados (columna derecha) ─────────── */}
          <div className="lg:col-span-3 flex flex-col">

            {/* Banner 3: Cauchos */}
            <Link
              href="/tienda?cat=ruedas"
              className="relative flex-1 group overflow-hidden bg-primary min-h-[250px] border-b border-white/10 block"
            >
              <Image
                src="/banners/tires-dark.png"
                alt="Cauchos originales"
                fill
                className="object-cover mix-blend-multiply opacity-70 group-hover:scale-110 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                <h3 className="font-black text-white text-xl md:text-2xl uppercase leading-tight">
                  CAUCHOS<br />QUE NO TE FALLAN
                </h3>
                <span className="text-[10px] font-black text-white uppercase tracking-widest mt-1">
                  VER CAUCHOS →
                </span>
              </div>
            </Link>

            {/* Banner 4: Partes Eléctricas */}
            <Link
              href="/tienda?cat=electricos"
              className="relative flex-1 group overflow-hidden bg-secondary min-h-[250px] block"
            >
              <Image
                src="/banners/battery-dark.png"
                alt="Partes eléctricas"
                fill
                className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-end items-end text-right z-10">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                  ELÉCTRICO
                </span>
                <h3 className="font-black text-white text-xl md:text-2xl uppercase leading-tight">
                  SIN CORTOS,<br />SIN PROBLEMAS
                </h3>
                <span className="text-[10px] font-black text-white uppercase tracking-widest mt-1">
                  VER PARTES ELÉCTRICAS →
                </span>
              </div>
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
