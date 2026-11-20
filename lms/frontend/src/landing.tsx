import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { listCourses, type CourseProgress, type CourseSummary } from './api'
import { isStaffUser, useAuth } from './auth'
import { CourseGrid } from './courses'
import { shortTitle } from './format'
import { useAllProgress, useSemesterCourses, useSyllabus } from './state'
import { SyllabusForm } from './syllabus-form'
import { CourseTile, Icon, Loading, ProgressBar, type IconName } from './ui'

function useAllCourses() {
  return useQuery({ queryKey: ['courses', {}], queryFn: () => listCourses() })
}

const scrollToCourses = () =>
  document.getElementById('my-courses')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

function syllabusLine(labels: ReturnType<typeof useSyllabus>['labels']) {
  return [labels.universityShort, labels.regulation, labels.branchShort, labels.semester].filter(Boolean).join(' · ')
}

/** The first-run card: "Set up your syllabus". */
function SetupCard({ onSaved, submitLabel = 'Save' }: { onSaved?: () => void; submitLabel?: string }) {
  return (
    <section className="card setup-card" aria-labelledby="setup-h">
      <span className="eyebrow">Start here</span>
      <h2 id="setup-h">Set up your syllabus</h2>
      <p className="muted small">Tell us where you study and we show your semester's courses everywhere on the site.</p>
      <SyllabusForm submitLabel={submitLabel} onSaved={onSaved} compact />
    </section>
  )
}

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'play', title: 'Watch', text: 'Short video parts that follow your syllabus, unit by unit.' },
  { icon: 'notes', title: 'Revise', text: 'Key points under every part, ready for the night before the exam.' },
  { icon: 'quiz', title: 'Check', text: 'Practice questions with an explanation for every answer.' },
]
const TRUST: { icon: IconName; text: string }[] = [
  { icon: 'sparkle', text: 'Free to watch' },
  { icon: 'captions', text: 'Captions on every video' },
  { icon: 'shield', text: 'No ads' },
]

function firstFreePart(lists: (CourseSummary[] | undefined)[]): { course: string; part: string } | null {
  for (const list of lists) {
    for (const c of list ?? []) if (c.previews[0]) return { course: c.slug, part: c.previews[0].slug }
  }
  return null
}

function SemesterSection({ title }: { title?: string }) {
  const { complete, labels, syllabus } = useSyllabus()
  const semester = useSemesterCourses()
  const all = useAllCourses()
  if (!complete) {
    return (
      <section className="block" id="my-courses">
        <div className="section-row">
          <h2 className="section-title">Courses</h2>
          <Link to="/courses" className="more">Browse all courses</Link>
        </div>
        <CourseGrid courses={all.data?.slice(0, 6)} loading={all.isLoading} />
      </section>
    )
  }
  return (
    <section className="block" id="my-courses">
      <div className="section-row">
        <div>
          <h2 className="section-title">{title ?? 'Your semester'}</h2>
          <p className="muted small">{syllabusLine(labels)}</p>
        </div>
        <Link to="/courses" className="more">Browse all courses</Link>
      </div>
      <CourseGrid
        courses={semester.data}
        loading={semester.isLoading}
        empty={
          <div className="empty">
            <Icon name="courses" size={28} />
            <h3>No courses for this semester yet</h3>
            <p>Courses for {syllabusLine(labels)} are on the way. Meanwhile, every published course is open to you.</p>
            <Link className="btn" to={`/courses?university=${syllabus.university}`}>Browse all courses</Link>
          </div>
        }
      />
    </section>
  )
}

