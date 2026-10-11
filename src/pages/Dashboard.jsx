import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { useMemberNames } from '../services/useMemberNames';
import { Icon } from '../components/Icon';
import { ResourceStatus } from '../components/ResourceStatus';

const initial = { books: 0, members: 0, active: 0, overdue: 0, available: 0, sampleSize: 0, recent: [] };
const dateLabel = value => value ? new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : 'Fecha no disponible';

export const Dashboard = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(initial);
  const { user } = useAuth();
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.get('/books', { params: { page: 1, size: 20 }, signal: controller.signal }),
      api.get('/members', { params: { page: 1, size: 1 }, signal: controller.signal }),
      api.get('/loans', { params: { page: 1, size: 1, status: 'open' }, signal: controller.signal }),
      api.get('/loans/overdue', { signal: controller.signal }),
      api.get('/loans', { params: { page: 1, size: 5 }, signal: controller.signal }),
    ]).then(([booksResponse, membersResponse, activeResponse, overdueResponse, recentResponse]) => {
      if (controller.signal.aborted) return;
      const books = booksResponse.data;
      const overdue = overdueResponse.data.items || overdueResponse.data;
      setStats({
        books: books.total,
        members: membersResponse.data.total,
        active: activeResponse.data.total,
        overdue: overdueResponse.data.total ?? overdue.length,
        available: books.items.reduce((sum, book) => sum + book.available_copies, 0),
        sampleSize: books.items.length,
        recent: recentResponse.data.items || [],
      });
      setError('');
    }).catch(err => {
      if (!controller.signal.aborted) setError(err.response?.data?.message || 'No se pudo cargar el resumen. Intenta actualizar la página.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const recentMembers = useMemberNames(stats.recent);
  const greeting = user?.role === 'admin' ? 'Qué bueno tenerte de vuelta.' : 'Tu biblioteca está en buenas manos.';

  return <div className="dashboard-page">
    <div className="page-heading dashboard-heading"><div><span className="eyebrow">TU BIBLIOTECA, EN UN VISTAZO</span><h1>Hola{user?.username ? `, ${user.username}` : ''} <span className="wave">✳</span></h1><p>{greeting} Aquí tienes la actividad reciente.</p></div><span className="date-pill"><Icon name="grid" size={16}/>Panel de control</span></div>
    <ResourceStatus error={error} loading={loading}/>
    <section className="stat-grid" aria-label="Estadísticas de la biblioteca">
      <article className="stat-card"><span className="stat-icon stat-icon--blue"><Icon name="book"/></span><span className="stat-label">Libros en catálogo</span><strong className="stat-value">{loading ? '—' : stats.books.toLocaleString('es-CO')}</strong><span className="stat-foot">Títulos activos</span></article>
      <article className="stat-card"><span className="stat-icon stat-icon--green"><Icon name="users"/></span><span className="stat-label">Socios registrados</span><strong className="stat-value">{loading ? '—' : stats.members.toLocaleString('es-CO')}</strong><span className="stat-foot">Personas en la biblioteca</span></article>
      <article className="stat-card"><span className="stat-icon stat-icon--violet"><Icon name="loan"/></span><span className="stat-label">Préstamos activos</span><strong className="stat-value">{loading ? '—' : stats.active.toLocaleString('es-CO')}</strong><span className="stat-foot">Vigentes según su fecha límite</span></article>
      <article className={`stat-card${stats.overdue ? ' stat-card--warning' : ''}`}><span className="stat-icon stat-icon--amber"><Icon name="clock"/></span><span className="stat-label">Préstamos vencidos</span><strong className="stat-value">{loading ? '—' : stats.overdue.toLocaleString('es-CO')}</strong><span className="stat-foot">Requieren seguimiento</span></article>
    </section>
    <section className="availability-strip"><span className="availability-symbol"><Icon name="check" size={18}/></span><div><strong>{loading ? 'Consultando disponibilidad…' : `${stats.available.toLocaleString('es-CO')} ejemplares disponibles`}</strong><span>En los {stats.sampleSize} títulos de la primera página del catálogo</span></div><Link to="/books" className="text-link">Explorar catálogo <Icon name="arrow" size={16}/></Link></section>
    <section className="dashboard-lower">
      <div className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">LO ÚLTIMO</span><h2>Actividad reciente</h2></div><Link to="/loans" className="text-link">Ver préstamos <Icon name="arrow" size={16}/></Link></div>
        {stats.recent.length ? <div className="activity-list">{stats.recent.map(loan => {
          const isClosed = loan.status === 'closed';
          const title = loan.items?.[0]?.book_title || 'Préstamo registrado';
          return <article className="activity-row" key={loan.id}><span className={`activity-icon${isClosed ? ' activity-icon--closed' : ''}`}><Icon name={isClosed ? 'check' : 'loan'} size={17}/></span><div className="activity-copy"><strong>{title}</strong><span>{recentMembers[loan.member_id] || 'Socio'} · {dateLabel(loan.loaned_at)}</span></div><span className={`status-badge ${isClosed ? 'status-badge--green' : loan.status === 'overdue' ? 'status-badge--red' : 'status-badge--blue'}`}>{isClosed ? 'Devuelto' : loan.status === 'overdue' ? 'Vencido' : 'Activo'}</span></article>;
        })}</div> : <div className="empty-state empty-state--compact"><span className="empty-icon"><Icon name="loan"/></span><strong>{loading ? 'Cargando actividad…' : 'Aún no hay actividad'}</strong><span>Los nuevos préstamos aparecerán aquí.</span></div>}
      </div>
      <div className="panel quick-panel"><span className="eyebrow">ACCESOS RÁPIDOS</span><h2>¿Qué necesitas hacer?</h2><div className="quick-links"><Link to="/loans" className="quick-link"><span className="quick-link-icon"><Icon name="plus"/></span><span><strong>Registrar préstamo</strong><small>Asignar libros a un socio</small></span><Icon name="chevron" size={18}/></Link><Link to="/members" className="quick-link"><span className="quick-link-icon quick-link-icon--green"><Icon name="users"/></span><span><strong>Agregar un socio</strong><small>Incorporar a la comunidad</small></span><Icon name="chevron" size={18}/></Link>{user?.role === 'admin' && <Link to="/books" className="quick-link"><span className="quick-link-icon quick-link-icon--amber"><Icon name="book"/></span><span><strong>Añadir un libro</strong><small>Ampliar el catálogo</small></span><Icon name="chevron" size={18}/></Link>}</div></div>
    </section>
  </div>;
};
