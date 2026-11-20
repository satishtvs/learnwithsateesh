import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  admin,
  ApiError,
  type AdminUnit,
  type AdminOverview,
  type AdminPart,
  type AdminQuestion,
  type AdminQuiz,
  type PartForm,
  type QuestionForm,
} from './api'
import { useAuth } from './auth'
import { LoginGate } from './courses'
import { Icon, Loading, PageHeader } from './ui'

const fmtWhen = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

// ---------------------------------------------------------------- shared bits
export function Gate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <p className="muted">Loading…</p>
  if (!user) return <LoginGate back={loc.pathname} title="Sign in to manage content" text="The instructor area is for course authors." />
  if (user.role === 'student') {
    return (
      <div className="empty">
        <Icon name="lock" size={28} />
        <h3>Instructor access required</h3>
        <p>This area is only for course authors. If you should have access, ask the site owner to enable it for your account.</p>
        <Link className="btn" to="/">Back home</Link>
      </div>
    )
  }
  return <>{children}</>
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null
  const msg = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
  return <p role="alert" className="error form-error">{msg}</p>
}

/** A mutation that refreshes the listed queries on success. */
export function useAdminMutation<A, R>(fn: (a: A) => Promise<R>, invalidate: unknown[][], onDone?: (r: R) => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      invalidate.forEach((k) => qc.invalidateQueries({ queryKey: k }))
      onDone?.(r)
    },
  })
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function MoveButtons({ onMove, disabled }: { onMove: (d: 'up' | 'down') => void; disabled?: boolean }) {
  return (
    <span className="move">
      <button type="button" className="icon-btn sm" aria-label="Move up" disabled={disabled} onClick={() => onMove('up')}>↑</button>
      <button type="button" className="icon-btn sm" aria-label="Move down" disabled={disabled} onClick={() => onMove('down')}>↓</button>
    </span>
  )
}

const ask = (msg: string) => window.confirm(msg)

