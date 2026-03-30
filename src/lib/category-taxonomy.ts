/**
 * Taxonomía canónica de categorías IMBRA.
 * Fuente única de verdad para normalizar categorías de WooCommerce
 * hacia slugs y nombres de display consistentes.
 *
 * Uso: findCategoryByText(nombreCategoria | tituloProducto)
 */

export interface CategoryMeta {
  slug: string;
  name: string;
  keywords: string[];
  icon: string;
  image?: string;
}

export const IMBRA_CATEGORIES: CategoryMeta[] = [
  {
    slug: "motor",
    name: "Motor",
    keywords: [
      "MOTOR", "CULATA", "CARTER", "PISTON", "PISTÓN",
      "CIGÜEÑAL", "CIGUENAL", "VALVULA", "VÁLVULA", "EMPAQUE",
      "ARBOL DE LEVAS", "ÁRBOL DE LEVAS", "BIELA", "CILINDRO",
      "TAPA VALVULAS", "TAPA VÁLVULAS", "JUNTA DE CULATA",
      // Categorías WooCommerce SAP
      "GUIAS DE MOTOR", "ESPARRAGOS", "ESPARRAGO", "ESPÁRRAGO",
      "LAINAS Y ARAND FIJ", "LAINA", "LAINAS",
      "RETENEDORES", "RETENEDOR",
      "VARILLAS DE IMPULSO", "VARILLA DE IMPULSO",
    ],
    icon: "settings",
    image: "/categories/motor.png",
  },
  {
    slug: "transmision",
    name: "Transmisión",
    keywords: [
      "TRANSMISION", "TRANSMISIÓN", "CADENA", "CORONA",
      "PIÑON", "PINON", "KIT ARRASTRE", "EMBRAGUE", "CLOCHE",
      "CAJA DE CAMBIO", "PALANCA DE CAMBIO", "SPROCKET",
      // Categorías WooCommerce SAP
      "CLUTCH", "KIT REP CLUTCH",
    ],
    icon: "settings_input_component",
    image: "/categories/transmision.png",
  },
  {
    slug: "suspension",
    name: "Suspensión",
    keywords: [
      "KIT TIJERA", "KIT DE SUSPENSION", "KIT DE SUSPENSIÓN",
      "SUSPENSION", "SUSPENSIÓN", "TIJERA",
      "AMORTIGUADOR", "HORQUILLA", "BUJE TIJERA", "RESORTE",
      "TAPA BUZON", "BUZON", "AMORTIGUACION",
      // Categorías WooCommerce SAP
      "BUJES", "BUJE",
      "EJE TRAS Y DEL", "EJE TRASERO", "EJE DELANTERO",
      "RESORTERIA", "RESORTERÍA",
    ],
    icon: "linear_scale",
    image: "/categories/suspension.png",
  },
  {
    slug: "frenos",
    name: "Frenos",
    keywords: [
      "BANDAS Y PASTILLAS", "DISCOS DE FRENO", "LEVAS DE FRENO",
      "EJE ABRE BANDAS", "VARILLA FRENO CLUTCH",
      "FRENO", "FRENOS", "PASTILLA", "DISCO DE FRENO",
      "TAMBOR", "ZAPATA", "BALATA", "LIQUIDO DE FRENO",
      "LÍQUIDO DE FRENO", "CILINDRO DE FRENO", "CABLE DE FRENO",
      // Categorías WooCommerce SAP
      "BANDA", "LEVA DE FRENO", "LEVA",
    ],
    icon: "trip_origin",
    image: "/categories/frenos.png",
  },
  {
    slug: "electricos",
    name: "Eléctricos",
    keywords: [
      // Categorías WooCommerce SAP (primero, más específicas)
      "PARTES ELECTRICAS", "PARTES ELÉCTRICAS",
      "ELECTRICO", "ELÉCTRICO", "BOBINA", "CDI", "REGULADOR",
      "RECTIFICADOR", "ARRANQUE", "ALTERNADOR", "BATERIA", "BATERÍA",
      "BUJIA", "BUJÍA", "RELAY", "FUSIBLE", "INTERRUPTOR",
      "CABLE BUJIA", "SWITCH", "SENSOR", "VELOCIMETRO", "VELOCÍMETRO",
    ],
    icon: "bolt",
    image: "/categories/electricos.png",
  },
  {
    slug: "iluminacion",
    name: "Iluminación",
    keywords: [
      "FARO", "FAROL", "LUZ", "LINTERNA", "BOMBILLO",
      "STOP", "PILOTO", "DIRECCIONAL", "INTERMITENTE",
      "ILUMINACION", "ILUMINACIÓN",
    ],
    icon: "lightbulb",
    image: "/categories/iluminacion.png",
  },
  {
    slug: "carburacion",
    name: "Carburación",
    keywords: [
      "CARBURADOR", "CARBURACION", "CARBURACIÓN",
      "MARIPOSA", "FILTRO DE AIRE", "FILTRO AIRE",
      "ADMISION", "ADMISIÓN", "INYECCION", "INYECCIÓN",
      "AGUJA CARBURADOR", "CHICLER", "SURTIDOR",
    ],
    icon: "tune",
    image: "/categories/carburacion.png",
  },
  {
    slug: "escape",
    name: "Escape",
    keywords: [
      "ESCAPE", "EXHOSTO", "SILENCIADOR",
      "TUBO DE ESCAPE", "MOFLE", "CATALIZADOR",
    ],
    icon: "waves",
    image: "/categories/escape.png",
  },
  {
    slug: "ruedas",
    name: "Ruedas y Llantas",
    keywords: [
      // Categorías WooCommerce SAP (primero, más específicas)
      "TENSORES RUEDA", "TENSOR RUEDA",
      "LLANTA", "RIN", "RUEDA", "TUBO LLANTA",
      "VALVULA AIRE", "VÁLVULA AIRE", "ARO", "NEUMATICO", "NEUMÁTICO",
      // Categorías WooCommerce SAP
      "CAUCHOS", "CAUCHO",
    ],
    icon: "radio_button_unchecked",
    image: "/categories/wheels_tires.png",
  },
  {
    slug: "carroceria",
    name: "Carrocería",
    keywords: [
      "CHASIS", "GUARDABARRO", "GUARDABARROS",
      "CARENADO", "PLASTICO", "PLÁSTICO", "PLASTICOS", "PLÁSTICOS",
      "TAPA", "ESTRIBO", "MANUBRIO", "PALANCA DE FRENO",
      "ESPEJOS", "ESPEJO",
    ],
    icon: "directions_bike",
    image: "/categories/chasis_3d.png",
  },
  {
    slug: "asiento",
    name: "Asiento",
    keywords: [
      "ASIENTO", "SILLIN", "SILLÍN",
      "ESPUMA SILLIN", "TAPIZADO",
    ],
    icon: "chair",
    image: "/categories/asientos.png",
  },
  {
    slug: "lubricacion",
    name: "Lubricación y Fluidos",
    keywords: [
      "FILTRO DE ACEITE", "FILTRO ACEITE",
      "ACEITE", "LUBRICANTE", "GRASA",
      "REFRIGERANTE",
    ],
    icon: "opacity",
    image: "/categories/filtros.png",
  },
  {
    slug: "herramientas",
    name: "Herramientas",
    keywords: [
      // Categorías WooCommerce SAP (primero, más específicas)
      "HERRAMIENTA ESP", "HERRAMIENTAS Y RIMAS",
      "HERRAMIENTA", "HERRAMIENTAS", "EXTRACTOR",
      "LLAVE ESPECIAL", "CALIBRADOR", "RIMA",
    ],
    icon: "build",
    image: "/categories/herramientas_3d.png",
  },
  {
    slug: "fijacion",
    name: "Tornillería y Fijación",
    keywords: [
      // Categorías WooCommerce SAP
      "TORNILLERIA", "TORNILLERÍA", "TORNILLO", "TORNILLOS",
      "TUERCA", "TUERCAS", "PERNO", "PERNOS",
      "ARANDELA", "ARANDELAS",
    ],
    icon: "construction",
    image: "/categories/fijacion.png",
  },
  {
    slug: "kit",
    name: "Kits",
    keywords: [
      "KIT MOTOR", "KIT PISTON", "KIT EMPAQUE",
      "KIT CARBURADOR", "KIT FRENO", "KIT CADENA",
    ],
    icon: "inventory_2",
    image: "/categories/kits.png",
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    keywords: [
      "ACCESORIOS", "ACCESORIO", "MANILLAR", "MANUBRIO",
      "CEPILLO", "CANASTA", "ESTANTERIA", "ESTANTERÍA",
      "EXHIBIDOR", "PORTA PLACA", "BOTON", "BOTÓN",
      "MANIJAS DE AGARRE", "KIT SUJECION", "KIT SUJECIÓN",
    ],
    icon: "extension",
    image: "/categories/fijacion.png",
  },
  {
    slug: "varios",
    name: "Varios",
    keywords: [
      "VARIOS", "CUPULA", "CÚPULA", "WINDSHIELD", "VISOR",
      "PARABRISAS", "BURBUJA", "GUARDABARRO TRASERO",
      "EXTENSOR", "PROTECTOR", "TAPON", "TAPÓN",
    ],
    icon: "more_horiz",
    image: "/categories/varios.png",
  },
];

