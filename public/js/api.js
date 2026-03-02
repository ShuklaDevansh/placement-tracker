var BASE_URL = 'https://placement-tracker-api-mbva.onrender.com/api';

const getToken = () => localStorage.getItem('token');

const request = async (method, endpoint, body = null) => {
  const token = getToken();

  // Redirect to login if no token found
  if (!token && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
    window.location.href = '/login.html';
    return;
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  // Token expired or invalid — force logout
  if (res.status === 401 && !endpoint.startsWith('/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
    return;
  }

  const data = await res.json();

  // Throw structured error for non-2xx responses
  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong');
    error.code = data.code || 'UNKNOWN_ERROR';
    error.details = data.details || [];
    throw error;
  }

  return data;
};

const api = {
  get:    (endpoint)       => request('GET', endpoint),
  post:   (endpoint, body) => request('POST', endpoint, body),
  put:    (endpoint, body) => request('PUT', endpoint, body),
  patch:  (endpoint, body) => request('PATCH', endpoint, body),
  delete: (endpoint)       => request('DELETE', endpoint)
};