// ---------------------------------------------------------------- overview
function OverviewPanel({ o }: { o: AdminOverview }) {
  const tiles = [
    { icon: 'learning' as const, label: 'Learners', value: o.learners, tone: 'orange' },
    { icon: 'sparkle' as const, label: 'Active this week', value: o.active_7d, tone: 'navy' },
    { icon: 'check' as const, label: 'Parts completed', value: o.parts_completed, tone: 'green' },
    { icon: 'quiz' as const, label: o.pass_rate === null ? 'Quiz attempts' : `Quiz attempts · ${o.pass_rate}% passed`, value: o.attempts, tone: 'violet' },
  ]
  return (
    <>
      <section className="stats" aria-label="Overview">
        {tiles.map((t) => (
          <div className="stat" key={t.label}>
            <span className={`stat-ico ${t.tone}`}><Icon name={t.icon} size={20} /></span>
            <div><strong>{t.value}</strong><span>{t.label}</span></div>
          </div>
        ))}
      </section>
      <div className="two-col block">
        <section className="panel">
          <h2>Courses</h2>
          <table className="tbl">
            <thead><tr><th>Course</th><th>Learners</th><th>Parts done</th></tr></thead>
            <tbody>
              {o.courses.map((c) => (
                <tr key={c.id}>
                  <td><Link to={`/admin/courses/${c.id}`}>{c.title}</Link> {!c.published && <span className="chip warn">Draft</span>}</td>
                  <td>{c.learners}</td>
                  <td>{c.completions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel">
          <h2>Recent quiz attempts</h2>
          {o.recent_attempts.length === 0 ? <p className="muted">No attempts yet.</p> : (
            <ul className="rows">
              {o.recent_attempts.map((r, i) => (
                <li key={i} className="row">
                  <span><strong>{r.learner}</strong><br /><small className="muted">{r.quiz_title} · {fmtWhen(r.created_at)}</small></span>
                  <span className={`chip ${r.passed ? 'ok' : 'warn'}`}>{r.score}/{r.total}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

// ---------------------------------------------------------------- course list
export function AdminHome() {
  const nav = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'courses'], queryFn: admin.courses })
  const overview = useQuery({ queryKey: ['admin', 'overview'], queryFn: admin.overview })
  const [open, setOpen] = useState(false)
  const create = useAdminMutation(admin.createCourse, [['admin', 'courses']], (c) => nav(`/admin/courses/${c.id}`))

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    create.mutate({ title: String(f.get('title')), description: String(f.get('description') ?? '') })
  }

  return (
    <Gate>
      <PageHeader title="Instructor area" subtitle="Create courses, add parts by pasting a YouTube link, and manage quizzes.">
        <Link className="btn ghost" to="/admin/live">Live sessions</Link>
        <button type="button" className="btn" onClick={() => setOpen((v) => !v)}>New course</button>
      </PageHeader>

      {open && (
        <form className="panel form" onSubmit={onSubmit}>
          <h2>New course</h2>
          <Field label="Title"><input name="title" required maxLength={200} placeholder="Machine Learning: JNTUH R22 III-I" /></Field>
          <Field label="Description"><textarea name="description" rows={3} /></Field>
          <ErrorNote error={create.error} />
          <div className="cta"><button className="btn" disabled={create.isPending}>Create course</button></div>
          <p className="muted small">New courses start unpublished, so students cannot see them until you publish.</p>
        </form>
      )}

      {overview.data && <OverviewPanel o={overview.data} />}

      {isLoading ? <p className="muted">Loading…</p> : (
        <div className="grid">
          {(data ?? []).map((c) => (
            <Link key={c.id} to={`/admin/courses/${c.id}`} className="card course-card">
              <div className="card-body">
                <div className="chips">
                  <span className={`chip ${c.published ? 'ok' : 'warn'}`}>{c.published ? 'Published' : 'Draft'}</span>
                </div>
                <h3>{c.title}</h3>
                <p className="clamp">{c.description || 'No description yet.'}</p>
                <div className="chips">
                  <span className="chip">{c.unit_count} units</span>
                  <span className="chip">{c.part_count} parts</span>
                  <span className="chip">{c.quiz_count} quizzes</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Gate>
  )
}

// ---------------------------------------------------------------- course editor
export function CourseEditor() {
  const id = Number(useParams().id)
  const key = ['admin', 'course', id]
  const { data, isLoading, error } = useQuery({ queryKey: key, queryFn: () => admin.course(id), retry: false })
  if (isLoading) return <Gate><p className="muted">Loading…</p></Gate>
  if (error || !data) {
    return <Gate><div className="empty"><h3>Course not found</h3><Link className="btn" to="/admin">Back</Link></div></Gate>
  }
  const { course, units, parts, quizzes } = data
  return (
    <Gate>
      <nav className="crumbs"><Link to="/admin">Instructor area</Link><Icon name="chevron" size={14} /><span>{course.title}</span></nav>
      <PageHeader title={course.title} subtitle={course.published ? 'Published: visible to students' : 'Draft: only you can see this'}>
        {course.published && <Link className="btn ghost" to={`/courses/${course.slug}`}>View on site</Link>}
      </PageHeader>
      <CourseDetails key={course.id} course={course} refresh={key} />
      <UnitsPanel courseId={id} units={units} refresh={key} />
      <PartsPanel courseId={id} units={units} parts={parts} refresh={key} />
      <QuizzesPanel courseId={id} units={units} quizzes={quizzes} refresh={key} />
    </Gate>
  )
}

function CourseDetails({ course, refresh }: { course: { id: number; title: string; slug: string; description: string; published: boolean }; refresh: unknown[] }) {
  const [title, setTitle] = useState(course.title)
  const [slug, setSlug] = useState(course.slug)
  const [description, setDescription] = useState(course.description)
  const save = useAdminMutation((b: Parameters<typeof admin.updateCourse>[1]) => admin.updateCourse(course.id, b), [refresh, ['admin', 'courses'], ['courses']])
  return (
    <form
      className="panel form"
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate({ title, slug, description })
      }}
    >
      <h2>Course details</h2>
      <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} /></Field>
      <Field label="Web address (slug)" hint="Used in the course link. Changing it breaks old links.">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
      </Field>
      <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></Field>
      <ErrorNote error={save.error} />
      <div className="cta">
        <button className="btn" disabled={save.isPending}>Save details</button>
        <button
          type="button"
          className={`btn ${course.published ? 'ghost' : 'accent'}`}
          disabled={save.isPending}
          onClick={() => save.mutate({ published: !course.published })}
        >
          {course.published ? 'Unpublish course' : 'Publish course'}
        </button>
        {save.isSuccess && <span className="muted small saved">Saved</span>}
      </div>
    </form>
  )
}

// ---------------------------------------------------------------- units
function UnitsPanel({ courseId, units, refresh }: { courseId: number; units: AdminUnit[]; refresh: unknown[] }) {
  const [editing, setEditing] = useState<number | null>(null)
  const move = useAdminMutation(({ id, d }: { id: number; d: 'up' | 'down' }) => admin.moveUnit(id, d), [refresh])
  const del = useAdminMutation((id: number) => admin.deleteUnit(id), [refresh])
  const add = useAdminMutation((b: { code: string; title: string; label: string | null; textbook_ref: string | null }) => admin.createUnit(courseId, b), [refresh])

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    add.mutate(
      { code: String(f.get('code')), title: String(f.get('title')), label: String(f.get('label') || '') || null, textbook_ref: String(f.get('ref') || '') || null },
      { onSuccess: () => form.reset() },
    )
  }

  return (
    <section className="panel">
      <h2>Units <small>Groups that hold your parts</small></h2>
      <ul className="rows">
        {units.map((ch) => (
          <li key={ch.id}>
            <div className="row static">
              <span className="code">{ch.code}</span>
              <span className="t">{ch.title}<small>{[ch.label, ch.textbook_ref].filter(Boolean).join(' · ')}</small></span>
              <MoveButtons onMove={(d) => move.mutate({ id: ch.id, d })} disabled={move.isPending} />
              <button type="button" className="btn ghost small" onClick={() => setEditing(editing === ch.id ? null : ch.id)}>Edit</button>
              <button
                type="button"
                className="btn ghost small danger"
                onClick={() => ask(`Delete unit ${ch.code}?`) && del.mutate(ch.id)}
              >
                Delete
              </button>
            </div>
            {editing === ch.id && <UnitEdit unit={ch} refresh={refresh} onDone={() => setEditing(null)} />}
          </li>
        ))}
        {units.length === 0 && <li className="muted small">No units yet.</li>}
      </ul>
      <ErrorNote error={move.error ?? del.error} />
      <form className="inline-form" onSubmit={onAdd}>
        <input name="code" placeholder="Code, e.g. U1" required maxLength={10} aria-label="Unit code" />
        <input name="title" placeholder="Unit title" required maxLength={200} aria-label="Unit title" className="grow" />
        <input name="label" placeholder="Unit label, e.g. Unit - I" maxLength={20} aria-label="Unit label" />
        <input name="ref" placeholder="Textbook reference" maxLength={200} aria-label="Textbook reference" />
        <button className="btn small" disabled={add.isPending}>Add unit</button>
      </form>
      <ErrorNote error={add.error} />
    </section>
  )
}

function UnitEdit({ unit, refresh, onDone }: { unit: AdminUnit; refresh: unknown[]; onDone: () => void }) {
  const [v, setV] = useState({ code: unit.code, title: unit.title, label: unit.label ?? '', textbook_ref: unit.textbook_ref ?? '' })
  const save = useAdminMutation(
    () => admin.updateUnit(unit.id, { code: v.code, title: v.title, label: v.label || null, textbook_ref: v.textbook_ref || null }),
    [refresh, ['course']],
    onDone,
  )
  return (
    <form className="inline-form edit" onSubmit={(e) => { e.preventDefault(); save.mutate(undefined) }}>
      <input value={v.code} onChange={(e) => setV({ ...v, code: e.target.value })} required maxLength={10} aria-label="Unit code" />
      <input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} required className="grow" aria-label="Unit title" />
      <input value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} placeholder="Unit label" aria-label="Unit label" />
      <input value={v.textbook_ref} onChange={(e) => setV({ ...v, textbook_ref: e.target.value })} placeholder="Textbook reference" aria-label="Textbook reference" />
      <button className="btn small" disabled={save.isPending}>Save</button>
      <button type="button" className="btn ghost small" onClick={onDone}>Cancel</button>
      <ErrorNote error={save.error} />
    </form>
  )
}

// ---------------------------------------------------------------- parts
function PartsPanel({ courseId, units, parts, refresh }: { courseId: number; units: AdminUnit[]; parts: AdminPart[]; refresh: unknown[] }) {
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const move = useAdminMutation(({ id, d }: { id: number; d: 'up' | 'down' }) => admin.movePart(id, d), [refresh])
  const del = useAdminMutation((id: number) => admin.deletePart(id), [refresh, ['course'], ['progress']])

  const groups: { key: string; title: string; items: AdminPart[] }[] = [
    { key: 'none', title: 'Start here (no unit)', items: parts.filter((l) => l.unit_id === null) },
    ...units.map((c) => ({ key: String(c.id), title: `${c.code} · ${c.title}`, items: parts.filter((l) => l.unit_id === c.id) })),
  ].filter((g) => g.items.length > 0)

  return (
    <section className="panel">
      <h2>Parts <small>Each part is one YouTube video with optional notes</small></h2>
      {groups.length === 0 && <p className="muted small">No parts yet. Add the first one below.</p>}
      {groups.map((g) => (
        <div key={g.key} className="group">
          <h3>{g.title}</h3>
          <ul className="rows">
            {g.items.map((l) => (
              <li key={l.id}>
                <div className="row static">
                  <span className="t">{l.title}<small>youtu.be/{l.youtube_id}</small></span>
                  {!l.published && <span className="chip warn">Draft</span>}
                  {l.is_preview && <span className="chip free">Free</span>}
                  <MoveButtons onMove={(d) => move.mutate({ id: l.id, d })} disabled={move.isPending} />
                  <button type="button" className="btn ghost small" onClick={() => setEditing(editing === l.id ? null : l.id)}>Edit</button>
                  <button type="button" className="btn ghost small danger" onClick={() => ask(`Delete the part "${l.title}"? Learners' progress on it is removed too.`) && del.mutate(l.id)}>Delete</button>
                </div>
                {editing === l.id && <PartEditor courseId={courseId} units={units} part={l} refresh={refresh} onDone={() => setEditing(null)} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <ErrorNote error={move.error ?? del.error} />
      {editing === 'new' ? (
        <PartEditor courseId={courseId} units={units} refresh={refresh} onDone={() => setEditing(null)} />
      ) : (
        <div className="cta"><button type="button" className="btn small" onClick={() => setEditing('new')}>Add part</button></div>
      )}
    </section>
  )
}

function PartEditor({ courseId, units, part, refresh, onDone }: { courseId: number; units: AdminUnit[]; part?: AdminPart; refresh: unknown[]; onDone: () => void }) {
  const [v, setV] = useState<PartForm>({
    title: part?.title ?? '',
    youtube: part ? `https://youtu.be/${part.youtube_id}` : '',
    unit_id: part?.unit_id ?? units[0]?.id ?? null,
    notes_md: part?.notes_md ?? '',
    slides_url: part?.slides_url ?? '',
    published: part?.published ?? true,
    is_preview: part?.is_preview ?? false,
  })
  const set = <K extends keyof PartForm>(k: K, val: PartForm[K]) => setV((p) => ({ ...p, [k]: val }))
  const save = useAdminMutation(
    () => {
      const body = { ...v, slides_url: v.slides_url?.trim() || null }
      return part ? admin.updatePart(part.id, body) : admin.createPart(courseId, body)
    },
    [refresh, ['course'], ['courses']],
    onDone,
  )
  return (
    <form className="form edit-box" onSubmit={(e) => { e.preventDefault(); save.mutate(undefined) }}>
      <h3>{part ? 'Edit part' : 'New part'}</h3>
      <Field label="Title"><input value={v.title} onChange={(e) => set('title', e.target.value)} required maxLength={200} /></Field>
      <Field label="YouTube link" hint="Paste any YouTube link (watch, youtu.be, embed) or the 11-character video id.">
        <input value={v.youtube} onChange={(e) => set('youtube', e.target.value)} required placeholder="https://youtu.be/…" />
      </Field>
      <Field label="Unit">
        <select value={v.unit_id ?? ''} onChange={(e) => set('unit_id', e.target.value ? Number(e.target.value) : null)}>
          <option value="">No unit (shown under "Start here")</option>
          {units.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
        </select>
      </Field>
      <Field label="Notes (Markdown, optional)"><textarea value={v.notes_md} onChange={(e) => set('notes_md', e.target.value)} rows={5} /></Field>
      <Field label="Slides link (optional)"><input value={v.slides_url ?? ''} onChange={(e) => set('slides_url', e.target.value)} placeholder="https://…" /></Field>
      <div className="checks">
        <Check label="Published (visible to students)" checked={v.published} onChange={(x) => set('published', x)} />
        <Check label="Free preview (watchable without an account)" checked={v.is_preview} onChange={(x) => set('is_preview', x)} />
      </div>
      <ErrorNote error={save.error} />
      <div className="cta">
        <button className="btn" disabled={save.isPending}>{part ? 'Save part' : 'Add part'}</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------- quizzes (course level)
function QuizzesPanel({ courseId, units, quizzes, refresh }: { courseId: number; units: AdminUnit[]; quizzes: AdminQuiz[]; refresh: unknown[] }) {
  const nav = useNavigate()
  const move = useAdminMutation(({ id, d }: { id: number; d: 'up' | 'down' }) => admin.moveQuiz(id, d), [refresh])
  const toggle = useAdminMutation(({ id, published }: { id: number; published: boolean }) => admin.updateQuiz(id, { published }), [refresh, ['quizzes']])
  const del = useAdminMutation((id: number) => admin.deleteQuiz(id), [refresh, ['quizzes']])
  const add = useAdminMutation((b: { title: string; unit_id: number | null; pass_percent: number }) => admin.createQuiz(courseId, b), [refresh], (q) => nav(`/admin/quizzes/${q.id}`))

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    add.mutate({ title: String(f.get('title')), unit_id: f.get('unit') ? Number(f.get('unit')) : null, pass_percent: Number(f.get('pass') || 70) })
  }

  return (
    <section className="panel">
      <h2>Quizzes <small>Multiple-choice questions students can take after the parts</small></h2>
      <ul className="rows">
        {quizzes.map((q) => (
          <li key={q.id}>
            <div className="row static">
              <span className="ico quiz"><Icon name="quiz" size={15} /></span>
              <span className="t">{q.title}<small>{q.question_count} questions · pass mark {q.pass_percent}%</small></span>
              <span className={`chip ${q.published ? 'ok' : 'warn'}`}>{q.published ? 'Published' : 'Draft'}</span>
              <MoveButtons onMove={(d) => move.mutate({ id: q.id, d })} disabled={move.isPending} />
              <Link className="btn ghost small" to={`/admin/quizzes/${q.id}`}>Questions</Link>
              <button type="button" className="btn ghost small" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: q.id, published: !q.published })}>
                {q.published ? 'Unpublish' : 'Publish'}
              </button>
              <button type="button" className="btn ghost small danger" onClick={() => ask(`Delete the quiz "${q.title}" with all its questions and students' attempts?`) && del.mutate(q.id)}>Delete</button>
            </div>
          </li>
        ))}
        {quizzes.length === 0 && <li className="muted small">No quizzes yet.</li>}
      </ul>
      <ErrorNote error={move.error ?? toggle.error ?? del.error} />
      <form className="inline-form" onSubmit={onAdd}>
        <input name="title" placeholder="Quiz title" required maxLength={200} className="grow" aria-label="Quiz title" />
        <select name="unit" aria-label="Unit" defaultValue="">
          <option value="">No unit</option>
          {units.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
        </select>
        <input name="pass" type="number" min={1} max={100} defaultValue={70} aria-label="Pass mark percent" className="narrow" />
        <button className="btn small" disabled={add.isPending}>Add quiz</button>
      </form>
      <ErrorNote error={add.error} />
    </section>
  )
}

// ---------------------------------------------------------------- quiz editor
export function QuizEditor() {
  const id = Number(useParams().id)
  const key = ['admin', 'quiz', id]
  const { data, isLoading, error } = useQuery({ queryKey: key, queryFn: () => admin.quiz(id), retry: false })
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const refresh = [key, ['admin', 'course'], ['quizzes'], ['quiz']]
  const toggle = useAdminMutation((published: boolean) => admin.updateQuiz(id, { published }), refresh)
  const move = useAdminMutation(({ qid, d }: { qid: number; d: 'up' | 'down' }) => admin.moveQuestion(qid, d), refresh)
  const del = useAdminMutation((qid: number) => admin.deleteQuestion(qid), refresh)

  if (isLoading) return <Gate><p className="muted">Loading…</p></Gate>
  if (error || !data) return <Gate><div className="empty"><h3>Quiz not found</h3><Link className="btn" to="/admin">Back</Link></div></Gate>
  const { quiz, questions } = data

  return (
    <Gate>
      <nav className="crumbs">
        <Link to="/admin">Instructor area</Link><Icon name="chevron" size={14} />
        <Link to={`/admin/courses/${quiz.course_id}`}>Course</Link><Icon name="chevron" size={14} /><span>{quiz.title}</span>
      </nav>
      <PageHeader title={quiz.title} subtitle={quiz.published ? 'Published: students can take this quiz' : 'Draft: hidden from students until you publish'}>
        <button type="button" className={`btn ${quiz.published ? 'ghost' : 'accent'}`} disabled={toggle.isPending} onClick={() => toggle.mutate(!quiz.published)}>
          {quiz.published ? 'Unpublish' : 'Publish quiz'}
        </button>
      </PageHeader>
      <ErrorNote error={toggle.error} />
      <QuizSettings key={quiz.id} quiz={quiz} refresh={refresh} />

      <section className="panel">
        <h2>Questions <small>{questions.length} total. The correct answer is highlighted in green.</small></h2>
        {questions.map((q, i) => (
          <div key={q.id} className="q-admin">
            {editing === q.id ? (
              <QuestionEditor quizId={id} question={q} refresh={refresh} onDone={() => setEditing(null)} />
            ) : (
              <>
                <div className="q-admin-head">
                  <p className="q-text"><span className="q-num">{i + 1}</span>{q.prompt}</p>
                  <MoveButtons onMove={(d) => move.mutate({ qid: q.id, d })} disabled={move.isPending} />
                  <button type="button" className="btn ghost small" onClick={() => setEditing(q.id)}>Edit</button>
                  <button type="button" className="btn ghost small danger" onClick={() => ask('Delete this question?') && del.mutate(q.id)}>Delete</button>
                </div>
                <ul className="opts">
                  {q.options.map((o, oi) => (
                    <li key={oi} className={`opt review${oi === q.correct_index ? ' is-correct' : ''}`}>
                      <span className="letter">{'ABCDEF'[oi]}</span><span>{o}</span>
                      {oi === q.correct_index && <span className="tag">Correct</span>}
                    </li>
                  ))}
                </ul>
                {q.explanation && <p className="explain"><strong>Why: </strong>{q.explanation}</p>}
              </>
            )}
          </div>
        ))}
        <ErrorNote error={move.error ?? del.error} />
        {adding ? (
          <QuestionEditor quizId={id} refresh={refresh} onDone={() => setAdding(false)} />
        ) : (
          <div className="cta"><button type="button" className="btn small" onClick={() => setAdding(true)}>Add question</button></div>
        )}
      </section>
    </Gate>
  )
}

function QuizSettings({ quiz, refresh }: { quiz: AdminQuiz; refresh: unknown[][] }) {
  const [title, setTitle] = useState(quiz.title)
  const [pass, setPass] = useState(quiz.pass_percent)
  const save = useAdminMutation(() => admin.updateQuiz(quiz.id, { title, pass_percent: pass }), refresh)
  return (
    <form className="panel inline-form" onSubmit={(e) => { e.preventDefault(); save.mutate(undefined) }}>
      <Field label="Quiz title"><input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} /></Field>
      <Field label="Pass mark (%)"><input type="number" min={1} max={100} value={pass} onChange={(e) => setPass(Number(e.target.value))} className="narrow" /></Field>
      <button className="btn small" disabled={save.isPending}>Save</button>
      {save.isSuccess && <span className="muted small saved">Saved</span>}
      <ErrorNote error={save.error} />
    </form>
  )
}

function QuestionEditor({ quizId, question, refresh, onDone }: { quizId: number; question?: AdminQuestion; refresh: unknown[][]; onDone: () => void }) {
  const [v, setV] = useState<QuestionForm>({
    prompt: question?.prompt ?? '',
    options: question?.options ?? ['', '', '', ''],
    correct_index: question?.correct_index ?? 0,
    explanation: question?.explanation ?? '',
  })
  const setOption = (i: number, text: string) => setV((p) => ({ ...p, options: p.options.map((o, j) => (j === i ? text : o)) }))
  const removeOption = (i: number) =>
    setV((p) => ({ ...p, options: p.options.filter((_, j) => j !== i), correct_index: p.correct_index === i ? 0 : p.correct_index > i ? p.correct_index - 1 : p.correct_index }))
  const save = useAdminMutation(() => (question ? admin.updateQuestion(question.id, v) : admin.createQuestion(quizId, v)), refresh, onDone)
  return (
    <form className="form edit-box" onSubmit={(e) => { e.preventDefault(); save.mutate(undefined) }}>
      <h3>{question ? 'Edit question' : 'New question'}</h3>
      <Field label="Question"><textarea value={v.prompt} onChange={(e) => setV({ ...v, prompt: e.target.value })} rows={2} required /></Field>
      <fieldset className="opt-edit">
        <legend>Options: select the correct one</legend>
        {v.options.map((o, i) => (
          <div key={i} className="opt-row">
            <input type="radio" name="correct" checked={v.correct_index === i} onChange={() => setV({ ...v, correct_index: i })} aria-label={`Option ${'ABCDEF'[i]} is correct`} />
            <span className="letter">{'ABCDEF'[i]}</span>
            <input value={o} onChange={(e) => setOption(i, e.target.value)} required className="grow" aria-label={`Option ${'ABCDEF'[i]}`} />
            <button type="button" className="icon-btn sm" aria-label={`Remove option ${'ABCDEF'[i]}`} disabled={v.options.length <= 2} onClick={() => removeOption(i)}>×</button>
          </div>
        ))}
        {v.options.length < 6 && (
          <button type="button" className="btn ghost small" onClick={() => setV({ ...v, options: [...v.options, ''] })}>Add option</button>
        )}
      </fieldset>
      <Field label="Explanation shown after submitting (recommended)"><textarea value={v.explanation} onChange={(e) => setV({ ...v, explanation: e.target.value })} rows={2} /></Field>
      <ErrorNote error={save.error} />
      <div className="cta">
        <button className="btn" disabled={save.isPending}>{question ? 'Save question' : 'Add question'}</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------- learners
function ago(iso: string | null): string {
  if (!iso) return 'Not started'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AdminLearners() {
  const [q, setQ] = useState('')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'learners', q],
    queryFn: () => admin.learners(q),
    placeholderData: (prev) => prev,
  })
  return (
    <Gate>
      <PageHeader title="Learners" subtitle="Students only, most recently active first. Instructor and admin accounts are not listed." />
      <section className="panel">
        <label className="field" style={{ maxWidth: 360 }}>
          <span>Search by name or email</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search learners" />
        </label>
        {isLoading ? <Loading /> : isError ? (
          <p className="error" role="alert">Could not load learners.</p>
        ) : !data || data.length === 0 ? (
          <p className="muted block">{q ? 'No learner matches this search.' : 'No learners have signed up yet.'}</p>
        ) : (
          <div className="table-wrap block">
            <table className="tbl">
              <thead>
                <tr><th>Learner</th><th>Last active</th><th>Parts done</th><th>Quizzes passed</th><th>Certificates</th></tr>
              </thead>
              <tbody>
                {data.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong><br /><span className="muted small">{l.email}</span></td>
                    <td>{ago(l.last_seen_at)}</td>
                    <td>{l.parts_completed}</td>
                    <td>{l.quizzes_passed}</td>
                    <td>{l.certificates}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.length >= 200 && <p className="muted small">Showing the 200 most recent learners. Use search to find others.</p>}
      </section>
    </Gate>
  )
}
