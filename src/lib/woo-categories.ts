/**
 * Categorías canónicas de WooCommerce/SAP de IMBRA.
 * Fuente única de verdad para sidebar, header, /categorias, banners.
 * NO agrupar — cada categoría es independiente.
 */

export interface WooCategory {
  slug: string;        // slug exacto de WooCommerce
  name: string;        // nombre de display
  icon: string;        // Material Icons
  image?: string;      // imagen en /public/categories/
}

export const WOO_CATEGORIES: WooCategory[] = [
  { slug: "accesorios",          name: "Accesorios",              icon: "category",                 image: "/categories/herramientas_3d.png" },
  { slug: "bandas-y-pastillas",  name: "Bandas y Pastillas",      icon: "trip_origin",              image: "/categories/frenos.png" },
  { slug: "bujes",               name: "Bujes",                   icon: "radio_button_unchecked",   image: "/categories/transmision.png" },
  { slug: "cauchos",             name: "Cauchos",                 icon: "circle",                   image: "/categories/wheels_tires.png" },
  { slug: "coronas",             name: "Coronas",                 icon: "settings_input_component", image: "/categories/transmision.png" },
  { slug: "direccionales",       name: "Direccionales",           icon: "traffic",                  image: "/categories/iluminacion.png" },
  { slug: "discos-de-freno",     name: "Discos de Freno",         icon: "album",                    image: "/categories/frenos.png" },
  { slug: "eje-abre-bandas",     name: "Eje Abre Bandas",         icon: "rotate_right",             image: "/categories/frenos.png" },
  { slug: "eje-tras-y-del",      name: "Eje Tras y Del",          icon: "compare_arrows",           image: "/categories/transmision.png" },
  { slug: "esparragos",          name: "Espárragos",              icon: "hardware",                 image: "/categories/fijacion.png" },
  { slug: "filtro-de-aceite",    name: "Filtro de Aceite",        icon: "opacity",                  image: "/categories/filtros.png" },
  { slug: "guias-de-motor",      name: "Guías de Motor",          icon: "settings",                 image: "/categories/motor.png" },
  { slug: "herramienta-esp",     name: "Herramienta Esp.",        icon: "build",                    image: "/categories/herramientas_3d.png" },
  { slug: "herramientas-y-rimas",name: "Herramientas y Rimas",   icon: "build",                    image: "/categories/herramientas_3d.png" },
  { slug: "kit-de-suspension",   name: "Kit de Suspensión",       icon: "linear_scale",             image: "/categories/suspension.png" },
  { slug: "kit-rep-bomba-freno", name: "Kit Rep. Bomba Freno",    icon: "trip_origin",              image: "/categories/frenos.png" },
  { slug: "kit-rep-carburador",  name: "Kit Rep. Carburador",     icon: "tune",                     image: "/categories/carburacion.png" },
  { slug: "kit-rep-clutch",      name: "Kit Rep. Clutch",         icon: "settings_input_component", image: "/categories/transmision.png" },
  { slug: "kit-tijera",          name: "Kit Tijera",              icon: "build_circle",             image: "/categories/suspension.png" },
  { slug: "lainas-y-arand-fij",  name: "Lainas y Arand. Fij.",   icon: "hardware",                 image: "/categories/fijacion.png" },
  { slug: "levas-de-freno",      name: "Levas de Freno",          icon: "rotate_right",             image: "/categories/frenos.png" },
  { slug: "partes-electricas",   name: "Partes Eléctricas",       icon: "bolt",                     image: "/categories/electricos.png" },
  { slug: "resorteria",          name: "Resortería",              icon: "compress",                 image: "/categories/suspension.png" },
  { slug: "retenedores",         name: "Retenedores",             icon: "donut_large",              image: "/categories/motor.png" },
  { slug: "tensores-rueda",      name: "Tensores Rueda",          icon: "radio_button_unchecked",   image: "/categories/wheels_tires.png" },
  { slug: "tornilleria",         name: "Tornillería",             icon: "construction",             image: "/categories/fijacion.png" },
  { slug: "tuerca",              name: "Tuerca",                  icon: "trip_origin",              image: "/categories/fijacion.png" },
  { slug: "varilla-freno-clutch",name: "Varilla Freno Clutch",    icon: "remove",                   image: "/categories/frenos.png" },
  { slug: "varillas-de-impulso", name: "Varillas de Impulso",     icon: "line_weight",              image: "/categories/motor.png" },
  { slug: "varios",              name: "Varios",                  icon: "grid_view",                image: "/categories/chasis_3d.png" },
];

export function getWooCategoryBySlug(slug: string): WooCategory | undefined {
  return WOO_CATEGORIES.find((c) => c.slug === slug);
}

/* ─────────────────────────────────────────────────────────────────
 * Agrupación aprobada de las 30 categorías en 10 grupos lógicos.
 * Fuente única de verdad — usar en Header (mega menú) y /categorias.
 * ───────────────────────────────────────────────────────────────── */
export interface CategoryGroup {
  id: string;
  name: string;
  image: string;
  slugs: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: "frenos",       name: "Frenos",       image: "/categories/frenos_3d.png",       slugs: ["bandas-y-pastillas","discos-de-freno","eje-abre-bandas","kit-rep-bomba-freno","levas-de-freno","varilla-freno-clutch"] },
  { id: "motor",        name: "Motor",         image: "/categories/motor_3d.png",        slugs: ["guias-de-motor","retenedores","varillas-de-impulso"] },
  { id: "transmision",  name: "Transmisión",   image: "/categories/transmision.png",     slugs: ["bujes","coronas","eje-tras-y-del","kit-rep-clutch"] },
  { id: "suspension",   name: "Suspensión",    image: "/categories/suspension.png",      slugs: ["kit-de-suspension","kit-tijera","resorteria"] },
  { id: "electricos",   name: "Eléctrico",     image: "/categories/electricos_3d.png",   slugs: ["partes-electricas","direccionales"] },
  { id: "carburacion",  name: "Carburación",   image: "/categories/carburacion.png",     slugs: ["kit-rep-carburador","filtro-de-aceite"] },
  { id: "fijacion",     name: "Fijación",      image: "/categories/fijacion.png",        slugs: ["esparragos","lainas-y-arand-fij","tornilleria","tuerca"] },
  { id: "ruedas",       name: "Ruedas",        image: "/categories/wheels_tires.png",    slugs: ["cauchos","tensores-rueda"] },
  { id: "herramientas", name: "Herramientas",  image: "/categories/herramientas_3d.png", slugs: ["herramienta-esp","herramientas-y-rimas","accesorios"] },
  { id: "varios",       name: "Varios",        image: "/categories/chasis_3d.png",       slugs: ["varios"] },
];
