import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ApiError,
  getAllProgress,
  getCourse,
  getCourseProgress,
  getLesson,
  listCourseQuizzes,
  listCourses,
  setLessonCompleted,
  type CourseProgress,
  type CourseSummary,
  type LessonSummary,
  type QuizSummary,
} from './api'
import { useAuth } from './auth'
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

export function Catalogue() {
  const { data, isLoading } = useCourses()
  const progress = useProgressBySlug()
  if (isLoading) return <p className="muted">Loading courses…</p>
  if (!data?.length) return <p className="muted">No courses yet.</p>
  return (
    <div className="grid">
      {data.map((c) => <CourseCard key={c.slug} c={c} progress={progress.get(c.slug)} />)}
    </div>
  )
}

export function CoursesPage() {
  return (
    <>
      <PageHeader title="Courses" subtitle="Syllabus-aligned video lessons, organised unit by unit." />
      <Catalogue />
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
              <span>{p.completed} of {p.total} lessons · {p.percent}%</span>
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

export function LearningPage() {
  const { user, loading } = useAuth()
  if (loading) return <p className="muted">Loading…</p>
  return (
    <>
      <PageHeader title="My learning" subtitle="Pick up where you left off." />
      {user ? (
        <ContinueLearning empty />
      ) : (
        <div className="empty">
          <Icon name="lock" size={28} />
          <h3>Sign in to track your progress</h3>
          <p>A free account remembers the lessons you have finished and takes you straight back to where you stopped.</p>
          <div className="cta">
            <Link className="btn" to="/register" state={{ from: '/learning' }}>Create a free account</Link>
            <Link className="btn ghost" to="/login" state={{ from: '/learning' }}>Sign in</Link>
          </div>
        </div>
      )}
    </>
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

function LessonRow({
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

function QuizRow({ course, q }: { course: string; q: QuizSummary }) {
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

export function CoursePage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const { data, error, isLoading } = useQuery({ queryKey: ['course', slug], queryFn: () => getCourse(slug), retry: false })
  const progress = useQuery({
    queryKey: ['progress', slug],
    queryFn: () => getCourseProgress(slug),
    enabled: !!user,
    retry: false,
  })
  const quizzes = useQuery({
    queryKey: ['quizzes', slug, user?.id ?? 'anon'],
    queryFn: () => listCourseQuizzes(slug),
    retry: false,
  })
  if (isLoading) return <p className="muted">Loading…</p>
  if (error || !data) return <div className="empty"><h3>Course not found</h3><Link className="btn" to="/courses">All courses</Link></div>

  const signedIn = !!user
  const done = new Set(progress.data?.completed_slugs ?? [])
  const allLessons = [...data.overview_lessons, ...data.chapters.flatMap((c) => c.lessons)]
  const anyLocked = allLessons.some((l) => !l.is_preview)
  const allQuizzes = quizzes.data ?? []
  const chapterCodes = new Set(data.chapters.map((c) => c.code))
  const looseQuizzes = allQuizzes.filter((q) => !q.chapter_code || !chapterCodes.has(q.chapter_code))

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/courses">Courses</Link><Icon name="chevron" size={14} /><span>{data.title}</span></nav>

      <section className="hero-card">
        <Cover seed={data.slug} />
        <div className="hero-body">
          <h1>{data.title}</h1>
          <p>{data.description}</p>
          <div className="chips">
            <span className="chip"><Icon name="play" size={12} /> {allLessons.length} {allLessons.length === 1 ? 'lesson' : 'lessons'}</span>
            {allQuizzes.length > 0 && (
              <span className="chip"><Icon name="quiz" size={12} /> {allQuizzes.length} {allQuizzes.length === 1 ? 'quiz' : 'quizzes'}</span>
            )}
            <span className="chip free">{allLessons.filter((l) => l.is_preview).length} free to watch</span>
          </div>
          {progress.data ? (
            <div className="hero-progress">
              <ProgressBar percent={progress.data.percent} label="Course progress" />
              <span>{progress.data.completed} of {progress.data.total} lessons · {progress.data.percent}%</span>
              {progress.data.resume && (
                <Link className="btn" to={`/courses/${slug}/lessons/${progress.data.resume.slug}`}>
                  {progress.data.started ? 'Resume' : 'Start'}: {progress.data.resume.title}
                </Link>
              )}
            </div>
          ) : (
            !signedIn && (
              <p className="note">
                {anyLocked
                  ? 'Some lessons are free to watch. Create a free account to unlock all of them.'
                  : 'Every lesson is free to watch. Create a free account to track progress and take quizzes.'}{' '}
                <Link to="/register" state={{ from: `/courses/${slug}` }}>Sign up free</Link>
              </p>
            )
          )}
        </div>
      </section>

      {data.overview_lessons.length > 0 && (
        <section className="panel">
          <h2>Start here</h2>
          <ul className="rows">
            {data.overview_lessons.map((l) => (
              <LessonRow key={l.slug} course={slug} lesson={l} signedIn={signedIn} done={done.has(l.slug)} />
            ))}
          </ul>
        </section>
      )}

      {data.chapters.map((ch) => {
        const chapterQuizzes = allQuizzes.filter((q) => q.chapter_code === ch.code)
        return (
          <section key={ch.code} className="panel">
            <h2>
              <span className="code">{ch.code}</span> {ch.title}
              <small>{[ch.unit, ch.textbook_ref].filter(Boolean).join(' · ')}</small>
            </h2>
            {ch.lessons.length === 0 && chapterQuizzes.length === 0 ? (
              <p className="muted small">Coming soon</p>
            ) : (
              <ul className="rows">
                {ch.lessons.map((l) => (
                  <LessonRow key={l.slug} course={slug} lesson={l} signedIn={signedIn} done={done.has(l.slug)} />
                ))}
                {chapterQuizzes.map((q) => <QuizRow key={q.slug} course={slug} q={q} />)}
              </ul>
            )}
          </section>
        )
      })}

      {looseQuizzes.length > 0 && (
        <section className="panel">
          <h2>Quizzes</h2>
          <ul className="rows">{looseQuizzes.map((q) => <QuizRow key={q.slug} course={slug} q={q} />)}</ul>
        </section>
      )}
    </>
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
