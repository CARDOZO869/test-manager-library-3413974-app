import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      setError('');
      await login(username, password);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 422) {
        setError('Usuario o contraseña incorrectos');
      } else if (err.response) {
        setError(`Error del servidor (${err.response.status}). Intenta de nuevo.`);
      } else {
        setError(err.message || 'No se pudo conectar con el servidor');
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm m-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Manager Library</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              id="username" autoComplete="username" type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password" autoComplete="current-password" type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button disabled={busy} type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            {busy ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};
