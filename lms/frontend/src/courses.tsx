import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  ApiError,
  getAllProgress,
  getCourse,
  getCourseProgress,
  getLesson,
  listCourses,
  setLessonCompleted,
  type CourseProgress,
  type CourseSummary,
  type LessonSummary,
  type QuizSummary,
} from './api'
import { useAuth } from './auth'
import { lessonsWord } from './format'
import { Cover, Icon, PageHeader, ProgressBar } from './ui'

function useCourses() {
  return useQuery({ queryKey: ['courses'], queryFn: listCourses })
}

function useProgressBySlug() {
  const { user } = useAuth()
  const { data } = useQuery({ queryKey: ['progress'], queryFn: getAllProgress, enabled: !!user, retry: false })
  return new Map((data ?? []).map((p) => [p.course_slug, p]))
}

export function QuizStatus({ q }: { q: Pick<QuizSummary, 'best_percent' | 'passed' | 'pass_percent'> }) {
  if (q.best_percent === null) return <span className="chip">Not attempted</span>
  return q.passed ? (
    <span className="chip ok"><Icon name="check" size={13} /> Passed · {q.best_percent}%</span>
  ) : (
    <span className="chip warn">Best {q.best_percent}% · need {q.pass_percent}%</span>
  )
}

function CourseCard({ c, progress }: { c: CourseSummary; progress?: CourseProgress }) {
  return (
    <Link to={`/courses/${c.slug}`} className="card course-card">
      <Cover seed={c.slug} />
      <div className="card-body">
        <h3>{c.title}</h3>
        <p className="clamp">{c.description}</p>
        <div className="chips">
          <span className="chip"><Icon name="play" size={12} /> {c.lesson_count} {c.lesson_count === 1 ? 'lesson' : 'lessons'}</span>
          {c.previews.length > 0 && <span className="chip free">{c.previews.length} free</span>}
        </div>
        {progress?.started && (
          <div className="card-progress">
            <ProgressBar percent={progress.percent} label={`${c.title} progress`} />
            <span>{progress.completed} of {progress.total} done · {progress.percent}%</span>
          </div>
        )}
      </div>
    </Link>
  )
}

/** The course grid. `query` filters by title or description; `limit` shows only the first few. */
export function Catalogue({ query = '', limit }: { query?: string; limit?: number }) {
  const { data, isLoading } = useCourses()
  const progress = useProgressBySlug()
  if (isLoading) return <p className="muted">Loading courses…</p>
  if (!data?.length) return <p className="muted">No courses yet.</p>
  const needle = query.trim().toLowerCase()
  const matches = needle ? data.filter((c) => `${c.title} ${c.description}`.toLowerCase().includes(needle)) : data
  if (!matches.length) {
    return (
      <div className="empty plain">
        <Icon name="search" size={28} />
        <h3>No courses match “{query.trim()}”</h3>
        <p>Try a shorter word, such as “machine” or “AI”.</p>
      </div>
    )
  }
  return (
    <div className="grid">
      {(limit ? matches.slice(0, limit) : matches).map((c) => <CourseCard key={c.slug} c={c} progress={progress.get(c.slug)} />)}
    </div>
  )
}

export function CoursesPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  return (
    <>
      <PageHeader title="Courses" subtitle="Syllabus-aligned video lessons, organised unit by unit." />
      <form className="search-bar" role="search" onSubmit={(e) => e.preventDefault()}>
        <Icon name="search" size={18} />
        <input
          type="search"
          value={q}
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
          placeholder="Search courses"
          aria-label="Search courses"
        />
      </form>
      <Catalogue query={q} />
    </>
  )
}

