# HOME DESIGN VAULT: Respaldo de Código Visual

Este documento contiene el código limpio de todos los componentes del Home. Úsalo para copiar y pegar la estructura visual en el nuevo proyecto.

---

## 1. Hero.tsx (Cinemático)
```tsx
'use client';
import React from 'react';

const Hero = () => {
    return (
        <section className="bg-white w-full px-[25px] pt-4 md:pt-6">
            <main className="max-w-[1550px] mx-auto relative bg-gray-900 h-[500px] md:h-[600px] lg:h-[650px] flex items-center overflow-hidden shadow-2xl">
                <div className="absolute inset-0 w-full h-full">
                    <img
                        alt="Mecánico trabajando"
                        className="w-full h-full object-cover object-center"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUkG8Ps1iygKD9jih9Sa_Yf3bpyLz3hayDV2Wc1JRXxBTxwcpkEPX8wxWmarJ7aum3D3Ie9vWAYxKqdzDRpIV-o0pnolbFRs6e2_bnsgDv3h1h4p4MFUCaAiXxUROWGeARsbRmmxJzedbX41mPnAsUAQ-vo4-iq02vVo3tJeQfj5kbZzWefMmMkVAtCRtKvVLIjKSgaU7Sed8NoN-hrlYlF1ZtSVkxnLIQLGJ9GEbFHZ1Cm7_dJMKGv50k4SsAHAOEDZvG5hZ9TEU"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/40 to-transparent"></div>
                </div>
                <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
                    <div className="max-w-3xl">
                        <span className="inline-block text-amber-500 font-black uppercase tracking-[0.3em] mb-4 text-xs">COMPRE LO MEJOR</span>
                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.85] mb-6 tracking-tighter uppercase">REPUESTOS <br />& ACCESORIOS</h2>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest mb-6">Calidad Superior - Alto Rendimiento</h3>
                        <button className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-[0.2em] px-10 py-5 rounded-sm transition-all text-xs">VER CATÁLOGO</button>
                    </div>
                </div>
            </main>
        </section>
    );
};
export default Hero;
```

---

## 2. MotoSelector.tsx (Filtro Técnico)
```tsx
'use client';
import React from 'react';

const MotoSelector = () => {
    return (
        <section className="bg-white px-[25px] pb-4">
            <div className="max-w-[1550px] mx-auto bg-[#1a1a1a] text-white flex flex-col lg:flex-row items-center shadow-xl">
                <div className="w-full lg:w-auto flex items-center p-8 border-r border-gray-700/50">
                    <span className="material-icons text-yellow-500 text-3xl">directions_car</span>
                    <div className="flex flex-col ml-4">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Busqueda Técnica</span>
                        <span className="text-base font-black uppercase">Selecciona tu vehículo</span>
                    </div>
                </div>
                <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded flex items-center px-4 py-2.5 h-12">
                            <span className="bg-gray-100 text-gray-400 text-[10px] font-black rounded-full h-5.5 w-5.5 flex items-center justify-center mr-3 border border-gray-200">{i}</span>
                            <select className="w-full bg-transparent text-gray-800 text-xs font-bold appearance-none uppercase">
                                <option>Elegir...</option>
                            </select>
                            <span className="material-icons text-gray-400">expand_more</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 lg:pr-6">
                    <button className="bg-amber-500 text-black font-black px-8 h-12 rounded-sm text-xs tracking-widest">GO</button>
                </div>
            </div>
        </section>
    );
};
export default MotoSelector;
```

---

## 3. CategoryCarousel.tsx
```tsx
'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryCarousel = () => {
    return (
        <div className="py-12 bg-white px-4">
            <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto scrollbar-hide">
                {/* Repetir estructura de categoría según blueprint */}
                <div className="flex-none w-40 flex flex-col items-center group cursor-pointer">
                    <div className="w-32 h-32 mb-4 bg-gray-50 rounded-lg p-4 group-hover:scale-105 transition-transform flex items-center justify-center">
                        <img src="..." className="mix-blend-multiply" />
                    </div>
                    <h3 className="font-bold text-sm uppercase">Categoría</h3>
                </div>
            </div>
        </div>
    );
};
export default CategoryCarousel;
```

