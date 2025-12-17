const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('token')

  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) =>
    apiCall(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) =>
    apiCall(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
}
