import { useCallback, useEffect, useState } from 'react';
import api from './api';

export function useCollection(path, params = {}) {
  const query = JSON.stringify(params);
  const [data, setData] = useState({ items: [], total: 0, size: 20 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    Promise.resolve().then(async () => {
      if (controller.signal.aborted) return;
      setLoading(true); setError('');
      try {
        const result = await api.get(path, { params: JSON.parse(query), signal: controller.signal });
        if (!controller.signal.aborted) setData(result.data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.response?.data?.message || 'No se pudo cargar la información.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    });
    return () => controller.abort();
  }, [path, query, revision]);
  return { data, error, setError, loading, reload, totalPages: Math.max(1, Math.ceil(data.total / data.size)) };
}
