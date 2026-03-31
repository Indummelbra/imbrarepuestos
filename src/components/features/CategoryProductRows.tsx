"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORY_GROUPS } from "@/lib/woo-categories";
import { WOO_CATEGORIES } from "@/lib/woo-categories";
import { useEffect, useRef, useState, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

/** IDs de grupos destacados que aparecen en esta sección */
const FEATURED_GROUPS = ["frenos", "motor", "suspension"];

interface RowProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  regular_price?: number;
  image_url: string | null;
  on_sale: boolean;
  brand: string | null;
  stock_status?: string;
  stock_quantity?: number;
  is_comprable?: boolean;
}

interface CategoryRowProps {
  group: typeof CATEGORY_GROUPS[0];
  products: RowProduct[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function CategoryRow({ group, products }: CategoryRowProps) {
  const { addItem } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shuffledProducts, setShuffledProducts] = useState<RowProduct[]>([]);

  // Drag state — refs para evitar re-renders (causa del "pegado")
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  useEffect(() => {
    setShuffledProducts(shuffleArray(products));
  }, [products]);

  // Loop infinito via scroll event
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = 179;
    const setW = itemWidth * shuffledProducts.length;
    if (el.scrollLeft >= setW * 1.5) el.scrollLeft = setW * 0.5;
    else if (el.scrollLeft <= setW * 0.1) el.scrollLeft = setW * 0.6;
  }, [shuffledProducts.length]);

  // Auto-scroll: avanza 3 tarjetas cada 3 segundos, se pausa si el usuario arrastra
  useEffect(() => {
    if (shuffledProducts.length === 0) return;
    const ITEM_WIDTH = window.innerWidth < 640 ? 150 : 179;
    const SCROLL_ITEMS = window.innerWidth < 640 ? 1 : 3;
    const interval = setInterval(() => {
      if (drag.current.active) return;
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ left: el.scrollLeft + ITEM_WIDTH * SCROLL_ITEMS, behavior: "smooth" });
    }, 3000);
    return () => clearInterval(interval);
  }, [shuffledProducts.length]);

  // Pointer events — fluido, sin re-renders, captura fuera del elemento
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const delta = drag.current.startX - e.clientX;
    if (Math.abs(delta) > 3) drag.current.moved = true;
    scrollRef.current!.scrollLeft = drag.current.scrollLeft + delta;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = scrollRef.current!;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = "grab";
    el.style.userSelect = "";
  };

  const handleAddToCart = (e: React.MouseEvent, product: RowProduct) => {
    if (drag.current.moved) { e.preventDefault(); return; }
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: "",
      price: String(product.price),
      regular_price: String(product.price),
      sale_price: product.on_sale ? String(product.price) : "",
      description: "",
      short_description: "",
      permalink: `/product/${product.slug}`,
      images: [{ src: product.image_url || "", alt: product.name }],
      stock_status: (product.stock_status as "instock" | "outofstock" | "onbackorder") || "outofstock",
      stock_quantity: product.stock_quantity ?? 0,
      brand: product.brand || "IMBRA",
      vehicle_brand: "",
      vehicle_model: "",
      vehicle_years: [],
      part_category: "",
      category_slug: "",
      categories: [],
      attributes: [],
      on_sale: product.on_sale,
      is_comprable: product.is_comprable ?? false,
      meta_data: [],
    }, 1);
  };

  const subcats = group.slugs
    .map((s) => WOO_CATEGORIES.find((c) => c.slug === s)?.name)
    .filter(Boolean)
    .slice(0, 5) as string[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* ── Panel izquierdo: banner de categoría ─────────────── */}
      <div className="lg:col-span-3 relative min-h-[280px] overflow-hidden bg-secondary">
        <Image
          src={group.image}
          alt={group.name}
          fill
          className="object-contain p-8 opacity-20"
          unoptimized
        />

        <div className="relative z-10 h-full flex flex-col justify-between p-8">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-3 block">
              REPUESTOS
            </span>
            <h3 className="font-black text-white text-3xl uppercase leading-tight mb-5">
              {group.name.toUpperCase()}
            </h3>

            <ul className="space-y-1.5">
              {subcats.map((name) => (
                <li key={name} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-white/70 text-[11px] font-medium uppercase tracking-wide">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={`/tienda?cat=${group.id}`}
            className="inline-flex items-center gap-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 hover:bg-white hover:text-primary transition-all w-fit mt-6"
          >
            VER TODOS
            <span className="material-icons text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* ── Panel derecho: carrusel con drag (sin flechas) ─────── */}
      <div className="lg:col-span-9 relative overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="w-full overflow-x-auto scrollbar-hide cursor-grab select-none"
          style={{ scrollBehavior: "auto" }}
        >
          <div className="flex gap-px bg-gray-100 w-max">
            {shuffledProducts.length === 0 ? (
              <div className="flex items-center justify-center w-full min-h-[280px] text-gray-400 text-sm px-8 bg-white">
                Sin productos disponibles
              </div>
            ) : (
              // Duplicar productos para efecto loop infinito (2 sets es suficiente)
              [...shuffledProducts, ...shuffledProducts, ...shuffledProducts].map(
                (product, idx) => {
                  const price = parseFloat(String(product.price));
                  const img = product.image_url || "/images/placeholder.png";
                  const isDuplicate = idx >= shuffledProducts.length;
                  return (
                    <div
                      key={`${product.id}-${idx}`}
                      className="group bg-white flex flex-col w-[150px] sm:w-[175px] flex-shrink-0 overflow-hidden hover:z-10 border border-gray-100"
                    >
                      <div className="relative w-full aspect-square bg-white overflow-hidden border-b border-gray-100">
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        {product.on_sale && !isDuplicate && (
                          <span className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">
                            Oferta
                          </span>
                        )}
                      </div>

                      <div className="px-3 pt-3 pb-2 flex flex-col flex-1">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest mb-0.5">
                          {product.brand || "IMBRA"}
                        </span>
                        <p className="text-[10px] font-bold text-secondary uppercase italic leading-tight line-clamp-2 flex-1 mb-2">
                          {product.name}
                        </p>
                        {product.on_sale && product.regular_price && product.regular_price > price ? (
                          <div className="mb-2">
                            <span className="text-[10px] text-gray-400 line-through block leading-none">
                              ${product.regular_price.toLocaleString("es-CO")}
                            </span>
                            <span className="text-[13px] font-black text-primary block leading-tight">
                              ${price.toLocaleString("es-CO")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[13px] font-black text-secondary block mb-2">
                            ${price.toLocaleString("es-CO")}
                          </span>
                        )}
                        {product.is_comprable !== false ? (
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-primary text-secondary text-[9px] font-black uppercase tracking-widest py-2 hover:bg-secondary hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Agregar
                          </button>
                        ) : (
                          <div className="w-full bg-gray-100 text-gray-300 text-[9px] font-black uppercase tracking-widest py-2 flex items-center justify-center gap-1.5 cursor-not-allowed">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Agotado
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryProductRows() {
  const [allProducts, setAllProducts] = useState<
    Array<{ group: typeof CATEGORY_GROUPS[0]; products: RowProduct[] }>
  >([]);

  useEffect(() => {
    const loadProducts = async () => {
      const rows = await Promise.all(
        FEATURED_GROUPS.map(async (groupId) => {
          const group = CATEGORY_GROUPS.find((g) => g.id === groupId)!;
          const { searchWithFilters } = await import("@/app/actions/vehicle-actions");
          const { products } = await searchWithFilters({
            filters: { categories: [groupId] },
            perPage: 12,
            sortBy: "name",
          });
          return { group, products: products as RowProduct[] };
        })
      );
      setAllProducts(rows);
    };

    loadProducts();
  }, []);

  return (
    <section className="w-full bg-[#f5f5f5] py-12">
      <div className="imbra-content-container flex flex-col gap-4">
        {allProducts.map(({ group, products }) => (
          <CategoryRow key={group.id} group={group} products={products} />
        ))}
      </div>
    </section>
  );
}
