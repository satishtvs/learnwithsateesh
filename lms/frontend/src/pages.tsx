import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getProviders, login, register, startGoogleLogin } from './api'
import { useAuth } from './auth'

export function Home() {
  const { user, signOut } = useAuth()
  return (
    <main className="card">
      <h1>LearnWithSateesh</h1>
      {user ? (
        <>
          <p>Welcome, {user.full_name || user.email}.</p>
          <p>Courses will appear here (next build step).</p>
          <button onClick={signOut}>Sign out</button>
        </>
      ) : (
        <p>
          <Link to="/login">Sign in</Link> or <Link to="/register">create an account</Link> to start learning.
        </p>
      )}
    </main>
  )
}

function GoogleButton() {
  const { data } = useQuery({ queryKey: ['providers'], queryFn: getProviders })
  if (!data?.google) return null
  return (
    <>
      <button type="button" onClick={startGoogleLogin}>
        Continue with Google
      </button>
      <p className="muted">or use email</p>
    </>
  )
}

export function Login() {
  const { user, refresh } = useAuth()
  const nav = useNavigate()
  const [error, setError] = useState('')
  if (user) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      await login(String(f.get('email')), String(f.get('password')))
      await refresh()
      nav('/')
    } catch {
      setError('Incorrect email or password.')
    }
  }

  return (
    <main className="card">
      <h1>Sign in</h1>
      <GoogleButton />
      <form onSubmit={onSubmit}>
        <input name="email" type="email" placeholder="Email" required autoComplete="email" />
        <input name="password" type="password" placeholder="Password" required autoComplete="current-password" />
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit">Sign in</button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </main>
  )
}

export function Register() {
  const { user, refresh } = useAuth()
  const nav = useNavigate()
  const [error, setError] = useState('')
  if (user) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email'))
    const password = String(f.get('password'))
    try {
      await register(email, password, String(f.get('name')))
      await login(email, password)
      await refresh()
      nav('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register.')
    }
  }

  return (
    <main className="card">
      <h1>Create account</h1>
      <GoogleButton />
      <form onSubmit={onSubmit}>
        <input name="name" placeholder="Full name" required autoComplete="name" />
        <input name="email" type="email" placeholder="Email" required autoComplete="email" />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit">Create account</button>
      </form>
      <p>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </main>
  )
}
