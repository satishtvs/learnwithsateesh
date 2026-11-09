export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'instructor' | 'admin'
  is_verified: boolean
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`/api${path}`, { credentials: 'same-origin', ...init })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail)
  }
  return res
}

export async function getMe(): Promise<User | null> {
  try {
    return await (await request('/me')).json()
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null
    throw e
  }
}

export async function login(email: string, password: string): Promise<void> {
  await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  })
}

export async function register(email: string, password: string, full_name: string): Promise<void> {
  await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  })
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' })
}

export async function getProviders(): Promise<{ google: boolean }> {
  return (await request('/auth/providers')).json()
}

/** Starts the Google flow: ask the API for the consent URL, then navigate to it. */
export async function startGoogleLogin(): Promise<void> {
  const { authorization_url } = await (await request('/auth/google/authorize')).json()
  window.location.href = authorization_url
}
