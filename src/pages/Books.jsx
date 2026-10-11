import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useCollection } from '../services/useCollection';
import { BookCover } from '../components/BookCover';
import { ResourceStatus } from '../components/ResourceStatus';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../contexts/useAuth';
import { Icon } from '../components/Icon';

const emptyForm = { title: '', author: '', isbn: '', total_copies: 1, category_id: '' };

export const Books = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [detail, setDetail] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { data: { items: books, total }, error, setError, loading, reload, totalPages } = useCollection('/books', { page, size: 20, q: search || undefined, category_id: category || undefined });

  useEffect(() => {
    const controller = new AbortController();
    api.get('/categories', { signal: controller.signal }).then(res => setCategories(res.data.data || res.data)).catch(err => {
      if (!controller.signal.aborted) setError(err.response?.data?.message || 'No se pudieron cargar las categorías.');
    });
    return () => controller.abort();
  }, [setError]);

  const visibleBooks = useMemo(() => books.filter(book => availability === 'available' ? book.available_copies > 0 : availability === 'unavailable' ? book.available_copies === 0 : true), [books, availability]);
  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, category_id: categories[0]?.id || '' }); setFormError(''); setShowForm(true); };
  const openEdit = book => { setEditing(book); setForm({ title: book.title, author: book.author, isbn: book.isbn, total_copies: book.total_copies, category_id: book.category_id || book.category?.id || '' }); setFormError(''); setShowForm(true); };
  const saveBook = async event => {
    event.preventDefault(); setFormError('');
    try {
      if (editing) await api.put(`/books/${editing.id}`, form); else await api.post('/books', form);
      setShowForm(false); reload();
    } catch (err) { setFormError(err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo guardar el libro.'); }
  };
  const removeBook = async () => {
    try { await api.delete(`/books/${pendingDelete.id}`); setPendingDelete(null); if (detail?.id === pendingDelete.id) setDetail(null); reload(); }
    catch (err) { setError(err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo dar de baja el libro.'); setPendingDelete(null); }
  };
  const viewDetail = async book => {
    try { const res = await api.get(`/books/${book.id}`); setDetail(res.data.data || res.data); setError(''); }
    catch (err) { setError(err.response?.data?.message || 'No se pudo cargar el libro.'); }
  };

  if (detail) return <div className="catalog-page"><button className="button button--secondary" onClick={() => setDetail(null)}>← Volver al catálogo</button><ResourceStatus error={error} loading={loading}/><section className="detail-layout panel" style={{ marginTop: 16 }}><div className="detail-cover-panel"><BookCover book={detail} isAdmin={isAdmin} onChange={() => viewDetail(detail)}/></div><div className="detail-copy"><span className="eyebrow">DETALLE DEL LIBRO</span><h2>{detail.title}</h2><p>por {detail.author}</p><div className="detail-meta-grid"><div className="detail-meta"><span>ISBN</span><strong>{detail.isbn}</strong></div><div className="detail-meta"><span>Categoría</span><strong>{detail.category?.name || 'Sin categoría'}</strong></div><div className="detail-meta"><span>Ejemplares en colección</span><strong>{detail.total_copies}</strong></div><div className="detail-meta"><span>Disponibilidad</span><strong>{detail.available_copies} de {detail.total_copies} disponibles</strong></div></div>{isAdmin && <div className="inline-filter-row"><button className="button button--secondary" onClick={() => openEdit(detail)}>Editar información</button><button className="button button--danger" onClick={() => setPendingDelete(detail)}>Dar de baja</button></div>}</div></section>{pendingDelete && <ConfirmDialog book={pendingDelete} onCancel={() => setPendingDelete(null)} onConfirm={removeBook}/>}</div>;

  return <div className="catalog-page">
    <div className="page-heading"><div><span className="eyebrow">COLECCIÓN</span><h1>Catálogo de libros</h1><p>Encuentra un título o explora lo que tenemos en estantería.</p></div>{isAdmin && <button className="button button--primary" onClick={openCreate}><Icon name="plus" size={17}/>Añadir libro</button>}</div>
    <ResourceStatus error={error} loading={loading}/>
    <div className="collection-toolbar"><div className="search-field"><Icon name="search" size={17}/><input className="input" type="search" aria-label="Buscar libros" placeholder="Buscar por título o autor…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }}/></div><select className="select-input" aria-label="Filtrar por categoría" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="">Todas las categorías</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select className="select-input" aria-label="Filtrar por disponibilidad" value={availability} onChange={event => setAvailability(event.target.value)}><option value="">Toda disponibilidad</option><option value="available">Con ejemplares</option><option value="unavailable">Agotados en esta página</option></select></div>
    <p className="results-meta">{visibleBooks.length ? `Mostrando ${visibleBooks.length} títulos en esta página · ${Number(total || 0).toLocaleString('es-CO')} en el catálogo` : loading ? 'Cargando catálogo…' : 'No hay títulos que coincidan con estos filtros.'}</p>
    {visibleBooks.length ? <div className="book-grid">{visibleBooks.map(book => <article className="book-card" key={book.id}>
      <div className="book-card-cover"><span className={`availability-pill${book.available_copies === 0 ? ' availability-pill--none' : ''}`}>{book.available_copies > 0 ? `${book.available_copies} disponible${book.available_copies === 1 ? '' : 's'}` : 'Sin ejemplares'}</span><BookCover compact book={book}/></div>
      <div className="book-card-body"><span className="book-card-category">{book.category?.name || 'Colección'}</span><h2 className="book-card-title">{book.title}</h2><p className="book-card-author">{book.author}</p><p className="book-card-isbn">ISBN {book.isbn} · {book.total_copies} ejemplar{book.total_copies === 1 ? '' : 'es'}</p>
        <div className="book-card-footer"><button className="button button--secondary button--small" onClick={() => viewDetail(book)}>Ver detalles</button>{isAdmin && <button className="button button--quiet button--small" onClick={() => openEdit(book)}>Editar</button>}</div>
      </div></article>)}</div> : !loading && <div className="panel empty-state"><span className="empty-icon"><Icon name="book"/></span><strong>No encontramos libros</strong><span>Prueba otra búsqueda o cambia los filtros.</span>{search || category || availability ? <button className="button button--secondary" onClick={() => { setSearch(''); setCategory(''); setAvailability(''); setPage(1); }}>Limpiar filtros</button> : isAdmin && <button className="button button--primary" onClick={openCreate}><Icon name="plus" size={16}/>Añadir el primer libro</button>}</div>}
    <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
    {showForm && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="book-form-title"><div className="modal-header"><div><span className="eyebrow">CATÁLOGO</span><h2 id="book-form-title">{editing ? 'Editar libro' : 'Añadir un libro'}</h2><p>Registra la información de la colección.</p></div><button className="modal-close" aria-label="Cerrar" onClick={() => setShowForm(false)}><Icon name="close" size={17}/></button></div>{formError && <p className="form-error" role="alert">{formError}</p>}<form className="form-grid" onSubmit={saveBook}>
      <Field label="Título"><input className="input" required maxLength="180" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })}/></Field><Field label="Autor"><input className="input" required maxLength="180" value={form.author} onChange={event => setForm({ ...form, author: event.target.value })}/></Field><Field label="ISBN"><input className="input" required pattern="[0-9]{13}" disabled={Boolean(editing)} value={form.isbn} onChange={event => setForm({ ...form, isbn: event.target.value })}/></Field><Field label="Total de ejemplares"><input className="input" required type="number" min="1" value={form.total_copies} onChange={event => setForm({ ...form, total_copies: Number(event.target.value) })}/></Field><Field label="Categoría"><select className="select-input" required value={form.category_id} onChange={event => setForm({ ...form, category_id: event.target.value })}><option value="">Selecciona una categoría</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><div className="modal-actions"><button className="button button--secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="button button--primary" type="submit">{editing ? 'Guardar cambios' : 'Guardar libro'}</button></div>
    </form></section></div>}
    {pendingDelete && <ConfirmDialog book={pendingDelete} onCancel={() => setPendingDelete(null)} onConfirm={removeBook}/>}
  </div>;
};

function Field({ label, children }) { return <div className="form-field"><label>{label}</label>{children}</div>; }
function ConfirmDialog({ book, onCancel, onConfirm }) { return <div className="modal-backdrop"><section className="modal modal--narrow" role="alertdialog" aria-modal="true" aria-labelledby="delete-book-title"><span className="stat-icon stat-icon--amber" style={{ position: 'static', marginBottom: 14 }}><Icon name="book" size={18}/></span><div className="modal-header"><div><span className="eyebrow">CONFIRMACIÓN</span><h2 id="delete-book-title">¿Dar de baja este libro?</h2><p>“{book.title}” dejará de aparecer en el catálogo. Los préstamos históricos se conservan.</p></div></div><div className="modal-actions"><button className="button button--secondary" onClick={onCancel}>Cancelar</button><button className="button button--danger" onClick={onConfirm}>Confirmar baja</button></div></section></div>; }
