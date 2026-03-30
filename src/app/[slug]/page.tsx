import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CMSContent from '@/components/layout/CMSContent';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicRootPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Solo procesamos slugs que tengan nuestros prefijos identificadores
  // para evitar consultas innecesarias a Supabase en otras rutas.
  const isCmsPage = slug.startsWith('politica-') || 
                    slug.startsWith('pagina-') || 
                    slug.startsWith('terminos-');

  if (!isCmsPage) {
    notFound();
  }

  // 2. Buscar en Supabase por el slug exacto (Root Level)
  const { data: page, error } = await supabase
    .from('info_politica_paginas')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !page) {
    // Si no existe en el CMS, 404
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* NAVEGACIÓN OFICIAL IMBRA */}
      <Header />
      
      <main className="flex-grow pt-0 bg-[#f8f7f5]">
        <div className="py-8 md:py-16">
          <CMSContent 
            title={page.title}
            content={page.content}
            type={page.type}
            modifiedGmt={page.modified_gmt}
            lastSync={page.last_sync}
          />
        </div>
      </main>

      {/* PIE DE PÁGINA OFICIAL IMBRA */}
      <Footer />
    </div>
  );
}
