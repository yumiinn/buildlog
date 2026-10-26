const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
const TOKEN_KEY = 'buildlog_access_token'

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const validationMessage = Array.isArray(data?.detail)
      ? data.detail[0]?.msg?.replace(/^Value error, /, '')
      : null
    throw new Error(validationMessage || data?.detail || '요청을 처리하지 못했습니다.')
  }
  return data
}
