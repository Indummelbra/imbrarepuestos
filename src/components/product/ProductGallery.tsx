"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: { src: string; alt: string }[];
  productName: string;
  discount?: number;
  onSale?: boolean;
}

/**
 * Galería interactiva de imágenes del producto.
 * Permite alternar entre imágenes con las miniaturas y visualizar la imagen ampliada.
 */
export default function ProductGallery({
  images,
  productName,
  discount = 0,
  onSale = false,
}: ProductGalleryProps) {
  const [imagenActiva, setImagenActiva] = useState(0);
  const [zoomActivo, setZoomActivo] = useState(false);
  const [posicionZoom, setPosicionZoom] = useState({ x: 50, y: 50 });

  /* Manejo del efecto lupa al mover el mouse sobre la imagen */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosicionZoom({ x, y });
  };

  const imagenActual = images[imagenActiva] || { src: "/placeholder.png", alt: productName };

  return (
    <div className="flex flex-col gap-4">
      {/* Imagen principal */}
      <div
        className="relative aspect-square bg-white border border-gray-100 overflow-hidden cursor-zoom-in touch-pan-y"
        onMouseEnter={() => setZoomActivo(true)}
        onMouseLeave={() => setZoomActivo(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={imagenActual.src}
          alt={imagenActual.alt || productName}
          fill
          priority
          className="object-contain p-8 transition-transform duration-300"
          style={
            zoomActivo
              ? {
                  transform: "scale(1.8)",
                  transformOrigin: `${posicionZoom.x}% ${posicionZoom.y}%`,
                }
              : {}
          }
          unoptimized={imagenActual.src.includes(".svg")}
        />

        {/* Badge de descuento */}
        {onSale && discount > 0 && (
          <div
            className="absolute top-5 left-5 px-3 py-1 text-white text-[11px] font-black tracking-widest italic"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-display)" }}
          >
            AHORRA {discount}%
          </div>
        )}

        {/* Icono de zoom */}
        <div
          className="absolute top-4 right-4 bg-white border border-gray-200 p-2 opacity-60 hover:opacity-100 transition-opacity"
          aria-hidden="true"
        >
          <ZoomIn size={16} className="text-secondary" />
        </div>
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setImagenActiva(i)}
              className={[
                "relative aspect-square bg-white border-2 overflow-hidden p-1 transition-all duration-200",
                imagenActiva === i
                  ? "border-primary"
                  : "border-gray-100 hover:border-gray-300",
              ].join(" ")}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.alt || productName}
                fill
                className="object-contain p-1"
                unoptimized={img.src.includes(".svg")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
