import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError, getQuiz, listAllQuizzes, submitAttempt, type AttemptResult, type QuizDetail } from './api'
import { useAuth } from './auth'
import { LoginGate, QuizStatus } from './courses'
import { Icon, PageHeader } from './ui'

const LETTERS = 'ABCDEF'

export function QuizzesPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['quizzes', 'all', user?.id ?? 'anon'], queryFn: listAllQuizzes })
  const byCourse = new Map<string, { title: string; items: NonNullable<typeof data> }>()
  for (const q of data ?? []) {
    const g = byCourse.get(q.course_slug) ?? { title: q.course_title, items: [] }
    g.items.push(q)
    byCourse.set(q.course_slug, g)
  }
  return (
    <>
      <PageHeader title="Quizzes" subtitle="Check what you have learnt. Retake any quiz as often as you like; your best score counts." />
      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : byCourse.size === 0 ? (
        <div className="empty">
          <Icon name="quiz" size={28} />
          <h3>Quizzes are on the way</h3>
          <p>Practice quizzes for each unit are being prepared. They will appear here as soon as they are ready.</p>
          <Link className="btn" to="/courses">Browse courses</Link>
        </div>
      ) : (
        [...byCourse.entries()].map(([slug, g]) => (
          <section key={slug} className="panel">
            <h2><Link to={`/courses/${slug}`}>{g.title}</Link></h2>
            <ul className="rows">
              {g.items.map((q) => (
                <li key={q.slug}>
                  <Link to={`/courses/${slug}/quizzes/${q.slug}`} className="row quiz">
                    <span className="ico quiz"><Icon name="quiz" size={15} /></span>
                    <span className="t">
                      {q.title}
                      <small>{q.question_count} questions · pass mark {q.pass_percent}%</small>
                    </span>
                    <QuizStatus q={q} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  )
}

function Result({
  quiz,
  result,
  course,
  onRetake,
}: {
  quiz: QuizDetail
  result: AttemptResult
  course: string
  onRetake: () => void
}) {
  const byId = new Map(result.results.map((r) => [r.question_id, r]))
  return (
    <>
      <section className={`score-card ${result.passed ? 'pass' : 'fail'}`} aria-live="polite">
        <div className="score-ring" style={{ ['--p' as string]: `${result.percent}%` }}>
          <span>{result.percent}%</span>
        </div>
        <div>
          <h2>{result.passed ? 'Well done, you passed!' : 'Not there yet. Keep going!'}</h2>
          <p>
            You got <strong>{result.score}</strong> of <strong>{result.total}</strong> right. Pass mark: {result.pass_percent}%.
            {!result.passed && ' Read the explanations below, rewatch the lesson and try again.'}
          </p>
          <div className="cta">
            <button type="button" className="btn" onClick={onRetake}>Retake quiz</button>
            <Link className="btn ghost" to={`/courses/${course}`}>Back to course</Link>
          </div>
        </div>
      </section>

      <h2 className="section-title">Review your answers</h2>
      {quiz.questions.map((q, i) => {
        const r = byId.get(q.id)!
        return (
          <section key={q.id} className={`q-card ${r.correct ? 'right' : 'wrong'}`}>
            <p className="q-text"><span className="q-num">{i + 1}</span>{q.prompt}</p>
            <ul className="opts">
              {q.options.map((o, oi) => {
                const isCorrect = oi === r.correct_index
                const isChosen = oi === r.chosen
                return (
                  <li key={oi} className={`opt review${isCorrect ? ' is-correct' : ''}${isChosen && !isCorrect ? ' is-wrong' : ''}`}>
                    <span className="letter">{LETTERS[oi]}</span>
                    <span>{o}</span>
                    {isCorrect && <span className="tag">Correct answer</span>}
                    {isChosen && !isCorrect && <span className="tag">Your answer</span>}
                  </li>
                )
              })}
            </ul>
            {r.chosen === null && <p className="note small">You skipped this question.</p>}
            {r.explanation && <p className="explain"><strong>Why: </strong>{r.explanation}</p>}
          </section>
        )
      })}
    </>
  )
}

export function QuizPage() {
  const { slug = '', quizSlug = '' } = useParams()
  const { user, loading } = useAuth()
  const loc = useLocation()
  const qc = useQueryClient()
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<AttemptResult | null>(null)

  const { data, error, isLoading } = useQuery({
    queryKey: ['quiz', slug, quizSlug, user?.id ?? 'anon'],
    queryFn: () => getQuiz(slug, quizSlug),
    enabled: !loading,
    retry: false,
  })
  const submit = useMutation({
    mutationFn: () => {
      const all: Record<number, number | null> = {}
      for (const q of data!.questions) all[q.id] = answers[q.id] ?? null
      return submitAttempt(slug, quizSlug, all)
    },
    onSuccess: (r) => {
      setResult(r)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      qc.invalidateQueries({ queryKey: ['quizzes'] })
      qc.invalidateQueries({ queryKey: ['quiz', slug, quizSlug] })
      qc.invalidateQueries({ queryKey: ['my-attempts'] })
    },
  })

  if (loading || isLoading) return <p className="muted">Loading…</p>
  if (error instanceof ApiError && error.status === 401) {
    return (
      <>
        <nav className="crumbs"><Link to={`/courses/${slug}`}>← Course</Link></nav>
        <LoginGate back={loc.pathname} title="Sign in to take this quiz" text="Quizzes are free; you just need a free account so we can save your scores." />
      </>
    )
  }
  if (error || !data) {
    return (
      <div className="empty">
        <h3>{error instanceof ApiError && error.status === 404 ? 'Quiz not found' : 'Could not load this quiz'}</h3>
        <Link className="btn" to="/quizzes">All quizzes</Link>
      </div>
    )
  }

  const total = data.questions.length
  const answered = data.questions.filter((q) => answers[q.id] !== undefined).length

  const retake = () => {
    setAnswers({})
    setResult(null)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/quizzes">Quizzes</Link><Icon name="chevron" size={14} />
        <Link to={`/courses/${slug}`}>Course</Link>
        {data.chapter_code && <><Icon name="chevron" size={14} /><span>{data.chapter_code} · {data.chapter_title}</span></>}
      </nav>
      <PageHeader title={data.title}>
        <QuizStatus q={data} />
      </PageHeader>

      {result ? (
        <Result quiz={data} result={result} course={slug} onRetake={retake} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit.mutate()
          }}
        >
          <p className="note">
            {total} questions · pass mark {data.pass_percent}%. Choose one answer for each question. You see the correct
            answers and explanations after you submit.
          </p>
          {data.questions.map((q, i) => (
            <fieldset key={q.id} className="q-card">
              <legend className="q-text"><span className="q-num">{i + 1}</span>{q.prompt}</legend>
              <div className="opts">
                {q.options.map((o, oi) => (
                  <label key={oi} className={`opt${answers[q.id] === oi ? ' selected' : ''}`}>
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      checked={answers[q.id] === oi}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    />
                    <span className="letter">{LETTERS[oi]}</span>
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="submit-bar">
            <span>{answered} of {total} answered{answered < total && ' · unanswered questions count as wrong'}</span>
            {submit.isError && <span role="alert" className="error">Could not submit. Try again.</span>}
            <button type="submit" className="btn" disabled={submit.isPending || answered === 0}>
              {submit.isPending ? 'Submitting…' : 'Submit answers'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}
