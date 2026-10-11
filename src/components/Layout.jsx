import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <aside className="w-full md:w-64 bg-gray-800 text-white flex flex-col shrink-0">
        <div className="p-4 text-2xl font-bold text-center border-b border-gray-700">
          Manager Library
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-700">Panel</Link>
          <Link to="/books" className="block py-2 px-4 rounded hover:bg-gray-700">Catálogo</Link>
          <Link to="/members" className="block py-2 px-4 rounded hover:bg-gray-700">Socios</Link>
          <Link to="/loans" className="block py-2 px-4 rounded hover:bg-gray-700">Préstamos</Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/reports" className="block py-2 px-4 rounded hover:bg-gray-700">Reportes</Link>
              <Link to="/users" className="block py-2 px-4 rounded hover:bg-gray-700">Usuarios</Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="mb-2 text-sm text-gray-300">Rol: {user?.role}</div>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
