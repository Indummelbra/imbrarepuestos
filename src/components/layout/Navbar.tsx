import Link from 'next/link';
import { Menu, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const categories = [
    "TODAS LAS CATEGORÍAS",
    "HERRAMIENTA ESPECIALIZADA",
    "ELÉCTRICOS",
    "DISCOS DE FRENO",
    "MOTOR"
  ];

  return (
    <nav className="w-full bg-white border-b border-zinc-200 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-4">
        <div className="flex gap-8 items-center">
          <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-sm text-sm font-bold hover:bg-brand-yellow hover:text-black transition uppercase">
            <Menu className="w-4 h-4" />
            MENÚ
          </button>
          
          <ul className="flex gap-8 text-xs font-black tracking-widest text-zinc-900">
            {categories.map((cat, i) => (
              <li key={i}>
                <Link href="#" className={`hover:text-brand-yellow transition flex items-center gap-1 ${i === 0 ? 'text-brand-yellow' : ''}`}>
                  {cat}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-6 text-xs font-bold text-zinc-500 uppercase">
          <button className="flex items-center gap-1 hover:text-black transition">
            COP <ChevronDown className="w-3 h-3" />
          </button>
          <button className="flex items-center gap-1 hover:text-black transition">
            ESPAÑOL <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </nav>
  );
}
