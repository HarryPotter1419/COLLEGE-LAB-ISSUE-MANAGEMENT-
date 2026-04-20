/**
 * js/api.js — API Helper v2
 * New: comments, priority, technician assignment
 */

const API_BASE = 'http://localhost:5000/api';

// ─── Token / User ─────────────────────────────────────────────
function getToken()      { return localStorage.getItem('lab_token'); }
function saveToken(t)    { localStorage.setItem('lab_token', t); }
function getUser()       { const u = localStorage.getItem('lab_user'); return u ? JSON.parse(u) : null; }
function saveUser(u)     { localStorage.setItem('lab_user', JSON.stringify(u)); }
function removeAuth()    { localStorage.removeItem('lab_token'); localStorage.removeItem('lab_user'); }

// ─── Fetch Wrapper ────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res  = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────
const Auth = {
  signup: (name, email, password, role) =>
    apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  login: (email, password) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => apiRequest('/auth/me'),
  logout() { removeAuth(); window.location.href = 'index.html'; }
};

// ─── Student Issues ───────────────────────────────────────────
const Issues = {
  create:     (formData)  => apiRequest('/issues', { method: 'POST', body: formData }),
  getMyIssues:()          => apiRequest('/issues'),
  getById:    (id)        => apiRequest(`/issues/${id}`),
  delete:     (id)        => apiRequest(`/issues/${id}`, { method: 'DELETE' }),
  addComment: (id, text)  =>
    apiRequest(`/issues/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) })
};

// ─── Admin ────────────────────────────────────────────────────
const Admin = {
  getIssues: ({ status='', lab='', search='', priority='', page=1 } = {}) => {
    const p = new URLSearchParams();
    if (status)   p.set('status', status);
    if (lab)      p.set('lab', lab);
    if (search)   p.set('search', search);
    if (priority) p.set('priority', priority);
    p.set('page', page);
    return apiRequest(`/admin/issues?${p}`);
  },
  getIssue:     (id)                 => apiRequest(`/admin/issues/${id}`),
  updateIssue:  (id, body)           => apiRequest(`/admin/issues/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  addComment:   (id, text)           => apiRequest(`/admin/issues/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  getStats:     ()                   => apiRequest('/admin/stats'),
  getUsers:     ()                   => apiRequest('/admin/users'),
  getTechnicians: ()                 => apiRequest('/admin/technicians')
};

// ─── Technician API ───────────────────────────────────────────
const Technician = {
  getMyIssues:    ()             => apiRequest('/technician/my-issues'),
  getMyIssue:     (id)           => apiRequest(`/technician/my-issues/${id}`),
  getAllIssues:    ()             => apiRequest('/technician/all-issues'),
  updateStatus:   (id, body)     => apiRequest(`/technician/my-issues/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  addComment:     (id, text)     => apiRequest(`/technician/my-issues/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) })
};

// ─── Route Guard ──────────────────────────────────────────────
function requireAuth(role = null) {
  const user  = getUser();
  const token = getToken();
  if (!user || !token) { window.location.href = 'index.html'; return null; }
  if (role && user.role !== role) {
    const map = { admin: 'admin.html', student: 'student.html', technician: 'technician.html' };
    window.location.href = map[user.role] || 'index.html';
    return null;
  }
  return user;
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  t.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

function statusBadge(s) {
  const cls = s === 'Pending' ? 'pending' : s === 'In Progress' ? 'in-progress' : 'resolved';
  return `<span class="status-badge ${cls}">${s}</span>`;
}

function priorityBadge(p) {
  const cls = (p || 'medium').toLowerCase();
  const icons = { high: '🔴', medium: '🟡', low: '🟢' };
  return `<span class="priority-badge ${cls}">${icons[cls] || ''} ${p || 'Medium'}</span>`;
}

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
}

function userInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}