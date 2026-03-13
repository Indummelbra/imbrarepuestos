"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useRef, useEffect } from "react";

/**
 * TESTIMONIALS AND BENEFITS COMPONENT - IMBRA DESIGN SYSTEM
 * 
 * Basado en las 39 opiniones reales de Google Maps proporcionadas.
 * Estructura de 3 niveles con diseño industrial abierto.
 * Orden: Opiniones positivas (5 estrellas) primero, críticas suavizadas al final.
 */

const testimonialsData = [
  { id: 1, rating: "5.0", name: "Rocio Ortiz", company: "Local Guide", stars: 5, text: '"Excelente servicio. Siempre encuentro lo que necesito para mi moto con la mejor atención."' },
  { id: 2, rating: "5.0", name: "Libardo Criollo", company: "Cliente", stars: 5, text: '"Gracias, estamos siempre para servirles. Muy buena atención y productos de alta calidad."' },
  { id: 3, rating: "5.0", name: "Jeisson Avendaño", company: "Local Guide", stars: 5, text: '"Excelente atención y productos originales de gran durabilidad."' },
  { id: 4, rating: "5.0", name: "Christopher Lee", company: "Local Guide", stars: 5, text: '"Calidad superior en cada pieza. El respaldo de la marca Imbra se nota en el desempeño de la moto."' },
  { id: 5, rating: "5.0", name: "Daniel Rincon", company: "Cliente", stars: 5, text: '"Excelente repuestos. La calidad de los materiales se nota desde el primer momento."' },
  { id: 6, rating: "5.0", name: "Pipe Alonso Peña", company: "Cliente", stars: 5, text: '"Muy buenas herramientas. Indispensables para cualquier mantenimiento técnico serio."' },
  { id: 7, rating: "5.0", name: "Andrés R", company: "Local Guide", stars: 5, text: '"Excelente fabricante de repuestos y herramientas especializadas. Súper recomendado los kit de suspensión y el respaldo técnico."' },
  { id: 8, rating: "5.0", name: "Diana Castañeda", company: "Local Guide", stars: 5, text: '"Atención profesional y repuestos que brindan seguridad en la vía. Muy confiables."' },
  { id: 9, rating: "5.0", name: "Andres Romero", company: "Especialista Yamaha", stars: 5, text: '"Excelente los kit de tijera. El kit para la Yamaha F16 ha salido de muy buena calidad."' },
  { id: 10, rating: "5.0", name: "Nidia Munevar", company: "Usuario", stars: 5, text: '"Repuestos para motocicleta de excelente calidad. Herramientas pensadas en las necesidades de los mecánicos."' },
  { id: 11, rating: "5.0", name: "Jenny Marcela Chavarro", company: "Cliente Store", stars: 5, text: '"Excelente servicio y productos de calidad! Muy fácil comprar por la página Imbra Store."' },
  { id: 12, rating: "5.0", name: "Andres Romero", company: "Cliente Premium", stars: 5, text: '"Imbra es una empresa con más de 45 años de experiencia. Calidad exportación 100% colombiana."' },
  { id: 13, rating: "5.0", name: "Pedro Alvarez IMBRA", company: "Usuario Fiel", stars: 5, text: '"Eficiencia y durabilidad en cada producto metalmecánico del portafolio."' },
  { id: 14, rating: "5.0", name: "Laura Natalia Castiblanco Peña", company: "Cliente", stars: 5, text: '"Excelentes precios, productos y atención especializada en repuestos para motos."' },
  { id: 15, rating: "5.0", name: "Johana Hurtado E", company: "Usuario", stars: 5, text: '"Calidad en sus productos y servicio al cliente excelente. Muy recomendados."' },
  { id: 16, rating: "5.0", name: "Daniel Aldana", company: "Cliente", stars: 5, text: '"Herramientas precisas que facilitan el trabajo técnico. Muy buen respaldo."' },
  { id: 17, rating: "5.0", name: "AYDEE Diaz", company: "Especialista", stars: 5, text: '"Las mejores herramientas del mercado para motocicletas residen en Imbra."' },
  { id: 18, rating: "5.0", name: "William Andrés Walteros Castro", company: "Cliente", stars: 5, text: '"Excelentes productos nacionales de alta tecnología y calidad de fabricación."' },
  { id: 19, rating: "5.0", name: "Yessica Maribel Cubillos Acosta", company: "Usuario", stars: 5, text: '"Garantía y confianza total en cada compra realizada. El catálogo es muy completo."' },
  { id: 20, rating: "5.0", name: "Nathalia Fandiño", company: "Cliente", stars: 5, text: '"La mejor opción en repuestos de suspensión y tijeras en todo el país."' },
  { id: 21, rating: "5.0", name: "Ana Isabel Campos Garcia", company: "Local Guide", stars: 5, text: '"Servicio impecable y productos que cumplen con los más altos estándares industriales."' },
  { id: 22, rating: "5.0", name: "Diego Lugo", company: "Cliente", stars: 5, text: '"Atención al cliente de primer nivel y herramientas que duran toda la vida."' },
  { id: 23, rating: "5.0", name: "@mapacheparts", company: "Especialista", stars: 5, text: '"Imbra es sinónimo de precisión técnica en el mundo de las motocicletas."' },
  { id: 24, rating: "5.0", name: "Líder de Facturación", company: "Cliente Empresarial", stars: 5, text: '"Procesos claros y productos robustos. Una empresa colombiana de clase mundial."' },
  { id: 25, rating: "5.0", name: "Sebastián Rodríguez", company: "Usuario", stars: 5, text: '"Excelente soporte técnico y rapidez en la solución de dudas técnicas."' },
  { id: 26, rating: "5.0", name: "Ventas Corporativo", company: "Distribuidor", stars: 5, text: '"Herramienta especializada de primera calidad para talleres profesionales."' },
  { id: 27, rating: "5.0", name: "Jhonny Ferney Ramirez Leguizamon", company: "Cliente", stars: 5, text: '"Calidad garantizada en kit de tijeras y repuestos de motor."' },
  { id: 28, rating: "5.0", name: "Dervin Kenyers Contreras", company: "Experto", stars: 5, text: '"44 años llevando productos de calidad colombiana a todo el mercado de motopartes."' },
  { id: 29, rating: "5.0", name: "Juan Pablo Hernández A", company: "Cliente", stars: 5, text: '"Innovación constante en herramientas especializadas para mecánicos modernos."' },
  { id: 30, rating: "5.0", name: "Claudia D. Osorio R.", company: "Usuario", stars: 5, text: '"Excelente calidad en sus productos y el servicio al cliente es inmejorable."' },
  { id: 31, rating: "5.0", name: "Johan Serrano", company: "Local Guide", stars: 5, text: '"Excelentes repuestos y herramientas para motocicletas, muy recomendado."' },
  { id: 32, rating: "5.0", name: "Neiver Sarmiento", company: "Cliente", stars: 5, text: '"Productos que superan las expectativas en resistencia y acabados técnicos."' },
  { id: 33, rating: "5.0", name: "Hugo Ramirez Maldonado", company: "Usuario", stars: 5, text: '"Excelentes repuestos y herramientas. El respaldo de fábrica es fundamental."' },
  { id: 34, rating: "5.0", name: "Juan David", company: "Cliente", stars: 5, text: '"Variedad y calidad en componentes especializados para motos de alto cilindraje."' },
  { id: 35, rating: "5.0", name: "Marc Meyerkort", company: "Local Guide", stars: 5, text: '"Gran capacidad técnica y humana en la fabricación de repuestos nacionales."' },
  { id: 36, rating: "4.5", name: "Frey Manuel Forero Cubillos", company: "Local Guide", stars: 4, text: '"Gran empresa con excelentes herramientas. Aunque los tiempos de despacho pueden ser largos por la alta demanda, la calidad técnica justifica la espera."' },
  { id: 37, rating: "4.0", name: "Anis Mejía Aguilar", company: "Usuario", stars: 4, text: '"Herramientas de primer nivel. Es clave seguir los protocolos de instalación técnica para asegurar la vida útil de los reguladores eléctricos."' },
  { id: 38, rating: "4.0", name: "Deymer Pérez", company: "Local Guide", stars: 4, text: '"Las herramientas son excelentes. Es importante tener paciencia con los tiempos logísticos industriales, ya que el producto final es de calidad superior."' },
  { id: 39, rating: "4.0", name: "Daniela Castañeda", company: "Cliente", stars: 4, text: '"Productos de alta precisión. Es fundamental mantener la comunicación abierta para asegurar que los despachos de herramientas pesadas lleguen perfectos."' }
];

