import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { Icon } from '../components/Icon';

export const Users = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user?.role !== 'admin') return <div className="panel empty-state"><span className="empty-icon"><Icon name="settings"/></span><strong>Acceso exclusivo para administradores</strong><span>Tu rol no permite administrar usuarios.</span></div>;
  const handleCreate = async event => {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try { await api.post('/users', { ...form, role: 'librarian' }); setSuccess(`El usuario “${form.username.trim()}” ya puede acceder como bibliotecario.`); setForm({ username: '', password: '' }); }
    catch (err) { setError(err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo crear el bibliotecario.'); }
    finally { setBusy(false); }
  };
  return <div className="users-page"><div className="page-heading"><div><span className="eyebrow">EQUIPO</span><h1>Accesos de biblioteca</h1><p>Invita a una persona del equipo para apoyar la operación diaria.</p></div><span className="report-period-icon"><Icon name="users" size={20}/></span></div>
    <section className="panel user-form-panel"><div className="panel-heading"><div><span className="eyebrow">NUEVO ACCESO</span><h2>Crear bibliotecario</h2></div><span className="status-badge status-badge--blue">Rol: bibliotecario</span></div><div className="user-note"><span className="user-note-icon"><Icon name="settings" size={17}/></span><span>Los bibliotecarios pueden registrar socios, préstamos y devoluciones. El rol de administrador no se asigna desde esta pantalla.</span></div>
      {success && <p className="form-success" role="status">{success}</p>}{error && <p className="form-error" role="alert">{error}</p>}
      <form className="form-grid" onSubmit={handleCreate}><div className="form-field"><label htmlFor="new-username">Nombre de usuario</label><input id="new-username" className="input" type="text" autoComplete="off" required maxLength="120" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })}/><span className="form-hint">Se guardará normalizado por el servidor.</span></div><div className="form-field"><label htmlFor="new-password">Contraseña temporal</label><input id="new-password" className="input" type="password" autoComplete="new-password" required value={form.password} onChange={event => setForm({ ...form, password: event.target.value })}/><span className="form-hint">La contraseña se transmite a la API para crear la cuenta y no se muestra en la respuesta.</span></div><div className="modal-actions"><button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Creando acceso…' : <><Icon name="plus" size={16}/>Crear bibliotecario</>}</button></div></form>
    </section></div>;
};
