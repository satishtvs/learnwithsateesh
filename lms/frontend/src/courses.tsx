import { useQuery } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError, getCourse, getLesson, listCourses, type LessonSummary } from './api'
import { useAuth } from './auth'

function useCourses() {
  return useQuery({ queryKey: ['courses'], queryFn: listCourses })
}

export function Catalogue() {
  const { data, isLoading } = useCourses()
  if (isLoading) return <p>Loading courses…</p>
  if (!data?.length) return <p>No courses yet.</p>
  return (
    <div className="grid">
      {data.map((c) => (
        <Link key={c.slug} to={`/courses/${c.slug}`} className="course-card">
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <p className="meta">
            {c.lesson_count} {c.lesson_count === 1 ? 'lesson' : 'lessons'} · {c.previews.length} free to watch
          </p>
        </Link>
      ))}
    </div>
  )
}

/** Lessons anyone can watch without an account, across all courses. */
export function FreePreviews() {
  const { data, isLoading } = useCourses()
  if (isLoading) return <p>Loading…</p>
  const items = (data ?? []).flatMap((c) => c.previews.map((l) => ({ course: c.slug, lesson: l })))
  if (!items.length) return <p className="muted-left">Free lessons are coming soon.</p>
  return (
    <ul className="lessons previews">
      {items.map(({ course, lesson }) => (
        <li key={`${course}/${lesson.slug}`}>
          <Link to={`/courses/${course}/lessons/${lesson.slug}`}>▶ {lesson.title}</Link>
          <span className="badge">Free</span>
        </li>
      ))}
    </ul>
  )
}

function LessonLink({ course, lesson, signedIn }: { course: string; lesson: LessonSummary; signedIn: boolean }) {
  const locked = !lesson.is_preview && !signedIn
  return (
    <li>
      <Link to={`/courses/${course}/lessons/${lesson.slug}`}>
        {locked ? '🔒 ' : ''}
        {lesson.title}
      </Link>
      {lesson.is_preview && !signedIn && <span className="badge">Free preview</span>}
    </li>
  )
}

export function CoursePage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const { data, error, isLoading } = useQuery({ queryKey: ['course', slug], queryFn: () => getCourse(slug), retry: false })
  if (isLoading) return <main className="wide">Loading…</main>
  if (error || !data) return <main className="wide"><p>Course not found.</p><Link to="/">Back</Link></main>
  const signedIn = !!user
  const allLessons = [...data.overview_lessons, ...data.chapters.flatMap((c) => c.lessons)]
  const anyLocked = allLessons.some((l) => !l.is_preview)

  return (
    <main className="wide">
      <p><Link to="/">← All courses</Link></p>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      {!signedIn && (
        <p className="unlock">
          {anyLocked
            ? 'Some lessons are free to watch. Create a free account to unlock all of them.'
            : 'Every lesson is free to watch. Create a free account to track your progress and get quizzes and certificates as they launch.'}{' '}
          <Link to="/register" state={{ from: `/courses/${slug}` }}>Sign up free</Link>
        </p>
      )}

      {data.overview_lessons.length > 0 && (
        <section>
          <h2>Start here</h2>
          <ul className="lessons">
            {data.overview_lessons.map((l) => <LessonLink key={l.slug} course={slug} lesson={l} signedIn={signedIn} />)}
          </ul>
        </section>
      )}

      {data.chapters.map((ch) => (
        <section key={ch.code}>
          <h2>
            {ch.code} · {ch.title}
            <small>{[ch.unit, ch.textbook_ref].filter(Boolean).join(' · ')}</small>
          </h2>
          {ch.lessons.length === 0 ? (
            <p className="muted-left">Coming soon</p>
          ) : (
            <ul className="lessons">
              {ch.lessons.map((l) => <LessonLink key={l.slug} course={slug} lesson={l} signedIn={signedIn} />)}
            </ul>
          )}
        </section>
      ))}
    </main>
  )
}

function LoginGate({ back }: { back: string }) {
  return (
    <div className="gate">
      <h2>🔒 This lesson is for registered learners</h2>
      <p>Create a free account to watch this lesson and every other lesson in the course. It is free for now.</p>
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
  const { data, error, isLoading } = useQuery({
    // user id in the key: re-fetch after signing in or out
    queryKey: ['lesson', slug, lessonSlug, user?.id ?? 'anon'],
    queryFn: () => getLesson(slug, lessonSlug),
    enabled: !loading,
    retry: false,
  })

  if (loading || isLoading) return <main className="wide">Loading…</main>
  if (error instanceof ApiError && error.status === 401) {
    return (
      <main className="wide">
        <p><Link to={`/courses/${slug}`}>← Course outline</Link></p>
        <LoginGate back={loc.pathname} />
      </main>
    )
  }
  if (error || !data) {
    const missing = error instanceof ApiError && error.status === 404
    return <main className="wide"><p>{missing ? 'Lesson not found.' : 'Could not load this lesson.'}</p><Link to={`/courses/${slug}`}>Back to course</Link></main>
  }

  return (
    <main className="wide">
      <p><Link to={`/courses/${slug}`}>← Course outline</Link></p>
      {data.chapter_code && <p className="muted-left">{data.chapter_code} · {data.chapter_title}</p>}
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
      {!user && (
        <p className="unlock">
          Enjoying this? <Link to="/register" state={{ from: loc.pathname }}>Create a free account</Link>{' '}
          to track your progress and get quizzes and certificates as they launch.
        </p>
      )}
      {data.slides_url && <p><a href={data.slides_url} target="_blank" rel="noreferrer">Download slides</a></p>}
      {data.notes_md && <article className="notes"><Markdown>{data.notes_md}</Markdown></article>}
      <nav className="prevnext">
        {data.prev ? <Link to={`/courses/${slug}/lessons/${data.prev.slug}`}>← {data.prev.title}</Link> : <span />}
        {data.next ? <Link to={`/courses/${slug}/lessons/${data.next.slug}`}>{data.next.title} →</Link> : <span />}
      </nav>
    </main>
  )
}
