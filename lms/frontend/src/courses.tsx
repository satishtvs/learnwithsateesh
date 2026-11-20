import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getMatrix, listCourses, type CourseFilters, type CourseProgress, type CourseSummary, type QuizSummary, type Regulation } from './api'
import { SEMESTERS, plural, semLabel, shortTitle } from './format'
import { useAllProgress, useCatalogue, useSyllabus } from './state'
import { CourseTile, Icon, Loading, PageHeader, ProgressBar, SkeletonGrid, Switch } from './ui'

/** The newest regulation already in force this year (used when no regulation is saved). */
function currentRegulation(regs: Regulation[]): string | null {
  const year = new Date().getFullYear()
  return [...regs].reverse().find((r) => (r.joined_year ?? 0) <= year)?.code ?? regs[0]?.code ?? null
}

export function QuizStatus({ q }: { q: Pick<QuizSummary, 'best_percent' | 'passed' | 'pass_percent'> }) {
  if (q.best_percent === null) return <span className="chip">Not taken</span>
  return q.passed ? (
    <span className="chip ok"><Icon name="check" size={12} /> Passed · {q.best_percent}%</span>
  ) : (
    <span className="chip warn">Best {q.best_percent}% · need {q.pass_percent}%</span>
  )
}

/** Branch, regulation and semester pills for a course. */
export function CourseMetaPills({ c, light = false }: { c: CourseSummary; light?: boolean }) {
  const cls = light ? 'chip on-dark' : 'chip'
  return (
    <>
      {c.branches.map((b) => <span key={b.slug} className={cls} title={b.name}>{b.short_name}</span>)}
      {c.regulations.map((r) => <span key={r.code} className={light ? cls : 'chip navy'} title={r.label}>{r.code}</span>)}
      {c.year && c.semester && <span className={cls}>{semLabel(c.year, c.semester)}</span>}
    </>
  )
}

