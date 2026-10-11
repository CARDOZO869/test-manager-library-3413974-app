import { useEffect, useState } from 'react';
import api from '../services/api';
import { useCollection } from '../services/useCollection';
import { BookCover } from '../components/BookCover';
import { ResourceStatus } from '../components/ResourceStatus';
import { useAuth } from '../contexts/useAuth';

export const Books = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', total_copies: 1, category_id: '' });
  const [formError, setFormError] = useState('');
  const [detail, setDetail] = useState(null);

  const { data: { items: books }, error, setError, loading, reload: fetchBooks, totalPages } = useCollection('/books', { page, q: search || undefined, category_id: category || undefined });

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data || res.data)).catch(err => setError(err.response?.data?.message || 'No se pudo cargar la información.'));
  }, [setError]);



  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', author: '', isbn: '', total_copies: 1, category_id: categories[0]?.id || '' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (book) => {
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      total_copies: book.total_copies,
      category_id: book.category_id || book.category?.id || ''
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editing) {
        await api.put(`/books/${editing.id}`, form);
      } else {
        await api.post('/books', form);
      }
      setShowForm(false);
      fetchBooks();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo guardar el libro';
      setFormError(msg);
    }
  };

  const handleDelete = async (book) => {
    if (!confirm(`¿Dar de baja «${book.title}»?`)) return;
    try {
      await api.delete(`/books/${book.id}`);
      fetchBooks();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo dar de baja el libro';
      alert(msg);
    }
  };

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/books/${id}`);
      setDetail(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la información.');
    }
  };

  if (detail) {
    return (
      <div>
        <button onClick={() => setDetail(null)} className="mb-4 text-blue-600 hover:underline">&larr; Volver al catálogo</button>
        <div className="bg-white p-6 rounded shadow">
          <ResourceStatus error={error} loading={loading} />
        <h1 className="text-3xl font-bold mb-4">{detail.title}</h1>
          <BookCover book={detail} isAdmin={isAdmin} onChange={() => viewDetail(detail.id)} />
          <p className="text-gray-600 text-lg mb-2">Autor: {detail.author}</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div><span className="font-semibold">ISBN:</span> {detail.isbn}</div>
            <div><span className="font-semibold">Categoría:</span> {detail.category?.name || 'N/A'}</div>
            <div><span className="font-semibold">Total de ejemplares:</span> {detail.total_copies}</div>
            <div><span className="font-semibold">Disponibles:</span> {detail.available_copies}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <ResourceStatus error={error} loading={loading} />
        <h1 className="text-3xl font-bold">Catálogo de libros</h1>
        {isAdmin && <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Nuevo libro</button>}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar…"
          className="border p-2 rounded flex-1"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="border p-2 rounded w-48"
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Editar libro' : 'Nuevo libro'}</h2>
            {formError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Autor</label>
                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN (13 dígitos)</label>
                <input type="text" pattern="[0-9]{13}" disabled={!!editing} required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total de ejemplares</label>
                <input type="number" min="1" required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.total_copies} onChange={e => setForm({...form, total_copies: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">Selecciona…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(b => (
          <div key={b.id} className="bg-white p-4 rounded shadow flex flex-col">
            <h3><button className="font-bold text-lg text-left hover:text-blue-600" onClick={() => viewDetail(b.id)}>{b.title}</button></h3>
            <p className="text-gray-600">{b.author}</p>
            <p className="text-sm text-gray-500 mt-2">ISBN: {b.isbn}</p>
            <p className="text-sm text-gray-500">Disponibles: {b.available_copies} / {b.total_copies}</p>
            <p className="text-sm text-gray-500">Categoría: {b.category?.name || 'N/A'}</p>
            {isAdmin && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(b)} className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">Editar</button>
                <button onClick={() => handleDelete(b)} className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600">Dar de baja</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {books.length === 0 && !loading && !error && <p className="text-center text-gray-500 mt-8">No se encontraron libros.</p>}

      <div className="mt-6 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(p => p + 1)}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >Siguiente</button>
      </div>
    </div>
  );
};