---

## 4. PromoGrid.tsx (Ofertas Especiales)
```tsx
'use client';
import React from 'react';
import { ChevronRight } from 'lucide-react';

const PromoGrid = () => {
    return (
        <div className="py-12 bg-white px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card Especializada Amarilla */}
                <div className="bg-[#FFB82B] rounded-xl p-8 min-h-[400px] relative overflow-hidden group">
                    <h2 className="text-4xl font-black uppercase">Herramienta<br />Especializada</h2>
                    <a className="bg-white text-black px-6 py-3 font-bold mt-8 inline-block">COMPRAR AHORA</a>
                </div>
                {/* Card Sistemas de Frenado Negra */}
                <div className="lg:col-span-2 bg-zinc-950 rounded-xl p-8 text-white min-h-[400px]">
                    <h2 className="text-4xl lg:text-5xl font-black uppercase">Sistemas de<br />Frenado</h2>
                </div>
            </div>
        </div>
    );
};
export default PromoGrid;
```

---

## 5. ProductShowcase.tsx (Vitrinas)
```tsx
'use client';
import React from 'react';
import { ChevronRight, Star } from 'lucide-react';

const ProductShowcase = () => {
    return (
        <div className="py-12 bg-white px-4">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Vitrina con Banner Lateral e Items */}
                <div className="w-full lg:w-1/2 flex flex-col md:flex-row border rounded-lg overflow-hidden">
                    <div className="w-full md:w-1/3 bg-black/80 p-6 text-white min-h-[300px]">
                        <h2 className="text-2xl font-bold uppercase">Categoría</h2>
                    </div>
                    <div className="w-full md:w-2/3 grid grid-cols-2">
                        {/* Product Cards Simples */}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProductShowcase;
```

---

## 6. ProfessionalCTA.tsx (Programa Taller)
```tsx
'use client';
import React from 'react';
import { CheckCircle, Wrench } from 'lucide-react';

const ProfessionalCTA = () => {
    return (
        <div className="py-16 bg-white px-4">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center bg-gray-50 p-12 rounded-2xl">
                <div className="w-full lg:w-1/2">
                    <h2 className="text-4xl font-black uppercase mb-4">¿Eres un Profesional?</h2>
                    <p className="text-lg font-bold uppercase mb-8">Únete a nuestro programa exclusivo</p>
                    <button className="bg-yellow-400 px-8 py-4 font-black uppercase">REGÍSTRATE AHORA</button>
                </div>
            </div>
        </div>
    );
};
export default ProfessionalCTA;
```

---

## 7. MarketingBanners.tsx
```tsx
'use client';
import React from 'react';

const MarketingBanners = () => {
    return (
        <div className="py-8 bg-gray-50 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-gray-900 h-[300px] p-8 text-white">
                    <h2 className="text-3xl font-black uppercase text-yellow-400">12 MESES GARANTÍA</h2>
                </div>
                <div className="bg-zinc-900 h-[300px] flex items-center justify-center p-8 text-white text-center">
                    <h2 className="text-4xl font-black uppercase">$50.000 DTO REFIERE AMIGO</h2>
                </div>
            </div>
        </div>
    );
};
export default MarketingBanners;
```

---

## 8. Testimonials.tsx & BenefitsBar
```tsx
'use client';
import React from 'react';
import { Truck, ShieldCheck, History, Award } from 'lucide-react';

const BenefitsBar = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 py-10 border-t">
            {/* Íconos y textos de beneficios */}
        </div>
    );
};

const Testimonials = () => {
    return (
        <div className="py-20 bg-white px-4 text-center">
            <h2 className="text-4xl font-black uppercase mb-4">Lo que dicen nuestros expertos</h2>
            {/* Grid de testimonios */}
            <BenefitsBar />
        </div>
    );
};
export default Testimonials;
```
