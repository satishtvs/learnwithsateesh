import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { admin, listLiveSessions, type AdminLiveSession, type LiveSession } from './api'
import { Check, ErrorNote, Field, Gate, useAdminMutation } from './admin'
import { useAuth } from './auth'
import { Icon, PageHeader } from './ui'

const dayFmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const timeFmt = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
const endOf = (s: { starts_at: string; duration_minutes: number }) => new Date(new Date(s.starts_at).getTime() + s.duration_minutes * 60000)

function icsStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Download a one-event calendar file so learners can add the session to any calendar app. */
function addToCalendar(s: LiveSession) {
  const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => `\\${m}`).replace(/\r?\n/g, '\\n')
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Learn With Sateesh//Live sessions//EN', 'BEGIN:VEVENT',
    `UID:live-${s.id}@learnwithsateesh.in`, `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(new Date(s.starts_at))}`, `DTEND:${icsStamp(endOf(s))}`,
    `SUMMARY:${esc(s.title)}`, `DESCRIPTION:${esc(s.description || 'Live session on Learn With Sateesh')}`,
    ...(s.join_url ? [`URL:${s.join_url}`] : []), 'END:VEVENT', 'END:VCALENDAR',
  ]
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'live-session.ics'
  a.click()
  URL.revokeObjectURL(url)
}

function SessionCard({ s, signedIn }: { s: LiveSession; signedIn: boolean }) {
  const d = new Date(s.starts_at)
  return (
    <article className="card session">
      <div className="date-tile" aria-hidden="true">
        <strong>{d.getDate()}</strong>
        <span>{d.toLocaleDateString(undefined, { month: 'short' })}</span>
      </div>
      <div className="session-body">
        <div className="chips">
          {s.status === 'live' && <span className="chip ok">Live now</span>}
          {s.status === 'upcoming' && <span className="chip">Upcoming</span>}
          {s.status === 'past' && <span className="chip">Finished</span>}
          {s.course_slug && <Link className="chip" to={`/courses/${s.course_slug}`}>{s.course_title}</Link>}
        </div>
        <h3>{s.title}</h3>
        <p className="muted small">{dayFmt(s.starts_at)} · {timeFmt(s.starts_at)} – {timeFmt(endOf(s).toISOString())} · {s.duration_minutes} min</p>
        {s.description && <p>{s.description}</p>}
        <div className="session-actions">
          {s.status !== 'past' && (signedIn ? (
            s.join_url
              ? <a className="btn" href={s.join_url} target="_blank" rel="noopener noreferrer">{s.status === 'live' ? 'Join now' : 'Join link'}</a>
              : <span className="muted small">The join link will be added soon.</span>
          ) : (
            <Link className="btn" to="/login" state={{ from: '/live' }}>Sign in to join</Link>
          ))}
          {s.status !== 'past' && <button type="button" className="btn ghost" onClick={() => addToCalendar(s)}>Add to calendar</button>}
          {s.status === 'past' && s.recording_youtube_id && (
            <a className="btn" href={`https://www.youtube.com/watch?v=${s.recording_youtube_id}`} target="_blank" rel="noopener noreferrer"><Icon name="play" size={15} /> Watch recording</a>
          )}
          {s.status === 'past' && !s.recording_youtube_id && <span className="muted small">Recording not available.</span>}
        </div>
      </div>
    </article>
  )
}

export function LivePage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['live', user?.id ?? 'anon'], queryFn: listLiveSessions })
  const upcoming = (data ?? []).filter((s) => s.status !== 'past')
  const past = (data ?? []).filter((s) => s.status === 'past')
  return (
    <>
      <PageHeader title="Live sessions" subtitle="Join Sateesh live for doubt clearing and revision. Sign in to get the join link." />
      {isLoading ? <p className="muted">Loading…</p> : (
        <>
          <h2 className="h-sec">Upcoming</h2>
          {upcoming.length === 0
            ? <div className="empty plain"><Icon name="live" size={28} /><h3>No sessions scheduled right now</h3><p>New live sessions will be listed here.</p></div>
            : <div className="stack">{upcoming.map((s) => <SessionCard key={s.id} s={s} signedIn={!!user} />)}</div>}
          {past.length > 0 && (
            <>
              <h2 className="h-sec">Past sessions</h2>
              <div className="stack">{past.map((s) => <SessionCard key={s.id} s={s} signedIn={!!user} />)}</div>
            </>
          )}
        </>
      )}
    </>
  )
}

