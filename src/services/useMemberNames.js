import { useEffect, useState } from 'react';
import api from './api';
export function useMemberNames(loans) {
  const ids = JSON.stringify([...new Set(loans.map(loan => loan.member_id))].sort());
  const [names, setNames] = useState({});
  useEffect(() => {
    const controller = new AbortController();
    Promise.all(JSON.parse(ids).map(async id => {
      try { const result = await api.get(`/members/${id}`, {signal:controller.signal}); return [id,result.data.full_name]; }
      catch { return [id,'Socio no disponible']; }
    })).then(entries => { if (!controller.signal.aborted) setNames(Object.fromEntries(entries)); });
    return () => controller.abort();
  }, [ids]);
  return names;
}
