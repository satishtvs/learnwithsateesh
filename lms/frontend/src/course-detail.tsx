import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { claimCertificate, getCourse, getCourseProgress, listCourseQuizzes, type PartSummary, type QuizSummary } from './api'
import { isStaffUser, useAuth } from './auth'
import { CourseMetaPills, QuizStatus } from './courses'
import { groupRefs, partGroups, plural, progressDetail, shortTitle } from './format'
import { CourseTile, Icon, Loading, PreviewBanner, ProgressBar } from './ui'

// Taken from the instructor's own course slides ("About the instructor" slide).
const INSTRUCTOR = {
  name: 'Sateesh Kumar Talupuri',
  role: 'Instructor',
  bio: 'Electronics Engineer with 28+ years of experience across firmware, mobile and cloud applications, and AI/ML. Former CTO and CEO at BlueSilica and CEO of DiagnoSmart. PGP in AI/ML from the University of Texas (Great Lakes) and a certified Project Management Professional (PMP).',
}

/** The quiz chip on a part row: "Quiz 8/10" when passed, "Not passed yet", "Not taken", or nothing without a quiz. */
function QuizChip({ q, signedIn }: { q: QuizSummary | undefined; signedIn: boolean }) {
  if (!q) return null
  if (!signedIn) return <span className="chip">Quiz</span>
  if (q.passed && q.best_percent !== null) {
    const score = Math.round((q.best_percent * q.question_count) / 100)
    return <span className="chip ok" title={`Best score ${q.best_percent}%`}><Icon name="check" size={12} /> Quiz {score}/{q.question_count}</span>
  }
  if (q.best_percent !== null) return <span className="chip warn" title={`Best ${q.best_percent}%, pass mark ${q.pass_percent}%`}>Not passed yet</span>
  return <span className="chip">Not taken</span>
}