/** Courses the signed-in learner has started, each with a resume button. */
export function ContinueLearning({ empty }: { empty?: boolean }) {
  const { data, isLoading } = useQuery({ queryKey: ['progress'], queryFn: getAllProgress })
  const started = (data ?? []).filter((p) => p.started)
  if (isLoading) return <p className="muted">Loading…</p>
  if (!started.length) {
    return empty ? (
      <div className="empty">
        <Icon name="learning" size={28} />
        <h3>You haven't started a course yet</h3>
        <p>Pick a course and your progress will show up here.</p>
        <Link className="btn" to="/courses">Browse courses</Link>
      </div>
    ) : null
  }
  return (
    <div className="grid">
      {started.map((p) => (
        <div key={p.course_slug} className="card static">
          <Cover seed={p.course_slug} icon="learning" />
          <div className="card-body">
            <h3>{p.course_title}</h3>
            <div className="card-progress">
              <ProgressBar percent={p.percent} label={`${p.course_title} progress`} />
              <span>{p.completed} of {p.total} {lessonsWord(p.total)} · {p.percent}%</span>
            </div>
            {p.resume ? (
              <Link className="btn small" to={`/courses/${p.course_slug}/lessons/${p.resume.slug}`}>Resume: {p.resume.title}</Link>
            ) : (
              <p className="muted small">All lessons completed. Well done!</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Lessons anyone can watch without an account, across all courses. */
export function FreePreviews() {
  const { data, isLoading } = useCourses()
  if (isLoading) return <p className="muted">Loading…</p>
  const items = (data ?? []).flatMap((c) => c.previews.map((l) => ({ course: c.slug, lesson: l })))
  if (!items.length) return <p className="muted">Free lessons are coming soon.</p>
  return (
    <ul className="rows">
      {items.map(({ course, lesson }) => (
        <li key={`${course}/${lesson.slug}`}>
          <Link to={`/courses/${course}/lessons/${lesson.slug}`} className="row">
            <span className="ico play"><Icon name="play" size={15} /></span>
            <span className="t">{lesson.title}</span>
            <span className="chip free">Free</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function LessonRow({
  course,
  lesson,
  signedIn,
  done,
  current,
}: {
  course: string
  lesson: LessonSummary
  signedIn: boolean
  done: boolean
  current?: boolean
}) {
  const locked = !lesson.is_preview && !signedIn
  return (
    <li>
      <Link
        to={`/courses/${course}/lessons/${lesson.slug}`}
        className={`row${done ? ' done' : ''}${current ? ' current' : ''}`}
        aria-current={current ? 'page' : undefined}
      >
        <span className={`ico${done ? ' ok' : ''}`}>
          <Icon name={done ? 'check' : locked ? 'lock' : 'play'} size={15} />
        </span>
        <span className="t">{lesson.title}</span>
        {lesson.is_preview && !signedIn && <span className="chip free">Free</span>}
      </Link>
    </li>
  )
}

export function QuizRow({ course, q }: { course: string; q: QuizSummary }) {
  return (
    <li>
      <Link to={`/courses/${course}/quizzes/${q.slug}`} className="row quiz">
        <span className="ico quiz"><Icon name="quiz" size={15} /></span>
        <span className="t">
          {q.title}
          <small>{q.question_count} questions · pass mark {q.pass_percent}%</small>
        </span>
        <QuizStatus q={q} />
      </Link>
    </li>
  )
}

export function LoginGate({ back, title, text }: { back: string; title: string; text: string }) {
  return (
    <div className="empty">
      <Icon name="lock" size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="cta">
        <Link className="btn" to="/register" state={{ from: back }}>Create a free account</Link>
        <Link className="btn ghost" to="/login" state={{ from: back }}>Sign in</Link>
      </div>
    </div>
  )
}

export function LessonPage() {
  const { slug = '', lessonSlug = '' } = useParams()
  const { user, loading } = useAuth()
  const loc = useLocation()
  const qc = useQueryClient()
  const { data, error, isLoading } = useQuery({
    // user id in the key: re-fetch after signing in or out
    queryKey: ['lesson', slug, lessonSlug, user?.id ?? 'anon'],
    queryFn: () => getLesson(slug, lessonSlug),
    enabled: !loading,
    retry: false,
  })
  const course = useQuery({ queryKey: ['course', slug], queryFn: () => getCourse(slug), retry: false })
  const progress = useQuery({
    queryKey: ['progress', slug],
    queryFn: () => getCourseProgress(slug),
    enabled: !!user,
    retry: false,
  })
  const toggle = useMutation({
    mutationFn: (completed: boolean) => setLessonCompleted(slug, lessonSlug, completed),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress'] })
      qc.invalidateQueries({ queryKey: ['lesson', slug, lessonSlug] })
    },
  })

  if (loading || isLoading) return <p className="muted">Loading…</p>
  if (error instanceof ApiError && error.status === 401) {
    return (
      <>
        <nav className="crumbs"><Link to={`/courses/${slug}`}>← Course</Link></nav>
        <LoginGate
          back={loc.pathname}
          title="This lesson is for registered learners"
          text="Create a free account to watch this lesson and every other lesson in the course. It is free for now."
        />
      </>
    )
  }
  if (error || !data) {
    const missing = error instanceof ApiError && error.status === 404
    return (
      <div className="empty">
        <h3>{missing ? 'Lesson not found' : 'Could not load this lesson'}</h3>
        <Link className="btn" to={`/courses/${slug}`}>Back to course</Link>
      </div>
    )
  }

  const signedIn = !!user
  const done = new Set(progress.data?.completed_slugs ?? [])
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/courses">Courses</Link><Icon name="chevron" size={14} />
        <Link to={`/courses/${slug}`}>{course.data?.title ?? 'Course'}</Link>
        {data.chapter_code && <><Icon name="chevron" size={14} /><span>{data.chapter_code} · {data.chapter_title}</span></>}
      </nav>

      <div className="lesson-layout">
        <article className="lesson-main">
          <h1>{data.title}</h1>
          <div className="video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${data.youtube_id}`}
              title={data.title}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="lesson-actions">
            {user ? (
              <button
                type="button"
                className={`btn${data.completed ? ' success' : ''}`}
                disabled={toggle.isPending}
                onClick={() => toggle.mutate(!data.completed)}
              >
                <Icon name="check" size={16} /> {data.completed ? 'Completed (click to undo)' : 'Mark as complete'}
              </button>
            ) : (
              <p className="note">
                Enjoying this? <Link to="/register" state={{ from: loc.pathname }}>Create a free account</Link> to track
                your progress and take quizzes.
              </p>
            )}
            {toggle.isError && <span role="alert" className="error">Could not save. Try again.</span>}
            {data.slides_url && <a className="btn ghost" href={data.slides_url} target="_blank" rel="noreferrer">Download slides</a>}
          </div>

          {data.notes_md && <section className="panel notes"><Markdown>{data.notes_md}</Markdown></section>}

          <nav className="prevnext" aria-label="Lesson navigation">
            {data.prev ? <Link className="btn ghost" to={`/courses/${slug}/lessons/${data.prev.slug}`}>← {data.prev.title}</Link> : <span />}
            {data.next ? <Link className="btn" to={`/courses/${slug}/lessons/${data.next.slug}`}>{data.next.title} →</Link> : <span />}
          </nav>
        </article>

        <aside className="lesson-outline" aria-label="Course content">
          <h2>Course content</h2>
          {progress.data && (
            <div className="card-progress">
              <ProgressBar percent={progress.data.percent} label="Course progress" />
              <span>{progress.data.completed} of {progress.data.total} · {progress.data.percent}%</span>
            </div>
          )}
          {course.data && (
            <>
              {course.data.overview_lessons.length > 0 && (
                <ul className="rows compact">
                  {course.data.overview_lessons.map((l) => (
                    <LessonRow key={l.slug} course={slug} lesson={l} signedIn={signedIn} done={done.has(l.slug)} current={l.slug === lessonSlug} />
                  ))}
                </ul>
              )}
              {course.data.chapters.filter((c) => c.lessons.length > 0).map((ch) => (
                <div key={ch.code}>
                  <h3><span className="code">{ch.code}</span> {ch.title}</h3>
                  <ul className="rows compact">
                    {ch.lessons.map((l) => (
                      <LessonRow key={l.slug} course={slug} lesson={l} signedIn={signedIn} done={done.has(l.slug)} current={l.slug === lessonSlug} />
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
    </>
  )
}
