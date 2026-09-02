"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <main>
          <h1>Ocurrió un error</h1>
          <p>No pudimos cargar esta página.</p>
          <button onClick={() => reset()} type="button">
            Intentar nuevamente
          </button>
        </main>
      </body>
    </html>
  );
}
