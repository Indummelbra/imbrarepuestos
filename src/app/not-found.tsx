import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertCircle, ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center pt-0 pb-24 text-center px-6 relative overflow-hidden">
        
        {/* Background Gráfico (404 marca de agua) */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        >
          <span 
            className="text-[180px] md:text-[300px] font-black text-gray-50 opacity-40" 
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.05em" }}
          >
            404
          </span>
        </div>

        {/* Contenido Principal */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 border border-gray-200">
            <AlertCircle size={32} className="text-primary" />
          </div>

          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-black uppercase text-secondary mb-4 tracking-tighter" 
            style={{ fontFamily: "var(--font-display)" }}
          >
            Error 404
          </h1>
          
          <p 
            className="max-w-lg mx-auto text-gray-500 mb-10 text-sm md:text-base leading-relaxed" 
            style={{ fontFamily: "var(--font-body)" }}
          >
            La ruta o repuesto que estabas buscando no cuadra en nuestro inventario o fue movida a otra categoría. Te sugerimos regresar al camino principal.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/tienda" 
              className="group flex flex-1 sm:flex-none items-center justify-center gap-2 px-8 py-3.5 bg-primary text-black font-black uppercase tracking-widest text-[13px] hover:bg-secondary hover:text-white transition-colors duration-300 w-full sm:w-[220px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Catálogo
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/" 
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-8 py-3.5 border-2 border-gray-200 text-gray-500 font-bold uppercase tracking-widest text-[13px] hover:border-primary hover:text-primary transition-colors duration-300 w-full sm:w-[220px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Home size={15} />
              Inicio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
