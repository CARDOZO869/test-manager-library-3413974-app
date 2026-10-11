export function Pagination({ page, totalPages, onChange }) {
  return <nav aria-label="Paginación" className="mt-6 flex items-center justify-between gap-3">
    <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50">Anterior</button>
    <span>Página {page} de {totalPages}</span>
    <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50">Siguiente</button>
  </nav>;
}
