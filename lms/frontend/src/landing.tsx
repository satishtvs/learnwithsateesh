import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listAllQuizzes, listCourses } from './api'
import { BrandArt } from './auth-ui'
import { Catalogue, FreePreviews } from './courses'
import { Icon, type IconName } from './ui'

/** Public home page for visitors who are not signed in (layout after the Dreams LMS "Home 3" design). */
export function Landing() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const courses = useQuery({ queryKey: ['courses'], queryFn: listCourses })
  const quizzes = useQuery({ queryKey: ['quizzes', 'all', 'anon'], queryFn: listAllQuizzes })

  // Real numbers from our own catalogue, never placeholders.
  const nCourses = courses.data?.length
  const nLessons = courses.data?.reduce((n, c) => n + c.lesson_count, 0)
  const nFree = courses.data?.reduce((n, c) => n + c.previews.length, 0)
  const nQuizzes = quizzes.data?.length
  const show = (n: number | undefined) => (n === undefined ? '–' : n)

  const STATS: { icon: IconName; value: number | string; label: string; tone: string }[] = [
    { icon: 'courses', value: show(nCourses), label: 'Courses', tone: 'orange' },
    { icon: 'play', value: show(nLessons), label: 'Video lessons', tone: 'navy' },
    { icon: 'quiz', value: show(nQuizzes), label: 'Practice quizzes', tone: 'violet' },
    { icon: 'sparkle', value: show(nFree), label: 'Free to watch', tone: 'green' },
  ]
  const hasQuizzes = (nQuizzes ?? 0) > 0
  const BULLETS: { icon: IconName; title: string; text: string }[] = [
    { icon: 'courses', title: 'Syllabus-aligned', text: 'Every video follows the units and topics of your university syllabus.' },
    { icon: 'clock', title: 'Short, focused videos', text: 'Each topic is split into parts of about 10 to 20 minutes.' },
    {
      icon: 'quiz',
      title: hasQuizzes ? 'Quizzes with instant feedback' : 'Practice quizzes (coming soon)',
      text: 'Check what you have learnt and see the explanation for every answer.',
    },
    { icon: 'learning', title: 'Track your progress', text: 'Pick up exactly where you stopped, on any device.' },
  ]

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    nav(q.trim() ? `/courses?q=${encodeURIComponent(q.trim())}` : '/courses')
  }

  return (
    <>
      <section className="home-hero">
        <div className="hh-text">
          <span className="eyebrow">JNTUH R22 · B.Tech CSE (AI &amp; ML)</span>
          <h1>Learn AI &amp; ML the <span>exam-ready</span> way</h1>
          <p>
            Clear, focused video lessons organised unit by unit and aligned to your syllabus. Watch free, then create an
            account to track progress and take quizzes.
          </p>
          <form className="hero-search" role="search" onSubmit={onSearch}>
            <Icon name="search" size={18} />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, e.g. machine learning" aria-label="Search courses" />
            <button type="submit" className="go" aria-label="Search"><Icon name="arrow" size={18} /></button>
          </form>
          <p className="trust"><strong>Free to watch</strong> · Taught by Sateesh Kumar Talupuri</p>
        </div>
        <div className="hh-art" aria-hidden="false">
          <div className="hh-blob" />
          <BrandArt />
        </div>
      </section>

      <section className="stats overlap" aria-label="Learn With Sateesh in numbers">
        {STATS.map((s) => (
          <div key={s.label} className="stat">
            <span className={`stat-ico ${s.tone}`}><Icon name={s.icon} size={20} /></span>
            <div><strong>{s.value}</strong><span>{s.label}</span></div>
          </div>
        ))}
      </section>

      <section className="block">
        <div className="section-row">
          <div>
            <span className="eyebrow plain">Favourite courses</span>
            <h2 className="section-title big">Featured courses</h2>
          </div>
          <Link to="/courses" className="btn small accent">View all courses</Link>
        </div>
        <Catalogue limit={3} />
      </section>

      <section className="block" id="try-free">
        <h2 className="section-title">Try it free, no account needed</h2>
        <FreePreviews />
      </section>

      <section className="master">
        <div className="steps" aria-hidden="true">
          {['Watch the lesson', 'Take the quiz', 'See your progress'].map((t, i) => (
            <div key={t} className="step"><span>{i + 1}</span>{t}</div>
          ))}
        </div>
        <div className="master-text">
          <h2>Master the skills to drive your career</h2>
          <span className="rule" aria-hidden="true" />
          <p>
            Built for B.Tech AI &amp; ML students who want to understand the ideas, not just memorise answers. Learn the
            concept, practise it, and revisit it whenever you need.
          </p>
          <ul className="bullets">
            {BULLETS.map((b) => (
              <li key={b.title}>
                <span className="feat-ico"><Icon name={b.icon} size={20} /></span>
                <div><strong>{b.title}</strong><span>{b.text}</span></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>Start learning today, it is free</h2>
          <p>Create an account to track your progress and take quizzes as they launch.</p>
        </div>
        <Link className="btn accent" to="/register">Create a free account</Link>
      </section>
    </>
  )
}
