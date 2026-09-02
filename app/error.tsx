"use client";

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h1>Ocurrió un error</h1>
      <p>No pudimos cargar esta página.</p>
      <button onClick={() => reset()} type="button">
        Intentar nuevamente
      </button>
    </main>
  );
}
