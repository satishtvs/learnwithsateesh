import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { claimCertificate, getCourse, getCourseProgress, listCourseQuizzes } from './api'
import { useAuth } from './auth'
import { LessonRow, QuizRow } from './courses'
import { groupRefs, lessonsWord } from './format'
import { Cover, Icon, ProgressBar } from './ui'

// Taken from the instructor's own course slides ("About the instructor" slide).
const INSTRUCTOR = {
  name: 'Sateesh Kumar Talupuri',
  role: 'Instructor',
  bio: 'Electronics Engineer with 28+ years of experience across firmware, mobile and cloud applications, and AI/ML. Former CTO and CEO at BlueSilica and CEO of DiagnoSmart. PGP in AI/ML from the University of Texas (Great Lakes) and a certified Project Management Professional (PMP).',
}

export function CoursePage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState('')
  const navigate = useNavigate()
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
  const freeLessons = allLessons.filter((l) => l.is_preview)
  const allQuizzes = quizzes.data ?? []
  const chapterCodes = new Set(data.chapters.map((c) => c.code))
  const looseQuizzes = allQuizzes.filter((q) => !q.chapter_code || !chapterCodes.has(q.chapter_code))
  const textbooks = groupRefs([...new Set(data.chapters.map((c) => c.textbook_ref).filter(Boolean))] as string[])
  const firstFree = freeLessons[0]
  const resume = progress.data?.resume

  async function claim() {
    setClaiming(true)
    setClaimError('')
    try {
      const cert = await claimCertificate(slug)
      navigate(`/certificates/${cert.code}`)
    } catch {
      setClaimError('Could not issue the certificate. Please try again.')
      setClaiming(false)
    }
  }

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: data!.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* the person closed the share sheet or the browser blocked clipboard access */
    }
  }

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/courses">Courses</Link><Icon name="chevron" size={14} /><span>{data.title}</span></nav>

      <section className="course-hero">
        <div className="chips"><span className="chip on-dark">AI &amp; ML</span><span className="chip on-dark">B.Tech</span></div>
        <h1>{data.title}</h1>
        <p>{data.description}</p>
        <ul className="ch-meta">
          <li><Icon name="play" size={15} /> {allLessons.length} {lessonsWord(allLessons.length)}</li>
          <li><Icon name="courses" size={15} /> {data.chapters.length} {data.chapters.length === 1 ? 'chapter' : 'chapters'}</li>
          {allQuizzes.length > 0 && <li><Icon name="quiz" size={15} /> {allQuizzes.length} {allQuizzes.length === 1 ? 'quiz' : 'quizzes'}</li>}
          <li><Icon name="sparkle" size={15} /> {freeLessons.length} free to watch</li>
        </ul>
        <div className="ch-instructor">
          <span className="avatar" aria-hidden="true">ST</span>
          <div><strong>{INSTRUCTOR.name}</strong><small>{INSTRUCTOR.role}</small></div>
        </div>
      </section>

      <div className="course-layout">
        <div className="course-main">
          <section className="panel">
            <h2>Overview</h2>
            <h3>About this course</h3>
            <p className="lead">{data.description}</p>
            {data.chapters.length > 0 && (
              <>
                <h3>What you will cover</h3>
                <ul className="covers">
                  {data.chapters.map((c) => <li key={c.code}><Icon name="check" size={15} /><span>{c.title}{c.unit && <small> · {c.unit}</small>}</span></li>)}
                </ul>
              </>
            )}
            {textbooks.length > 0 && (
              <>
                <h3>Textbook references</h3>
                <p className="muted">{textbooks.join(' · ')}</p>
              </>
            )}
          </section>

          <section className="panel">
            <div className="section-row">
              <h2>Course content</h2>
              <span className="muted small">{allLessons.length} {lessonsWord(allLessons.length)}{allQuizzes.length > 0 && ` · ${allQuizzes.length} ${allQuizzes.length === 1 ? 'quiz' : 'quizzes'}`}</span>
            </div>
            {data.overview_lessons.length > 0 && (
              <details className="acc" open>
                <summary><span>Start here</span><span className="muted small">{data.overview_lessons.length} {lessonsWord(data.overview_lessons.length)}</span></summary>
                <ul className="rows">
                  {data.overview_lessons.map((l) => <LessonRow key={l.slug} course={slug} lesson={l} signedIn={signedIn} done={done.has(l.slug)} />)}
                </ul>
              </details>
            )}
            {data.chapters.map((ch, i) => {
              const chapterQuizzes = allQuizzes.filter((q) => q.chapter_code === ch.code)
              const count = ch.lessons.length
              return (
                <details key={ch.code} className="acc" open={i === 0 && data.overview_lessons.length === 0 && count > 0}>
                  <summary>
                    <span><span className="code">{ch.code}</span> {ch.title}</span>
                    <span className="muted small">
                      {count > 0 ? `${count} ${lessonsWord(count)}` : 'Coming soon'}
                      {chapterQuizzes.length > 0 && ` · ${chapterQuizzes.length} ${chapterQuizzes.length === 1 ? 'quiz' : 'quizzes'}`}
                    </span>
                  </summary>
                  {count === 0 && chapterQuizzes.length === 0 ? (
                    <p className="muted small acc-empty">Lessons for this chapter are on the way.</p>
                  ) : (
                    <ul className="rows">
                      {ch.lessons.map((l) => <LessonRow key={l.slug} course={slug} lesson={l} signedIn={signedIn} done={done.has(l.slug)} />)}
                      {chapterQuizzes.map((q) => <QuizRow key={q.slug} course={slug} q={q} />)}
                    </ul>
                  )}
                </details>
              )
            })}
            {looseQuizzes.length > 0 && (
              <details className="acc" open>
                <summary><span>Quizzes</span><span className="muted small">{looseQuizzes.length}</span></summary>
                <ul className="rows">{looseQuizzes.map((q) => <QuizRow key={q.slug} course={slug} q={q} />)}</ul>
              </details>
            )}
          </section>

          <section className="panel">
            <h2>About the instructor</h2>
            <div className="instructor">
              <span className="avatar-lg dark" aria-hidden="true">ST</span>
              <div>
                <h3>{INSTRUCTOR.name}</h3>
                <p className="muted small">{INSTRUCTOR.role}</p>
              </div>
            </div>
            <p className="lead">{INSTRUCTOR.bio}</p>
          </section>
        </div>

        <aside className="enroll-card" aria-label="Start this course">
          <Cover seed={data.slug} icon="play" />
          <div className="ec-body">
            <p className="price">Free <small>to learn</small></p>

            {progress.data?.started && (
              <div className="card-progress">
                <ProgressBar percent={progress.data.percent} label="Course progress" />
                <span>{progress.data.completed} of {progress.data.total} {lessonsWord(progress.data.total)} · {progress.data.percent}%</span>
              </div>
            )}
            {signedIn ? (
              resume ? (
                <Link className="btn block" to={`/courses/${slug}/lessons/${resume.slug}`}>
                  {progress.data?.started ? 'Resume' : 'Start learning'}
                </Link>
              ) : progress.data && progress.data.total > 0 ? (
                <>
                  <p className="note small">You have completed every lesson. Well done!</p>
                  <button type="button" className="btn block" onClick={claim} disabled={claiming}>
                    <Icon name="award" size={16} /> {claiming ? 'Preparing…' : 'Get your certificate'}
                  </button>
                  {claimError && <p className="error small" role="alert">{claimError}</p>}
                </>
              ) : (
                <p className="muted small">Lessons are on the way.</p>
              )
            ) : (
              <>
                <Link className="btn block" to="/register" state={{ from: `/courses/${slug}` }}>Create a free account</Link>
                {firstFree && (
                  <Link className="btn ghost block" to={`/courses/${slug}/lessons/${firstFree.slug}`}>Watch a free lesson</Link>
                )}
              </>
            )}
            <button type="button" className="btn ghost block" onClick={share}>
              <Icon name="share" size={15} /> {copied ? 'Link copied' : 'Share this course'}
            </button>

            <h3>This course includes</h3>
            <ul className="incl">
              <li><Icon name="play" size={16} /> {allLessons.length} video {lessonsWord(allLessons.length)}</li>
              {allQuizzes.length > 0 && <li><Icon name="quiz" size={16} /> {allQuizzes.length} practice {allQuizzes.length === 1 ? 'quiz' : 'quizzes'} with instant feedback</li>}
              <li><Icon name="learning" size={16} /> Progress tracking and resume</li>
              {freeLessons.length > 0 && <li><Icon name="sparkle" size={16} /> {freeLessons.length} free preview {lessonsWord(freeLessons.length)}</li>}
              <li><Icon name="award" size={16} /> Certificate when you finish every lesson</li>
            </ul>

            <h3>Course features</h3>
            <dl className="feat">
              <div><dt>Chapters</dt><dd>{data.chapters.length}</dd></div>
              <div><dt>Lessons</dt><dd>{allLessons.length}</dd></div>
              <div><dt>Quizzes</dt><dd>{allQuizzes.length}</dd></div>
              <div><dt>Free lessons</dt><dd>{freeLessons.length}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  )
}
