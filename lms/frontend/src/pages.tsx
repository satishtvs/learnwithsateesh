import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getProviders, login, register, startGoogleLogin } from './api'
import { useAuth } from './auth'
import { Catalogue, ContinueLearning, FreePreviews } from './courses'
import { Icon, Logo, type IconName } from './ui'

/** Where to go after signing in: the page that sent us here, if it was an in-app path. */
function useReturnTo(): string {
  const from = (useLocation().state as { from?: string } | null)?.from
  return from && from.startsWith('/') && !from.startsWith('//') ? from : '/'
}

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'courses', title: 'Syllabus-aligned', text: 'Every video follows the units and topics of your university syllabus.' },
  { icon: 'clock', title: 'Short, focused videos', text: 'Each topic is split into parts of about 10 to 20 minutes.' },
  { icon: 'sparkle', title: 'Revision-ready', text: 'Worked examples and an important-questions slide at the end of each unit.' },
]

const PERKS: { icon: IconName; text: string; status?: string }[] = [
  { icon: 'learning', text: 'Track your progress and resume where you left off' },
  { icon: 'quiz', text: 'Practice quizzes on every unit, with instant feedback', status: 'Coming soon' },
  { icon: 'award', text: 'Certificates when you complete a course', status: 'Planned' },
  { icon: 'live', text: 'Live doubt-clearing sessions with the instructor', status: 'Planned' },
]

export function Home() {
  const { user } = useAuth()
  const first = (user?.full_name || '').trim().split(/\s+/)[0]

  if (user) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1>Welcome back{first ? `, ${first}` : ''}</h1>
            <p className="sub">Continue a course or explore something new.</p>
          </div>
        </div>
        <section className="block">
          <h2 className="section-title">Continue learning</h2>
          <ContinueLearning empty />
        </section>
        <section className="block">
          <h2 className="section-title">All courses</h2>
          <Catalogue />
        </section>
      </>
    )
  }

  return (
    <>
      <section className="hero-banner">
        <h1>Learn AI &amp; ML the exam-ready way</h1>
        <p>
          Clear, focused video lessons for B.Tech AI &amp; ML students, organised unit by unit and aligned to the JNTUH
          syllabus. Taught by Sateesh Kumar Talupuri.
        </p>
        <div className="cta">
          <Link className="btn accent" to="/register">Create a free account</Link>
          <a className="btn ghost-light" href="#try-free">Watch a free lesson</a>
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <div key={f.title} className="card feature">
            <span className="feat-ico"><Icon name={f.icon} size={20} /></span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="block" id="try-free">
        <h2 className="section-title">Try it free, no account needed</h2>
        <FreePreviews />
      </section>

      <section className="block">
        <h2 className="section-title">Courses</h2>
        <Catalogue />
      </section>

      <section className="panel">
        <h2>With a free account</h2>
        <ul className="rows">
          {PERKS.map((p) => (
            <li key={p.text} className="row static">
              <span className="ico"><Icon name={p.icon} size={15} /></span>
              <span className="t">{p.text}</span>
              {p.status && <span className="chip">{p.status}</span>}
            </li>
          ))}
        </ul>
        <div className="cta"><Link className="btn" to="/register">Sign up free</Link></div>
      </section>
    </>
  )
}

function GoogleButton() {
  const { data } = useQuery({ queryKey: ['providers'], queryFn: getProviders })
  if (!data?.google) return null
  return (
    <>
      <button type="button" className="btn ghost block" onClick={startGoogleLogin}>
        Continue with Google
      </button>
      <p className="divider"><span>or use email</span></p>
    </>
  )
}

function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="auth-card">
      <Link to="/" className="auth-logo" aria-label="Learn With Sateesh, home"><Logo height={44} /></Link>
      <h1>{title}</h1>
      {children}
    </main>
  )
}

export function Login() {
  const { user, refresh } = useAuth()
  const nav = useNavigate()
  const returnTo = useReturnTo()
  const [error, setError] = useState('')
  if (user) return <Navigate to={returnTo} replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      await login(String(f.get('email')), String(f.get('password')))
      await refresh()
      nav(returnTo)
    } catch {
      setError('Incorrect email or password.')
    }
  }

  return (
    <AuthCard title="Sign in">
      <GoogleButton />
      <form onSubmit={onSubmit}>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="btn block">Sign in</button>
      </form>
      <p className="auth-alt">New here? <Link to="/register" state={{ from: returnTo }}>Create an account</Link></p>
    </AuthCard>
  )
}

export function Register() {
  const { user, refresh } = useAuth()
  const nav = useNavigate()
  const returnTo = useReturnTo()
  const [error, setError] = useState('')
  if (user) return <Navigate to={returnTo} replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email'))
    const password = String(f.get('password'))
    try {
      await register(email, password, String(f.get('name')))
      await login(email, password)
      await refresh()
      nav(returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register.')
    }
  }

  return (
    <AuthCard title="Create your free account">
      <GoogleButton />
      <form onSubmit={onSubmit}>
        <label>Full name<input name="name" required autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>
          Password
          <input name="password" type="password" placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
        </label>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="btn block">Create account</button>
      </form>
      <p className="auth-alt">Already registered? <Link to="/login" state={{ from: returnTo }}>Sign in</Link></p>
    </AuthCard>
  )
}
