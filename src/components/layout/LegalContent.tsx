import React from 'react';

interface LegalContentProps {
  title: string;
  content: string;
  modifiedGmt?: string;
  lastSync?: string;
}

export default function LegalContent({ title, content, modifiedGmt, lastSync }: LegalContentProps) {
  const dateToDisplay = modifiedGmt || lastSync;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 shadow-xl border-t-8 border-primary rounded-lg">
        {/* Encabezado Premium */}
        <header className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-Archivo font-black text-secondary leading-tight uppercase tracking-tighter">
            {title}
          </h1>
          <div className="mt-4 flex items-center text-gray-400 text-sm font-medium tracking-wide">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mr-4">
              DOCUMENTO OFICIAL
            </span>
            {dateToDisplay && (
              <span>
                Última actualización: {new Date(dateToDisplay).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            )}
          </div>
        </header>

        {/* Contenido Dinámico (Renderizado de WordPress) */}
        <article 
          className="prose prose-lg max-w-none text-gray-700 font-medium leading-relaxed
                     prose-headings:font-Archivo prose-headings:font-black prose-headings:text-secondary prose-headings:uppercase
                     prose-strong:text-secondary prose-strong:font-black
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-ul:list-disc prose-li:marker:text-primary"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Footer del Documento */}
        <footer className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm italic">
            Este documento es una copia fiel del original alojado en nuestros sistemas centrales. 
            Cualquier duda adicional puede ser consultada a través de nuestros canales oficiales.
          </p>
          <div className="mt-8 flex justify-center opacity-30 grayscale">
             {/* Logo Placeholder o similar */}
             <span className="font-Archivo font-black text-xl text-secondary">IMBRA REPUESTOS</span>
          </div>
        </footer>
      </div>
      
      {/* Estilos específicos para el contenido de WordPress */}
      <style jsx global>{`
        .prose h2 {
          border-left: 4px solid #F68D2E;
          padding-left: 1rem;
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
        }
        .prose p {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}
