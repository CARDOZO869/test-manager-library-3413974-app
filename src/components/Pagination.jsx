import { Icon } from './Icon';
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return <nav aria-label="Paginación" className="pagination"><button className="button button--secondary button--small" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Anterior</button><span>Página {page} de {totalPages}</span><button className="button button--secondary button--small" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Siguiente <Icon name="arrow" size={13}/></button></nav>;
}
