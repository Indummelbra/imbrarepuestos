"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* SECCIÓN 1: TOP BAR */}
      <div className="w-full bg-[#f3f4f6] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        {/* DIV 1: FONDO (Full Width) */}
        
        <div className="imbra-content-container">
          {/* DIV 2: CONTENEDOR (1920px + padding global) */}
          
          <div className="py-2.5 flex justify-between items-center imbra-label">
            {/* DIV 3: CONTENIDO INTERNO */}
            <div> REPUESTOS ORIGINALES · CALIDAD GARANTIZADA </div>
            <div className="flex items-center space-x-6">
              <Link href="#" className="hover:text-primary transition-colors">Catálogo</Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="hover:text-primary transition-colors">Preguntas Frecuentes</Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="hover:text-primary transition-colors">Contáctenos</Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors flex items-center">
                <span className="material-icons text-xs mr-1">person</span>
                Ingresar <span className="mx-1 text-gray-400 font-normal">o</span> Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: MIDDLE BAR */}
      <div className="w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900">
        {/* DIV 1: FONDO (Full Width) */}
        
        <div className="imbra-content-container">
          {/* DIV 2: CONTENEDOR (1920px + padding global) */}
          
          <div className="py-5 flex items-center justify-between gap-8">
            {/* DIV 3: CONTENIDO INTERNO */}
            <div className="flex items-center space-x-10">
              <Link href="/" className="flex items-center group shrink-0">
                <img src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png" alt="Imbra Repuestos" className="h-14 w-auto object-contain dark:brightness-0 dark:invert" />
              </Link>
              <button className="flex items-center space-x-2 text-gray-900 dark:text-white font-bold hover:text-primary transition-colors group">
                <span className="material-icons text-xl group-hover:scale-110 transition-transform">menu</span>
                <span className="imbra-label text-secondary dark:text-white border-b-2 border-transparent group-hover:border-primary pb-0.5">Comprar por...</span>
              </button>
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="relative flex items-center bg-[#f8f9fa] dark:bg-gray-900 rounded-lg group border border-transparent focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                <input className="w-full px-6 py-3.5 bg-transparent text-sm focus:outline-none dark:text-white placeholder:text-gray-400 font-semibold" placeholder="Busca tus repuestos, productos..." type="text" />
                <button className="pr-6 text-gray-400 group-focus-within:text-primary transition-colors">
                  <span className="material-icons text-2xl">search</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-8 shrink-0">
              <div className="hidden xl:flex items-center space-x-3 group cursor-pointer border-r border-gray-100 dark:border-gray-800 pr-8">
                <span className="material-icons text-3xl text-gray-400 group-hover:text-primary transition-colors">headset_mic</span>
                <div className="flex flex-col">
                  <div className="imbra-label !text-[9px] mb-1">
                    Centro de Ayuda <span className="material-icons text-[10px] ml-0.5">expand_more</span>
                  </div>
                  <span className="imbra-h3 !text-sm text-secondary dark:text-white">(+57) 322 846 4800</span>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <Link href="#" className="relative group text-gray-900 dark:text-white">
                  <span className="material-icons text-3xl group-hover:text-primary transition-all">favorite_border</span>
                  <span className="absolute top-0 right-0 bg-[#F18700] rounded-full h-3 w-3 border-2 border-white dark:border-gray-900"></span>
                </Link>
                <Link href="#" className="flex items-center space-x-3 group text-gray-900 dark:text-white">
                  <div className="relative">
                    <span className="material-icons text-3xl group-hover:text-primary transition-all">shopping_cart</span>
                    <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-900">0</span>
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="imbra-label mb-1">Carrito</span>
                    <span className="imbra-price !text-sm">$0.00</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: BOTTOM BAR */}
      <nav className="w-full bg-white dark:bg-gray-950 font-display">
        {/* DIV 1: FONDO (Full Width) */}
        
        <div className="imbra-content-container">
          {/* DIV 2: CONTENEDOR (1920px + padding global) */}
          
          <div className="flex justify-between items-center py-4">
            {/* DIV 3: CONTENIDO INTERNO */}
            <ul className="flex space-x-10 imbra-label !text-[12px] text-secondary dark:text-white">
              <li><Link href="/" className="text-primary hover:text-primary transition-colors flex items-center">INICIO <span className="material-icons text-sm ml-1">expand_more</span></Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center group">TIENDA <span className="material-icons text-sm ml-1 text-gray-400 group-hover:text-primary transition-colors">expand_more</span></Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center group">PRODUCTOS <span className="material-icons text-sm ml-1 text-gray-400 group-hover:text-primary transition-colors">expand_more</span></Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center group">BLOG <span className="material-icons text-sm ml-1 text-gray-400 group-hover:text-primary transition-colors">expand_more</span></Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors flex items-center group">PÁGINAS <span className="material-icons text-sm ml-1 text-gray-400 group-hover:text-primary transition-colors">expand_more</span></Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">CONTACTO</Link></li>
            </ul>
            <div className="flex space-x-8 text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest font-body">
              <button className="flex items-center hover:text-primary transition-colors uppercase"> COP <span className="material-icons text-[10px] ml-1 opacity-50">expand_more</span> </button>
              <button className="flex items-center hover:text-primary transition-colors uppercase"> Español <span className="material-icons text-[10px] ml-1 opacity-50">expand_more</span> </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
