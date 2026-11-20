import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError, getCourse, getCourseProgress, getPart, getQuiz, setPartCompleted } from './api'
import { isStaffUser, useAuth } from './auth'
import { PartList } from './course-detail'
import { LoginGate } from './courses'
import { partGroups, shortTitle } from './format'
import { QuizRunner } from './quiz'
import { Icon, Loading, PreviewBanner, ProgressBar } from './ui'

export function PartPage() {
  const { slug = '', partSlug = '' } = useParams()
  const { user, loading } = useAuth()
  const staff = isStaffUser(user)
  const loc = useLocation()
  const qc = useQueryClient()
  const { data, error, isLoading } = useQuery({
    // user id in the key: re-fetch after signing in or out
    queryKey: ['part', slug, partSlug, user?.id ?? 'anon'],
    queryFn: () => getPart(slug, partSlug),
    enabled: !loading,
    retry: false,
  })
  const course = useQuery({ queryKey: ['course', slug], queryFn: () => getCourse(slug), retry: false })
  const progress = useQuery({
    queryKey: ['progress', slug],
    queryFn: () => getCourseProgress(slug),
    enabled: !!user && !staff,
    retry: false,
  })
  const quizSlug = data?.quiz_slug ?? ''
  const quizState = useQuery({
    queryKey: ['quiz', slug, quizSlug, user?.id ?? 'anon'],
    queryFn: () => getQuiz(slug, quizSlug),
    enabled: !!user && !!quizSlug,
    retry: false,
  })
  const toggle = useMutation({
    mutationFn: (completed: boolean) => setPartCompleted(slug, partSlug, completed),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress'] })
      qc.invalidateQueries({ queryKey: ['part', slug, partSlug] })
    },
  })

  const courseTitle = course.data ? shortTitle(course.data.title) : 'Course'
  const crumbs = (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/courses">Courses</Link><Icon name="chevron" size={14} />
      <Link to={`/courses/${slug}`}>{courseTitle}</Link>
      {data?.unit_code && <><Icon name="chevron" size={14} /><span>{data.unit_title}</span></>}
    </nav>
  )

  if (loading || isLoading) return <Loading />
  if (error instanceof ApiError && error.status === 401) {
    return (
      <>
        {crumbs}
        <LoginGate
          back={loc.pathname}
          title="This part is for registered learners"
          text="Create a free account to watch this part and every other part in the course. It is free."
        />
      </>
    )
  }
  if (error || !data) {
    const missing = error instanceof ApiError && error.status === 404
    return (
      <div className="empty">
        <h3>{missing ? 'Part not found' : 'Could not load this part'}</h3>
        <Link className="btn" to={`/courses/${slug}`}>Back to course</Link>
      </div>
    )
  }

  const signedIn = !!user
  const done = new Set(progress.data?.completed_slugs ?? [])
  // A part with a visible quiz is completed by passing it (the quiz result is cached by the quiz runner).
  const quizPending = !!data.quiz_slug && !quizState.data?.passed
  let step = 0
  return (
    <article className="part-page">
      {crumbs}
      {staff && <PreviewBanner />}
      <h1 className="part-title">{data.title}</h1>
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${data.youtube_id}`}
          title={data.title}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      {/* Phones have no side panel open, so the course outline sits under the video. */}
      {course.data && (
        <details className="phone-outline">
          <summary>
            <span>Course content</span>
            {progress.data && <span className="muted small">{progress.data.percent}% complete</span>}
          </summary>
          {progress.data && <ProgressBar percent={progress.data.percent} label="Course progress" />}
          {partGroups(course.data).filter((g) => g.parts.length).map((g) => (
            <div key={g.key} className="po-group">
              <h3>{g.name}{g.title && ` · ${g.title}`}</h3>
              <PartList course={slug} parts={g.parts} done={done} current={partSlug} signedIn={signedIn} compact />
            </div>
          ))}
        </details>
      )}

      {data.slides_url && (
        <p><a className="btn ghost" href={data.slides_url} target="_blank" rel="noreferrer"><Icon name="notes" size={15} /> Download slides</a></p>
      )}

      {data.notes_md && (
        <section className="panel notes">
          <h2 className="step-title"><span className="step-no">{++step}</span> Key points</h2>
          <Markdown>{data.notes_md}</Markdown>
        </section>
      )}

      {data.quiz_slug && (
        <section className="panel part-quiz" id="quiz">
          <h2 className="step-title"><span className="step-no">{++step}</span> Check yourself</h2>
          <QuizRunner
            slug={slug}
            quizSlug={data.quiz_slug}
            embedded
            onPassed={() => {
              if (!data.completed) toggle.mutate(true)
            }}
          />
        </section>
      )}

      <section className={`donebar${data.completed ? ' is-done' : ''}`}>
        {user && !staff ? (
          <>
            <div>
              <strong>{data.completed ? 'This part is complete.' : quizPending ? 'Pass the quiz to complete this part.' : 'Finished this part?'}</strong>
              <p className="muted small">
                {data.completed
                  ? 'Your progress is saved.'
                  : quizPending
                    ? 'It is marked complete automatically when you pass.'
                    : 'Mark it complete to track your progress.'}
              </p>
            </div>
            <button
              type="button"
              className={`btn${data.completed ? ' success' : ''}`}
              disabled={toggle.isPending || (quizPending && !data.completed)}
              onClick={() => toggle.mutate(!data.completed)}
            >
              <Icon name="check" size={16} /> {data.completed ? 'Completed (undo)' : 'Mark as complete'}
            </button>
          </>
        ) : staff ? (
          <p className="muted small">Instructor preview: completion is not recorded for instructor accounts.</p>
        ) : (
          <p>
            Enjoying this? <Link to="/register" state={{ from: loc.pathname }}>Create a free account</Link> to track your
            progress and take the quizzes.
          </p>
        )}
        {toggle.isError && <span role="alert" className="error">Could not save. Try again.</span>}
      </section>

      <nav className="prevnext" aria-label="Part navigation">
        {data.prev ? (
          <Link className="pn prev" to={`/courses/${slug}/parts/${data.prev.slug}`}>
            <small>Previous</small><span>{data.prev.title}</span>
          </Link>
        ) : <span />}
        {data.next ? (
          <Link className="pn next" to={`/courses/${slug}/parts/${data.next.slug}`}>
            <small>Next</small><span>{data.next.title}</span>
          </Link>
        ) : <span />}
      </nav>
    </article>
  )
}
