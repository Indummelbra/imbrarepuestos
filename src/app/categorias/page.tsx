import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoriaGrid from "./CategoriaGrid";
import PageHero from "@/components/ui/PageHero";
import { getWooCategoriesWithCount } from "@/app/actions/vehicle-actions";
import { WOO_CATEGORIES } from "@/lib/woo-categories";

export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  const counts = await getWooCategoriesWithCount();

  // Merge WOO_CATEGORIES (fuente de verdad) con conteos reales de DB
  const categories = WOO_CATEGORIES.map((wc) => ({
    slug: wc.slug,
    name: wc.name,
    icon: wc.icon,
    image: wc.image,
    count: counts.find((c) => c.slug === wc.slug)?.count ?? 0,
  }));

  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <Header />

      <main className="flex-grow pb-20">
        <PageHero
          label="Catálogo completo"
          title="Categorías de"
          titleAccent="Repuestos"
          subtitle={`${categories.length} categorías · ${total.toLocaleString("es-CO")} referencias disponibles`}
          badge={String(categories.length)}
          badgeLabel="Categorías"
        />

        <div className="px-4 md:px-[60px] lg:px-[100px] pt-10">
          <CategoriaGrid categories={categories} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
