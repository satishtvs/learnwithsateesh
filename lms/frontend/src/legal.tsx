import { PageHeader } from './ui'

// The public contact address for privacy requests (shown on the privacy page).
export const CONTACT_EMAIL = 'sateesh.aiml@gmail.com'
const UPDATED = '20 November 2026'

export function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy policy" subtitle={`Learn With Sateesh (learnwithsateesh.in). Last updated ${UPDATED}.`} />
      <article className="panel notes">
        <p>
          Learn With Sateesh is a free learning website with video lessons, quizzes and certificates, run by Sateesh Kumar
          Talupuri. This page explains what information the site keeps about you and why.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account details:</strong> your name and email address, and a password (stored only as a one-way hash, never as plain text). If you sign in with Google, we receive your name and email address from Google. We do not receive your Google password.</li>
          <li><strong>Learning activity:</strong> which parts you have watched or completed, your quiz answers and scores, and the certificates issued to you.</li>
          <li><strong>Technical data:</strong> a sign-in cookie that keeps you logged in, and ordinary server logs (such as IP address and time of request) kept for security and troubleshooting.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To run your account, show your progress and issue your certificates.</li>
          <li>To send emails that you need, such as email verification and password reset.</li>
          <li>To keep the site secure and working.</li>
        </ul>
        <p>We do not sell your data, we do not show advertising, and we do not use your data to build advertising profiles.</p>

        <h2>Videos from YouTube</h2>
        <p>
          The lesson videos are played from YouTube using the privacy-enhanced embed (youtube-nocookie.com). When you play a
          video, YouTube may collect information as described in the{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a> and the{' '}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">YouTube Terms of Service</a>.
        </p>

        <h2>Who can see your data</h2>
        <p>
          Only you and the site administrator can see your account and learning activity. A certificate page is public if
          someone has its certificate code (this is how employers can verify a certificate); it shows your name, the course
          and the completion details, and nothing else from your account. We use hosting and email-delivery providers to run the site; they process data only
          to provide those services.
        </p>

        <h2>Keeping and deleting your data</h2>
        <p>
          We keep your data while your account exists. You can ask us to delete your account and the learning data linked to
          it at any time by writing to the address below; we will do it within a reasonable time.
        </p>

        <h2>Children</h2>
        <p>The site is meant for college students and other adult learners. It is not directed at children under 13.</p>

        <h2>Changes and contact</h2>
        <p>
          If this policy changes, the date at the top of this page changes. Questions or requests about your data:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </article>
    </>
  )
}
