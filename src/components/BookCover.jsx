import { useEffect, useState } from 'react';
import api from '../services/api';

export function BookCover({ book, isAdmin, onChange }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true; let objectUrl;
    if (book.cover_key) api.get(`/books/${book.id}/cover`, { responseType: 'blob' }).then(res => {
      if (active) { objectUrl = URL.createObjectURL(res.data); setUrl(objectUrl); }
    }).catch(() => { if (active) setError('No se pudo cargar la portada.'); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [book.id, book.cover_key]);
  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/png'].includes(file.type) || file.size > 2097152) {
      setError('Selecciona una imagen JPG o PNG de hasta 2 MB.'); return;
    }
    const body = new FormData(); body.append('file',file);
    try { await api.put(`/books/${book.id}/cover`, body); setError(''); onChange(); }
    catch (err) { setError(err.response?.data?.message || 'No se pudo guardar la portada.'); }
  }
  async function remove() {
    try { await api.delete(`/books/${book.id}/cover`); setUrl(null); setError(''); onChange(); }
    catch (err) { setError(err.response?.data?.message || 'No se pudo quitar la portada.'); }
  }
  return <div className="my-4 space-y-3">
    {url && book.cover_key && <img src={url} alt={`Portada de ${book.title}`} className="max-h-64 rounded object-contain" />}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {isAdmin && <><label className="block">Subir portada (JPG/PNG, hasta 2 MB)<input aria-label="Portada" type="file" accept="image/png,image/jpeg" onChange={upload} className="block" /></label>{book.cover_key && <button onClick={remove} className="rounded bg-gray-200 p-2">Quitar portada</button>}</>}
  </div>;
}
