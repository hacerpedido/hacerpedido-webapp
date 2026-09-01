import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";

// The App Router does not use pages/_app.tsx, so its routes need their own
// global stylesheet imports. Keep the same order used by the Pages Router:
// the app's global rules load before Bootstrap's reset/utilities.
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata: Metadata = {
  description:
    "Pedí a tu comercio favorito por WhatsApp. Empezá a recibir pedidos de tus clientes hoy mismo, gratis.",
  metadataBase: new URL("https://hacerpedido.com"),
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
    url: "https://hacerpedido.com/",
  },
  title: "Hacer Pedido | Pedí a tu comercio favorito por WhatsApp.",
  twitter: {
    card: "summary",
    description: "HacerPedido",
    title: "HacerPedido",
  },
};

/**
 * App Router root boundary. It intentionally does not define a page route;
 * existing URLs remain owned by the Pages Router during the incremental
 * migration.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
