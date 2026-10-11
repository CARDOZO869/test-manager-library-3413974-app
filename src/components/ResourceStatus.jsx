export function ResourceStatus({ error, loading }) {
  return <>{loading && <p role="status" className="mb-4">Cargando…</p>}{error && <p role="alert" className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</p>}</>;
}