// ---------------------------------------------------------------- instructor side
const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function SessionForm({ session, onDone }: { session?: AdminLiveSession; onDone: () => void }) {
  const courses = useQuery({ queryKey: ['admin', 'courses'], queryFn: admin.courses })
  const [published, setPublished] = useState(session?.published ?? false)
  const save = useAdminMutation(
    (b: Parameters<typeof admin.saveLive>[1]) => admin.saveLive(session?.id, b),
    [['admin', 'live'], ['live']],
    onDone,
  )
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const course = String(f.get('course_id') ?? '')
    save.mutate({
      title: String(f.get('title')),
      description: String(f.get('description') ?? ''),
      starts_at: new Date(String(f.get('starts_at'))).toISOString(),
      duration_minutes: Number(f.get('duration_minutes')),
      join_url: String(f.get('join_url') ?? ''),
      recording: String(f.get('recording') ?? ''),
      course_id: course ? Number(course) : null,
      published,
    })
  }
  return (
    <form className="panel form" onSubmit={onSubmit}>
      <h2>{session ? 'Edit session' : 'New session'}</h2>
      <Field label="Title"><input name="title" required maxLength={200} defaultValue={session?.title} placeholder="Unit I doubt clearing" /></Field>
      <Field label="Description"><textarea name="description" rows={3} defaultValue={session?.description} /></Field>
      <div className="grid-2">
        <Field label="Starts (your local time)"><input name="starts_at" type="datetime-local" required defaultValue={session ? toLocalInput(session.starts_at) : ''} /></Field>
        <Field label="Length (minutes)"><input name="duration_minutes" type="number" min={5} max={480} required defaultValue={session?.duration_minutes ?? 60} /></Field>
      </div>
      <Field label="Join link" hint="Google Meet, Zoom or YouTube Live link. Only signed-in learners see it.">
        <input name="join_url" type="url" defaultValue={session?.join_url_raw} placeholder="https://meet.google.com/…" />
      </Field>
      <Field label="Course (optional)">
        <select name="course_id" defaultValue={session?.course_id ?? ''}>
          <option value="">Not tied to a course</option>
          {(courses.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </Field>
      <Field label="Recording (after the session)" hint="Paste the YouTube link of the recording once it is uploaded.">
        <input name="recording" defaultValue={session?.recording_youtube_id ?? ''} />
      </Field>
      <Check label="Published (visible to everyone)" checked={published} onChange={setPublished} />
      <ErrorNote error={save.error} />
      <div className="cta">
        <button className="btn" disabled={save.isPending}>{session ? 'Save changes' : 'Create session'}</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}

export function AdminLive() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'live'], queryFn: admin.liveSessions })
  const [editing, setEditing] = useState<AdminLiveSession | 'new' | null>(null)
  const del = useAdminMutation(admin.deleteLive, [['admin', 'live'], ['live']])
  return (
    <Gate>
      <PageHeader title="Live sessions" subtitle="Schedule classes, add the join link, and attach the recording afterwards.">
        <Link className="btn ghost" to="/admin">Back</Link>
        <button type="button" className="btn" onClick={() => setEditing('new')}>New session</button>
      </PageHeader>
      {editing && <SessionForm key={editing === 'new' ? 'new' : editing.id} session={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />}
      {isLoading ? <p className="muted">Loading…</p> : !data?.length ? <p className="muted">No sessions yet.</p> : (
        <ul className="rows">
          {data.map((s) => (
            <li key={s.id} className="row static">
              <span className="t">{s.title}<small>{dayFmt(s.starts_at)} {timeFmt(s.starts_at)} · {s.status}</small></span>
              <span className={`chip ${s.published ? 'ok' : 'warn'}`}>{s.published ? 'Published' : 'Draft'}</span>
              <button type="button" className="btn ghost sm" onClick={() => setEditing(s)}>Edit</button>
              <button type="button" className="btn ghost sm" onClick={() => { if (window.confirm(`Delete "${s.title}"?`)) del.mutate(s.id) }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </Gate>
  )
}
