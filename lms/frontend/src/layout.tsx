import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { Icon, Logo, type IconName } from './ui'

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/courses', label: 'Courses', icon: 'courses' },
  { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/quizzes', label: 'Quizzes', icon: 'quiz' },
]
const SOON: { label: string; icon: IconName }[] = [
  { label: 'Live sessions', icon: 'live' },
]

const YEAR = new Date().getFullYear()

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}

/** Main app frame: left sidebar (slide-out drawer on phones), top bar, page content. */
export function Shell() {
  const { user, signOut } = useAuth()
  // The drawer is "open" only for the page it was opened on, so navigating closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const { pathname } = useLocation()
  const open = openAt === pathname
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenAt(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const name = user?.full_name || user?.email || ''
  return (
    <div className={`shell${open ? ' nav-open' : ''}`}>
      <aside className="sidebar" id="sidebar" aria-label="Main navigation">
        <div className="side-top">
          <Link to="/" className="brand" aria-label="Learn With Sateesh, home">
            <Logo height={46} />
          </Link>
          <button type="button" className="icon-btn side-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon name="x" />
          </button>
        </div>

        <nav className="side-nav">
          {NAV.map((n) => {
            // Quiz pages live under /courses/... but belong to the Quizzes item.
            const inQuiz = !pathname.startsWith('/admin') && (pathname === '/quizzes' || pathname.includes('/quizzes/'))
            const active = inQuiz
              ? n.to === '/quizzes'
              : n.end
                ? pathname === n.to
                : pathname === n.to || pathname.startsWith(n.to + '/')
            return (
              <Link key={n.to} to={n.to} className={`nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
                <Icon name={n.icon} />
                <span>{n.label}</span>
              </Link>
            )
          })}
          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <>
              <p className="nav-label">Instructor</p>
              <Link to="/admin" className={`nav-item${pathname.startsWith('/admin') ? ' active' : ''}`} aria-current={pathname.startsWith('/admin') ? 'page' : undefined}>
                <Icon name="settings" />
                <span>Manage content</span>
              </Link>
            </>
          )}
          <p className="nav-label">Coming soon</p>
          {SOON.map((n) => (
            <span key={n.label} className="nav-item disabled" aria-disabled="true">
              <Icon name={n.icon} />
              <span>{n.label}</span>
            </span>
          ))}
        </nav>

        <div className="side-foot">
          {user ? (
            <>
              <div className="who">
                <span className="avatar" aria-hidden="true">{initials(name)}</span>
                <span className="who-name" title={name}>{name}</span>
              </div>
              <button type="button" className="nav-item as-button" onClick={() => signOut()}>
                <Icon name="logout" />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link className="btn block" to="/register">Create free account</Link>
              <Link className="btn ghost block" to="/login">Sign in</Link>
            </>
          )}
        </div>
      </aside>
      <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="main-col">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-controls="sidebar"
            aria-expanded={open}
          >
            <Icon name="menu" size={22} />
          </button>
          <Link to="/" className="top-logo" aria-label="Learn With Sateesh, home"><Logo height={34} /></Link>
          <div className="top-right">
            {user ? (
              <span className="avatar" title={name} aria-label={`Signed in as ${name}`}>{initials(name)}</span>
            ) : (
              <>
                <Link className="link-quiet" to="/login">Sign in</Link>
                <Link className="btn small" to="/register">Join free</Link>
              </>
            )}
          </div>
        </header>
        <main className="content" id="content">
          <Outlet />
        </main>
        <footer className="foot">
          <span>© {YEAR} Learn With Sateesh</span>
          <span>AI &amp; ML for B.Tech students</span>
        </footer>
      </div>
    </div>
  )
}
