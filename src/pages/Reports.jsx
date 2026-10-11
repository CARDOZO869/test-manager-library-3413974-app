import { useState } from 'react';
import api from '../services/api';
import { ResourceStatus } from '../components/ResourceStatus';
import { useAuth } from '../contexts/useAuth';

export const Reports = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState([]);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const { user } = useAuth();

  const fetchReport = () => {
    setError(''); setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    api.get('/reports/most-borrowed', { params }).then(res => {
      setReport(res.data.rows);
    }).catch(err => setError(err.response?.data?.message || 'No se pudo cargar la información.')).finally(() => setLoading(false));
  };

  if (user?.role !== 'admin') {
    return <div className="text-center text-gray-500 mt-8">Acceso exclusivo para administradores.</div>;
  }

  return (
    <div>
      <ResourceStatus error={error} loading={loading} />
        <h1 className="text-3xl font-bold mb-6">Reporte: libros más prestados</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Desde</label>
          <input type="date" className="border p-2 rounded" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hasta</label>
          <input type="date" className="border p-2 rounded" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <button onClick={fetchReport} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Consultar</button>
        <button onClick={() => { const today = new Date().toISOString().slice(0, 10); setFrom(today); setTo(today); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Restablecer</button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-[450px] w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 border-b">#</th>
              <th className="p-4 border-b">Libro</th>
              <th className="p-4 border-b">Categoría</th>
              <th className="p-4 border-b">Veces prestado</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-4 border-b font-bold text-gray-400">{i + 1}</td>
                <td className="p-4 border-b">{r.book_title}</td>
                <td className="p-4 border-b">{r.category_name}</td>
                <td className="p-4 border-b font-bold text-blue-600">{r.times_borrowed}</td>
              </tr>
            ))}
            {report.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">No hay datos para este periodo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
