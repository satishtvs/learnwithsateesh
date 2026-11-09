import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getCertificate, getMyCertificates, type Certificate } from './api'
import { useAuth } from './auth'
import { Icon } from './ui'

const fmtLong = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

/** Public, printable certificate. Anyone with the code can open it, which is how it is verified. */
export function CertificatePage() {
  const { code = '' } = useParams()
  const { data, isLoading, error } = useQuery({ queryKey: ['certificate', code], queryFn: () => getCertificate(code), retry: false })
  if (isLoading) return <p className='cert-wrap muted'>Loading…</p>
  if (error || !data) {
    return (
      <div className='cert-wrap'>
        <div className='empty'><h3>Certificate not found</h3><p>Check the code and try again.</p><Link className='btn' to='/'>Go to home</Link></div>
      </div>
    )
  }
  return (
    <div className='cert-wrap'>
      <div className='cert-actions no-print'>
        <Link className='btn ghost' to='/dashboard/certificates'>Back</Link>
        <button type='button' className='btn' onClick={() => window.print()}>Print or save as PDF</button>
      </div>
      <article className='cert' aria-label='Certificate of completion'>
        <div className='cert-inner'>
          <img src='/logo.png' alt='Learn With Sateesh' height={56} />
          <p className='cert-kicker'>Certificate of completion</p>
          <p className='cert-small'>This certifies that</p>
          <h1 className='cert-name'>{data.learner_name}</h1>
          <p className='cert-small'>has completed all {data.lesson_count} lessons of</p>
          <h2 className='cert-course'>{data.course_title}</h2>
          <div className='cert-foot'>
            <div><strong>{fmtLong(data.issued_at)}</strong><span>Date issued</span></div>
            <div><strong>Sateesh Kumar Talupuri</strong><span>Instructor, Learn With Sateesh</span></div>
          </div>
          <p className='cert-code'>Certificate ID {data.code} · verify at learnwithsateesh.in/certificates/{data.code}</p>
        </div>
      </article>
    </div>
  )
}

export function MyCertificates() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['certificates', user?.id], queryFn: getMyCertificates, enabled: !!user })
  if (!user) return null
  return (
    <section className='panel'>
      <h2>My certificates</h2>
      {isLoading ? <p className='muted'>Loading…</p> : !data?.length ? (
        <div className='empty plain'>
          <Icon name='award' size={28} />
          <h3>No certificates yet</h3>
          <p>Finish every lesson in a course and you can claim its certificate from the course page.</p>
          <Link className='btn' to='/courses'>Browse courses</Link>
        </div>
      ) : (
        <ul className='rows'>
          {data.map((c: Certificate) => (
            <li key={c.code}>
              <Link className='row' to={`/certificates/${c.code}`}>
                <span className='ico'><Icon name='award' size={18} /></span>
                <span className='t'>{c.course_title}<small>Issued {fmtLong(c.issued_at)} · {c.code}</small></span>
                <Icon name='chevron' size={16} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
