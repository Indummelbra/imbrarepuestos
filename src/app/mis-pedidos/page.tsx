import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/ui/PageHero";
import OrderLookup from "./OrderLookup";

export const metadata = {
  title: "Mis Pedidos — IMBRA Repuestos",
  description: "Consulta el estado de tus pedidos e información de envío sin necesidad de crear una cuenta.",
};

export default function MisPedidosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-[#F8F7F5] min-h-screen">
        <PageHero
          label="Tu cuenta"
          title="Mis"
          titleAccent="Pedidos"
          subtitle="Consulta el estado de tus pedidos sin necesidad de crear una cuenta"
        />
        <div className="px-5 pt-10 pb-20">
          <OrderLookup />
        </div>
      </main>
      <Footer />
    </div>
  );
}
