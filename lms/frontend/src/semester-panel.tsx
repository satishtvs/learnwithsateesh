import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourse, listCourses, type CourseOutline, type CourseProgress, type CourseSummary, type PartSummary } from './api'
import { useAuth } from './auth'
import { partGroups, shortTitle } from './format'
import { useAllProgress, useChangeSyllabusLink, useRouteCourse, useSemesterCourses, useSyllabus } from './state'
import { Icon } from './ui'

export function SyllabusBox() {
  const { complete, labels, ready } = useSyllabus()
  const change = useChangeSyllabusLink()
  if (!ready) return <div className="syl-box"><small>My syllabus</small><span className="muted">Loading…</span></div>
  if (!complete) {
    return (
      <div className="syl-box">
        <small>My syllabus</small>
        <b>Not set yet</b>
        <span className="muted">Choose your university, branch and semester to see your courses here.</span>
        <Link to={change.to} state={change.state}>Set up my syllabus</Link>
      </div>
    )
  }
  return (
    <div className="syl-box">
      <small>My syllabus</small>
      <b>{[labels.regulation, labels.branchShort].filter(Boolean).join(' · ')}</b>
      <span className="muted">{labels.universityShort} · Year {labels.semester?.split('-')[0]} · Sem {labels.semester?.split('-')[1]}</span>
      <Link to={change.to} state={change.state} aria-label="Change my syllabus">Change</Link>
    </div>
  )
}

function coursePill(c: CourseSummary, p: CourseProgress | undefined) {
  if (c.part_count === 0) return <span className="chip">Soon</span>
  if (p?.started) return <span className="chip accent">{p.percent}%</span>
  return null
}

function PartLink({ course, part, done, current, isPage, locked }: { course: string; part: PartSummary; done: boolean; current: boolean; isPage: boolean; locked: boolean }) {
  return (
    <li>
      <Link
        to={`/courses/${course}/parts/${part.slug}`}
        className={`tp${current ? ' on' : ''}${done ? ' done' : ''}`}
        aria-current={isPage ? 'page' : undefined}
        title={part.title}
      >
        <span className="tp-ico" aria-hidden="true">
          {done ? <Icon name="check" size={12} /> : current ? <Icon name="play" size={10} /> : locked ? <Icon name="lock" size={11} /> : null}
        </span>
        <span className="tp-t">{part.title}</span>
        <span className="sr-only">{done ? ' (completed)' : current ? ' (current part)' : locked ? ' (sign in to watch)' : ''}</span>
      </Link>
    </li>
  )
}

/** The active course: its units, and the current unit opened to its parts. */
function CourseUnits({ outline, progress, currentPart, inCourse }: { outline: CourseOutline; progress?: CourseProgress; currentPart: string | null; inCourse: boolean }) {
  const { user } = useAuth()
  const done = new Set(user ? (progress?.completed_slugs ?? []) : [])
  const marker = currentPart ?? progress?.resume?.slug ?? null
  const groups = partGroups(outline)
  const currentGroup = groups.find((g) => g.parts.some((p) => p.slug === marker))?.key ?? groups.find((g) => g.parts.length)?.key
  const [toggled, setToggled] = useState<Record<string, boolean>>({})

  return (
    <ul className="tu">
      {groups.map((g) => {
        const open = toggled[g.key] ?? (inCourse && g.key === currentGroup)
        const allDone = g.parts.length > 0 && g.parts.every((p) => done.has(p.slug))
        const isCurrent = g.key === currentGroup && !!marker
        return (
          <li key={g.key}>
            <button
              type="button"
              className={`tu-row${isCurrent ? ' on' : ''}`}
              aria-expanded={open}
              onClick={() => setToggled((t) => ({ ...t, [g.key]: !open }))}
              title={g.title ? `${g.name}: ${g.title}` : g.name}
            >
              <Icon name="chevron" size={12} />
              <span className="tu-t">{g.name}{g.title && <span className="muted"> · {g.title}</span>}</span>
              {allDone && <span className="tick" aria-label="completed"><Icon name="check" size={13} /></span>}
            </button>
            {open && (
              g.parts.length ? (
                <ul className="tparts">
                  {g.parts.map((p) => (
                    <PartLink
                      key={p.slug}
                      course={outline.slug}
                      part={p}
                      done={done.has(p.slug)}
                      current={p.slug === marker}
                      isPage={p.slug === currentPart}
                      locked={!user && !p.is_preview}
                    />
                  ))}
                </ul>
              ) : (
                <p className="tparts-empty">Parts are on the way.</p>
              )
            )}
          </li>
        )
      })}
    </ul>
  )
}

