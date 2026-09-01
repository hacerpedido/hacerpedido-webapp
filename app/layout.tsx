import type { ReactNode } from "react";
import { Providers } from "./providers";

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
