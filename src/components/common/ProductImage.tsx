"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface ProductImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

/**
 * Componente de imagen de producto con lógica de fallback automática.
 * Si la imagen original falla (404), muestra el placeholder minimalista de IMBRA.
 */
export default function ProductImage({ 
  src, 
  alt, 
  fallbackSrc = "/images/placeholder-imbra.png",
  className,
  ...props 
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Sincronizar si el src cambia (por ejemplo al navegar entre productos)
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
}
