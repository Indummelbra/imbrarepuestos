# Sistema Global de Fallback de Imágenes

Este documento detalla la implementación del sistema de protección contra imágenes rotas (errores 404) en la tienda Headless. El objetivo es garantizar una experiencia de usuario premium, evitando que la ausencia de activos físicos en el servidor de imágenes afecte la estética del sitio.

## 1. Problema Identificado
En el catálogo de productos, existen casos donde el SKU no tiene una imagen asociada en el servidor de activos. Al intentar cargar estas imágenes mediante el componente nativo de Next.js, el navegador recibe un error 404, dejando un recuadro vacío o un icono de imagen rota que degrada la percepción de calidad de la marca.

## 2. Solución Implementada: El Componente `ProductImage`

La solución consiste en un componente centralizado (`ProductImage.tsx`) que encapsula la lógica de detección de errores. No depende de que los datos de la API sean perfectos; en su lugar, reacciona en tiempo real en el navegador del cliente.

### Arquitectura Técnica
El componente utiliza un estado local para monitorear el ciclo de vida de la carga de la imagen:

```tsx
"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

export default function ProductImage({ src, alt, ...props }: ImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reiniciar el estado si la fuente cambia (navegación entre productos)
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Si se detecta error 404 o el src está vacío, usamos el placeholder
  const finalSrc = hasError || !src ? "/images/placeholder-brand.png" : src;

  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt}
      onError={() => setHasError(true)}
    />
  );
}
```

## 3. Por qué es un sistema robusto
Este sistema es **inmune a actualizaciones de productos** por las siguientes razones:

*   **Detección en el Cliente:** No importa si hoy un producto tiene imagen y mañana se borra del servidor; el navegador detectará el fallo en el momento de la carga y activará el fallback instantáneamente.
*   **Independencia de la Base de Datos:** No requiere modificar miles de registros en la base de datos para "limpiar" URLs. Se encarga de la realidad de lo que llega al navegador.
*   **Consistencia de Marca:** Al centralizar el fallback en un solo componente, cualquier cambio en el diseño del "placeholder" se refleja en toda la tienda (Buscador, Carrito, Galería, etc.) modificando un único archivo.

## 4. Guía de Integración para Nuevos Desarrollos

Para mantener la integridad del sistema en futuras secciones de la web, se debe seguir esta regla de oro:

> [!IMPORTANT]
> **REGLA DE ORO:** Nunca usar `Image` de `next/image` directamente para miniaturas de productos. Usar siempre `ProductImage`.

### Ejemplo de uso en una nueva sección:
```tsx
import ProductImage from "@/components/common/ProductImage";

// En el renderizado:
<ProductImage 
  src={product.image_url} 
  alt={product.name}
  fill
  className="object-contain"
/>
```

## 5. Mantenimiento y Personalización
Para cambiar la imagen que se muestra cuando no hay foto de producto:
1. Reemplazar el archivo físico en `public/images/placeholder-brand.png`.
2. El sistema detectará el nuevo archivo automáticamente en todas las vistas de la aplicación.

---
**Nota para el desarrollador:** Esta lógica es totalmente portable a otros proyectos. Solo requiere asegurar la existencia del asset de fallback en la carpeta `public` correspondiente.
