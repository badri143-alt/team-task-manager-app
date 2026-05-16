const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ======================================
// GET TOKEN FROM LOCAL STORAGE
// ======================================

function getToken() {
  return localStorage.getItem('ttm_token');
}

// ======================================
// REQUEST FUNCTION
// ======================================

async function request(
  path,
  {
    method = 'GET',
    body,
    headers = {},
  } = {}
) {

  const token = getToken();

  const opts = {
    method,

    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...headers,
    },
  };

  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(
    `${BASE_URL}${path}`,
    opts
  );

  const text = await res.text();

  let data = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }

  if (!res.ok) {

    const msg =
      data?.message ||
      data?.error ||
      'Request failed';

    const err = new Error(msg);

    err.status = res.status;
    err.data = data;

    throw err;
  }

  return data;
}

// ======================================
// API METHODS
// ======================================

export const api = {
  get: (p) => request(p),

  post: (p, body) =>
    request(p, {
      method: 'POST',
      body,
    }),

  put: (p, body) =>
    request(p, {
      method: 'PUT',
      body,
    }),

  patch: (p, body) =>
    request(p, {
      method: 'PATCH',
      body,
    }),

  delete: (p) =>
    request(p, {
      method: 'DELETE',
    }),
};