/** One unit's parts: status icon (done, current, locked for visitors), title and the quiz chip. */
export function PartList({
  course,
  parts,
  done,
  current,
  signedIn,
  quizzes,
  compact = false,
}: {
  course: string
  parts: PartSummary[]
  done: Set<string>
  current: string | null
  signedIn: boolean
  quizzes?: Map<string, QuizSummary>
  compact?: boolean
}) {
  return (
    <ol className={`prows${compact ? ' compact' : ''}`}>
      {parts.map((p) => {
        const isDone = done.has(p.slug)
        const isCur = p.slug === current
        const locked = !signedIn && !p.is_preview
        return (
          <li key={p.slug}>
            <Link
              to={`/courses/${course}/parts/${p.slug}`}
              className={`prow${isCur ? ' cur' : ''}${isDone ? ' done' : ''}`}
              aria-current={isCur && compact ? 'page' : undefined}
            >
              <span className={`ic${isDone ? ' done' : isCur ? ' cur' : locked ? ' locked' : ''}`} aria-hidden="true">
                <Icon name={isDone ? 'check' : locked ? 'lock' : 'play'} size={isDone ? 13 : 11} />
              </span>
              <span className="t">
                {p.title}
                {!compact && (
                  <small>
                    {isDone ? 'Completed' : isCur ? (signedIn ? 'Up next' : 'Now playing') : locked ? 'Free account needed' : p.is_preview && !signedIn ? 'Free preview, no account needed' : ''}
                  </small>
                )}
              </span>
              {!compact && <QuizChip q={quizzes?.get(p.slug)} signedIn={signedIn} />}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export function CoursePage() {
  const { slug = '' } = useParams()
  const { user } = useAuth()
  const staff = isStaffUser(user)
  const [copied, setCopied] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState('')
  const navigate = useNavigate()
  const { data, error, isLoading } = useQuery({ queryKey: ['course', slug], queryFn: () => getCourse(slug), retry: false })
  const progress = useQuery({
    queryKey: ['progress', slug],
    queryFn: () => getCourseProgress(slug),
    enabled: !!user && !staff,
    retry: false,
  })
  const quizzes = useQuery({
    queryKey: ['quizzes', slug, user?.id ?? 'anon'],
    queryFn: () => listCourseQuizzes(slug),
    retry: false,
  })
  if (isLoading) return <Loading />
  if (error || !data) return <div className="empty"><h3>Course not found</h3><Link className="btn" to="/courses">All courses</Link></div>

  const signedIn = !!user
  const p = progress.data
  const done = new Set(p?.completed_slugs ?? [])
  const groups = partGroups(data)
  const allParts = groups.flatMap((g) => g.parts)
  const freeParts = allParts.filter((l) => l.is_preview)
  const allQuizzes = quizzes.data ?? []
  const quizBySlug = new Map(allQuizzes.map((q) => [q.slug, q]))
  const partSlugs = new Set(allParts.map((x) => x.slug))
  const otherQuizzes = allQuizzes.filter((q) => !partSlugs.has(q.slug))
  const textbooks = groupRefs([...new Set(data.units.map((c) => c.textbook_ref).filter(Boolean))] as string[])
  const firstFree = freeParts[0]
  const resume = p?.resume
  const current = signedIn ? (resume?.slug ?? null) : null
  const quizzesLeft = p ? p.quizzes_total - p.quizzes_passed : 0
  const nextQuiz = allQuizzes.find((q) => !q.passed)
  const title = shortTitle(data.title)

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
      {staff && <PreviewBanner />}
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/courses">Courses</Link><Icon name="chevron" size={14} /><span>{title}</span></nav>

      <section className="course-head">
        <div className="chips">
          <CourseMetaPills c={data} light />
          {data.subject_code && <span className="chip on-dark">Subject code {data.subject_code}</span>}
        </div>
        <h1>{title}</h1>
        <p className="ch-sub">{data.description}</p>
        <ul className="ch-meta">
          <li><Icon name="courses" size={15} /> {plural(data.units.length, 'unit')}</li>
          <li><Icon name="play" size={15} /> {plural(allParts.length, 'part')}</li>
          {allQuizzes.length > 0 && <li><Icon name="quiz" size={15} /> {plural(allQuizzes.length, 'quiz', 'quizzes')}</li>}
        </ul>
        {signedIn && p && p.total > 0 && (
          <div className="ch-progress">
            <ProgressBar percent={p.percent} label="Course progress" light />
            <span>{p.percent}% · {p.completed} of {p.total} parts complete · {progressDetail(p)}</span>
          </div>
        )}
        <div className="cta">
          {signedIn ? (
            resume ? (
              <Link className="btn accent" to={`/courses/${slug}/parts/${resume.slug}`}>
                <Icon name="play" size={15} /> {p?.started ? `Resume: ${resume.title}` : 'Start the course'}
              </Link>
            ) : p && p.total > 0 ? (
              <span className="ch-done"><Icon name="check" size={16} /> Every part complete</span>
            ) : null
          ) : (
            <>
              {firstFree && <Link className="btn accent" to={`/courses/${slug}/parts/${firstFree.slug}`}><Icon name="play" size={15} /> Watch a free part</Link>}
              <Link className="btn ghost-light" to="/register" state={{ from: `/courses/${slug}` }}>Create a free account</Link>
            </>
          )}
        </div>
      </section>

      <div className="course-layout">
        <div className="course-main">
          <div className="section-row">
            <h2 className="section-title">Course content</h2>
            <span className="muted small">{plural(allParts.length, 'part')}{allQuizzes.length > 0 && ` · ${plural(allQuizzes.length, 'quiz', 'quizzes')}`}</span>
          </div>
          {groups.map((g) => {
            const n = g.parts.length
            const nDone = g.parts.filter((x) => done.has(x.slug)).length
            return (
              <section key={g.key} className="unit-card" id={`unit-${g.key}`} aria-labelledby={`uh-${g.key}`}>
                <header className="uh">
                  <h3 id={`uh-${g.key}`}>{g.name}{g.title && <span> · {g.title}</span>}</h3>
                  <span className="muted small">
                    {n === 0 ? 'Coming soon' : signedIn && nDone > 0 ? `${nDone} of ${n} done` : plural(n, 'part')}
                  </span>
                </header>
                {n === 0 ? (
                  <p className="muted small unit-empty">Parts for this unit are on the way.</p>
                ) : (
                  <PartList course={slug} parts={g.parts} done={done} current={current} signedIn={signedIn} quizzes={quizBySlug} />
                )}
              </section>
            )
          })}

          {otherQuizzes.length > 0 && (
            <section className="unit-card" aria-labelledby="uh-quizzes">
              <header className="uh"><h3 id="uh-quizzes">Unit quizzes</h3><span className="muted small">{otherQuizzes.length}</span></header>
              <ol className="prows">
                {otherQuizzes.map((q) => (
                  <li key={q.slug}>
                    <Link to={`/courses/${slug}/quizzes/${q.slug}`} className="prow">
                      <span className="ic" aria-hidden="true"><Icon name="quiz" size={13} /></span>
                      <span className="t">{q.title}<small>{q.question_count} questions · pass mark {q.pass_percent}%</small></span>
                      <QuizStatus q={q} />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="panel">
            <h2>About the instructor</h2>
            <div className="instructor">
              <span className="avatar lg" aria-hidden="true">ST</span>
              <div>
                <h3>{INSTRUCTOR.name}</h3>
                <p className="muted small">{INSTRUCTOR.role}</p>
              </div>
            </div>
            <p className="lead">{INSTRUCTOR.bio}</p>
          </section>
        </div>

        <aside className="side-card" aria-label="About this course">
          <div className="sc-top">
            <CourseTile title={data.title} size="sm" />
            <p className="price">Free <small>to learn</small></p>
          </div>

          {signedIn && p && p.total > 0 && !resume && (
            quizzesLeft > 0 ? (
              <>
                <p className="note small">
                  You have completed every part. Pass {quizzesLeft === 1 ? 'the remaining quiz' : `the ${quizzesLeft} remaining quizzes`} to
                  earn your certificate ({p.quizzes_passed} of {p.quizzes_total} passed).
                </p>
                {nextQuiz && (
                  <Link className="btn block" to={`/courses/${slug}/quizzes/${nextQuiz.slug}`}>
                    <Icon name="quiz" size={16} /> Take the next quiz
                  </Link>
                )}
              </>
            ) : (
              <>
                <p className="note small">
                  {p.quizzes_total > 0 ? 'You have finished every part and passed every quiz. Well done!' : 'You have completed every part. Well done!'}
                </p>
                <button type="button" className="btn block" onClick={claim} disabled={claiming}>
                  <Icon name="award" size={16} /> {claiming ? 'Preparing…' : 'Get your certificate'}
                </button>
              </>
            )
          )}
          {claimError && <p className="error small" role="alert">{claimError}</p>}

          <h3>What is included</h3>
          <ul className="incl">
            <li><Icon name="play" size={16} /> {plural(allParts.length, 'video part')}</li>
            <li><Icon name="notes" size={16} /> Key points with every part</li>
            {allQuizzes.length > 0 && <li><Icon name="quiz" size={16} /> {plural(allQuizzes.length, 'practice quiz', 'practice quizzes')} with explanations</li>}
            {freeParts.length > 0 && <li><Icon name="sparkle" size={16} /> {plural(freeParts.length, 'free preview part')}, no account needed</li>}
            <li><Icon name="learning" size={16} /> Progress tracking and resume</li>
            <li><Icon name="award" size={16} /> Certificate when you finish every part{allQuizzes.length > 0 && ' and pass every quiz'}</li>
          </ul>
          {textbooks.length > 0 && (
            <>
              <h3>Textbooks</h3>
              <p className="muted small">{textbooks.join(' · ')}</p>
            </>
          )}
          <button type="button" className="btn ghost block" onClick={share}>
            <Icon name="share" size={15} /> {copied ? 'Link copied' : 'Share this course'}
          </button>
        </aside>
      </div>
    </>
  )
}
