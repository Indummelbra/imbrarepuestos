"use client";

import React from 'react';

interface CMSContentProps {
  title: string;
  content: string;
  type?: string;
  modifiedGmt?: string;
  lastSync?: string;
}

const CMSContent: React.FC<CMSContentProps> = ({ title, content, type, modifiedGmt, lastSync }) => {
  const isLegal = type === 'legal';
  
  // Fecha legible
  const formattedDate = modifiedGmt 
    ? new Date(modifiedGmt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recientemente';

  return (
    <div className="imbra-content-container">
      {/* BANNER DE TÍTULO INDUSTRIAL IMBRA */}
      <div className="mb-12 border-l-8 border-primary pl-8 py-8 bg-[#212221] shadow-2xl relative overflow-hidden">
        {/* Decoración Industrial de fondo (Icono de engranaje) */}
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
          <span className="material-icons text-[250px] rotate-45 text-white">settings</span>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-8 h-[2px] bg-primary"></span>
            <span className="imbra-label-orange !text-[10px] tracking-[0.3em]">
              {isLegal ? 'SISTEMA LEGAL IMBRA' : 'CENTRO DE INFORMACIÓN IMBRA'}
            </span>
          </div>
          
          <h1 className="imbra-h1 text-white italic break-words max-w-5xl !text-4xl md:!text-6xl !normal-case">
            {title}
          </h1>
          
          <div className="mt-6 flex items-center text-gray-400 imbra-label !text-[11px]">
            <span className="material-icons text-xs mr-1 text-primary">history</span>
            REVISIÓN TÉCNICA: {formattedDate.toUpperCase()}
          </div>
        </div>
      </div>

      {/* CUERPO DEL DOCUMENTO */}
      <div className="bg-white shadow-sm border border-gray-100 p-8 md:p-12 lg:p-20 relative min-h-[600px]">
        {/* Marca de agua sutil IMBRA lateral */}
        <div className="absolute top-0 right-0 h-full w-1 bg-gray-50"></div>

        <article className="cms-content prose prose-slate max-w-none 
          prose-headings:font-display prose-headings:text-secondary prose-headings:font-black
          prose-h2:text-2xl prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-6 prose-h2:mt-12 prose-h2:mb-6
          prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
          prose-strong:text-secondary prose-strong:font-black
          prose-ul:list-disc prose-ul:pl-6 prose-li:mb-2
          prose-a:text-primary prose-a:font-bold hover:prose-a:underline transition-all">
          
          <div 
            dangerouslySetInnerHTML={{ __html: content }} 
            className="font-body text-[15px]"
          />
        </article>

        {/* ACCIONES DE DOCUMENTO */}
        <div className="mt-20 pt-10 border-t border-gray-100 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-all font-bold imbra-label !text-[11px] group"
            >
              <span className="material-icons text-xl group-hover:scale-110 transition-transform">print</span>
              <span>IMPRIMIR DOCUMENTO</span>
            </button>
            <div className="w-[1px] h-4 bg-gray-200"></div>
            <button 
              className="flex items-center gap-2 text-secondary hover:text-primary transition-all font-bold imbra-label !text-[11px] group"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title, url: window.location.href });
                }
              }}
            >
              <span className="material-icons text-xl group-hover:scale-110 transition-transform">share</span>
              <span>COMPARTIR ENLACE</span>
            </button>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="imbra-label !text-[9px] text-gray-400">SINCRO-ID: {lastSync || '000-IMB'}</span>
            <img 
              src="https://imbrarepuestos.com/pagos/wp-content/uploads/2023/10/cropped-Logo-Imbra.png" 
              alt="IMBRA" 
              className="h-6 w-auto opacity-30 mt-2 grayscale"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSContent;
