import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ApiError, sendPartFeedback, type FeedbackKind } from './api'
import { Icon } from './ui'

const KINDS: { value: FeedbackKind; label: string }[] = [
  { value: 'mistake', label: 'A mistake (wrong fact, number, spelling)' },
  { value: 'unclear', label: 'Something is unclear' },
  { value: 'suggestion', label: 'A suggestion' },
  { value: 'other', label: 'Something else' },
]

/** "3:25", "1:02:05" or "205" -> seconds; empty -> null; anything else -> undefined (invalid). */
export function parseVideoTime(text: string): number | null | undefined {
  const t = text.trim()
  if (!t) return null
  if (/^\d{1,5}$/.test(t)) return Number(t)
  const m = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/.exec(t)
  if (!m) return undefined
  return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

/** A signed-in learner reports a mistake or suggests an improvement for this part; the instructor sees it in Admin. */
export function PartFeedbackBox({ course, part }: { course: string; part: string }) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<FeedbackKind>('mistake')
  const [message, setMessage] = useState('')
  const [when, setWhen] = useState('')
  const [badTime, setBadTime] = useState(false)
  const send = useMutation({
    mutationFn: (secs: number | null) =>
      sendPartFeedback(course, part, { kind, message: message.trim(), video_time_seconds: secs }),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const secs = parseVideoTime(when)
    if (secs === undefined) return setBadTime(true)
    setBadTime(false)
    send.mutate(secs)
  }

  if (send.isSuccess) {
    return (
      <section className="panel feedback-box" aria-live="polite">
        <p><Icon name="check" size={16} /> Thank you. Your report was sent to the instructor.</p>
        <button type="button" className="btn ghost small" onClick={() => { send.reset(); setMessage(''); setWhen(''); setOpen(false) }}>
          Send another
        </button>
      </section>
    )
  }
  if (!open) {
    return (
      <p className="feedback-open">
        <button type="button" className="btn ghost small" onClick={() => setOpen(true)}>
          <Icon name="flag" size={15} /> Report a mistake or give feedback
        </button>
      </p>
    )
  }
  return (
    <section className="panel feedback-box">
      <h2 className="step-title">Report a mistake or give feedback</h2>
      <form onSubmit={onSubmit}>
        <label className="field">
          <span>What is it about?</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as FeedbackKind)}>
            {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Tell us what you found</span>
          <textarea
            rows={4}
            required
            minLength={5}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="For example: on the slide about averages, the answer should be 6, not 5."
          />
        </label>
        <label className="field" style={{ maxWidth: 260 }}>
          <span>Where in the video? (optional, like 3:25)</span>
          <input type="text" value={when} onChange={(e) => setWhen(e.target.value)} placeholder="3:25" inputMode="numeric" />
        </label>
        {badTime && <p className="error form-error" role="alert">Write the time like 3:25, or leave it empty.</p>}
        {send.error && (
          <p className="error form-error" role="alert">
            {send.error instanceof ApiError ? send.error.message : 'Could not send. Please try again.'}
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="submit" className="btn" disabled={send.isPending || message.trim().length < 5}>
            {send.isPending ? 'Sending...' : 'Send'}
          </button>
          <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </form>
    </section>
  )
}
