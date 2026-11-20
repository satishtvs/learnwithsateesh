import { useQuery, useQueryClient } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError, getCourse, getCourseProgress, getPart, getQuiz } from './api'
import { isStaffUser, useAuth } from './auth'
import { PartList } from './course-detail'
import { LoginGate } from './courses'
import { partGroups, shortTitle } from './format'
import { QuizRunner } from './quiz'
import { WatchedVideo } from './watch'
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
  // The server completes a part once the video is watched and its quiz (if any) is passed; refresh what it shows.
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['progress'] })
    qc.invalidateQueries({ queryKey: ['part', slug, partSlug] })
  }

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
  // A part is complete when the video is watched AND its quiz (if any) is passed; the server decides.
  const quizPassed = !data.quiz_slug || !!quizState.data?.passed
  let step = 0
  return (
    <article className="part-page">
      {crumbs}
      {staff && <PreviewBanner />}
      <h1 className="part-title">{data.title}</h1>
      <WatchedVideo
        key={`${slug}/${partSlug}/${user?.id ?? 'anon'}`}
        course={slug}
        part={partSlug}
        videoId={data.youtube_id}
        title={data.title}
        track={signedIn && !staff}
        initialSeconds={data.watched_seconds}
        knownDuration={data.duration_seconds}
        onResult={(r) => {
          if (r.watched || r.completed) refresh()
        }}
      />

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
            onPassed={refresh}
          />
        </section>
      )}

      <section className={`donebar${data.completed ? ' is-done' : ''}`}>
        {user && !staff ? (
          <>
            <div>
              <strong>{data.completed ? 'This part is complete.' : 'To complete this part:'}</strong>
              <ul className="req-list">
                <li className={data.watched ? 'ok' : ''}>
                  <Icon name="check" size={14} /> Watch the whole video
                </li>
                {data.quiz_slug && (
                  <li className={quizPassed ? 'ok' : ''}>
                    <Icon name="check" size={14} /> Pass the quiz
                  </li>
                )}
              </ul>
              <p className="muted small">It is marked complete automatically once both are done. Your progress is saved.</p>
            </div>
          </>
        ) : staff ? (
          <p className="muted small">Instructor preview: completion is not recorded for instructor accounts.</p>
        ) : (
          <p>
            Enjoying this? <Link to="/register" state={{ from: loc.pathname }}>Create a free account</Link> to track your
            progress and take the quizzes.
          </p>
        )}
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
