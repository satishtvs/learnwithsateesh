import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { getAllProgress, getMyAttempts, updateMe, type CourseProgress, type MyAttempt } from './api'
import { useAuth } from './auth'
import { ContinueLearning, LoginGate } from './courses'
import { lessonsWord } from './format'
import { Cover, Icon, ProgressBar, type IconName } from './ui'

const ROLE_LABEL: Record<string, string> = { student: 'Student', instructor: 'Instructor', admin: 'Administrator' }

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

function useProgress() {
  return useQuery({ queryKey: ['progress'], queryFn: getAllProgress })
}
function useAttempts() {
  return useQuery({ queryKey: ['my-attempts'], queryFn: () => getMyAttempts(200) })
}

const TABS = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/courses', label: 'Enrolled courses' },
  { to: '/dashboard/quizzes', label: 'Quiz attempts' },
  { to: '/dashboard/profile', label: 'My profile' },
]

/** Profile banner and tab bar shared by every learner-dashboard page. */
export function DashboardLayout() {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <p className="muted">Loading…</p>
  if (!user) {
    return (
      <LoginGate
        back={loc.pathname}
        title="Sign in to see your dashboard"
        text="Your dashboard keeps track of your courses, quiz results and progress. It is free."
      />
    )
  }
  const name = user.full_name || user.email
  const isStaff = user.role === 'instructor' || user.role === 'admin'
  return (
    <>
      <section className="profile-banner">
        <span className="avatar-lg" aria-hidden="true">{initials(name)}</span>
        <div className="pb-text">
          <h1>{name}</h1>
          <span className="chip role">{ROLE_LABEL[user.role] ?? user.role}</span>
        </div>
        <div className="pb-actions">
          <Link className="btn accent" to="/courses">Browse courses</Link>
          {isStaff && <Link className="btn ghost-light" to="/admin">Instructor area</Link>}
        </div>
      </section>
      <nav className="dtabs" aria-label="Dashboard sections">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `dtab${isActive ? ' active' : ''}`}>{t.label}</NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  )
}

