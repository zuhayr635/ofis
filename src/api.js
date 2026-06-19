const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Backend API yanıt vermiyor. Sunucu statik modda çalışıyor olabilir.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'İşlem tamamlanamadı.');
  return data;
};

export const publicApi = {
  content: () => request('/api/public/content'),
  createInquiry: (payload) => request('/api/public/inquiries', { method: 'POST', body: JSON.stringify(payload) })
};

export const createAdminApi = (token) => {
  const admin = (url, options = {}) => request(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers }
  });
  return {
    login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    dashboard: () => admin('/api/admin/dashboard'),
    settings: () => admin('/api/admin/settings'),
    saveSettings: (payload) => admin('/api/admin/settings', { method: 'PUT', body: JSON.stringify(payload) }),
    products: () => admin('/api/admin/products'),
    createProduct: (payload) => admin('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
    updateProduct: (id, payload) => admin(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteProduct: (id) => admin(`/api/admin/products/${id}`, { method: 'DELETE' }),
    inquiries: () => admin('/api/admin/inquiries'),
    updateInquiry: (id, status) => admin(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteInquiry: (id) => admin(`/api/admin/inquiries/${id}`, { method: 'DELETE' }),
    reset: () => admin('/api/admin/reset', { method: 'POST' })
  };
};

export const authApi = {
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
};
