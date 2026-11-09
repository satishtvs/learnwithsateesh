import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, forgotPassword, getProviders, login, register, resetPassword, startGoogleLogin, verifyEmail } from './api'
import { AuthField, AuthShell, OrDivider, PasswordField } from './auth-ui'
import { useAuth } from './auth'
import { Catalogue, ContinueLearning, FreePreviews } from './courses'
import { Icon, type IconName } from './ui'

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

// ---------------------------------------------------------------- sign-in screens
function useProviders() {
  return useQuery({ queryKey: ['providers'], queryFn: getProviders })
}

function SocialLogin() {
  const { data } = useProviders()
  if (!data?.google) return null
  return (
    <>
      <OrDivider />
      <button type="button" className="social" onClick={startGoogleLogin}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.2-3.9 7.2-9.6 7.2-16.9z" />
          <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.4-4.7 2.3-8.8 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        Continue with Google
      </button>
    </>
  )
}

export function Login() {
  const { user, refresh } = useAuth()
  const nav = useNavigate()
  const returnTo = useReturnTo()
  const providers = useProviders()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to={returnTo} replace />

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    try {
      await login(String(f.get('email')), String(f.get('password')))
      await refresh()
      nav(returnTo)
    } catch (err) {
      setError(err instanceof ApiError && err.status !== 400 ? err.message : 'Incorrect email or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Sign in to your account">
      <form className="aform" onSubmit={onSubmit}>
        <AuthField label="Email" name="email" type="email" icon="mail" required autoComplete="email" />
        <PasswordField label="Password" name="password" required autoComplete="current-password" />
        {providers.data?.email && (
          <div className="aform-row"><Link to="/forgot-password" className="alink">Forgot password?</Link></div>
        )}
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="pill" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <SocialLogin />
      <p className="auth-alt">Don't have an account? <Link to="/register" state={{ from: returnTo }}>Sign up</Link></p>
    </AuthShell>
  )
}

export function Register() {
  const { user, refresh } = useAuth()
  const nav = useNavigate()
  const returnTo = useReturnTo()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  if (user) return <Navigate to={returnTo} replace />
  const mismatch = pw2.length > 0 && pw !== pw2

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pw !== pw2) {
      setError('The two passwords do not match.')
      return
    }
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email'))
    setBusy(true)
    try {
      await register(email, pw, String(f.get('name')))
      await login(email, pw)
      await refresh()
      nav(returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Create your free account">
      <form className="aform" onSubmit={onSubmit}>
        <AuthField label="Full name" name="name" icon="user" required autoComplete="name" />
        <AuthField label="Email" name="email" type="email" icon="mail" required autoComplete="email" />
        <PasswordField label="Password" name="password" required minLength={8} autoComplete="new-password" showStrength value={pw} onChange={(e) => { setPw(e.target.value); setError('') }} />
        <PasswordField label="Confirm password" name="confirm" required autoComplete="new-password" value={pw2} onChange={(e) => { setPw2(e.target.value); setError('') }} aria-invalid={mismatch} />
        {mismatch && <p className="field-note error" role="status">Passwords do not match yet.</p>}
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="pill" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <SocialLogin />
      <p className="auth-alt">Already have an account? <Link to="/login" state={{ from: returnTo }}>Sign in</Link></p>
    </AuthShell>
  )
}

export function ForgotPassword() {
  const providers = useProviders()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email'))
    setBusy(true)
    try {
      await forgotPassword(email)
      setSent(true) // same answer whether or not the account exists
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (providers.data && !providers.data.email) {
    return (
      <AuthShell title="Forgot password?">
        <p className="auth-sub">Password reset by email is not available yet. Please contact the site owner and they will help you get back in.</p>
        <p className="auth-alt"><Link to="/login">Back to sign in</Link></p>
      </AuthShell>
    )
  }
  if (sent) {
    return (
      <AuthShell title="Check your email">
        <p className="auth-sub">If an account exists for that address, we have sent a link to reset your password. It can take a minute to arrive, so check your spam folder too.</p>
        <p className="auth-alt"><Link to="/login">Back to sign in</Link></p>
      </AuthShell>
    )
  }
  return (
    <AuthShell title="Forgot password?" subtitle="Enter the email you signed up with and we will send you a reset link.">
      <form className="aform" onSubmit={onSubmit}>
        <AuthField label="Email" name="email" type="email" icon="mail" required autoComplete="email" />
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="pill" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <p className="auth-alt">Remembered it? <Link to="/login">Sign in</Link></p>
    </AuthShell>
  )
}

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const mismatch = pw2.length > 0 && pw !== pw2

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pw !== pw2) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await resetPassword(token, pw)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset your password.')
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <AuthShell title="Reset link missing">
        <p className="auth-sub">This page needs the link from your reset email. Please request a new one.</p>
        <p className="auth-alt"><Link to="/forgot-password">Request a reset link</Link></p>
      </AuthShell>
    )
  }
  if (done) {
    return (
      <AuthShell title="Password updated">
        <p className="auth-sub">Your password has been changed. You can now sign in with it.</p>
        <Link className="pill link-pill" to="/login">Go to sign in</Link>
      </AuthShell>
    )
  }
  return (
    <AuthShell title="Set a new password" subtitle="Choose a password you have not used before.">
      <form className="aform" onSubmit={onSubmit}>
        <PasswordField label="New password" name="password" required minLength={8} autoComplete="new-password" showStrength value={pw} onChange={(e) => { setPw(e.target.value); setError('') }} />
        <PasswordField label="Confirm password" name="confirm" required autoComplete="new-password" value={pw2} onChange={(e) => { setPw2(e.target.value); setError('') }} aria-invalid={mismatch} />
        {mismatch && <p className="field-note error" role="status">Passwords do not match yet.</p>}
        {error && (
          <p role="alert" className="error">
            {error} {/invalid or has expired/.test(error) && <Link to="/forgot-password">Request a new link</Link>}
          </p>
        )}
        <button type="submit" className="pill" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
      </form>
    </AuthShell>
  )
}

export function VerifyEmail() {
  const token = useSearchParams()[0].get('token') ?? ''
  const { data, error, isLoading } = useQuery({
    queryKey: ['verify', token],
    queryFn: () => verifyEmail(token).then(() => true),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  })
  const { refresh } = useAuth()
  if (!token) {
    return <AuthShell title="Verification link missing"><p className="auth-sub">Open the link from your verification email.</p></AuthShell>
  }
  if (isLoading) return <AuthShell title="Verifying your email…"><p className="auth-sub">One moment.</p></AuthShell>
  if (data) {
    return (
      <AuthShell title="Email verified">
        <p className="auth-sub">Thank you. Your email address is confirmed.</p>
        <Link className="pill link-pill" to="/" onClick={() => refresh()}>Continue to Learn With Sateesh</Link>
      </AuthShell>
    )
  }
  return (
    <AuthShell title="Could not verify">
      <p role="alert" className="error">{error instanceof Error ? error.message : 'This verification link is invalid or has expired.'}</p>
      <p className="auth-alt"><Link to="/login">Back to sign in</Link></p>
    </AuthShell>
  )
}
