import type { Metadata } from "next";
import { Inter, Montserrat, Archivo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  style: ["normal"],
  variable: "--font-archivo",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Imbra Store | Repuestos para Motos de Alto Impacto",
  description: "La tienda líder en repuestos industriales y accesorios para motos. Calidad garantizada para profesionales.",
  icons: {
    icon: "https://mkt.imbrarepuestos.com/wp-content/uploads/2026/04/Favicon-Imbra.png",
    apple: "https://mkt.imbrarepuestos.com/wp-content/uploads/2026/04/Favicon-Imbra.png",
  },
  openGraph: {
    images: ["https://mkt.imbrarepuestos.com/wp-content/uploads/2026/04/Favicon-Imbra.png"],
  },
};

import { CartProvider } from "@/context/CartContext";
import { CartSidebar } from "@/components/cart/CartSidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#F18700" />
        {/* Material Icons — carga no bloqueante vía script */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} ${archivo.variable} font-sans antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  );
}
