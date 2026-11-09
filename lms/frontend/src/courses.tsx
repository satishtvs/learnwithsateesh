import { useQuery } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ApiError, getCourse, getLesson, listCourses } from './api'
import { useAuth } from './auth'

export function Catalogue() {
  const { data, isLoading } = useQuery({ queryKey: ['courses'], queryFn: listCourses })
  if (isLoading) return <p>Loading courses…</p>
  if (!data?.length) return <p>No courses yet.</p>
  return (
    <div className="grid">
      {data.map((c) => (
        <Link key={c.slug} to={`/courses/${c.slug}`} className="course-card">
          <h3>{c.title}</h3>
          <p>{c.description}</p>
        </Link>
      ))}
    </div>
  )
}

export function CoursePage() {
  const { slug = '' } = useParams()
  const { data, error, isLoading } = useQuery({ queryKey: ['course', slug], queryFn: () => getCourse(slug), retry: false })
  if (isLoading) return <main className="wide">Loading…</main>
  if (error || !data) return <main className="wide"><p>Course not found.</p><Link to="/">Back</Link></main>

  return (
    <main className="wide">
      <p><Link to="/">← All courses</Link></p>
      <h1>{data.title}</h1>
      <p>{data.description}</p>

      {data.overview_lessons.length > 0 && (
        <section>
          <h2>Start here</h2>
          <ul className="lessons">
            {data.overview_lessons.map((l) => (
              <li key={l.slug}><Link to={`/courses/${slug}/lessons/${l.slug}`}>{l.title}</Link></li>
            ))}
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
              {ch.lessons.map((l) => (
                <li key={l.slug}><Link to={`/courses/${slug}/lessons/${l.slug}`}>{l.title}</Link></li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  )
}

export function LessonPage() {
  const { slug = '', lessonSlug = '' } = useParams()
  const { user, loading } = useAuth()
  const loc = useLocation()
  const { data, error, isLoading } = useQuery({
    queryKey: ['lesson', slug, lessonSlug],
    queryFn: () => getLesson(slug, lessonSlug),
    enabled: !!user,
    retry: false,
  })

  if (loading) return <main className="wide">Loading…</main>
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (isLoading) return <main className="wide">Loading…</main>
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
      {data.slides_url && <p><a href={data.slides_url} target="_blank" rel="noreferrer">Download slides</a></p>}
      {data.notes_md && <article className="notes"><Markdown>{data.notes_md}</Markdown></article>}
      <nav className="prevnext">
        {data.prev ? <Link to={`/courses/${slug}/lessons/${data.prev.slug}`}>← {data.prev.title}</Link> : <span />}
        {data.next ? <Link to={`/courses/${slug}/lessons/${data.next.slug}`}>{data.next.title} →</Link> : <span />}
      </nav>
    </main>
  )
}