function Stat({ icon, label, value, tone }: { icon: IconName; label: string; value: number | string; tone: 'orange' | 'navy' | 'green' | 'violet' }) {
  return (
    <div className="stat">
      <span className={`stat-ico ${tone}`}><Icon name={icon} size={20} /></span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function AttemptRow({ a }: { a: MyAttempt }) {
  return (
    <li>
      <Link to={`/courses/${a.course_slug}/quizzes/${a.quiz_slug}`} className="row quiz">
        <span className={`ico ${a.passed ? 'ok' : 'quiz'}`}><Icon name={a.passed ? 'check' : 'quiz'} size={15} /></span>
        <span className="t">
          {a.quiz_title}
          <small>{a.course_title} · {fmtDate(a.created_at)}</small>
        </span>
        <span className="score">{a.score}/{a.total}</span>
        <span className={`chip ${a.passed ? 'ok' : 'warn'}`}>{a.percent}% · {a.passed ? 'Passed' : 'Try again'}</span>
      </Link>
    </li>
  )
}

export function DashboardHome() {
  const progress = useProgress()
  const attempts = useAttempts()
  const started = (progress.data ?? []).filter((p) => p.started)
  const completed = started.filter((p) => p.total > 0 && p.percent === 100).length
  const passedQuizzes = new Set((attempts.data ?? []).filter((a) => a.passed).map((a) => `${a.course_slug}/${a.quiz_slug}`)).size
  const latest = (attempts.data ?? []).slice(0, 5)

  return (
    <>
      <section className="stats" aria-label="Your numbers">
        <Stat icon="courses" label="Enrolled courses" value={started.length} tone="navy" />
        <Stat icon="learning" label="In progress" value={started.length - completed} tone="orange" />
        <Stat icon="check" label="Completed" value={completed} tone="green" />
        <Stat icon="quiz" label="Quizzes passed" value={passedQuizzes} tone="violet" />
      </section>

      <section className="block">
        <div className="section-row">
          <h2 className="section-title">Continue learning</h2>
          <Link to="/dashboard/courses" className="more">View all</Link>
        </div>
        <ContinueLearning empty />
      </section>

      <section className="panel">
        <div className="section-row">
          <h2>Latest quiz results</h2>
          <Link to="/dashboard/quizzes" className="more">View all</Link>
        </div>
        {attempts.isLoading ? (
          <p className="muted">Loading…</p>
        ) : latest.length === 0 ? (
          <p className="muted">You have not taken a quiz yet. <Link to="/quizzes">See the quizzes</Link>.</p>
        ) : (
          <ul className="rows">{latest.map((a, i) => <AttemptRow key={i} a={a} />)}</ul>
        )}
      </section>
    </>
  )
}

type Filter = 'all' | 'active' | 'done'

export function EnrolledCourses() {
  const { data, isLoading } = useProgress()
  const [filter, setFilter] = useState<Filter>('all')
  const started = (data ?? []).filter((p) => p.started)
  const done = (p: CourseProgress) => p.total > 0 && p.percent === 100
  const shown = started.filter((p) => (filter === 'all' ? true : filter === 'done' ? done(p) : !done(p)))
  const counts = { all: started.length, active: started.filter((p) => !done(p)).length, done: started.filter(done).length }
  const tabs: [Filter, string][] = [['all', 'All'], ['active', 'In progress'], ['done', 'Completed']]

  return (
    <section>
      <div className="pills" role="tablist" aria-label="Filter courses">
        {tabs.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={filter === k} className={`pill-tab${filter === k ? ' active' : ''}`} onClick={() => setFilter(k)}>
            {label} <span>{counts[k]}</span>
          </button>
        ))}
      </div>
      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="empty">
          <Icon name="learning" size={28} />
          <h3>{started.length === 0 ? "You haven't started a course yet" : 'Nothing here yet'}</h3>
          <p>{started.length === 0 ? 'Open any lesson and the course appears here with your progress.' : 'Try another filter.'}</p>
          {started.length === 0 && <Link className="btn" to="/courses">Browse courses</Link>}
        </div>
      ) : (
        <div className="grid">
          {shown.map((p) => (
            <div key={p.course_slug} className="card static">
              <Cover seed={p.course_slug} icon={done(p) ? 'award' : 'learning'} />
              <div className="card-body">
                <h3>{p.course_title}</h3>
                <div className="card-progress">
                  <ProgressBar percent={p.percent} label={`${p.course_title} progress`} />
                  <span>{p.completed} of {p.total} {lessonsWord(p.total)} · {p.percent}%</span>
                </div>
                {p.resume ? (
                  <Link className="btn small" to={`/courses/${p.course_slug}/lessons/${p.resume.slug}`}>Resume: {p.resume.title}</Link>
                ) : (
                  <Link className="btn ghost small" to={`/courses/${p.course_slug}`}>Review course</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function QuizAttempts() {
  const { data, isLoading } = useAttempts()
  return (
    <section className="panel">
      <h2>My quiz attempts</h2>
      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : !data?.length ? (
        <div className="empty plain">
          <Icon name="quiz" size={28} />
          <h3>No attempts yet</h3>
          <p>Take a quiz and your scores will be listed here, newest first.</p>
          <Link className="btn" to="/quizzes">See the quizzes</Link>
        </div>
      ) : (
        <ul className="rows">{data.map((a, i) => <AttemptRow key={i} a={a} />)}</ul>
      )}
    </section>
  )
}

export function ProfilePage() {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.full_name ?? '')
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  if (!user) return null

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('saving')
    try {
      await updateMe({ full_name: name.trim() })
      await refresh()
      setState('saved')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="panel">
      <h2>My profile</h2>
      <dl className="facts">
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Account type</dt><dd>{ROLE_LABEL[user.role] ?? user.role}</dd></div>
        <div><dt>Email verified</dt><dd>{user.is_verified ? 'Yes' : 'Not yet'}</dd></div>
      </dl>
      <form className="form profile-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Full name</span>
          <input value={name} onChange={(e) => { setName(e.target.value); setState('idle') }} required maxLength={200} autoComplete="name" />
        </label>
        {state === 'error' && <p role="alert" className="error form-error">Could not save. Please try again.</p>}
        <div className="cta">
          <button className="btn" disabled={state === 'saving' || name.trim() === (user.full_name ?? '')}>{state === 'saving' ? 'Saving…' : 'Save name'}</button>
          {state === 'saved' && <span className="saved muted small">Saved</span>}
        </div>
      </form>
    </section>
  )
}