function VisitorHome() {
  const { complete, labels, ready } = useSyllabus()
  const loc = useLocation()
  const askedToEdit = !!(loc.state as { editSyllabus?: boolean } | null)?.editSyllabus
  const [edit, setEdit] = useState(askedToEdit)
  const [seenKey, setSeenKey] = useState(loc.key)
  if (loc.key !== seenKey) {
    // "Change" in the Learn panel while already on Home
    setSeenKey(loc.key)
    if (askedToEdit) setEdit(true)
  }
  const semester = useSemesterCourses()
  const all = useAllCourses()
  const free = firstFreePart([semester.data, all.data])

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">For B.Tech students · JNTUH</span>
          <h1>Learn your syllabus the <span>exam-ready</span> way</h1>
          <p>
            Short video parts that follow your university syllabus unit by unit, with key points to revise and quizzes to
            check yourself. Watch the free parts now; a free account unlocks the rest.
          </p>
          <div className="cta">
            {free && (
              <Link className="btn accent" to={`/courses/${free.course}/parts/${free.part}`}>
                <Icon name="play" size={15} /> Watch a free part
              </Link>
            )}
            <Link className="btn ghost" to="/courses">Browse courses</Link>
          </div>
        </div>
        <div className="hero-side">
          {!ready ? (
            <Loading />
          ) : !complete || edit ? (
            <SetupCard submitLabel="Show my courses" onSaved={() => { setEdit(false); window.setTimeout(scrollToCourses, 50) }} />
          ) : (
            <section className="card setup-card" aria-labelledby="mine-h">
              <span className="eyebrow">My syllabus</span>
              <h2 id="mine-h">{[labels.regulation, labels.branchShort].filter(Boolean).join(' · ')}</h2>
              <p className="muted">{labels.universityShort} · {labels.semester}</p>
              <div className="cta">
                <button type="button" className="btn" onClick={scrollToCourses}>Show my courses</button>
                <button type="button" className="btn ghost" onClick={() => setEdit(true)}>Change</button>
              </div>
              <p className="muted small">Saved in this browser. Create a free account to keep it on every device.</p>
            </section>
          )}
        </div>
      </section>

      <ul className="trust" aria-label="Good to know">
        {TRUST.map((t) => <li key={t.text}><Icon name={t.icon} size={17} /> {t.text}</li>)}
      </ul>

      <SemesterSection title="Your semester's courses" />

      <section className="block">
        <h2 className="section-title">How it works</h2>
        <ol className="how">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card">
              <span className="how-ico"><Icon name={s.icon} size={20} /></span>
              <h3><span className="how-no">{i + 1}.</span> {s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-band">
        <div>
          <h2>Keep your progress on every device</h2>
          <p>A free account saves your syllabus, the parts you have finished and your quiz scores.</p>
        </div>
        <Link className="btn accent" to="/register">Create a free account</Link>
      </section>
    </>
  )
}

/** Continue where you stopped: the next unfinished part of the most recent course. */
function ResumeCard() {
  const progress = useAllProgress()
  const semester = useSemesterCourses()
  if (progress.isLoading) return <Loading />
  const rows = progress.data ?? []
  const recent = rows
    .filter((p) => p.started && p.last_seen_at)
    .sort((a, b) => (a.last_seen_at! < b.last_seen_at! ? 1 : -1))[0] as CourseProgress | undefined
  const firstOfSemester = semester.data?.map((c) => rows.find((p) => p.course_slug === c.slug)).find((p) => p?.resume)
  const p = recent ?? firstOfSemester
  if (!p) return null
  const started = p.started
  return (
    <section className="card resume-card" aria-labelledby="resume-h">
      <CourseTile title={p.course_title} size="lg" />
      <div className="rc-body">
        <span className="eyebrow">{started ? 'Continue where you stopped' : 'Start your semester'}</span>
        <h2 id="resume-h">{shortTitle(p.course_title)}</h2>
        {p.resume ? <p className="rc-next">{started ? 'Next' : 'First'}: {p.resume.title}</p> : <p className="rc-next">You have completed every part.</p>}
        {started && (
          <div className="card-progress">
            <ProgressBar percent={p.percent} label={`${shortTitle(p.course_title)} progress`} />
            <span>{p.completed} of {p.total} parts · {p.percent}%</span>
          </div>
        )}
      </div>
      <div className="rc-action">
        {p.resume ? (
          <Link className="btn accent" to={`/courses/${p.course_slug}/parts/${p.resume.slug}`}><Icon name="play" size={15} /> {started ? 'Resume' : 'Start'}</Link>
        ) : (
          <Link className="btn ghost" to={`/courses/${p.course_slug}`}>Open the course</Link>
        )}
      </div>
    </section>
  )
}

function StudentHome() {
  const { user } = useAuth()
  const { complete, ready } = useSyllabus()
  const first = (user?.full_name || '').trim().split(/\s+/)[0]
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Welcome back{first ? `, ${first}` : ''}</h1>
          <p className="sub">Pick up where you stopped, or open any course of your semester.</p>
        </div>
      </div>
      {ready && !complete && <SetupCard />}
      <ResumeCard />
      <SemesterSection />
    </>
  )
}

export function Home() {
  const { user } = useAuth()
  if (isStaffUser(user)) return <Navigate to="/admin" replace />
  return user ? <StudentHome /> : <VisitorHome />
}
