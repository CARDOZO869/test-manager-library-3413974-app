import { useEffect, useState } from 'react';
import api from '../services/api';
import { ResourceStatus } from '../components/ResourceStatus';

export const Dashboard = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    books: 0,
    members: 0,
    loans: 0,
    overdue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [booksRes, membersRes, loansRes, overdueRes] = await Promise.all([
          api.get('/books'),
          api.get('/members'),
          api.get('/loans'),
          api.get('/loans/overdue')
        ]);
        setStats({
          books: booksRes.data.total,
          members: membersRes.data.total,
          loans: loansRes.data.total,
          overdue: overdueRes.data.items.length
        });
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el panel.');
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <ResourceStatus error={error} loading={loading} />
        <h1 className="text-3xl font-bold mb-6">Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-sm uppercase">Libros</h2>
          <p className="text-3xl font-bold">{stats.books}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h2 className="text-gray-500 text-sm uppercase">Socios</h2>
          <p className="text-3xl font-bold">{stats.members}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
          <h2 className="text-gray-500 text-sm uppercase">Préstamos registrados</h2>
          <p className="text-3xl font-bold">{stats.loans}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
          <h2 className="text-gray-500 text-sm uppercase">Vencidos</h2>
          <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>
    </div>
  );
};
