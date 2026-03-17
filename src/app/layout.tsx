import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ImageAI Studio - Genera Imágenes con IA",
  description: "Plataforma profesional de generación de imágenes con inteligencia artificial. Crea contenido visual único para tu negocio, redes sociales y proyectos creativos.",
  keywords: ["IA", "inteligencia artificial", "generador de imágenes", "AI art", "diseño", "marketing", "contenido visual"],
  authors: [{ name: "ImageAI Studio" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ImageAI Studio - Genera Imágenes con IA",
    description: "Crea imágenes increíbles con inteligencia artificial en segundos",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
