import type { ReactNode } from 'react'
import { initialsOf } from './format'

export type IconName =
  | 'home' | 'courses' | 'learning' | 'quiz' | 'award' | 'live' | 'menu' | 'lock' | 'check' | 'play' | 'user'
  | 'logout' | 'x' | 'chevron' | 'chevronLeft' | 'clock' | 'sparkle' | 'settings' | 'mail' | 'eye' | 'eyeOff'
  | 'grid' | 'share' | 'search' | 'arrow' | 'layers' | 'panel' | 'captions' | 'shield' | 'notes' | 'flag'

const PATHS: Record<IconName, ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
  courses: <><path d="M3 5.5C5.5 4.5 9 4.5 12 6.5c3-2 6.5-2 9-1V19c-2.5-1-6-1-9 1-3-2-6.5-2-9-1z" /><path d="M12 6.5V20" /></>,
  learning: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5z" /></>,
  quiz: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m8 9 2 2 3-3" /><path d="M8 15h8" /></>,
  award: <><circle cx="12" cy="9" r="5" /><path d="M8.5 13.5 7 21l5-3 5 3-1.5-7.5" /></>,
  live: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  check: <path d="m5 12.5 5 5 9-10" />,
  play: <path d="M8 5.5v13l11-6.5z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>,
  logout: <><path d="M10 4H5v16h5" /><path d="m15 8 4 4-4 4" /><path d="M19 12H9" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.6 6.8-4.2M8.6 13.4l6.8 4.2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  grid: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /><path d="M3 3l18 18" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>,
  panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>,
  captions: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 10.5a2 2 0 1 0 0 3M16 10.5a2 2 0 1 0 0 3" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>,
  notes: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7M9 7h4" /></>,
}

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}

export function PageHeader({ title, subtitle, eyebrow, children }: { title: string; subtitle?: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  )
}

export function ProgressBar({ percent, label, light = false }: { percent: number; label?: string; light?: boolean }) {
  return (
    <div className={`progress${light ? ' light' : ''}`} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progress'}>
      <div className="bar"><div style={{ width: `${percent}%` }} /></div>
    </div>
  )
}

export function Logo({ height }: { height: number }) {
  return <img src="/logo.png" alt="Learn With Sateesh" height={height} />
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return <p className="muted loading" role="status">{label}</p>
}

/** Placeholder cards while a course grid loads. */
export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid" role="status" aria-label="Loading courses">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton" aria-hidden="true"><div className="sk-tile" /><div className="sk-line" /><div className="sk-line short" /></div>
      ))}
    </div>
  )
}

/** The course tile: initials on a navy-to-orange gradient. */
export function CourseTile({ title, size = 'md' }: { title: string; size?: 'sm' | 'md' | 'lg' }) {
  return <div className={`tile ${size}`} aria-hidden="true">{initialsOf(title)}</div>
}

export function Switch({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <label className={`switch${disabled ? ' disabled' : ''}`}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" aria-hidden="true" />
      <span className="switch-label">{label}{hint && <small> {hint}</small>}</span>
    </label>
  )
}

/** Shown to instructors and admins on learner pages: they see what a student sees, but nothing is recorded. */
export function PreviewBanner() {
  return (
    <p className="preview-banner" role="note">
      <strong>Instructor preview.</strong> You see this page as a student does. Progress, quiz answers and certificates are not
      recorded for instructor accounts. Use a separate student account to study.
    </p>
  )
}
