import type { CourseOutline, PartSummary } from './api'

/** "1 part", "2 parts". */
export const partsWord = (n: number): string => (n === 1 ? 'part' : 'parts')

/** plural(1, 'unit') -> "1 unit"; plural(2, 'quiz', 'quizzes') -> "2 quizzes". */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

const ROMAN = ['', 'I', 'II', 'III', 'IV']
/** 3, 1 -> "III-I" */
export const semLabel = (year: number, semester: number) => `${ROMAN[year] ?? year}-${ROMAN[semester] ?? semester}`
export const SEMESTERS: { year: number; semester: number; label: string }[] = [1, 2, 3, 4].flatMap((y) =>
  [1, 2].map((s) => ({ year: y, semester: s, label: semLabel(y, s) })),
)

/** "Machine Learning: JNTUH R22 B.Tech ..." -> "Machine Learning" (the rest is shown as pills). */
export function shortTitle(title: string): string {
  const head = title.split(/:|\s[—–-]\s/)[0].trim()
  return head || title
}

/** "Machine Learning" -> "ML"; "Artificial Intelligence" -> "AI". */
export function initialsOf(text: string): string {
  const words = shortTitle(text).split(/\s+/).filter((w) => /^[A-Za-z]/.test(w) && !/^(and|of|the|for|in|to|a)$/i.test(w))
  return (words.slice(0, 2).map((w) => w[0]).join('') || '?').toUpperCase()
}

/** A person's initials: "Asha Rao" -> "AR". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}

/** "Unit - I" -> "Unit I"; falls back to the unit code. */
export function unitName(u: { code: string; label: string | null }): string {
  return (u.label ?? u.code).replace(/\s*-\s*/, ' ').trim()
}

export interface PartGroup {
  key: string
  name: string
  title: string
  parts: PartSummary[]
}

/** A course's parts in watching order, grouped: "Start here" (parts outside a unit), then each unit. */
export function partGroups(c: CourseOutline): PartGroup[] {
  return [
    ...(c.overview_parts.length ? [{ key: '_start', name: 'Start here', title: '', parts: c.overview_parts }] : []),
    ...c.units.map((u) => ({ key: u.code, name: unitName(u), title: u.title, parts: u.parts })),
  ]
}

/**
 * Collapses references like "AIMA ch. 1", "AIMA ch. 2", "AIMA ch. 26-27" into one entry per book:
 * "AIMA ch. 1, 2, 26-27". Anything that does not fit that shape is kept as it is.
 */
export function groupRefs(refs: string[]): string[] {
  const byBook = new Map<string, string[]>()
  const other: string[] = []
  for (const r of refs) {
    const m = /^(\S.*?) ch\. ([\d-]+)$/.exec(r)
    if (m) byBook.set(m[1], [...(byBook.get(m[1]) ?? []), m[2]])
    else other.push(r)
  }
  return [...[...byBook].map(([book, units]) => `${book} ch. ${units.join(', ')}`), ...other]
}

/** 135 -> "2h 15m", 40 -> "40m". */
export function minutesText(m: number): string {
  const h = Math.floor(m / 60)
  return h ? `${h}h ${m % 60}m` : `${m}m`
}

/** "2h 15m of 7h watched · 3 of 29 quizzes passed" (the quiz part is left out for a course without quizzes). */
export function progressDetail(p: { minutes_watched: number; minutes_total: number; quizzes_passed: number; quizzes_total: number }): string {
  const watched = `${minutesText(p.minutes_watched)} of ${minutesText(p.minutes_total)} watched`
  return p.quizzes_total ? `${watched} · ${p.quizzes_passed} of ${p.quizzes_total} quizzes passed` : watched
}