function ActiveCourse({ course, progress, currentPart, inCourse }: { course: Pick<CourseSummary, 'slug' | 'title'> & Partial<CourseSummary>; progress?: CourseProgress; currentPart: string | null; inCourse: boolean }) {
  const outline = useQuery({ queryKey: ['course', course.slug], queryFn: () => getCourse(course.slug), retry: false })
  return (
    <li className="tc-active">
      <Link to={`/courses/${course.slug}`} className="tc on" title={course.title}>
        <span className="tc-t">{shortTitle(course.title)}</span>
        {progress?.started ? <span className="chip accent">{progress.percent}%</span> : course.part_count === 0 ? <span className="chip">Soon</span> : null}
      </Link>
      {outline.isLoading ? (
        <p className="tparts-empty">Loading units…</p>
      ) : outline.data ? (
        <CourseUnits key={`${course.slug}:${currentPart}`} outline={outline.data} progress={progress} currentPart={currentPart} inCourse={inCourse} />
      ) : null}
    </li>
  )
}

/** "My semester": the saved semester's courses as a tree, with the active course expanded. */
export function SemesterTree() {
  const { complete, ready } = useSyllabus()
  const semester = useSemesterCourses()
  const progress = useAllProgress()
  const route = useRouteCourse()
  const bySlug = new Map((progress.data ?? []).map((p) => [p.course_slug, p]))
  const courses = semester.data ?? []

  // Active course: the one being viewed, else the most recently studied, else the first.
  const recent = [...courses]
    .filter((c) => bySlug.get(c.slug)?.last_seen_at)
    .sort((a, b) => (bySlug.get(b.slug)!.last_seen_at! > bySlug.get(a.slug)!.last_seen_at! ? 1 : -1))[0]
  const activeSlug = route?.slug ?? recent?.slug ?? courses[0]?.slug ?? null
  // Courses of other semesters the student has started ("other courses I'm following").
  const allCourses = useQuery({ queryKey: ['courses', {}], queryFn: () => listCourses(), enabled: complete })
  const others = complete && semester.data
    ? (allCourses.data ?? []).filter((c) => bySlug.get(c.slug)?.started && !courses.some((s) => s.slug === c.slug))
    : []
  const viewingOther = route && !courses.some((c) => c.slug === route.slug)
  const viewingFollowed = !!route && others.some((c) => c.slug === route.slug)
  const routeCourse = useQuery({ queryKey: ['course', route?.slug], queryFn: () => getCourse(route!.slug), enabled: !!viewingOther && !viewingFollowed, retry: false })

  return (
    <>
      {viewingOther && !viewingFollowed && routeCourse.data && (
        <>
          <h3 className="lp-label">This course</h3>
          <ul className="tree">
            <ActiveCourse course={routeCourse.data} progress={bySlug.get(route.slug)} currentPart={route.part} inCourse />
          </ul>
        </>
      )}
      <h3 className="lp-label">My semester</h3>
      {!ready || (complete && semester.isLoading) ? (
        <p className="tparts-empty">Loading…</p>
      ) : !complete ? (
        <p className="tparts-empty">Your semester's courses appear here once your syllabus is set.</p>
      ) : courses.length === 0 ? (
        <p className="tparts-empty">No courses for this semester yet. They are on the way.</p>
      ) : (
        <ul className="tree">
          {courses.map((c) =>
            c.slug === activeSlug ? (
              <ActiveCourse key={c.slug} course={c} progress={bySlug.get(c.slug)} currentPart={route?.slug === c.slug ? route.part : null} inCourse={route?.slug === c.slug} />
            ) : (
              <li key={c.slug}>
                <Link to={`/courses/${c.slug}`} className="tc" title={c.title}>
                  <span className="tc-t">{shortTitle(c.title)}</span>
                  {coursePill(c, bySlug.get(c.slug))}
                </Link>
              </li>
            ),
          )}
        </ul>
      )}
      {others.length > 0 && (
        <>
          <h3 className="lp-label">Other courses I'm following</h3>
          <ul className="tree">
            {others.map((c) =>
              c.slug === route?.slug ? (
                <ActiveCourse key={c.slug} course={c} progress={bySlug.get(c.slug)} currentPart={route.part} inCourse />
              ) : (
                <li key={c.slug}>
                  <Link to={`/courses/${c.slug}`} className="tc" title={c.title}>
                    <span className="tc-t">{shortTitle(c.title)}</span>
                    {coursePill(c, bySlug.get(c.slug))}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </>
      )}
      <Link to="/courses" className="lp-browse"><Icon name="search" size={15} /> Browse all courses</Link>
    </>
  )
}
