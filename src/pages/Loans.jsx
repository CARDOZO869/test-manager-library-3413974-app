import { useState } from 'react';
import api from '../services/api';
import { useCollection } from '../services/useCollection';
import { useMemberNames } from '../services/useMemberNames';
import { Pagination } from '../components/Pagination';
import { ResourceStatus } from '../components/ResourceStatus';
import { MemberAvatar } from '../components/MemberAvatar';
import { Icon } from '../components/Icon';

const dateLabel = value => value ? new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
export const Loans = () => {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [selectedTitles, setSelectedTitles] = useState({});
  const [loanForm, setLoanForm] = useState({ member_id: '' });
  const [formError, setFormError] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [pendingReturn, setPendingReturn] = useState(null);

  const collection = useCollection('/loans', { page, size: 20, status: status || undefined, from: from || undefined, to: to || undefined, member_id: memberFilter || undefined });
  const overdueCollection = useCollection('/loans/overdue');
  const loans = collection.data.items;
  const memberNames = useMemberNames(loans);
  const filterMembers = useCollection('/members', { q: filterQuery || undefined, size: 50 });
  const overdue = overdueCollection.data.items;
  const memberOptions = useCollection(showCreate ? '/members' : null, { q: memberQuery || undefined, size: 50 });
  const bookOptions = useCollection(showCreate ? '/books' : null, { q: bookQuery || undefined, size: 50 });
  const members = memberOptions.data.items;
  const books = bookOptions.data.items.filter(book => book.available_copies > 0);
  const error = collection.error || overdueCollection.error;
  const loading = collection.loading || overdueCollection.loading;
  const totalPages = collection.totalPages;
  const displayLoans = tab === 'overdue' ? overdue.map(row => ({ id: row.loan_id, member_id: row.member_id, member_name: row.member_name, loaned_at: row.loaned_at, items: [{ id: row.item_id, loan_id: row.loan_id, book_id: row.book_id, book_title: row.book_title, due_at: row.due_at, days_late: row.days_late, returned_at: null, status: 'overdue' }] })) : loans;

  const openCreate = () => { setFormError(''); setLoanForm({ member_id: '' }); setMemberQuery(''); setBookQuery(''); setSelectedTitles({}); setSelectedBooks([]); setShowCreate(true); };
  const toggleBook = id => {
    const book = books.find(item => item.id === id);
    if (book) setSelectedTitles(current => ({ ...current, [id]: book.title }));
    setSelectedBooks(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current);
  };
  const createLoan = async event => {
    event.preventDefault(); setFormError('');
    if (!selectedBooks.length) { setFormError('Selecciona al menos un libro para continuar.'); return; }
    try { await api.post('/loans', { member_id: loanForm.member_id, items: selectedBooks.map(book_id => ({ book_id })) }); setShowCreate(false); collection.reload(); overdueCollection.reload(); }
    catch (err) { setFormError(err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo registrar el préstamo.'); }
  };
  const returnItem = async () => {
    try { await api.post(`/loans/${pendingReturn.loanId}/items/${pendingReturn.item.id}/return`); setPendingReturn(null); collection.reload(); overdueCollection.reload(); }
    catch (err) { collection.setError(err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo registrar la devolución.'); setPendingReturn(null); }
  };
  const startReturn = (loan, item) => setPendingReturn({ loanId: item.loan_id || loan.id, item, bookTitle: item.book_title });
  const getLoanState = (loan, item) => item.returned_at ? { label: 'Devuelto', style: 'status-badge--green' } : loan.status === 'overdue' || item.status === 'overdue' ? { label: 'Vencido', style: 'status-badge--red' } : { label: 'Activo', style: 'status-badge--blue' };

  return <div className="loans-page">
    <div className="page-heading"><div><span className="eyebrow">CIRCULACIÓN</span><h1>Préstamos</h1><p>Registra entregas y acompaña cada devolución.</p></div><button className="button button--primary" onClick={openCreate}><Icon name="plus" size={17}/>Nuevo préstamo</button></div>
    <ResourceStatus error={error} loading={loading}/>
    <div className="tabs"><button className={`tab-button${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>Todos los préstamos</button><button className={`tab-button${tab === 'overdue' ? ' active' : ''}`} onClick={() => setTab('overdue')}>Vencidos <span className="tab-count">{overdue.length}</span></button></div>
    {tab === 'all' && <div className="collection-toolbar"><div className="filter-group"><Icon name="filter" size={16}/><span className="toolbar-label">Filtros</span></div><select className="filter-select" aria-label="Filtrar por estado" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Todos los estados</option><option value="open">Activos</option><option value="overdue">Vencidos</option><option value="closed">Devueltos</option></select><input className="filter-select" type="date" aria-label="Desde" value={from} onChange={event => { setFrom(event.target.value); setPage(1); }}/><input className="filter-select" type="date" aria-label="Hasta" value={to} onChange={event => { setTo(event.target.value); setPage(1); }}/><div className="search-field loan-filter-search"><Icon name="search" size={15}/><input className="input" type="search" aria-label="Buscar socio para filtrar préstamos" placeholder="Buscar socio…" value={filterQuery} onChange={event => setFilterQuery(event.target.value)}/></div><select className="filter-select member-filter" aria-label="Filtrar préstamos por socio" value={memberFilter} onChange={event => { setMemberFilter(event.target.value); setPage(1); }}><option value="">Todos los socios</option>{filterMembers.data.items.map(member => <option key={member.id} value={member.id}>{member.full_name}</option>)}</select></div>}
    {tab === 'overdue' && <div className="status-alert" style={{ marginBottom: 15 }}><Icon name="clock" size={15}/>Los préstamos vencidos requieren seguimiento. Confirma cada devolución al recibir el ejemplar.</div>}
    <div className="loan-list">{displayLoans.map(loan => <article className="loan-card" key={loan.id}>
      <div className="loan-card-heading"><div className="loan-member"><MemberAvatar name={loan.member_name || memberNames[loan.member_id] || 'Socio'}/><div className="loan-member-copy"><strong>{loan.member_name || memberNames[loan.member_id] || 'Socio'}</strong><small>Préstamo · {String(loan.id || '').slice(0, 8)}</small></div></div><span className="loan-date">{dateLabel(loan.loaned_at)}</span></div>
      <div className="loan-lines">{loan.items?.map(item => { const state = getLoanState(loan, item); return <div className="loan-line" key={item.id}><BookSpine title={item.book_title}/><div className="loan-book-copy"><strong>{item.book_title}</strong><small>Vence {dateLabel(item.due_at)}{item.days_late ? ` · ${item.days_late} días de retraso` : ''}</small></div><span className={`status-badge ${state.style}`}>{state.label}</span>{!item.returned_at && <button className="button button--secondary button--small" onClick={() => startReturn(loan, item)}><Icon name="check" size={14}/>Devolver</button>}</div>; })}</div>
    </article>)}</div>
    {!displayLoans.length && !loading && !error && <div className="panel empty-state"><span className="empty-icon"><Icon name={tab === 'overdue' ? 'check' : 'loan'}/></span><strong>{tab === 'overdue' ? 'Todo al día' : 'Aún no hay préstamos'}</strong><span>{tab === 'overdue' ? 'No hay ejemplares vencidos por el momento.' : 'Los préstamos nuevos aparecerán aquí.'}</span>{tab === 'all' && <button className="button button--primary" onClick={openCreate}>Registrar el primer préstamo</button>}</div>}
    {tab === 'all' && <Pagination page={page} totalPages={totalPages} onChange={setPage}/>}

    {showCreate && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowCreate(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="loan-form-title"><div className="modal-header"><div><span className="eyebrow">CIRCULACIÓN</span><h2 id="loan-form-title">Registrar un préstamo</h2><p>Un socio puede tener hasta 3 libros pendientes.</p></div><button className="modal-close" aria-label="Cerrar" onClick={() => setShowCreate(false)}><Icon name="close" size={17}/></button></div>
      {(memberOptions.error || bookOptions.error) && <p className="form-error" role="alert">{memberOptions.error || bookOptions.error}</p>}{formError && <p className="form-error" role="alert">{formError}</p>}
      <form className="form-grid" onSubmit={createLoan}>
        <div className="form-field"><label htmlFor="loan-member-search">Socio</label><div className="search-field"><Icon name="search" size={16}/><input id="loan-member-search" className="input" type="search" placeholder="Buscar nombre o documento…" value={memberQuery} onChange={event => { setMemberQuery(event.target.value); setLoanForm({ member_id: '' }); }}/></div><select className="select-input" required aria-label="Seleccionar socio" value={loanForm.member_id} onChange={event => setLoanForm({ member_id: event.target.value })}><option value="">Selecciona un socio</option>{members.map(member => <option key={member.id} value={member.id}>{member.full_name} · {member.document_number}</option>)}</select></div>
        <div className="form-field"><label htmlFor="loan-book-search">Libros <span className="form-hint">· máximo 3</span></label><div className="search-field"><Icon name="search" size={16}/><input id="loan-book-search" className="input" type="search" placeholder="Buscar título o autor…" value={bookQuery} onChange={event => setBookQuery(event.target.value)}/></div><div className="selected-book-list">{selectedBooks.map(id => <span className="selected-book" key={id}>{selectedTitles[id]}<button type="button" aria-label={`Quitar ${selectedTitles[id]}`} onClick={() => toggleBook(id)}><Icon name="close" size={12}/></button></span>)}</div><div className="option-list">{books.map(book => <label key={book.id} className="option-row"><input type="checkbox" checked={selectedBooks.includes(book.id)} onChange={() => toggleBook(book.id)} disabled={!selectedBooks.includes(book.id) && selectedBooks.length >= 3}/><span>{book.title}<small> · {book.author}</small></span><small>{book.available_copies} disponibles</small></label>)}{!books.length && <div className="table-empty">No hay libros disponibles para esta búsqueda.</div>}</div></div>
        <div className="modal-actions"><button className="button button--secondary" type="button" onClick={() => setShowCreate(false)}>Cancelar</button><button className="button button--primary" type="submit">Registrar préstamo</button></div>
      </form></section></div>}
    {pendingReturn && <div className="modal-backdrop"><section className="modal modal--narrow" role="alertdialog" aria-modal="true" aria-labelledby="return-title"><span className="stat-icon stat-icon--green" style={{ position: 'static', marginBottom: 14 }}><Icon name="check" size={18}/></span><div className="modal-header"><div><span className="eyebrow">DEVOLUCIÓN</span><h2 id="return-title">¿Confirmar devolución?</h2><p>Registrar la recepción de “{pendingReturn.bookTitle}” y sumar una unidad disponible al catálogo.</p></div></div><div className="modal-actions"><button className="button button--secondary" onClick={() => setPendingReturn(null)}>Volver</button><button className="button button--primary" onClick={returnItem}>Confirmar devolución</button></div></section></div>}
  </div>;
};
function BookSpine({ title }) { const hue = [...String(title || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5; return <span className={`loan-book-spine loan-book-spine--${hue}`} aria-hidden="true"><Icon name="book" size={15}/></span>; }
