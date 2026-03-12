import Link from 'next/link';
import { Search, ShoppingCart, User, Phone, Menu, Heart } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full bg-white text-black">
      {/* Top Bar */}
      <div className="bg-zinc-100 py-2 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-zinc-600 font-medium">
          <p>BIENVENIDO A IMBRA STORE - REPUESTOS PROFESIONALES</p>
          <div className="flex gap-4">
            <Link href="/catalogo" className="hover:text-brand-yellow transition">CATÁLOGO</Link>
            <Link href="/faq" className="hover:text-brand-yellow transition">FAQ</Link>
            <Link href="/contacto" className="hover:text-brand-yellow transition">CONTACTO</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-brand-yellow p-1 rounded-sm group-hover:rotate-12 transition-transform">
            <Search className="w-6 h-6 text-black" strokeWidth={3} />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            IMBRA<span className="text-brand-yellow">STORE</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex relative">
          <input 
            type="text" 
            placeholder="BUSCAR REPUESTOS O HERRAMIENTAS..." 
            className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-yellow transition"
          />
          <button className="absolute right-0 top-0 h-full px-4 text-zinc-400 hover:text-brand-yellow transition">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">ASISTENCIA</span>
              <span className="text-sm font-black tracking-tight">(+57) 322 846 48 00</span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-zinc-700">
            <button className="relative hover:text-brand-yellow transition group">
              <Heart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">0</span>
            </button>
            <button className="relative hover:text-brand-yellow transition group flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-brand-yellow text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">0</span>
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">MI CARRITO</span>
                <span className="text-sm font-black">$0.00</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
