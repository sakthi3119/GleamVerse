export const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:8000' : 'http://localhost:8000';
export const asApiUrl = (u) => {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE}${u}`;
};

export async function getClerkToken() {
  try {
    if (!window.Clerk || !Clerk.load) return '';
    await Clerk.load();
    const s = Clerk.session; if (!s) return '';
    return await s.getToken();
  } catch { return ''; }
}

