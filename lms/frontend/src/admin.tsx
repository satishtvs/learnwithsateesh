import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  admin,
  ApiError,
  type AdminChapter,
  type AdminOverview,
  type AdminLesson,
  type AdminQuestion,
  type AdminQuiz,
  type LessonForm,
  type QuestionForm,
} from './api'
import { useAuth } from './auth'
import { LoginGate } from './courses'
import { Icon, PageHeader } from './ui'

const fmtWhen = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

// ---------------------------------------------------------------- shared bits
function Gate({ children }: { children: ReactNode }) {
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

function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null
  const msg = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
  return <p role="alert" className="error form-error">{msg}</p>
}

/** A mutation that refreshes the listed queries on success. */
function useAdminMutation<A, R>(fn: (a: A) => Promise<R>, invalidate: unknown[][], onDone?: (r: R) => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      invalidate.forEach((k) => qc.invalidateQueries({ queryKey: k }))
      onDone?.(r)
    },
  })
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
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
    { icon: 'check' as const, label: 'Lessons completed', value: o.lessons_completed, tone: 'green' },
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
            <thead><tr><th>Course</th><th>Learners</th><th>Lessons done</th></tr></thead>
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
      <PageHeader title="Instructor area" subtitle="Create courses, add lessons by pasting a YouTube link, and manage quizzes.">
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
                  <span className="chip">{c.chapter_count} chapters</span>
                  <span className="chip">{c.lesson_count} lessons</span>
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
  const { course, chapters, lessons, quizzes } = data
  return (
    <Gate>
      <nav className="crumbs"><Link to="/admin">Instructor area</Link><Icon name="chevron" size={14} /><span>{course.title}</span></nav>
      <PageHeader title={course.title} subtitle={course.published ? 'Published: visible to students' : 'Draft: only you can see this'}>
        {course.published && <Link className="btn ghost" to={`/courses/${course.slug}`}>View on site</Link>}
      </PageHeader>
      <CourseDetails key={course.id} course={course} refresh={key} />
      <ChaptersPanel courseId={id} chapters={chapters} refresh={key} />
      <LessonsPanel courseId={id} chapters={chapters} lessons={lessons} refresh={key} />
      <QuizzesPanel courseId={id} chapters={chapters} quizzes={quizzes} refresh={key} />
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

// ---------------------------------------------------------------- chapters
function ChaptersPanel({ courseId, chapters, refresh }: { courseId: number; chapters: AdminChapter[]; refresh: unknown[] }) {
  const [editing, setEditing] = useState<number | null>(null)
  const move = useAdminMutation(({ id, d }: { id: number; d: 'up' | 'down' }) => admin.moveChapter(id, d), [refresh])
  const del = useAdminMutation((id: number) => admin.deleteChapter(id), [refresh])
  const add = useAdminMutation((b: { code: string; title: string; unit: string | null; textbook_ref: string | null }) => admin.createChapter(courseId, b), [refresh])

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    add.mutate(
      { code: String(f.get('code')), title: String(f.get('title')), unit: String(f.get('unit') || '') || null, textbook_ref: String(f.get('ref') || '') || null },
      { onSuccess: () => form.reset() },
    )
  }

  return (
    <section className="panel">
      <h2>Chapters <small>Units or topics that group your lessons</small></h2>
      <ul className="rows">
        {chapters.map((ch) => (
          <li key={ch.id}>
            <div className="row static">
              <span className="code">{ch.code}</span>
              <span className="t">{ch.title}<small>{[ch.unit, ch.textbook_ref].filter(Boolean).join(' · ')}</small></span>
              <MoveButtons onMove={(d) => move.mutate({ id: ch.id, d })} disabled={move.isPending} />
              <button type="button" className="btn ghost small" onClick={() => setEditing(editing === ch.id ? null : ch.id)}>Edit</button>
              <button
                type="button"
                className="btn ghost small danger"
                onClick={() => ask(`Delete chapter ${ch.code}?`) && del.mutate(ch.id)}
              >
                Delete
              </button>
            </div>
            {editing === ch.id && <ChapterEdit chapter={ch} refresh={refresh} onDone={() => setEditing(null)} />}
          </li>
        ))}
        {chapters.length === 0 && <li className="muted small">No chapters yet.</li>}
      </ul>
      <ErrorNote error={move.error ?? del.error} />
      <form className="inline-form" onSubmit={onAdd}>
        <input name="code" placeholder="Code, e.g. U1" required maxLength={10} aria-label="Chapter code" />
        <input name="title" placeholder="Chapter title" required maxLength={200} aria-label="Chapter title" className="grow" />
        <input name="unit" placeholder="Unit, e.g. Unit - I" maxLength={20} aria-label="Unit" />
        <input name="ref" placeholder="Textbook reference" maxLength={200} aria-label="Textbook reference" />
        <button className="btn small" disabled={add.isPending}>Add chapter</button>
      </form>
      <ErrorNote error={add.error} />
    </section>
  )
}

