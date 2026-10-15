import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Archivo is loaded with its width axis: expanded for display, condensed for labels.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Meng Heng · Driver #52",
  description:
    "Meng Heng is a backend developer in Phnom Penh, racing for BongKert Solutions. Race results, car setup and team radio: backend engineering at race pace.",
  openGraph: {
    title: "Meng Heng · Backend engineering, race pace",
    description: "Backend developer in Phnom Penh. NestJS, Node.js, PostgreSQL, Docker.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
