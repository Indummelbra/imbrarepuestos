import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow">
        {/* Banner de Página */}
        <section className="bg-secondary py-12">
          <div className="imbra-content-container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl lg:text-5xl font-Archivo font-black text-white italic tracking-tighter uppercase leading-none">
                  CASI LISTO — <span className="text-primary text-2xl lg:text-3xl">CONFIRMA TU PEDIDO</span>
                </h1>
                <p className="text-gray-400 text-xs font-bold tracking-[0.3em] mt-2 uppercase">UN PASO MÁS Y TU REPUESTO ESTÁ EN CAMINO</p>
              </div>
              <div className="mt-6 md:mt-0 flex space-x-4">
                 <div className="flex items-center space-x-2 bg-white/5 p-3 px-5 border border-white/10">
                    <span className="material-icons text-primary text-xl">lock</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">SEGURIDAD<br/>ENCRIPTADA</span>
                 </div>
                 <div className="flex items-center space-x-2 bg-white/5 p-3 px-5 border border-white/10">
                    <span className="material-icons text-primary text-xl">verified</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">REPUESTOS<br/>100% ORIGINALES</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32">
          <div className="imbra-content-container">
             <CheckoutForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