function ChapterEdit({ chapter, refresh, onDone }: { chapter: AdminChapter; refresh: unknown[]; onDone: () => void }) {
  const [v, setV] = useState({ code: chapter.code, title: chapter.title, unit: chapter.unit ?? '', textbook_ref: chapter.textbook_ref ?? '' })
  const save = useAdminMutation(
    () => admin.updateChapter(chapter.id, { code: v.code, title: v.title, unit: v.unit || null, textbook_ref: v.textbook_ref || null }),
    [refresh, ['course']],
    onDone,
  )
  return (
    <form className="inline-form edit" onSubmit={(e) => { e.preventDefault(); save.mutate(undefined) }}>
      <input value={v.code} onChange={(e) => setV({ ...v, code: e.target.value })} required maxLength={10} aria-label="Chapter code" />
      <input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} required className="grow" aria-label="Chapter title" />
      <input value={v.unit} onChange={(e) => setV({ ...v, unit: e.target.value })} placeholder="Unit" aria-label="Unit" />
      <input value={v.textbook_ref} onChange={(e) => setV({ ...v, textbook_ref: e.target.value })} placeholder="Textbook reference" aria-label="Textbook reference" />
      <button className="btn small" disabled={save.isPending}>Save</button>
      <button type="button" className="btn ghost small" onClick={onDone}>Cancel</button>
      <ErrorNote error={save.error} />
    </form>
  )
}

