import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
        <OrderLookup />
      </main>
      <Footer />
    </div>
  );
}
