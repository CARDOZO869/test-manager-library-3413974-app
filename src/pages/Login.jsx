import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Icon } from '../components/Icon';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);
  const handleSubmit = async event => {
    event.preventDefault();
    try {
      setBusy(true); setError('');
      await login(username, password);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 422) setError('Usuario o contraseña incorrectos. Revisa tus datos e intenta de nuevo.');
      else if (err.response) setError(`No pudimos iniciar sesión (${err.response.status}). Intenta nuevamente.`);
      else setError('No se pudo conectar con la biblioteca. Comprueba que el servicio esté disponible.');
    } finally { setBusy(false); }
  };
  return <div className="login-page">
    <section className="login-showcase"><div className="login-brand"><span className="brand-mark"><Icon name="book" size={22}/></span>folio</div>
      <div className="login-hero-copy"><span className="eyebrow">UN ESPACIO PARA LAS HISTORIAS</span><h1>Todo lo que tu biblioteca necesita.</h1><p>Cuida tu colección, acompaña a tus socios y mantén cada préstamo en su lugar.</p></div>
      <div className="login-book-stack" aria-hidden="true"><span className="login-book"/><span className="login-book"/><span className="login-book"/><span className="login-book"/></div><div className="login-foot">Una manera más clara de cuidar cada libro.</div>
    </section>
    <section className="login-form-side"><div className="login-card"><span className="eyebrow">PANEL DE GESTIÓN</span><h2>Bienvenido de vuelta</h2><p>Ingresa a tu espacio de biblioteca.</p>
      {error && <div className="status-message" role="alert">{error}</div>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-field"><label htmlFor="username">Usuario</label><input className="input" id="username" autoComplete="username" type="text" required value={username} onChange={event => setUsername(event.target.value)}/></div>
        <div className="form-field"><label htmlFor="password">Contraseña</label><input className="input" id="password" autoComplete="current-password" type="password" required value={password} onChange={event => setPassword(event.target.value)}/></div>
        <button disabled={busy} type="submit" className="button button--primary login-submit">{busy ? 'Ingresando…' : 'Entrar a la biblioteca'}<Icon name="arrow" size={17}/></button>
      </form>
      <div className="login-secure"><Icon name="check" size={14}/>Acceso protegido para el equipo bibliotecario</div>
    </div></section>
  </div>;
};
