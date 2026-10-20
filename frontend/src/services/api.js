const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
let token = localStorage.getItem('northstar_token');
export function setToken(value) { token = value; if (value) localStorage.setItem('northstar_token', value); else localStorage.removeItem('northstar_token'); }
export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Something went wrong.');
  return data;
}
