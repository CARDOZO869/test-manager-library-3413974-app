import { useState } from 'react';
import api from '../services/api';
import { useCollection } from '../services/useCollection';
import { Pagination } from '../components/Pagination';
import { ResourceStatus } from '../components/ResourceStatus';

export const Members = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ document_number: '', full_name: '' });
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: { items: members }, error, setError, loading, reload: fetchMembers, totalPages } = useCollection('/members', { page, size: 20, q: search || undefined });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/members', form);
      setShowForm(false);
      setForm({ document_number: '', full_name: '' });
      fetchMembers();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo registrar el socio';
      setFormError(msg);
    }
  };

  const [detail, setDetail] = useState(null);
  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/members/${id}`);
      setDetail(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la información.');
    }
  };

  if (detail) {
    return (
      <div>
        <button onClick={() => setDetail(null)} className="mb-4 text-blue-600 hover:underline">&larr; Volver a socios</button>
        <div className="bg-white p-6 rounded shadow">
          <ResourceStatus error={error} loading={loading} />
        <h1 className="text-3xl font-bold mb-4">{detail.full_name}</h1>
          <p className="text-gray-600">Document: {detail.document_number}</p>
          {detail.id && <p className="text-gray-500 text-sm mt-2">ID: {detail.id}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <ResourceStatus error={error} loading={loading} />
        <h1 className="text-3xl font-bold">Socios</h1>
        <button onClick={() => { setShowForm(true); setFormError(''); }} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Nuevo socio</button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar…"
          className="border p-2 rounded w-full"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo socio</h2>
            {formError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{formError}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de documento</label>
                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.document_number} onChange={e => setForm({...form, document_number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-[450px] w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 border-b">Documento</th>
              <th className="p-4 border-b">Nombre</th>
              <th className="p-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-4 border-b">{m.document_number}</td>
                <td className="p-4 border-b">{m.full_name}</td>
                <td className="p-4 border-b">
                  <button onClick={() => viewDetail(m.id)} className="text-blue-600 hover:underline text-sm">Ver</button>
                </td>
              </tr>
            ))}
            {members.length === 0 && !loading && !error && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">No se encontraron socios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};
