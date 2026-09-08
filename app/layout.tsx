import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";

// Global styles are owned by the App Router. Keep the established order:
// the app's global rules load before Bootstrap's reset/utilities.
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hacerpedido.com";

export const metadata: Metadata = {
  description:
    "Pedí a tu comercio favorito por WhatsApp. Empezá a recibir pedidos de tus clientes hoy mismo, gratis.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/favicon.ico",
    apple: "/logo192.png",
  },
  openGraph: {
    description: "Pedí a tu comercio favorito por WhatsApp",
    images: ["og_image.jpg"],
    siteName: "Hacer Pedido",
    title: "HacerPedido",
    type: "article",
    url: `${SITE_URL}/`,
  },
  title: "Hacer Pedido | Pedí a tu comercio favorito por WhatsApp.",
  twitter: {
    card: "summary",
    description: "HacerPedido",
    title: "HacerPedido",
  },
};

/** App Router root layout for all application routes. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
