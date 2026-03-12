import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
