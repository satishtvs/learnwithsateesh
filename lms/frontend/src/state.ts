/** Shared hooks: "my syllabus" state, the catalogue, the semester's courses, progress and the current course route. */
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { getAllProgress, getCatalogue, listCourses, type SyllabusFields } from './api'
import { useAuth } from './auth'
import type { University } from './api'

export const LS_SYLLABUS = 'lws.syllabus'
export const LS_OTHER_REGS = 'lws.otherRegulations'

export const EMPTY_SYLLABUS: SyllabusFields = { university: null, regulation: null, branch: null, joined_year: null, year: null, semester: null }

export function readJSON(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
export function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private window or storage blocked: the choice simply is not remembered */
  }
}

const str = (v: unknown) => (typeof v === 'string' && v ? v : null)
const int = (v: unknown, lo: number, hi: number) => (typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi ? v : null)

export function readLocalSyllabus(): SyllabusFields {
  const o = readJSON(LS_SYLLABUS)
  if (!o || typeof o !== 'object') return EMPTY_SYLLABUS
  const r = o as Record<string, unknown>
  return {
    university: str(r.university),
    regulation: str(r.regulation),
    branch: str(r.branch),
    joined_year: int(r.joined_year, 2015, 2035),
    year: int(r.year, 1, 4),
    semester: int(r.semester, 1, 2),
  }
}

export const pickSyllabus = (s: SyllabusFields): SyllabusFields => ({
  university: s.university ?? null,
  regulation: s.regulation ?? null,
  branch: s.branch ?? null,
  joined_year: s.joined_year ?? null,
  year: s.year ?? null,
  semester: s.semester ?? null,
})
export const isEmptySyllabus = (s: SyllabusFields) => Object.values(pickSyllabus(s)).every((v) => v === null)
/** Enough to filter by: university, branch, year and semester. */
export const isComplete = (s: SyllabusFields) => !!(s.university && s.branch && s.year && s.semester)

export interface SyllabusLabels {
  university: University | null
  universityShort: string | null
  regulation: string | null
  branchShort: string | null
  semester: string | null
}

export interface SyllabusCtx {
  syllabus: SyllabusFields
  /** false while the signed-in profile is loading */
  ready: boolean
  complete: boolean
  labels: SyllabusLabels
  save: (s: SyllabusFields) => Promise<void>
  /** Per-browser preference: do not limit lists to the saved regulation. */
  showOtherRegs: boolean
  setShowOtherRegs: (v: boolean) => void
}

export const SyllabusContext = createContext<SyllabusCtx>(null!)
export const useSyllabus = () => useContext(SyllabusContext)

export function useCatalogue() {
  return useQuery({ queryKey: ['catalogue'], queryFn: getCatalogue, staleTime: Infinity })
}

/** The courses of the saved semester (disabled until a syllabus is set). */
export function useSemesterCourses() {
  const { syllabus, complete, showOtherRegs } = useSyllabus()
  const filters = {
    university: syllabus.university,
    regulation: showOtherRegs ? null : syllabus.regulation,
    branch: syllabus.branch,
    year: syllabus.year,
    semester: syllabus.semester,
  }
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => listCourses(filters),
    enabled: complete,
  })
}

/** Where the "Change" link for the syllabus goes: the profile for students, the Home chooser for visitors. */
export function useChangeSyllabusLink(): { to: string; state?: unknown } {
  const { user } = useAuth()
  return user ? { to: '/dashboard/profile#my-syllabus' } : { to: '/', state: { editSyllabus: true } }
}

export function useAllProgress() {
  const { user } = useAuth()
  return useQuery({ queryKey: ['progress'], queryFn: getAllProgress, enabled: !!user, retry: false })
}

/** Where the current route is inside a course, if anywhere. */
export function useRouteCourse(): { slug: string; part: string | null } | null {
  const { pathname } = useLocation()
  const part = matchPath('/courses/:slug/parts/:part', pathname)
  if (part?.params.slug) return { slug: part.params.slug, part: part.params.part ?? null }
  const other = matchPath('/courses/:slug/quizzes/:quiz', pathname) ?? matchPath('/courses/:slug', pathname)
  return other?.params.slug ? { slug: other.params.slug, part: null } : null
}