export function CourseCard({ c, progress }: { c: CourseSummary; progress?: CourseProgress }) {
  const counts = [plural(c.unit_count, 'unit'), plural(c.part_count, 'part'), ...(c.quiz_count ? [plural(c.quiz_count, 'quiz', 'quizzes')] : [])]
  return (
    <Link to={`/courses/${c.slug}`} className="card course-card" title={c.title}>
      <CourseTile title={c.title} />
      <div className="cc-body">
        <div className="chips">
          <CourseMetaPills c={c} />
          <span className="chip ok">Free</span>
        </div>
        <h3>{shortTitle(c.title)}</h3>
        {c.subject_code && <p className="cc-code">Subject code {c.subject_code}</p>}
        <p className="cc-counts">{c.part_count === 0 ? 'Parts coming soon' : counts.join(' · ')}</p>
        {progress?.started && (
          <div className="card-progress">
            <ProgressBar percent={progress.percent} label={`${shortTitle(c.title)} progress`} />
            <span>{progress.completed} of {progress.total} parts · {progress.percent}%</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export function CourseGrid({ courses, loading, empty }: { courses: CourseSummary[] | undefined; loading: boolean; empty?: ReactNode }) {
  const progress = useAllProgress()
  const bySlug = new Map((progress.data ?? []).map((p) => [p.course_slug, p]))
  if (loading) return <SkeletonGrid />
  if (!courses?.length) return <>{empty ?? <p className="muted">No courses yet.</p>}</>
  return (
    <div className="grid">
      {courses.map((c) => <CourseCard key={c.slug} c={c} progress={bySlug.get(c.slug)} />)}
    </div>
  )
}

export function LoginGate({ back, title, text }: { back: string; title: string; text: string }) {
  return (
    <div className="empty">
      <Icon name="lock" size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="cta">
        <Link className="btn" to="/register" state={{ from: back }}>Create a free account</Link>
        <Link className="btn ghost" to="/login" state={{ from: back }}>Sign in</Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- the Courses page (search, quick selectors, matrix)
const FILTER_KEYS = ['university', 'regulation', 'branch', 'year', 'semester'] as const
type Filters = { university: string | null; regulation: string | null; branch: string | null; year: number | null; semester: number | null }

function numParam(v: string | null, lo: number, hi: number): number | null {
  const n = Number(v)
  return v && Number.isInteger(n) && n >= lo && n <= hi ? n : null
}

/** Filters live in the URL so a filtered list can be shared. With none in the URL, the saved syllabus applies. */
function useCourseFilters() {
  const [params, setParams] = useSearchParams()
  const { syllabus, complete, showOtherRegs, setShowOtherRegs } = useSyllabus()
  const catalogue = useCatalogue()
  const firstUni = catalogue.data?.universities[0]?.slug ?? null
  const explicit = FILTER_KEYS.some((k) => params.has(k))

  const filters: Filters = explicit
    ? {
        university: params.get('university') || firstUni,
        regulation: params.get('regulation'),
        branch: params.get('branch'),
        year: numParam(params.get('year'), 1, 4),
        semester: numParam(params.get('semester'), 1, 2),
      }
    : complete
      ? { ...syllabus, regulation: showOtherRegs ? null : syllabus.regulation }
      : { university: firstUni, regulation: null, branch: null, year: null, semester: null }
  const q = params.get('q') ?? ''

  const write = (f: Filters, nextQ = q) => {
    const p = new URLSearchParams()
    for (const k of FILTER_KEYS) if (f[k] !== null && f[k] !== '') p.set(k, String(f[k]))
    if (!p.has('university') && f.university === null && firstUni) p.set('university', firstUni)
    if (nextQ.trim()) p.set('q', nextQ)
    setParams(p, { replace: true })
  }
  const update = (patch: Partial<Filters>) => write({ ...filters, ...patch })

  const usingSyllabus =
    complete &&
    filters.university === syllabus.university &&
    filters.branch === syllabus.branch &&
    filters.year === syllabus.year &&
    filters.semester === syllabus.semester &&
    (filters.regulation === syllabus.regulation || filters.regulation === null)

  return { filters, q, write, update, usingSyllabus, complete, syllabus, showOtherRegs, setShowOtherRegs }
}

function SearchBox({ q, onChange }: { q: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(q)
  const [seenQ, setSeenQ] = useState(q)
  if (q !== seenQ) {
    // the search was changed elsewhere (e.g. "Clear the search")
    setSeenQ(q)
    setText(q)
  }
  // Write the search to the URL a moment after typing stops.
  useEffect(() => {
    if (text === q) return
    const t = window.setTimeout(() => onChange(text), 250)
    return () => window.clearTimeout(t)
  }, [text, q, onChange])
  return (
    <form className="search-bar" role="search" onSubmit={(e) => { e.preventDefault(); onChange(text) }}>
      <Icon name="search" size={18} />
      <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Course name or subject code" aria-label="Search courses" />
    </form>
  )
}

function Matrix({ filters, onPick }: { filters: Filters; onPick: (branch: string, year: number, semester: number) => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['matrix', filters.university, filters.regulation],
    queryFn: () => getMatrix(filters.university!, filters.regulation),
    enabled: !!filters.university,
    retry: false,
  })
  if (!filters.university) return null
  if (isLoading) return <Loading label="Loading the semester grid…" />
  if (error || !data) return <p className="muted">The semester grid could not be loaded.</p>
  const count = new Map(data.cells.map((c) => [`${c.branch}/${c.year}-${c.semester}`, c.count]))
  return (
    <div className="matrix-wrap">
      <table className="matrix">
        <caption className="sr-only">Published courses by branch and semester{data.regulation ? `, ${data.regulation}` : ', all regulations'}</caption>
        <thead>
          <tr>
            <td />
            {data.branches.map((b) => <th key={b.slug} scope="col">{b.short_name}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.semesters.map((s) => (
            <tr key={s.key}>
              <th scope="row">{s.label}</th>
              {data.branches.map((b) => {
                const n = count.get(`${b.slug}/${s.key}`) ?? 0
                const sel = filters.branch === b.slug && filters.year === s.year && filters.semester === s.semester
                return (
                  <td key={b.slug}>
                    <button
                      type="button"
                      className={`cell${n === 0 ? ' zero' : n >= 3 ? ' l2' : ' l1'}${sel ? ' sel' : ''}`}
                      aria-pressed={sel}
                      aria-label={`${b.short_name}, ${s.label}: ${n === 0 ? 'no courses yet, coming soon' : plural(n, 'course')}`}
                      onClick={() => onPick(b.slug, s.year, s.semester)}
                    >
                      {n === 0 ? <span className="soon">Soon</span> : n}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CoursesPage() {
  const f = useCourseFilters()
  const { filters, q } = f
  const catalogue = useCatalogue()
  const uni = catalogue.data?.universities.find((u) => u.slug === filters.university) ?? null
  const query: CourseFilters = { ...filters, q }
  const results = useQuery({ queryKey: ['courses', query], queryFn: () => listCourses(query), enabled: !catalogue.isLoading })
  const semKey = filters.year && filters.semester ? `${filters.year}-${filters.semester}` : ''
  const branchName = uni?.branches.find((b) => b.slug === filters.branch)?.short_name
  const summary = [
    uni?.short_name,
    filters.regulation ?? 'all regulations',
    branchName ?? 'all branches',
    semKey ? semLabel(filters.year!, filters.semester!) : 'all semesters',
  ].filter(Boolean).join(' · ')

  return (
    <>
      <PageHeader title="Courses" subtitle="Find your subject by branch and semester. Every course follows the university syllabus unit by unit." />
      <SearchBox q={q} onChange={(v) => f.write(filters, v)} />

      <section className="panel finder" aria-labelledby="finder-h">
        <h2 id="finder-h" className="sr-only">Filters</h2>
        <div className="quick">
          <label className="sel">
            <span>University</span>
            <select value={filters.university ?? ''} onChange={(e) => f.write({ university: e.target.value, regulation: null, branch: null, year: filters.year, semester: filters.semester })}>
              {(catalogue.data?.universities ?? []).map((u) => <option key={u.slug} value={u.slug}>{u.short_name}</option>)}
            </select>
          </label>
          <label className="sel">
            <span>Regulation</span>
            <select value={filters.regulation ?? ''} onChange={(e) => f.update({ regulation: e.target.value || null })}>
              <option value="">All regulations</option>
              {(uni?.regulations ?? []).map((r) => <option key={r.code} value={r.code}>{r.code}</option>)}
            </select>
          </label>
          <label className="sel">
            <span>Branch</span>
            <select value={filters.branch ?? ''} onChange={(e) => f.update({ branch: e.target.value || null })}>
              <option value="">All branches</option>
              {(uni?.branches ?? []).map((b) => <option key={b.slug} value={b.slug}>{b.short_name}</option>)}
            </select>
          </label>
          <label className="sel">
            <span>Year and semester</span>
            <select
              value={semKey}
              onChange={(e) => {
                const [y, s] = e.target.value ? e.target.value.split('-').map(Number) : [null, null]
                f.update({ year: y, semester: s })
              }}
            >
              <option value="">All semesters</option>
              {SEMESTERS.map((s) => <option key={s.label} value={`${s.year}-${s.semester}`}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <div className="switches">
          <Switch
            checked={f.usingSyllabus}
            disabled={!f.complete}
            label="Use my syllabus"
            hint={f.complete ? undefined : '(set it on Home first)'}
            onChange={(v) =>
              v
                ? f.write({ ...f.syllabus, regulation: f.showOtherRegs ? null : f.syllabus.regulation })
                : f.write({ university: filters.university, regulation: filters.regulation, branch: null, year: null, semester: null })
            }
          />
          <Switch
            checked={filters.regulation === null}
            label="Also show other regulations"
            onChange={(v) => {
              f.setShowOtherRegs(v)
              f.update({ regulation: v ? null : (f.syllabus.regulation ?? currentRegulation(uni?.regulations ?? [])) })
            }}
          />
        </div>

        <h3 className="finder-h">Find by branch and semester</h3>
        <p className="muted small">Tap a cell to list its courses; tap it again to clear. Numbers count published courses.</p>
        <Matrix
          filters={filters}
          onPick={(branch, year, semester) =>
            filters.branch === branch && filters.year === year && filters.semester === semester
              ? f.update({ branch: null, year: null, semester: null })
              : f.update({ branch, year, semester })
          }
        />
      </section>

      <section className="block" aria-live="polite">
        <div className="section-row">
          <h2 className="section-title">{results.data ? plural(results.data.length, 'course') : 'Courses'}</h2>
          <span className="muted small">{summary}{q.trim() && ` · “${q.trim()}”`}</span>
        </div>
        <CourseGrid
          courses={results.data}
          loading={results.isLoading || catalogue.isLoading}
          empty={
            <div className="empty">
              <Icon name="search" size={28} />
              <h3>No courses here yet</h3>
              <p>
                {q.trim()
                  ? `Nothing matches “${q.trim()}” with these filters. Try a shorter word or clear the search.`
                  : 'Courses for this branch and semester are coming soon. Try another semester or show all regulations.'}
              </p>
              <div className="cta">
                {q.trim() && <button type="button" className="btn ghost" onClick={() => f.write(filters, '')}>Clear the search</button>}
                <button type="button" className="btn ghost" onClick={() => f.write({ university: filters.university, regulation: null, branch: null, year: null, semester: null }, '')}>Show every course</button>
              </div>
            </div>
          }
        />
      </section>
    </>
  )
}
