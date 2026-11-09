import { useState, type ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Icon, Logo, type IconName } from './ui'

/** Original illustration for the sign-in panel: our book badge, a lesson card, a quiz result and a progress ring. */
export function BrandArt() {
  return (
    <svg className="auth-art" viewBox="0 0 420 360" role="img" aria-label="A lesson, a passed quiz and course progress">
      <defs>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1e2a44" floodOpacity="0.14" />
        </filter>
      </defs>
      <circle cx="210" cy="175" r="150" className="art-disc" />
      <ellipse cx="150" cy="285" rx="110" ry="40" className="art-ground" />

      {/* scattered pixels, echoing the original logo */}
      {[[58, 70, 10, '#F97316'], [80, 52, 6, '#FBBF24'], [346, 120, 8, '#FBBF24'], [362, 138, 5, '#F97316'], [40, 190, 7, '#FBBF24'], [372, 232, 9, '#F97316'], [96, 318, 6, '#F97316'], [300, 40, 6, '#F97316']].map(([x, y, s, c], i) => (
        <rect key={i} x={x as number} y={y as number} width={s as number} height={s as number} rx="2" fill={c as string} opacity="0.85" />
      ))}

      <image href="/icon-192.png" x="140" y="100" width="140" height="140" />

      {/* lesson card */}
      <g filter="url(#soft)">
        <rect x="262" y="52" width="130" height="62" rx="14" className="art-card" />
        <circle cx="292" cy="83" r="14" fill="#F97316" />
        <path d="M288 76v14l12-7z" fill="#fff" />
        <rect x="314" y="72" width="62" height="7" rx="3.5" className="art-line" />
        <rect x="314" y="86" width="40" height="7" rx="3.5" className="art-line soft" />
      </g>

      {/* quiz result */}
      <g filter="url(#soft)">
        <rect x="32" y="232" width="150" height="46" rx="23" className="art-card" />
        <circle cx="58" cy="255" r="12" fill="#1a7f4b" />
        <path d="m52.5 255.5 4 4 7-8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="78" y="260" className="art-text">Quiz passed · 86%</text>
      </g>

      {/* progress ring */}
      <g filter="url(#soft)">
        <circle cx="338" cy="248" r="36" className="art-card" />
        <circle cx="338" cy="248" r="25" fill="none" className="art-ring-bg" strokeWidth="7" />
        <circle cx="338" cy="248" r="25" fill="none" stroke="#F97316" strokeWidth="7" strokeLinecap="round" strokeDasharray="110 157" transform="rotate(-90 338 248)" />
        <text x="338" y="253" textAnchor="middle" className="art-text strong">70%</text>
      </g>
    </svg>
  )
}

/** Split-screen frame for every sign-in screen: illustration on the left, the form on the right. */
export function AuthLayout() {
  return (
    <div className="auth-split">
      <aside className="auth-aside" aria-hidden="false">
        <BrandArt />
        <div className="auth-welcome">
          <h2>Welcome to<br />Learn With <span>Sateesh</span></h2>
          <p>Syllabus-aligned AI &amp; ML video lessons, practice quizzes and progress tracking for B.Tech students.</p>
        </div>
      </aside>
      <div className="auth-main">
        <Outlet />
      </div>
    </div>
  )
}

/** The right-hand side: logo + "Back to Home", a big title, then the form. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="auth-form-wrap">
      <header className="auth-head">
        <Link to="/" className="auth-logo" aria-label="Learn With Sateesh, home"><Logo height={42} /></Link>
        <Link to="/" className="auth-back">Back to Home</Link>
      </header>
      <h1>{title}</h1>
      {subtitle && <p className="auth-sub">{subtitle}</p>}
      {children}
    </main>
  )
}

export function AuthField({
  label,
  icon,
  ...input
}: { label: string; icon?: IconName } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="afield">
      <span className="alabel">{label}{input.required && <i className="req" aria-hidden="true"> *</i>}</span>
      <span className="input-wrap">
        <input {...input} />
        {icon && <span className="adorn" aria-hidden="true"><Icon name={icon} size={17} /></span>}
      </span>
    </label>
  )
}

/** 0 (empty) to 4 (strong). A hint only: the server enforces the real rule. */
function passwordScore(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++
  return Math.max(s, 1)
}
const STRENGTH = ['', 'Weak', 'Fair', 'Good', 'Strong']

export function PasswordField({
  label,
  showStrength,
  ...input
}: { label: string; showStrength?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)
  const score = showStrength ? passwordScore(String(input.value ?? '')) : 0
  return (
    <div className="afield">
      <label className="alabel" htmlFor={input.name}>{label}{input.required && <i className="req" aria-hidden="true"> *</i>}</label>
      <span className="input-wrap">
        <input id={input.name} {...input} type={show ? 'text' : 'password'} />
        <button type="button" className="adorn eye" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} onClick={() => setShow((v) => !v)}>
          <Icon name={show ? 'eye' : 'eyeOff'} size={17} />
        </button>
      </span>
      {showStrength && (
        <div className="strength" aria-live="polite">
          <div className="segs" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => <span key={i} className={i <= score ? `on s${score}` : ''} />)}
          </div>
          <small>{score ? `Password strength: ${STRENGTH[score]}` : 'Use at least 8 characters.'}</small>
        </div>
      )}
    </div>
  )
}

export function OrDivider() {
  return <p className="divider"><span>Or</span></p>
}