// ---------------------------------------------------------------- lessons
function LessonsPanel({ courseId, chapters, lessons, refresh }: { courseId: number; chapters: AdminChapter[]; lessons: AdminLesson[]; refresh: unknown[] }) {
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const move = useAdminMutation(({ id, d }: { id: number; d: 'up' | 'down' }) => admin.moveLesson(id, d), [refresh])
  const del = useAdminMutation((id: number) => admin.deleteLesson(id), [refresh, ['course'], ['progress']])

  const groups: { key: string; title: string; items: AdminLesson[] }[] = [
    { key: 'none', title: 'Start here (no chapter)', items: lessons.filter((l) => l.chapter_id === null) },
    ...chapters.map((c) => ({ key: String(c.id), title: `${c.code} · ${c.title}`, items: lessons.filter((l) => l.chapter_id === c.id) })),
  ].filter((g) => g.items.length > 0)

  return (
    <section className="panel">
      <h2>Lessons <small>Each lesson is one YouTube video with optional notes</small></h2>
      {groups.length === 0 && <p className="muted small">No lessons yet. Add the first one below.</p>}
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
                  <button type="button" className="btn ghost small danger" onClick={() => ask(`Delete the lesson "${l.title}"? Learners' progress on it is removed too.`) && del.mutate(l.id)}>Delete</button>
                </div>
                {editing === l.id && <LessonEditor courseId={courseId} chapters={chapters} lesson={l} refresh={refresh} onDone={() => setEditing(null)} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <ErrorNote error={move.error ?? del.error} />
      {editing === 'new' ? (
        <LessonEditor courseId={courseId} chapters={chapters} refresh={refresh} onDone={() => setEditing(null)} />
      ) : (
        <div className="cta"><button type="button" className="btn small" onClick={() => setEditing('new')}>Add lesson</button></div>
      )}
    </section>
  )
}

function LessonEditor({ courseId, chapters, lesson, refresh, onDone }: { courseId: number; chapters: AdminChapter[]; lesson?: AdminLesson; refresh: unknown[]; onDone: () => void }) {
  const [v, setV] = useState<LessonForm>({
    title: lesson?.title ?? '',
    youtube: lesson ? `https://youtu.be/${lesson.youtube_id}` : '',
    chapter_id: lesson?.chapter_id ?? chapters[0]?.id ?? null,
    notes_md: lesson?.notes_md ?? '',
    slides_url: lesson?.slides_url ?? '',
    published: lesson?.published ?? true,
    is_preview: lesson?.is_preview ?? false,
  })
  const set = <K extends keyof LessonForm>(k: K, val: LessonForm[K]) => setV((p) => ({ ...p, [k]: val }))
  const save = useAdminMutation(
    () => {
      const body = { ...v, slides_url: v.slides_url?.trim() || null }
      return lesson ? admin.updateLesson(lesson.id, body) : admin.createLesson(courseId, body)
    },
    [refresh, ['course'], ['courses']],
    onDone,
  )
  return (
    <form className="form edit-box" onSubmit={(e) => { e.preventDefault(); save.mutate(undefined) }}>
      <h3>{lesson ? 'Edit lesson' : 'New lesson'}</h3>
      <Field label="Title"><input value={v.title} onChange={(e) => set('title', e.target.value)} required maxLength={200} /></Field>
      <Field label="YouTube link" hint="Paste any YouTube link (watch, youtu.be, embed) or the 11-character video id.">
        <input value={v.youtube} onChange={(e) => set('youtube', e.target.value)} required placeholder="https://youtu.be/…" />
      </Field>
      <Field label="Chapter">
        <select value={v.chapter_id ?? ''} onChange={(e) => set('chapter_id', e.target.value ? Number(e.target.value) : null)}>
          <option value="">No chapter (shown under "Start here")</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
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
        <button className="btn" disabled={save.isPending}>{lesson ? 'Save lesson' : 'Add lesson'}</button>
        <button type="button" className="btn ghost" onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------- quizzes (course level)
function QuizzesPanel({ courseId, chapters, quizzes, refresh }: { courseId: number; chapters: AdminChapter[]; quizzes: AdminQuiz[]; refresh: unknown[] }) {
  const nav = useNavigate()
  const move = useAdminMutation(({ id, d }: { id: number; d: 'up' | 'down' }) => admin.moveQuiz(id, d), [refresh])
  const toggle = useAdminMutation(({ id, published }: { id: number; published: boolean }) => admin.updateQuiz(id, { published }), [refresh, ['quizzes']])
  const del = useAdminMutation((id: number) => admin.deleteQuiz(id), [refresh, ['quizzes']])
  const add = useAdminMutation((b: { title: string; chapter_id: number | null; pass_percent: number }) => admin.createQuiz(courseId, b), [refresh], (q) => nav(`/admin/quizzes/${q.id}`))

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    add.mutate({ title: String(f.get('title')), chapter_id: f.get('chapter') ? Number(f.get('chapter')) : null, pass_percent: Number(f.get('pass') || 70) })
  }

  return (
    <section className="panel">
      <h2>Quizzes <small>Multiple-choice questions students can take after the lessons</small></h2>
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
        <select name="chapter" aria-label="Chapter" defaultValue="">
          <option value="">No chapter</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
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
