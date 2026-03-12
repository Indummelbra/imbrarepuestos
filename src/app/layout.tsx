import type { Metadata } from "next";
import { Inter, Montserrat, Archivo } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Imbra Store | Repuestos para Motos de Alto Impacto",
  description: "La tienda líder en repuestos industriales y accesorios para motos. Calidad garantizada para profesionales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body 
        className={`${inter.variable} ${montserrat.variable} ${archivo.variable} font-sans antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
