"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";


export default function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products/showcase");
        const { products: data } = await res.json();

        if (data && data.length > 0) {
          const mapped: Product[] = data.map((p: Record<string, unknown>) => ({
            id: p.id as number,
            name: p.name as string,
            slug: p.slug as string,
            sku: (p.sku as string) || "",
            price: String(p.price ?? 0),
            regular_price: String(p.regular_price ?? p.price ?? 0),
            sale_price: p.sale_price ? String(p.sale_price) : "",
            on_sale: (p.on_sale as boolean) ?? false,
            description: "",
            short_description: "",
            permalink: `/product/${p.slug}`,
            images: [{ src: (p.image_url as string) || "/images/placeholder.png", alt: p.name as string }],
            categories: (p.categories as Product["categories"]) || [],
            attributes: [],
            brand: (p.brand as string) || (p.vehicle_brand as string) || "IMBRA",
            vehicle_brand: (p.vehicle_brand as string) || "",
            vehicle_model: (p.vehicle_model as string) || "",
            vehicle_years: (p.vehicle_years as number[]) || [],
            part_category: (p.part_category as string) || "",
            category_slug: (p.category_slug as string) || "",
            stock_status: (p.stock_status as "instock" | "outofstock" | "onbackorder") || "outofstock",
            stock_quantity: (p.stock_quantity as number) ?? 0,
            is_comprable: p.is_comprable === true,
            meta_data: [],
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("ProductShowcase load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-white">
        <div className="imbra-content-container">
          <div className="flex justify-between items-end py-10 px-4 md:px-[40px]">
            <div>
              <h4 className="imbra-label text-primary mb-1">FABRICADOS POR IMBRA</h4>
              <h2 className="imbra-h2">REPUESTOS DE FÁBRICA — LOS MÁS ELEGIDOS</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse aspect-square" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="imbra-content-container text-center">
          <h2 className="imbra-h2 mb-4">Nuestros Productos</h2>
          <p className="text-gray-500">No se encontraron productos disponibles en este momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white">
      <div className="imbra-content-container">

        {/* Header */}
        <div className="flex justify-between items-end py-10 px-4 md:px-[40px]">
          <div>
            <h4 className="imbra-label text-primary mb-1">FABRICADOS POR IMBRA</h4>
            <h2 className="imbra-h2">REPUESTOS DE FÁBRICA — LOS MÁS ELEGIDOS</h2>
          </div>
          <Link href="/tienda" className="imbra-label text-secondary hover:text-primary transition-colors items-center group hidden sm:flex">
            VER CATÁLOGO COMPLETO
            <span className="material-icons ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-white">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
