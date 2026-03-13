# Documentación de Componente: Filtro (MotoSelector)
**Fecha de Registro:** 2026-03-12
**Estado:** Terminado / Parametrizado

## 🏗️ Estructura de 3 Niveles (Jerarquía Imbra)
Integrado como componente de acción rápida para identificación de motocicletas.

1.  **DIV 1 (Fondo):** Contenedor de ancho completo con fondo blanco o adaptable.
2.  **DIV 2 (Contenedor Maestro):** Clase `.imbra-content-container`.
    *   **Max-Width:** 1920px
    *   **Padding Horizontal:** 20px (`px-5`).
3.  **DIV 3 (Contenido):** Barra de filtros horizontal con selectores estilizados.

## 🎨 Parámetros y Tokens
- **Estilo:** Bordes rectos (Industrial), sombreados suaves.
- **Selectores:** Marca, Año, Cilindraje, Modelo.
- **Acción:** Botón de "BUSCAR" en naranja corporativo.

## 🧩 Lógica Funcional
- Permite al usuario filtrar el catálogo completo basándose en las especificaciones de su moto desde el Hero.

---
**Ruta del Archivo Original:** `src/components/features/MotoSelector.tsx`
