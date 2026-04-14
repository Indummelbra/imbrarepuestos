'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProductsAdvanced, SearchResult } from '@/app/actions/search-actions';
import Link from 'next/link';
import ProductImage from '../common/ProductImage';

export default function LiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const data = await searchProductsAdvanced(query);
        setResults(data);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative flex items-center bg-gray-100 rounded-sm group">
        <input
          className="w-full pl-3 sm:pl-5 pr-10 sm:pr-12 py-2.5 bg-transparent text-sm focus:outline-none placeholder:text-gray-400 text-gray-700"
          placeholder="Buscar productos..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        <div className="absolute right-4 pointer-events-none">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          ) : (
            <span className="material-icons text-lg text-gray-400 group-focus-within:text-primary transition-colors">
              search
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-[100]"
          >
            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 mb-2">
                Resultados encontrados
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                >
                  <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 relative">
                    <ProductImage
                      src={product.image_url || '/images/placeholder-imbra.png'}
                      alt={product.name}
                      fill
                      className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div 
                      className="text-sm font-bold text-secondary dark:text-white group-hover:text-primary transition-colors line-clamp-1"
                      dangerouslySetInnerHTML={{ __html: product.headline || product.name }}
                    />
                    <div className="flex items-center mt-1 space-x-3">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded font-bold">
                        SKU: {product.sku}
                      </span>
                      <span className={`text-[10px] font-bold ${product.stock_status === 'instock' ? 'text-green-500' : 'text-red-500'}`}>
                        {product.stock_status === 'instock' ? 'En Stock' : 'Agotado'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-black text-primary">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 text-center border-t border-gray-100 dark:border-gray-800">
              <Link
                href={`/tienda?q=${encodeURIComponent(query)}`}
                className="text-xs font-bold text-secondary dark:text-gray-400 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Ver todos los resultados para &quot;{query}&quot;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
