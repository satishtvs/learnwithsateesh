import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { initials } from './format'
import { SemesterTree, SyllabusBox } from './semester-panel'
import { Icon, Loading, Logo, type IconName } from './ui'

const YEAR = new Date().getFullYear()
const LS_COLLAPSED = 'lws.panelCollapsed'

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(LS_COLLAPSED) === '1'
  } catch {
    return false
  }
}

type Section = 'home' | 'courses' | 'dashboard' | 'live' | 'admin' | 'me' | 'overview' | 'learners' | 'adminlive' | null

function sectionOf(pathname: string, staff = false): Section {
  if (staff) {
    // Instructors and admins: their own area, plus the learner pages as a preview.
    if (pathname === '/admin/learners') return 'learners'
    if (pathname === '/admin/live') return 'adminlive'
    if (pathname.startsWith('/admin')) return 'overview'
    if (pathname === '/dashboard/profile') return 'me'
    if (pathname.startsWith('/courses')) return 'courses'
    return null
  }
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname === '/dashboard/profile') return 'me'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/courses')) return 'courses'
  if (pathname.startsWith('/live')) return 'live'
  return null
}

/** Each rail icon has its own panel. For now only Courses has real content; every other panel holds a single entry named after its icon (more can be added per icon later). */
const PANEL_ENTRY: Record<Exclude<Section, null>, { label: string; to: string; icon: IconName }> = {
  home: { label: 'Home', to: '/', icon: 'home' },
  courses: { label: 'Courses', to: '/courses', icon: 'courses' },
  dashboard: { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
  live: { label: 'Live sessions', to: '/live', icon: 'live' },
  admin: { label: 'Manage content', to: '/admin', icon: 'settings' },
  me: { label: 'Me and settings', to: '/dashboard/profile', icon: 'user' },
  overview: { label: 'Overview', to: '/admin', icon: 'grid' },
  learners: { label: 'Learners', to: '/admin/learners', icon: 'learning' },
  adminlive: { label: 'Live sessions', to: '/admin/live', icon: 'live' },
}

function RailLink({ to, label, icon, active, onActive }: { to: string; label: string; icon: IconName; active: boolean; onActive?: () => void }) {
  return (
    <Link
      to={to}
      className={`rail-item${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      data-tip={label}
      onClick={(e) => {
        // Pressing the icon of the section you are already in shows or hides that section's panel.
        if (active && onActive) {
          e.preventDefault()
          onActive()
        }
      }}
    >
      <Icon name={icon} size={21} />
    </Link>
  )
}

/**
 * Layout D: a slim icon rail, a collapsible "Learn" panel (my syllabus + my semester's courses as a tree), then the page.
 * Under 980px the panel opens over the page; under 760px the rail becomes a bottom tab bar and the panel a sheet.
 */
export function Shell() {
  const { user } = useAuth()
  const { pathname, hash } = useLocation()
  const phone = useMediaQuery('(max-width: 759.98px)')
  const wide = useMediaQuery('(min-width: 980px)')
  const mode: 'inline' | 'overlay' | 'sheet' = phone ? 'sheet' : wide ? 'inline' : 'overlay'
  const [collapsed, setCollapsedState] = useState(readCollapsed)
  // The overlay or sheet is "open" only on the page where it was opened, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null)
  // Every rail icon has a panel (Courses: my syllabus + my semester; the others: one entry named after the icon).
  // Pages that belong to no icon (sign-in, legal pages) have none.
  const isStaff = user?.role === 'instructor' || user?.role === 'admin'
  const section = sectionOf(pathname, isStaff)
  const hasPanel = section !== null
  const open = hasPanel && (mode === 'inline' ? !collapsed : openAt === pathname)
  const panelRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v)
    try {
      window.localStorage.setItem(LS_COLLAPSED, v ? '1' : '0')
    } catch {
      /* not remembered */
    }
  }
  const setOpen = (v: boolean) => {
    if (mode === 'inline') setCollapsed(!v)
    else setOpenAt(v ? pathname : null)
  }

  // A new page starts at the top (or at its #anchor, which the page itself scrolls to).
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  const floating = mode !== 'inline' && open
  useEffect(() => {
    if (!floating) return
    panelRef.current?.querySelector<HTMLElement>('.lp-close')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenAt(null)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [floating])

  // Students get the syllabus and semester tree under Courses; instructors only preview the learner pages.
  const showTree = section === 'courses' && !isStaff
  const entry = isStaff && section === 'courses' ? { ...PANEL_ENTRY.courses, label: 'Preview courses' } : PANEL_ENTRY[section ?? 'home']
  const name = user?.full_name || user?.email || ''
  const first = (user?.full_name || '').trim().split(/\s+/)[0] || name
  const meTo = user ? '/dashboard/profile' : '/login'

  return (
    <div className={`app panel-${mode}${open ? ' panel-open' : ''}${hasPanel ? '' : ' no-panel'}`}>
      <a className="skip" href="#content">Skip to content</a>

      <div className="rail-col">
      <nav className="rail" aria-label="Main">
        <Link to="/" className="rail-logo" aria-label="Learn With Sateesh, home">
          <img src="/icon-192.png" alt="" width={36} height={36} />
        </Link>
        <span className="rail-sep" aria-hidden="true" />
        {isStaff ? (
          <>
            <RailLink to="/admin" label="Overview" icon="grid" active={section === 'overview'} onActive={() => setOpen(!open)} />
            <RailLink to="/admin/learners" label="Learners" icon="learning" active={section === 'learners'} onActive={() => setOpen(!open)} />
            <RailLink to="/admin/live" label="Live sessions" icon="live" active={section === 'adminlive'} onActive={() => setOpen(!open)} />
            <RailLink to="/courses" label="Preview courses" icon="courses" active={section === 'courses'} onActive={() => setOpen(!open)} />
          </>
        ) : (
          <>
            <RailLink to="/" label="Home" icon="home" active={section === 'home'} onActive={() => setOpen(!open)} />
            <RailLink to="/courses" label="Courses" icon="courses" active={section === 'courses'} onActive={() => setOpen(!open)} />
            <RailLink to="/dashboard" label="Dashboard" icon="grid" active={section === 'dashboard'} onActive={() => setOpen(!open)} />
            {user && <RailLink to="/live" label="Live sessions" icon="live" active={section === 'live'} onActive={() => setOpen(!open)} />}
          </>
        )}
        <span className="rail-push" />
        {user ? (
          <Link to={meTo} className={`rail-item rail-me${section === 'me' ? ' active' : ''}`} aria-label={`Me: ${name}`} data-tip="Me and settings" aria-current={section === 'me' ? 'page' : undefined} onClick={(e) => { if (section === 'me') { e.preventDefault(); setOpen(!open) } }}>
            <span className="avatar sm" aria-hidden="true">{initials(name)}</span>
          </Link>
        ) : (
          <RailLink to={meTo} label="Sign in" icon="user" active={false} />
        )}
      </nav>
      </div>

      <div className="learn-col">
      <aside
        id="learn-panel"
        ref={panelRef}
        className="learn"
        aria-label="Learn: my syllabus and my semester"
        role={floating ? 'dialog' : undefined}
        aria-modal={floating && mode === 'sheet' ? true : undefined}
        inert={!open}
      >
        <div className="lp-head">
          <h2>{showTree && mode === 'sheet' ? 'My semester' : entry.label}</h2>
          <button type="button" className="icon-btn lp-close" onClick={() => { setOpen(false); toggleRef.current?.focus() }} aria-label={mode === 'sheet' ? 'Close' : 'Hide the Learn panel'}>
            <Icon name={mode === 'sheet' ? 'x' : 'chevronLeft'} size={18} />
          </button>
        </div>
        <div className="lp-body">
          {showTree ? (
            <>
              <SyllabusBox />
              <SemesterTree />
            </>
          ) : (
            <nav className="lp-entries" aria-label={entry.label}>
              <Link to={entry.to} className="lp-entry active" aria-current="page">
                <Icon name={entry.icon} size={18} /> {entry.label}
              </Link>
            </nav>
          )}
        </div>
      </aside>
      </div>
      <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="main-col">
        <header className="topbar">
          <Link to="/" className="top-logo" aria-label="Learn With Sateesh, home"><Logo height={30} /></Link>
          <button
            ref={mode === 'sheet' ? toggleRef : undefined}
            type="button"
            className="btn ghost small sem-btn"
            aria-expanded={mode === 'sheet' && open}
            aria-controls="learn-panel"
            onClick={() => setOpen(true)}
          >
            <Icon name="layers" size={16} /> <span className="sem-label">{showTree ? 'My semester' : entry.label}</span>
          </button>
          <div className="top-right">
            {user ? (
              <Link to="/dashboard/profile" className="who" aria-label={`Signed in as ${name}. Open my profile`}>
                <span className="avatar" aria-hidden="true">{initials(name)}</span>
                <span className="who-name">{first}</span>
              </Link>
            ) : (
              <>
                <Link className="link-quiet" to="/login" state={{ from: pathname }}>Sign in</Link>
                <Link className="btn small" to="/register">Join free</Link>
              </>
            )}
          </div>
        </header>
        <main className="content" id="content" tabIndex={-1}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="foot">
          <span>© {YEAR} Learn With Sateesh</span>
          <span className="foot-links">
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms and conditions</Link>
          </span>
        </footer>
      </div>

      <nav className="tabbar" aria-label="Main">
        {((isStaff
          ? [
              ['/admin', 'Overview', 'grid', section === 'overview'],
              ['/admin/learners', 'Learners', 'learning', section === 'learners'],
              ['/admin/live', 'Live', 'live', section === 'adminlive'],
              [meTo, 'Me', 'user', section === 'me'],
            ]
          : [
              ['/', 'Home', 'home', section === 'home'],
              ['/courses', 'Courses', 'courses', section === 'courses'],
              [meTo, 'Me', 'user', section === 'me' || section === 'dashboard'],
            ]) as [string, string, IconName, boolean][]).map(([to, label, icon, active]) => (
          <Link key={label} to={to} className={`tab${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
            <Icon name={icon} size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
