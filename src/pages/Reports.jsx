import { useState } from 'react';
import api from '../services/api';
import { ResourceStatus } from '../components/ResourceStatus';
import { useAuth } from '../contexts/useAuth';
import { Icon } from '../components/Icon';
import { BookCover } from '../components/BookCover';

const today = () => new Date().toISOString().slice(0, 10);
export const Reports = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const { user } = useAuth();
  const fetchReport = async () => {
    if (!from || !to) { setError('Selecciona las fechas de inicio y fin.'); return; }
    if (from > to) { setError('La fecha de inicio debe ser anterior o igual a la fecha de fin.'); return; }
    setError(''); setLoading(true);
    try { const response = await api.get('/reports/most-borrowed', { params: { from, to } }); setReport(response.data.rows); }
    catch (err) { setError(err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo cargar el reporte.'); }
    finally { setLoading(false); }
  };
  if (user?.role !== 'admin') return <div className="panel empty-state"><span className="empty-icon"><Icon name="chart"/></span><strong>Acceso exclusivo para administradores</strong><span>Tu rol no permite consultar este reporte.</span></div>;
  const totalLendings = report?.reduce((sum, row) => sum + Number(row.times_borrowed || 0), 0) ?? 0;
  const ranked = [...(report || [])].sort((a, b) => Number(b.times_borrowed) - Number(a.times_borrowed));
  return <div className="reports-page">
    <div className="page-heading"><div><span className="eyebrow">ANÁLISIS DE COLECCIÓN</span><h1>Libros más prestados</h1><p>Descubre qué historias han acompañado más a tus socios.</p></div><span className="report-period-icon"><Icon name="chart" size={20}/></span></div>
    <ResourceStatus error={error} loading={loading}/>
    <section className="collection-toolbar report-toolbar"><div className="form-field"><label htmlFor="report-from">Desde</label><input id="report-from" type="date" className="input" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)}/></div><span className="report-date-separator">—</span><div className="form-field"><label htmlFor="report-to">Hasta</label><input id="report-to" type="date" className="input" value={to} min={from || undefined} onChange={event => setTo(event.target.value)}/></div><button className="button button--primary" onClick={fetchReport} disabled={loading}><Icon name="chart" size={16}/>{loading ? 'Consultando…' : 'Generar reporte'}</button><button className="button button--secondary" onClick={() => { setFrom(today()); setTo(today()); setReport(null); setError(''); }}>Restablecer</button></section>
    {report && <><div className="reports-highlight"><div className="report-summary"><span>Títulos en el reporte</span><strong>{report.length}</strong></div><div className="report-summary"><span>Préstamos en el periodo</span><strong>{totalLendings}</strong></div><div className="report-summary"><span>Rango consultado</span><strong className="report-range">{from} — {to}</strong></div></div>
      {report.length ? <section className="data-panel"><div className="panel-heading report-table-heading"><div><span className="eyebrow">RENDIMIENTO DE LA COLECCIÓN</span><h2>Popularidad por título</h2></div><span className="results-meta">{report.length} {report.length === 1 ? 'resultado' : 'resultados'}</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Posición</th><th>Libro</th><th>Categoría</th><th>Préstamos</th></tr></thead><tbody>{ranked.map((row, index) => <tr key={`${row.book_title}-${row.category_name}-${index}`}><td><span className={`report-rank${index === 0 ? ' report-rank--top' : ''}`}>{String(index + 1).padStart(2, '0')}</span></td><td><div className="report-book-cell"><BookCover compact book={{ title: row.book_title, author: '', isbn: row.isbn, id: `${row.book_title}-${index}`, cover_key: null }}/><div><strong>{row.book_title}</strong><small>Según el título guardado en el préstamo</small></div></div></td><td>{row.category_name}</td><td><span className="report-count">{Number(row.times_borrowed).toLocaleString('es-CO')}</span></td></tr>)}</tbody></table></div></section> : <div className="panel empty-state"><span className="empty-icon"><Icon name="chart"/></span><strong>Sin préstamos en estas fechas</strong><span>Prueba otro periodo para consultar la actividad de la colección.</span></div>}</>}
    {!report && !loading && <div className="panel report-intro"><span className="report-intro-icon"><Icon name="spark" size={22}/></span><div><strong>Un vistazo a los favoritos de la comunidad</strong><p>Elige un periodo para ver los libros con más préstamos. El reporte conserva los nombres de título y categoría de cada préstamo.</p></div></div>}
  </div>;
};
