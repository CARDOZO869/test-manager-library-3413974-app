import { useEffect, useState } from 'react';
import { AuthContext } from './useAuth';
import api from '../services/api';
import { clearSession, parseSession, readSession } from '../services/session';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { const session = readSession(); return session ? { role: session.role } : null; });
  const loading = false;
  const [expiresAt, setExpiresAt] = useState(() => readSession()?.expiresAt ?? null);

  useEffect(() => { if (!readSession()) clearSession(); }, []);

  useEffect(() => {
    const sync = () => {
      const session = readSession();
      setUser(session ? { role: session.role } : null);
      setExpiresAt(session?.expiresAt ?? null);
      if (!session) clearSession();
    };
    const timer = expiresAt ? setTimeout(sync, Math.max(0, expiresAt - Date.now())) : null;
    window.addEventListener('storage', sync);
    window.addEventListener('session-expired', sync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', sync);
      window.removeEventListener('session-expired', sync);
    };
  }, [expiresAt]);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', {
      username: username.trim(), password,
    });
    const { token, role, expiresAt: expiry } = parseSession(data);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('expiresAt', String(expiry));
    setExpiresAt(expiry);
    setUser({ role });
  };

  const logout = () => { clearSession(); setUser(null); setExpiresAt(null); };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
