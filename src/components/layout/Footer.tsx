"use client";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram, faPinterestP } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faHeadset, faClock, faMap, faChevronRight } from "@fortawesome/free-solid-svg-icons";

/**
 * FOOTER COMPONENT - IMBRA DESIGN SYSTEM
 * 
 * Estructura de 3 Niveles:
 * DIV 1: Full-width background (#1a1c1e)
 * DIV 2: imbra-content-container (Centered, max-width 1920px)
 * DIV 3: Contenido asimétrico corregido (Títulos proporcionales + Iconos Modernos)
 */

export default function Footer() {
  return (
    <footer className="bg-[#1a1c1e] text-white pt-16 pb-8 border-t border-gray-800 font-sans">
      <div className="imbra-content-container">
        <div className="flex flex-col lg:flex-row justify-between mb-12 gap-8 lg:gap-16">
          
          {/* COLUMNA MARCA (Izquierda - 1/4) */}
          <div className="lg:w-1/4 lg:pr-12 lg:border-r border-gray-700">
            <Link href="/" className="flex items-center group mb-8">
              <Image 
                src="https://mkt.imbrarepuestos.com/wp-content/uploads/2026/04/Logo-Imbra-Footer.png" 
                alt="Imbra Repuestos" 
                width={120}
                height={48}
                className="h-12 w-auto object-contain"
                style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                unoptimized
              />
            </Link>
            
            <p className="!text-white text-sm leading-relaxed mb-10">
              Indummelbra S.A.S. cuenta con 50 años de experiencia en la manufactura de repuestos y herramientas para motocicletas en Colombia y Centroamérica.
            </p>
            
            {/* Feedback Box */}
            <div className="flex items-start">
              <div className="relative mr-4 mt-1">
                <span className="material-icons text-gray-500 text-4xl">chat_bubble_outline</span>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#F18700] rounded-full border-2 border-[#1a1c1e]"></div>
              </div>
              <div>
                <h4 className="text-[#F18700] text-sm font-bold mb-1">Feedback</h4>
                <p className="text-gray-400 text-xs mb-2">Tus comentarios nos ayudan a mejorar nuestro sitio.</p>
                <Link 
                  href="#" 
                  className="text-white font-semibold text-xs flex items-center hover:text-[#F18700] transition-colors"
                >
                  Envíanos tus comentarios <FontAwesomeIcon icon={faChevronRight} className="text-[#F18700] text-[10px] ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* ZONA DE CONTENIDO (Derecha - 3/4) */}
          <div className="lg:w-3/4 flex flex-col">
            
            {/* FILA 1: CONTACTO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faPhone} className="text-[#F18700] text-lg mt-1" />
                <div>
                  <p className="!text-white text-[9px] font-bold tracking-widest uppercase mb-1">Teléfono</p>
                  <span className="imbra-price text-lg">(+57) 322 846 4800</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faHeadset} className="text-[#F18700] text-lg mt-1" />
                <div>
                  <p className="!text-white text-[9px] font-bold tracking-widest uppercase mb-1">Soporte Técnico</p>
                  <p className="text-lg font-bold !text-[#F18700]">PBX: (1) 335 0591</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faClock} className="text-[#F18700] text-lg mt-1" />
                <div>
                  <p className="!text-white text-[9px] font-bold tracking-widest uppercase mb-1">Horario</p>
                  <p className="text-base font-bold !text-[#F18700]">LUN - VIE: 6AM-5PM</p>
                  <p className="text-xs !text-[#F18700] font-bold uppercase">SAB: 8AM-1PM</p>
                </div>
              </div>
            </div>

            {/* FILA 2: BOTÓN Y REDES */}
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <button className="bg-[#F18700] hover:bg-orange-600 text-[#1a1c1e] px-8 py-3 font-bold text-xs uppercase flex items-center gap-2 transition-all">
                <FontAwesomeIcon icon={faMap} />
                VER MAPA
              </button>
              <div className="flex gap-2">
                {[
                  { icon: faFacebookF, color: 'hover:text-white' },
                  { icon: faTwitter, color: 'hover:text-white' },
                  { icon: faInstagram, color: 'hover:text-white' },
                  { icon: faPinterestP, color: 'hover:text-white' }
                ].map((social, i) => (
                  <Link 
                    key={i}
                    href="#" 
                    className={`w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#F18700] transition-all text-gray-400 ${social.color}`}
                  >
                    <FontAwesomeIcon icon={social.icon} className="text-sm" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-b border-gray-700/50 mb-10"></div>

            {/* FILA 3: ENLACES GRID - Títulos Proporcionales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="imbra-label !text-white mb-4">
                  Mapa de Sitio
                </h3>
                <ul className="space-y-4 mt-6">
                  {[
                    { label: 'Home',              href: '/' },
                    { label: 'Productos',         href: '/tienda' },
                    { label: 'Quiénes Somos',     href: '#' },
                    { label: 'Rastrea tu compra', href: '/mis-pedidos' },
                    { label: 'Contáctenos',       href: '/contacto' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="text-gray-400 hover:text-[#F18700] text-[13px] transition-colors">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="imbra-label !text-white mb-4">
                  Legal
                </h3>
                <ul className="space-y-4 mt-6">
                  <li>
                    <Link href="/politica-de-proteccion-de-datos-personales" className="text-gray-400 hover:text-[#F18700] text-[13px] transition-colors">
                      Protección de Datos
                    </Link>
                  </li>
                  <li>
                    <Link href="/pagina-preguntas-frecuentes-sobre-pagos-electronicos" className="text-gray-400 hover:text-[#F18700] text-[13px] transition-colors">
                      Preguntas Frecuentes Pagos
                    </Link>
                  </li>
                  <li>
                    <Link href="/terminos-y-condiciones" className="text-gray-400 hover:text-[#F18700] text-[13px] transition-colors">
                      Términos y Condiciones
                    </Link>
                  </li>
                  <li>
                    <Link href="/politica-de-envios" className="text-gray-400 hover:text-[#F18700] text-[13px] transition-colors">
                      Política de Envíos
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="imbra-label !text-white mb-4">
                  Categorías
                </h3>
                <ul className="space-y-4 mt-6">
                  {['Herramienta Especializada', 'Eléctricos', 'Frenos', 'Direccionales'].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-gray-400 hover:text-[#F18700] text-[13px] transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="imbra-label !text-white mb-4">
                  Asistencia
                </h3>
                <ul className="space-y-4 mt-6">
                  {['Mi cuenta', 'Ingresar', 'Crear cuenta', 'Favoritos'].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-gray-400 hover:text-[#F18700] text-[13px] transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA LEGAL */}
        <div className="pt-8 border-t border-gray-700/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center gap-x-2 text-[13px] md:text-[14px]">
            <p className="imbra-body !text-[13px] text-gray-500">
              © 2024 IMBRA Repuestos. Todos los derechos reservados.
            </p>
            <span className="text-gray-600 hidden md:inline">|</span>
            <span className="text-gray-500">Diseño y Desarrollo por</span>
            <Link 
              href="https://wa.me/573218737931" 
              target="_blank"
              className="font-black bg-gradient-to-r from-[#F18700] via-white to-[#F18700] bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              iAnGo Agencia de Desarrollo y Automatizaciones con IA
            </Link>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 font-bold italic">Gustavo Vargas</span>
            <span className="text-gray-600">|</span>
            <Link 
              href="tel:+573218737931" 
              className="text-[#F18700] font-black hover:underline flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faPhone} className="text-[11px]" />
              +57 321 873 7931
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            {/* Logos de Pago Con URLs Oficiales */}
            <div className="bg-white px-2 py-1 rounded flex items-center justify-center h-6 grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" width={32} height={20} className="h-4 w-auto object-contain" alt="Mastercard" unoptimized />
            </div>
            <div className="bg-white px-2 py-1 rounded flex items-center justify-center h-6 grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm">
              <Image src="https://www.svgrepo.com/show/303225/visa-logo.svg" width={32} height={10} className="h-3 w-auto object-contain" alt="Visa" unoptimized />
            </div>
            <div className="bg-white px-2 py-1 rounded flex items-center justify-center h-6 grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm">
              <Image src="https://cdn.worldvectorlogo.com/logos/nequi-2.svg" width={32} height={32} className="h-4 w-auto object-contain" alt="Nequi" unoptimized />
            </div>
            <div className="bg-white px-2 py-1 rounded flex items-center justify-center h-6 grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm">
              <Image src="https://placetopay.dev/_astro/logo-placetopay.zD2RPUwO.svg" width={60} height={20} className="h-4 w-auto object-contain" alt="Placetopay" unoptimized />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
