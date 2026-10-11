export const SESSION_KEYS = ['token', 'role', 'expiresAt'];
export const clearSession = () => SESSION_KEYS.forEach(key => localStorage.removeItem(key));

export function parseSession(payload, now = Date.now()) {
  const data = payload?.data ?? payload;
  if (typeof data?.access_token !== 'string' || !data.access_token.trim() ||
      !['admin', 'librarian'].includes(data.role) ||
      !Number.isFinite(data.expires_in) || data.expires_in <= 0 || data.token_type !== 'Bearer') {
    throw new Error('La respuesta de inicio de sesión no cumple el contrato de la API.');
  }
  return { token: data.access_token, role: data.role, expiresAt: now + data.expires_in * 1000 };
}

export function readSession() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const expiresAt = Number(localStorage.getItem('expiresAt'));
  return token && ['admin', 'librarian'].includes(role) && Number.isFinite(expiresAt) && expiresAt > Date.now()
    ? { token, role, expiresAt } : null;
}
