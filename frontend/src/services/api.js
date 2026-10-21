const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function apiPost(path, body) {
  let response
  try {
    response = await fetch(`${BASE_URL}/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Cannot connect to the backend. Make sure Flask is running at http://localhost:5000.')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`)
  return data
}

export async function healthCheck() {
  const response = await fetch(`${BASE_URL}/api/health`)
  if (!response.ok) throw new Error('Backend unavailable')
  return response.json()
}
