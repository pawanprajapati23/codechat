const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://codechat-5oju.onrender.com';

const request = async (path, options = {}) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const signup = (payload) => request('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const login = (payload) => request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const getMe = () => request('/api/auth/me');

export const logout = () => request('/api/auth/logout', {
  method: 'POST',
});

export const getRoomMessages = (roomCode, limit = 100) => (
  request(`/api/rooms/${roomCode}/messages?limit=${limit}`)
);

export const getDirectMessages = (userId) => (
  request(`/api/messages/${userId}`)
);