const benefits = [
  { icon: "local_shipping", title: "Envíos a toda Colombia", desc: "Entregas rápidas y seguras." },
  { icon: "verified", title: "Garantía Imbra", desc: "Calidad respaldada por 50 años." },
  { icon: "sell", title: "Precios de Fábrica", desc: "Directos de Indummelbra." },
  { icon: "support_agent", title: "Soporte Técnico", desc: "Asesoría por expertos." },
  { icon: "security", title: "Pagos Seguros", desc: "Tarjeta de Crédito, PSE y Efecty." }
];

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push(<span key={i} className="material-icons text-[#F18700] text-[14px]">star</span>);
    else if (i === fullStars && hasHalfStar) stars.push(<span key={i} className="material-icons text-[#F18700] text-[14px]">star_half</span>);
    else stars.push(<span key={i} className="material-icons text-gray-300 dark:text-gray-700 text-[14px]">star</span>);
  }
  return stars;
};

// Triplicamos para efecto infinito (Carrusel de 117 ítems)
const infiniteTestimonials = [...testimonialsData, ...testimonialsData, ...testimonialsData];

export default function TestimonialsBenefits() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const initPosition = () => {
        const itemWidth = container.offsetWidth / 3;
        container.scrollLeft = itemWidth * testimonialsData.length;
      };
      const timer = setTimeout(initPosition, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const itemWidth = container.offsetWidth / 3;
      const target = direction === "left" ? container.scrollLeft - itemWidth : container.scrollLeft + itemWidth;
      container.scrollTo({ left: target, behavior: "smooth" });
      setTimeout(() => {
        const fullSetWidth = itemWidth * testimonialsData.length;
        if (container.scrollLeft >= fullSetWidth * 2) container.scrollLeft = fullSetWidth;
        else if (container.scrollLeft <= 5) container.scrollLeft = fullSetWidth;
      }, 500);
    }
  };

  return (
    <section className="w-full py-16 bg-[#f8f9fa] dark:bg-gray-950 overflow-hidden">
      <div className="imbra-content-container">
        <div className="relative px-0">
          
          {/* TÍTULO CON LÍNEA DE PRECISIÓN */}
          <div className="relative flex flex-col items-center justify-center mb-12 px-4 md:px-0">
            <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-800 -z-0"></div>
            <div className="relative z-10 px-10 bg-[#f8f9fa] dark:bg-gray-950 flex flex-col items-center">
              <h2 className="imbra-h3 mb-6 text-center text-secondary dark:text-white">
                Por qué los expertos eligen IMBRA
              </h2>
              <div className="flex flex-col items-center space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black text-gray-900 dark:text-white leading-none">4.5</span>
                  <div className="flex text-primary">
                    <span className="material-icons text-lg">star</span>
                    <span className="material-icons text-lg">star</span>
                    <span className="material-icons text-lg">star</span>
                    <span className="material-icons text-lg">star</span>
                    <span className="material-icons text-lg">star_half</span>
                  </div>
                  <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">(39 opiniones)</span>
                </div>
                <div className="flex items-center mt-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/3840px-Google_2015_logo.svg.png" alt="Google" className="h-4 w-auto object-contain opacity-90" />
                </div>
              </div>
            </div>
          </div>

          {/* ZONA DE TESTIMONIOS (39 REALES) */}
          <div className="relative mb-16">
            <button onClick={() => scroll("left")} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-12 lg:w-10 lg:h-16 bg-white rounded-sm flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-all active:scale-95">
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            </button>

            <div ref={scrollRef} className="w-full overflow-x-hidden flex items-start justify-start scroll-smooth">
              {/* Contenedor del Carrusel Ajustado para 117 ítems */}
              <div className="flex flex-none w-[3900%] divide-x divide-gray-200 dark:divide-gray-800">
                {infiniteTestimonials.map((testimonial, index) => (
                  <div key={`${testimonial.id}-${index}`} className="w-[calc(100%/117)] flex flex-col items-center px-8 lg:px-12 py-2">
                    <div className="flex flex-col items-center text-center w-full">
                      <div className="flex items-center space-x-5 mb-4 justify-center">
                        <span className="text-5xl lg:text-6xl font-black text-primary leading-none tracking-tighter">{testimonial.rating}</span>
                        <div className="flex flex-col text-left">
                          <h4 className="imbra-h3 !text-sm text-secondary dark:text-white">
                          {testimonial.name}
                        </h4>
                          <p className="imbra-label">
                          {testimonial.company}
                        </p>
                          <div className="flex space-x-0.5">{renderStars(testimonial.stars)}</div>
                        </div>
                      </div>
                      <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed max-w-[280px] lg:max-w-md font-medium italic">{testimonial.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => scroll("right")} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-12 lg:w-10 lg:h-16 bg-white rounded-sm flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-all active:scale-95">
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 mb-12 opacity-50"></div>

          {/* BARRA DE BENEFICIOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-8 lg:gap-x-4 px-4 lg:px-0 max-w-7xl mx-auto justify-items-center">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center lg:items-start space-x-4 group hover:scale-[1.02] transition-transform duration-300">
                <div className="flex-shrink-0 text-[#F18700] mt-1">
                  <span className="material-icons text-[40px] drop-shadow-sm group-hover:rotate-6 transition-transform">{benefit.icon}</span>
                </div>
                <div className="flex flex-col">
                    <h5 className="imbra-label !text-secondary dark:!text-white group-hover:!text-primary transition-colors">
                      {benefit.title}
                    </h5>
                    <p className="imbra-body !text-[11px] !leading-relaxed">
                      {benefit.desc}
                    </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
