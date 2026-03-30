/**
 * Transportadoras colombianas — configuración para la tienda headless.
 *
 * El slug debe coincidir exactamente con los valores guardados en WordPress
 * por el snippet imbra-shipping-tracking.php (_imbra_shipping_carrier).
 *
 * trackingUrl: página de rastreo de la transportadora. El cliente copia
 * el número de guía con el botón "Copiar guía" y lo pega ahí.
 */

export interface Carrier {
  slug: string;
  name: string;
  trackingUrl: string;
  logo?: string; // opcional — ruta en /public/carriers/
}

export const CARRIERS: Carrier[] = [
  {
    slug: "servientrega",
    name: "Servientrega",
    trackingUrl: "https://www.servientrega.com/wps/portal/Colombia/inicio/herramientas/rastrear-mi-envio",
  },
  {
    slug: "interrapidisimo",
    name: "Interrapidísimo",
    trackingUrl: "https://www.interrapidisimo.com/rastreo/",
  },
  {
    slug: "coordinadora",
    name: "Coordinadora",
    trackingUrl: "https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastreo-de-envios/",
  },
  {
    slug: "envia",
    name: "Envía",
    trackingUrl: "https://www.envia.co/tracking",
  },
  {
    slug: "tcc",
    name: "TCC",
    trackingUrl: "https://www.tcc.com.co/inicio/servicios-en-linea/rastrear-mi-paquete.html",
  },
  {
    slug: "deprisa",
    name: "Deprisa",
    trackingUrl: "https://www.deprisa.com/es/rastrear-envio",
  },
  {
    slug: "472",
    name: "472 · Correos de Colombia",
    trackingUrl: "https://www.4-72.com.co/",
  },
  {
    slug: "domina",
    name: "Domina",
    trackingUrl: "https://www.domina.com.co/rastreo",
  },
  {
    slug: "mensajeros",
    name: "Mensajeros Urbanos",
    trackingUrl: "https://mensajerosurbanos.com/rastreo",
  },
  {
    slug: "suppla",
    name: "Suppla",
    trackingUrl: "https://www.suppla.com/rastreo",
  },
  {
    slug: "otra",
    name: "Otra transportadora",
    trackingUrl: "#",
  },
];

/** Busca una transportadora por su slug. */
export function getCarrier(slug: string): Carrier | undefined {
  return CARRIERS.find((c) => c.slug === slug);
}
