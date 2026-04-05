# Walkthrough: Infraestructura E-commerce Headless Imbra Store

He completado el desarrollo de la base tecnológica para la nueva tienda online de Imbra Store. El proyecto está diseñado para ser de alto rendimiento, visualmente impactante y fácil de desplegar.

## ✅ Hitos Alcanzados

### 1. Núcleo Tecnológico (Next.js 15 + Tailwind 4)
*   **Next.js 15 (App Router):** Implementación de Server Components para una carga instantánea.
*   **Tailwind CSS 4:** Uso de la última versión para una gestión de estilos más eficiente y moderna.
*   **TypeScript:** Código fuertemente tipado para evitar errores en producción.

### 2. Estética Industrial Premium
He implementado los siguientes componentes con el lenguaje visual de Imbra:
*   **Header & Navbar:** Con búsqueda integrada, asistencia de WhatsApp y acceso rápido al carrito.
*   **Hero Section:** Un banner de alto impacto con gradientes oscuros y paleta de colores amarillo/negro.
*   **MotoSelector:** Un buscador inteligente por Año/Marca/Modelo para facilitar la compra de repuestos.
*   **Sistema de Grillas:** Preparado para mostrar productos destacados con badges de "NUEVO" y precios dinámicos.

### 3. Infraestructura Docker (Listp para Dokploy)
*   **[Dockerfile](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Store/Dockerfile) Multi-Stage:**
    *   **deps:** Instala solo lo necesario.
    *   **builder:** Realiza el build de Next.js de forma aislada.
    *   **runner:** Genera la imagen de producción final (`standalone`) ultraligera.
*   **[docker-compose.yml](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Store/docker-compose.yml):** Orquestación lista para producción con soporte para variables de entorno.

## 📁 Estructura del Proyecto
```text
/src
  /app        -> Rutas, Layouts y Páginas (Next.js 15)
  /components -> Componentes UI (Common, Layout, Features)
  /lib        -> Utilidades de API (WooCommerce Client)
  /types      -> Definiciones de TypeScript
/Dockerfile   -> Configuración de contenedor
/docker-compose.yml -> Orquestación para Dokploy
```

## 🚀 Próximos Pasos para el Usuario
1.  **Variables de Entorno:** Renombra el archivo [.env.example](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Store/.env.example) a `.env.local` y añade tus claves de WooCommerce.
2.  **Despliegue:** 
    *   Sube este código a tu repositorio GitHub.
    *   En **Dokploy**, crea un nuevo servicio de tipo "Docker" cargando este repositorio.
    *   Configura las variables de entorno en el panel de Dokploy.
    *   ¡Despliega y disfruta de la velocidad de una tienda Headless!

---
**Nota:** Todo el código y la interfaz están 100% en Español, siguiendo las Reglas de Oro del proyecto.
