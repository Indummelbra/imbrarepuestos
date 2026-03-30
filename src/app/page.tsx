import Header from "@/components/layout/Header";
export const revalidate = 3600;
import MotoSelector from "@/components/features/MotoSelector";
import Hero from "@/components/features/Hero";
import CategoryCarousel from "@/components/features/CategoryCarousel";
import ProductShowcase from "@/components/features/ProductShowcase";
import PromoBanners from "@/components/features/PromoBanners";
import CategoryProductRows from "@/components/features/CategoryProductRows";
import ProfessionalCTA from "@/components/features/ProfessionalCTA";
import TestimonialsBenefits from "@/components/features/TestimonialsBenefits";
import Footer from "@/components/layout/Footer";
import { getGroupProductCounts } from "@/app/actions/vehicle-actions";
import { getHeroSlides } from "@/lib/wordpress";

interface PageProps {
  searchParams: { cat?: string; brand?: string; cc?: string; year?: string };
}

export default async function Home({ searchParams }: PageProps) {
  const { cat, brand, cc, year } = searchParams;

  const [groupCounts, heroSlides] = await Promise.all([
    getGroupProductCounts(),
    getHeroSlides(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-white pt-0">
        <MotoSelector
          initialCat={cat}
          initialBrand={brand}
          initialCC={cc}
          initialYear={year}
        />
        <Hero slides={heroSlides} />
        <CategoryCarousel groupCounts={groupCounts} />
        <ProductShowcase />
        <PromoBanners />
        <CategoryProductRows />
        <ProfessionalCTA />
        <TestimonialsBenefits />
      </main>

      <Footer />
    </div>
  );
}
