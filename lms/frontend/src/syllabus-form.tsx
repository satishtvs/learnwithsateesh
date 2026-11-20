import { useId, useState, type FormEvent } from 'react'
import { suggestRegulation, type SyllabusFields } from './api'
import { SEMESTERS } from './format'
import { useCatalogue, useSyllabus } from './state'
import { Switch } from './ui'

const THIS_YEAR = new Date().getFullYear()
const JOIN_YEARS = Array.from({ length: Math.min(THIS_YEAR, 2035) - 2015 + 1 }, (_, i) => Math.min(THIS_YEAR, 2035) - i)

/**
 * The "My syllabus" fields: University, Year you joined B.Tech, Regulation (suggested from the year), Branch,
 * Current year and semester. Used by the first-run card on Home and by the profile settings.
 */
interface FormProps {
  submitLabel?: string
  onSaved?: (s: SyllabusFields) => void
  withOtherRegs?: boolean
  compact?: boolean
}

export function SyllabusForm(props: FormProps) {
  const { ready } = useSyllabus()
  // The fields start from the saved syllabus, so wait until the signed-in profile has loaded.
  if (!ready) return <p className="muted">Loading your syllabus…</p>
  return <SyllabusFormFields {...props} />
}

function SyllabusFormFields({ submitLabel = 'Save', onSaved, withOtherRegs = false, compact = false }: FormProps) {
  const id = useId()
  const { syllabus, save, showOtherRegs, setShowOtherRegs } = useSyllabus()
  const catalogue = useCatalogue()
  const universities = catalogue.data?.universities ?? []
  const [form, setForm] = useState<SyllabusFields>(syllabus)
  const [suggested, setSuggested] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  const uniSlug = form.university ?? universities[0]?.slug ?? null
  const uni = universities.find((u) => u.slug === uniSlug) ?? null
  const semKey = form.year && form.semester ? `${form.year}-${form.semester}` : ''

  const set = (patch: Partial<SyllabusFields>) => {
    setForm((f) => ({ ...f, university: f.university ?? uniSlug, ...patch }))
    setState('idle')
  }

  async function onJoined(value: string) {
    const joined = value ? Number(value) : null
    set({ joined_year: joined })
    setSuggested(null)
    if (!joined || !uniSlug) return
    try {
      const code = await suggestRegulation(uniSlug, joined)
      setSuggested(code)
      if (code) setForm((f) => ({ ...f, regulation: code }))
    } catch {
      /* no suggestion; the student picks the regulation */
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const out = { ...form, university: uniSlug }
    if (!out.university || !out.branch || !out.year || !out.semester) {
      setState('error')
      setError('Choose your university, branch, and current year and semester.')
      return
    }
    setState('saving')
    try {
      await save(out)
      setState('saved')
      onSaved?.(out)
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? `Could not save: ${err.message}` : 'Could not save. Please try again.')
    }
  }

  if (catalogue.isLoading) return <p className="muted">Loading the syllabus options…</p>
  if (!universities.length) return <p className="muted">Syllabus options could not be loaded. Please refresh the page.</p>

  return (
    <form className={`syl-form${compact ? ' compact' : ''}`} onSubmit={onSubmit} aria-describedby={`${id}-hint`}>
      <div className="syl-fields">
        <label className="sel">
          <span>University</span>
          <select value={uniSlug ?? ''} onChange={(e) => set({ university: e.target.value, regulation: null, branch: null })}>
            {universities.map((u) => <option key={u.slug} value={u.slug}>{u.short_name}</option>)}
          </select>
        </label>
        <label className="sel">
          <span>Year you joined B.Tech</span>
          <select value={form.joined_year ?? ''} onChange={(e) => onJoined(e.target.value)}>
            <option value="">Choose a year</option>
            {JOIN_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="sel">
          <span>Regulation{suggested && form.regulation === suggested ? ' · suggested' : ''}</span>
          <select value={form.regulation ?? ''} onChange={(e) => set({ regulation: e.target.value || null })}>
            <option value="">Not sure yet</option>
            {(uni?.regulations ?? []).map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
          </select>
        </label>
        <label className="sel">
          <span>Branch</span>
          <select value={form.branch ?? ''} onChange={(e) => set({ branch: e.target.value || null })} required>
            <option value="">Choose a branch</option>
            {(uni?.branches ?? []).map((b) => <option key={b.slug} value={b.slug}>{b.short_name}</option>)}
          </select>
        </label>
        <label className="sel">
          <span>Current year and semester</span>
          <select
            value={semKey}
            required
            onChange={(e) => {
              const [y, s] = e.target.value.split('-').map(Number)
              set({ year: y || null, semester: s || null })
            }}
          >
            <option value="">Choose</option>
            {SEMESTERS.map((s) => <option key={s.label} value={`${s.year}-${s.semester}`}>{s.label} (Year {s.year}, Sem {s.semester})</option>)}
          </select>
        </label>
      </div>
      <p className="muted small" id={`${id}-hint`}>
        {suggested && form.joined_year
          ? `You joined in ${form.joined_year}, so ${suggested} is suggested. `
          : 'Pick the year you joined and we suggest your regulation. '}
        Joined by lateral entry or changed regulation? Pick the one printed on your syllabus book.
      </p>
      {withOtherRegs && (
        <Switch
          checked={showOtherRegs}
          onChange={setShowOtherRegs}
          label="Also show courses from other regulations"
          hint="Saved in this browser."
        />
      )}
      {state === 'error' && <p className="error small" role="alert">{error}</p>}
      <div className="syl-actions">
        <button type="submit" className="btn" disabled={state === 'saving'}>{state === 'saving' ? 'Saving…' : submitLabel}</button>
        {state === 'saved' && <span className="saved small" role="status">Saved</span>}
      </div>
    </form>
  )
}