export const DEFAULT_CATEGORY: CategoryMeta = {
  slug: "general",
  name: "General",
  keywords: [],
  icon: "category",
};

/**
 * Busca la categoría canónica para un texto dado (nombre de categoría WooCommerce o título de producto).
 * Ordena por longitud de keyword descendente para que keywords más específicas ganen
 * (ej: "KIT TIJERA" → suspensión antes de "KIT" → kits).
 */
export function findCategoryByText(text: string): CategoryMeta {
  if (!text?.trim()) return DEFAULT_CATEGORY;

  const upper = text.toUpperCase().trim();

  // Construir lista plana (categoría + keyword) ordenada por especificidad
  const entries: { cat: CategoryMeta; kw: string }[] = [];
  for (const cat of IMBRA_CATEGORIES) {
    for (const kw of cat.keywords) {
      entries.push({ cat, kw });
    }
  }
  entries.sort((a, b) => b.kw.length - a.kw.length);

  for (const { cat, kw } of entries) {
    if (upper.includes(kw)) return cat;
  }

  return DEFAULT_CATEGORY;
}

/**
 * Devuelve todas las categorías que tienen imagen asignada (para el carousel/menú).
 */
export function getCategoriesWithImage(): CategoryMeta[] {
  return IMBRA_CATEGORIES.filter((c) => c.image);
}
