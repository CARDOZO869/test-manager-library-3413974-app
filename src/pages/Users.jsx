import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/useAuth';

export const Users = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (user?.role !== 'admin') {
    return <div className="text-center text-gray-500 mt-8">Acceso exclusivo para administradores.</div>;
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/users', { ...form, role: 'librarian' });
      setSuccess('Bibliotecario creado correctamente.');
      setForm({ username: '', password: '' });
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo crear el bibliotecario';
      setError(msg);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Crear bibliotecario</h1>
      <div className="bg-white p-6 rounded shadow max-w-md">
        {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input type="text" required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" required className="mt-1 block w-full border border-gray-300 rounded p-2" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Crear bibliotecario</button>
        </form>
      </div>
    </div>
  );
};
