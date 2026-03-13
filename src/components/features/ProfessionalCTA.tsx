'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PROFESSIONAL CTA - Alineado a BrandBook IMBRA 2025
 * Colores: Naranja (#F18700), Negro Carbón (#212221)
 * Tipografía: Archivo (Display), Montserrat (Body)
 */

const ProfessionalCTA = () => {

  return (
    <section className="w-full bg-white py-16 lg:py-24" id="div-1">
      <div className="imbra-content-container" id="div-2">
        {/* DIV 3: El Grid de Contenido Industrial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch bg-[#f8f7f5] overflow-hidden" id="div-3">
          
          {/* Columna 1: Composición Visual a Sangre Lateral Izquierda */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative min-h-[400px] lg:min-h-[550px] bg-[#212221]"
          >
            {/* Capa 1: Fondo Taller (Asset Local) */}
            <div className="absolute inset-0">
              <Image
                src="/images/taller-bg.png"
                alt="Fondo Taller IMBRA"
                fill
                className="object-cover opacity-60 grayscale"
                priority
              />
            </div>

            {/* Capa 2: Patrón de Franjas IMBRA (Esquina Superior Izquierda) */}
            <div className="absolute top-0 left-0 w-48 h-10 z-10" style={{
              backgroundImage: `repeating-linear-gradient(45deg, #F18700, #F18700 10px, transparent 10px, transparent 20px)`,
              opacity: 0.9
            }} />

            {/* Capa 3: Bloque Naranja IMBRA (#F18700) */}
            <div className="absolute top-0 right-0 w-[42%] h-full bg-[#F18700] z-30 p-6 flex flex-col justify-center items-center text-center">
              <div className="mb-6">
                <svg className="w-14 h-14 lg:w-20 lg:h-20 text-[#212221]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" />
                </svg>
              </div>
              <Link 
              href="/registro-profesional"
              className="bg-primary text-secondary imbra-label !text-secondary px-6 h-10 transition-all active:scale-95 flex items-center justify-center group w-fit"
            >
              ¡Aplicar Ahora!
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            </div>
          </motion.div>

          {/* Columna 2: Jerarquía Visual según Referencia HTML */}
          <div className="flex flex-col justify-center p-10 lg:p-24 bg-white relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
             <span className="imbra-label-orange mb-4">
              ¿Eres un Profesional de la Mecánica?
            </span>
            <h2 className="imbra-h2 text-secondary mb-6">
              ¡Te invitamos a ser un <br />
              <span className="text-primary">Aliado Imbra!</span>
            </h2>

              <p className="imbra-body-bold text-secondary mb-6">
              Únete a nuestro programa exclusivo y accede a beneficios diseñados para potenciar tu taller.
            </p>
            <p className="imbra-body mb-8">
              En Imbra Repuestos reconocemos la importancia de tu labor. Por eso, hemos creado un espacio donde la calidad de nuestros productos se une a tu experiencia técnica.
            </p>

              <ul className="space-y-4 mb-10">
                    {["Descuentos preferenciales de fábrica", "Soporte técnico y asesoría prioritaria", "Acceso a capacitaciones y eventos técnicos"].map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="imbra-body !text-sm">{benefit}</span>
                      </li>
                    ))}
              </ul>

              <Link 
              href="/registro-profesional"
              className="bg-primary text-secondary imbra-label !text-secondary px-6 h-10 transition-all active:scale-95 flex items-center justify-center group w-fit"
            >
              ¡Aplicar Ahora!
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProfessionalCTA;
