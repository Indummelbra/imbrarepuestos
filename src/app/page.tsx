import Header from "@/components/layout/Header";
import MotoSelector from "@/components/features/MotoSelector";
import Hero from "@/components/features/Hero";
import CategoryCarousel from "@/components/features/CategoryCarousel";
import ProductShowcase from "@/components/features/ProductShowcase";
import PromoBanners from "@/components/features/PromoBanners";
import ProfessionalCTA from "@/components/features/ProfessionalCTA";
import TestimonialsBenefits from "@/components/features/TestimonialsBenefits";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-[200px] bg-white">
        <MotoSelector />
        <Hero />
        <CategoryCarousel />
        <ProductShowcase />
        <PromoBanners />
        <ProfessionalCTA />
        <TestimonialsBenefits />
      </main>

      <Footer />
    </div>
  );
}
