import { useEffect, useState } from 'react';
import api from '../services/api';
import { Icon } from './Icon';

function coverStyle(book) {
  const palette = ['cover-art--blue', 'cover-art--sage', 'cover-art--plum', 'cover-art--sand', 'cover-art--night'];
  const seed = String(book.isbn || book.id || book.title).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[seed % palette.length];
}

export function BookCover({ book, isAdmin, onChange, compact = false }) {
  const [cover, setCover] = useState({ key: '', url: '', error: '' });
  const imageKey = book.cover_key ? `${book.id}:${book.cover_key}` : '';
  const url = cover.key === imageKey ? cover.url : '';
  const error = cover.key === imageKey ? cover.error : '';
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true; let objectUrl;
    if (book.cover_key) api.get(`/books/${book.id}/cover`, { responseType: 'blob' }).then(res => {
      if (active) { objectUrl = URL.createObjectURL(res.data); setCover({ key: imageKey, url: objectUrl, error: '' }); }
    }).catch(() => { if (active) setCover({ key: imageKey, url: '', error: 'La portada no está disponible; se muestra una cubierta ilustrada.' }); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [book.id, book.cover_key, imageKey]);
  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2097152) {
      setCover({ key: imageKey, url, error: 'Selecciona una imagen JPG o PNG de hasta 2 MB.' }); return;
    }
    const body = new FormData(); body.append('file', file); setSaving(true);
    try { await api.put(`/books/${book.id}/cover`, body); onChange?.(); }
    catch (err) { setCover({ key: imageKey, url, error: err.response?.data?.message || 'No se pudo guardar la portada.' }); }
    finally { setSaving(false); event.target.value = ''; }
  }
  async function remove() {
    setSaving(true);
    try { await api.delete(`/books/${book.id}/cover`); onChange?.(); }
    catch (err) { setCover({ key: imageKey, url, error: err.response?.data?.message || 'No se pudo quitar la portada.' }); }
    finally { setSaving(false); }
  }
  return <div className={`cover-wrap${compact ? ' cover-wrap--compact' : ''}`}>
    {url && book.cover_key ? <img src={url} alt={`Portada de ${book.title}`} className="cover-image"/> : <div className={`cover-art ${coverStyle(book)}`} role="img" aria-label={`Cubierta ilustrada de respaldo para ${book.title}`}>
      <span className="cover-art-emblem"><Icon name="book" size={compact ? 19 : 28}/></span><span className="cover-art-rule"/><span className="cover-art-title">{book.title}</span><span className="cover-art-author">{book.author}</span><span className="cover-art-label">FOLIO · COLECCIÓN</span>
    </div>}
    {isAdmin && !compact && <div className="cover-actions"><label className="button button--quiet button--small"><Icon name="plus" size={15}/>{saving ? 'Guardando…' : book.cover_key ? 'Cambiar portada' : 'Subir portada'}<input aria-label="Portada" type="file" accept="image/png,image/jpeg" onChange={upload} disabled={saving}/></label>{book.cover_key && <button className="button button--quiet button--small" onClick={remove} disabled={saving}>Quitar</button>}</div>}
    {error && !compact && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
