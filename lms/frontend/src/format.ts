/** "1 lesson", "2 lessons". */
export const lessonsWord = (n: number): string => (n === 1 ? 'lesson' : 'lessons')

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
  return [...[...byBook].map(([book, chapters]) => `${book} ch. ${chapters.join(', ')}`), ...other]
}
