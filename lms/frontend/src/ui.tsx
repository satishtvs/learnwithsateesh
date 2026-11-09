import type { ReactNode } from 'react'

export type IconName =
  | 'home' | 'courses' | 'learning' | 'quiz' | 'award' | 'live' | 'menu' | 'lock' | 'check'
  | 'play' | 'user' | 'logout' | 'x' | 'chevron' | 'clock' | 'sparkle' | 'settings' | 'mail' | 'eye' | 'eyeOff'

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
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /><path d="M3 3l18 18" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
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

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  )
}

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progress'}>
      <div className="bar"><div style={{ width: `${percent}%` }} /></div>
    </div>
  )
}

/** The logo has dark text, so dark mode gets its own light-text version. */
export function Logo({ height }: { height: number }) {
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet="/logo-dark.png" />
      <img src="/logo.png" alt="Learn With Sateesh" height={height} />
    </picture>
  )
}

const COVERS = [
  ['#f97316', '#fbbf24'],
  ['#1e2a44', '#3f5378'],
  ['#0f766e', '#34d399'],
  ['#7c3aed', '#c084fc'],
  ['#be123c', '#fb7185'],
]

/** A deterministic gradient cover per course so cards are easy to tell apart. */
export function Cover({ seed, icon = 'courses' }: { seed: string; icon?: IconName }) {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const [a, b] = COVERS[h % COVERS.length]
  return (
    <div className="cover" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-hidden="true">
      <Icon name={icon} size={34} />
    </div>
  )
}
