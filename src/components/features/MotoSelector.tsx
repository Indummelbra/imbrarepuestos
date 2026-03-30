"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bike } from "lucide-react";
import PremiumDropdown from "@/components/ui/PremiumDropdown";
import {
  getVehicleBrands,
  getAvailableCCClasses,
  getAvailableYears,
} from "@/app/actions/vehicle-actions";
import { CATEGORY_GROUPS } from "@/lib/woo-categories";

/**
 * Selector en cascada:
 *   REPUESTO → MARCA → CILINDRADA → AÑO (opcional)
 *
 * Cada dropdown filtra al siguiente usando datos reales de Supabase.
 * Requiere ejecutar primero sql/enrich-products-search.sql en Supabase
 * para tener vehicle_brand y cc_class bien poblados.
 */
interface MotoSelectorProps {
  /** Valores iniciales desde URL params (para pre-rellenar en /tienda) */
  initialCat?: string; // group id, ej: "motor"
  initialBrand?: string;
  initialCC?: string;
  initialYear?: string;
}

export default function MotoSelector({
  initialCat,
  initialBrand,
  initialCC,
  initialYear,
}: MotoSelectorProps = {}) {
  const router = useRouter();

  const groupOptions = CATEGORY_GROUPS.map((g) => g.name);

  const [brands, setBrands] = useState<string[]>([]);
  const [ccList, setCcList] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  // Resolver nombre del grupo desde el id (cat param)
  const initialGroupName = initialCat
    ? CATEGORY_GROUPS.find((g) => g.id === initialCat)?.name ?? ""
    : "";

  const [selectedGroup, setSelectedGroup] = useState(initialGroupName);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand ?? "");
  const [selectedCC, setSelectedCC] = useState(initialCC ?? "");
  const [selectedYear, setSelectedYear] = useState(initialYear ?? "");

  const [loading, setLoading] = useState({
    brands: false,
    cc: false,
    years: false,
  });

  /**
   * El id del grupo seleccionado coincide exactamente con el category_slug
   * almacenado en Supabase (extraído por IMBRA_CATEGORIES taxonomy).
   * Ej: grupo "Motor" → id "motor" → category_slug "motor" en DB.
   */
  const activeGroupId = selectedGroup
    ? CATEGORY_GROUPS.find((g) => g.name === selectedGroup)?.id ?? null
    : null;
  const activeCatFilter = activeGroupId ? [activeGroupId] : undefined;

  /* ── 1. Carga inicial de marcas ── */
  useEffect(() => {
    async function init() {
      setLoading((p) => ({ ...p, brands: true }));
      const list = await getVehicleBrands();
      setBrands(list);
      setLoading((p) => ({ ...p, brands: false }));
    }
    init();
  }, []);

  /* ── 2. Cambio de grupo → recargar marcas filtradas por categoría ── */
  useEffect(() => {
    async function reload() {
      setLoading((p) => ({ ...p, brands: true }));
      const list = await getVehicleBrands(activeCatFilter);
      setBrands(list);
      setSelectedBrand("");
      setSelectedCC("");
      setSelectedYear("");
      setCcList([]);
      setYears([]);
      setLoading((p) => ({ ...p, brands: false }));
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  /* ── 3. Cambio de marca → cilindradas disponibles ── */
  useEffect(() => {
    if (!selectedBrand) {
      setCcList([]);
      setSelectedCC("");
      setSelectedYear("");
      setYears([]);
      return;
    }
    async function reload() {
      setLoading((p) => ({ ...p, cc: true }));
      const list = await getAvailableCCClasses(activeCatFilter, selectedBrand);
      setCcList(list);
      setSelectedCC("");
      setSelectedYear("");
      setYears([]);
      setLoading((p) => ({ ...p, cc: false }));
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand]);

  /* ── 4. Cambio de cilindrada → años disponibles ── */
  useEffect(() => {
    if (!selectedBrand) return;
    async function reload() {
      setLoading((p) => ({ ...p, years: true }));
      const list = await getAvailableYears(
        selectedBrand,
        selectedCC || undefined,
        activeCatFilter
      );
      setYears(list);
      setSelectedYear("");
      setLoading((p) => ({ ...p, years: false }));
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCC, selectedBrand]);

  /* ── Búsqueda ── */
  const handleSearch = () => {
    if (!canSearch) return;
    const params = new URLSearchParams();

    if (activeGroupId) params.set("cat", activeGroupId);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (selectedCC) params.set("cc", selectedCC);
    if (selectedYear) params.set("year", selectedYear);

    router.push(`/tienda?${params.toString()}`);
  };

  const canSearch = !!(selectedGroup || selectedBrand);

  return (
    <section className="relative px-5">
      <div
        className="w-full bg-[#1a1a1a] rounded-[0px] shadow-none"
      >
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 p-5 lg:px-8 lg:py-6">

          {/* Cabezal - Estilo fila industrial */}
          <div className="flex flex-row items-center gap-4 lg:gap-6 shrink-0 w-full lg:w-auto">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-[3px] bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Bike className="w-7 h-7 lg:w-8 lg:h-8 text-primary" strokeWidth={2.5} />
            </div>
            <div className="hidden lg:block w-px h-10 bg-white/10" />
            <div className="text-left">
              <h2 className="text-white text-[16px] lg:text-[14px] font-black leading-tight uppercase tracking-tight">
                Busca tus <span className="text-primary tracking-tighter">REPUESTOS</span>
              </h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">
                Selecciona tu vehículo
              </p>
            </div>
          </div>

          {/* Dropdowns en cascada */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">

            <PremiumDropdown
              number="01"
              options={groupOptions}
              value={selectedGroup}
              onChange={setSelectedGroup}
              placeholder="¿Qué buscas?"
            />

            <PremiumDropdown
              number="02"
              options={brands}
              value={selectedBrand}
              onChange={setSelectedBrand}
              placeholder="Marca"
              loading={loading.brands}
            />

            <PremiumDropdown
              number="03"
              options={ccList}
              value={selectedCC}
              onChange={setSelectedCC}
              placeholder="Cilindrada"
              loading={loading.cc}
              disabled={!selectedBrand}
            />

            <PremiumDropdown
              number="04"
              options={years}
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder="Año"
              loading={loading.years}
              disabled={!selectedBrand}
            />

          </div>

          {/* Botón CTA */}
          <div className="w-full lg:w-[220px] shrink-0 mt-2 lg:mt-0">
            <button
              onClick={handleSearch}
              disabled={!canSearch}
              className="w-full h-[45px] bg-primary hover:bg-[#ff9500] text-secondary font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 rounded-[3px] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Search className="w-5 h-5" strokeWidth={3} />
              BUSCAR
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
