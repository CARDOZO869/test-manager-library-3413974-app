import { useState } from 'react';
import api from '../services/api';
import { useCollection } from '../services/useCollection';
import { Pagination } from '../components/Pagination';
import { ResourceStatus } from '../components/ResourceStatus';
import { MemberAvatar } from '../components/MemberAvatar';
import { Icon } from '../components/Icon';

export const Members = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ document_number: '', full_name: '' });
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const { data: { items: members, total }, error, setError, loading, reload, totalPages } = useCollection('/members', { page, size: 20, q: search || undefined });
  const openCreate = () => { setForm({ document_number: '', full_name: '' }); setFormError(''); setShowForm(true); };
  const createMember = async event => {
    event.preventDefault(); setFormError('');
    try { await api.post('/members', form); setShowForm(false); reload(); }
    catch (err) { setFormError(err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo registrar el socio.'); }
  };
  const viewDetail = async member => {
    try { const res = await api.get(`/members/${member.id}`); setDetail(res.data.data || res.data); setError(''); }
    catch (err) { setError(err.response?.data?.message || 'No se pudo cargar el perfil.'); }
  };
  if (detail) return <div><button className="button button--secondary" onClick={() => setDetail(null)}>← Volver a socios</button><ResourceStatus error={error} loading={loading}/><section className="panel" style={{ maxWidth: 720, margin: '16px auto' }}><div className="member-profile"><MemberAvatar name={detail.full_name} large/><div><span className="eyebrow">PERFIL DEL SOCIO · AVATAR ILUSTRADO</span><h1>{detail.full_name}</h1><p>{detail.document_number}</p></div></div><div className="detail-meta-grid"><div className="detail-meta"><span>Nombre</span><strong>{detail.full_name}</strong></div><div className="detail-meta"><span>Documento</span><strong>{detail.document_number}</strong></div></div><p className="form-hint">No se registran fotografías ni datos de contacto en este perfil.</p></section></div>;
  return <div className="members-page">
    <div className="page-heading"><div><span className="eyebrow">COMUNIDAD</span><h1>Socios de la biblioteca</h1><p>Las personas que hacen de esta biblioteca un lugar especial.</p></div><button className="button button--primary" onClick={openCreate}><Icon name="plus" size={17}/>Añadir socio</button></div>
    <ResourceStatus error={error} loading={loading}/>
    <div className="collection-toolbar"><div className="search-field"><Icon name="search" size={17}/><input className="input" type="search" aria-label="Buscar socios" placeholder="Buscar por nombre o documento…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }}/></div><span className="members-total">{loading ? 'Cargando…' : `${Number(total || 0).toLocaleString('es-CO')} socios registrados`}</span></div>
    {members.length ? <div className="member-grid">{members.map(member => <article className="member-card" key={member.id}><div className="member-card-top"><MemberAvatar name={member.full_name}/><div className="member-card-copy"><h2 className="member-name">{member.full_name}</h2><p className="member-document">Documento · {member.document_number}</p></div></div><div className="member-card-bottom"><small>Avatar ilustrado · sin fotografía</small><button className="button button--quiet button--small" onClick={() => viewDetail(member)}>Ver perfil <Icon name="arrow" size={13}/></button></div></article>)}</div> : !loading && <div className="panel empty-state"><span className="empty-icon"><Icon name="users"/></span><strong>{search ? 'No encontramos socios' : 'La comunidad empieza aquí'}</strong><span>{search ? 'Prueba con otro nombre o número de documento.' : 'Registra al primer socio de la biblioteca.'}</span>{search ? <button className="button button--secondary" onClick={() => setSearch('')}>Limpiar búsqueda</button> : <button className="button button--primary" onClick={openCreate}><Icon name="plus" size={16}/>Añadir socio</button>}</div>}
    <Pagination page={page} totalPages={totalPages} onChange={setPage}/>
    {showForm && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false); }}><section className="modal modal--narrow" role="dialog" aria-modal="true" aria-labelledby="member-form-title"><div className="modal-header"><div><span className="eyebrow">COMUNIDAD</span><h2 id="member-form-title">Registrar un socio</h2><p>Completa los datos de identificación.</p></div><button className="modal-close" aria-label="Cerrar" onClick={() => setShowForm(false)}><Icon name="close" size={17}/></button></div><div className="user-note"><MemberAvatar name={form.full_name || 'Socio'}/> <span>Usamos iniciales como avatar ilustrado. No solicitamos ni asignamos fotografías.</span></div>{formError && <p className="form-error" role="alert">{formError}</p>}<form className="form-grid" onSubmit={createMember}><div className="form-field"><label htmlFor="member-name">Nombre completo</label><input id="member-name" className="input" required maxLength="160" autoComplete="name" value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })}/></div><div className="form-field"><label htmlFor="member-document">Número de documento</label><input id="member-document" className="input" required maxLength="80" value={form.document_number} onChange={event => setForm({ ...form, document_number: event.target.value })}/></div><div className="modal-actions"><button className="button button--secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="button button--primary" type="submit">Guardar socio</button></div></form></section></div>}
  </div>;
};
