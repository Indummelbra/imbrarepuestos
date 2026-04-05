# Estándar de Imágenes de Productos: Integración SAP

**Fecha de Implementación:** 16 de Marzo, 2026
**Proveedor de Imágenes:** Servidor Interno SAP (movil.indummelbra.com)

## 1. Definición del Estándar
Para garantizar la uniformidad visual y la actualización automática desde el ERP (SAP), se ha establecido que **todas** las imágenes del catálogo se consuman directamente del servidor SAP, ignorando las cargas manuales en WooCommerce.

## 2. Lógica de Construcción de URLs
El sistema construye la URL de imagen dinámicamente basándose en el SKU del producto:
- **Dominio**: `https://movil.indummelbra.com:50101`
- **Ruta**: `/Imbrapp/images/`
- **Transformación de SKU**: Se toma el SKU de WooCommerce (ej: `104317b`), se convierte a minúsculas y se elimina el sufijo `b` para coincidir con el nombre de archivo en SAP (`104317`).
- **Formato**: `.png`

**URL Resultante:** `https://movil.indummelbra.com:50101/Imbrapp/images/104317.png`

## 3. Ajustes de UI y Estética
- **Fondo Unificado**: Todos los contenedores de imágenes (`ProductCard`, `ProductPage`, `CartPage`) han sido ajustados a `bg-white` (Blanco) para integrarse sin costuras con el fondo de las imágenes SAP.
- **Seguridad de Red**: Se configuró `next.config.js` para permitir el tráfico desde el puerto `50101` del servidor SAP.

## 4. Archivos Modificados
- `src/lib/mappers.ts`: Donde reside la lógica de transformación del SKU.
- `next.config.js`: Configuración de `remotePatterns`.
- `ProductCard.tsx` & `page.tsx`: Actualizaciones de diseño para fondos blancos.
