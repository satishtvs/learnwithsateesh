import { Link } from 'react-router-dom'
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

export function TermsPage() {
  return (
    <>
      <PageHeader title="Terms and conditions" subtitle={`Learn With Sateesh (learnwithsateesh.in). Last updated ${UPDATED}.`} />
      <article className="panel notes">
        <p>
          By using learnwithsateesh.in (the "site") you agree to these terms. If you do not agree, please do not use the site.
          The site is run by Sateesh Kumar Talupuri ("we", "us").
        </p>

        <h2>What the site offers</h2>
        <p>
          Free video lessons, practice quizzes and completion certificates for engineering courses, starting with Machine
          Learning for JNTUH R22 B.Tech CSE (AI and ML). The lessons are study aids that follow the published syllabus. They
          are not a substitute for your college classes, textbooks or official notes.
        </p>

        <h2>Your account</h2>
        <ul>
          <li>Give correct details and keep your password private. You are responsible for activity on your account.</li>
          <li>One person, one account. Do not share your account or take quizzes on behalf of someone else.</li>
          <li>We may suspend or delete accounts that break these terms or harm the site or other learners.</li>
        </ul>

        <h2>Using the site fairly</h2>
        <ul>
          <li>Do not try to break, overload or gain unauthorised access to the site, or to collect its data automatically.</li>
          <li>Do not cheat on quizzes, or copy the quiz questions and answers to sell or republish them.</li>
          <li>Do not upload or post anything unlawful, abusive or misleading.</li>
        </ul>

        <h2>Our content</h2>
        <p>
          The videos, slides, notes, figures, quizzes and website are owned by Sateesh Kumar Talupuri. You may watch them and
          learn from them for your own personal, non-commercial study, and share the link to a lesson. Please do not copy,
          re-upload, sell or build a product from the content without written permission. The textbooks and papers we refer to
          belong to their authors and publishers; our explanations and examples are our own summaries.
        </p>

        <h2>AI voice</h2>
        <p>The narration in our videos is created with an AI voice made from the instructor's own voice, and this is disclosed on YouTube.</p>

        <h2>Quizzes and certificates</h2>
        <p>
          A certificate of completion shows that you finished the lessons and quizzes of a course on this site. It is issued by
          Learn With Sateesh. It is not a degree, is not issued by any university or board, and does not by itself guarantee
          marks, admission or a job.
        </p>

        <h2>No guarantee, and limits of liability</h2>
        <p>
          We work hard to keep the content correct, but we cannot promise that it is free of mistakes or that it will match
          every exam. The site and the lessons are provided "as they are", free of charge, and may change, pause or stop at any
          time. To the extent the law allows, we are not liable for any loss arising from using the site or relying on its
          content. Nothing here limits any right you have under the law that cannot be limited.
        </p>

        <h2>Privacy</h2>
        <p>
          How we handle your information is explained in our <Link to="/privacy">privacy policy</Link>.
        </p>

        <h2>Changes, law and contact</h2>
        <p>
          We may update these terms; the date at the top shows the latest version, and continuing to use the site means you
          accept the update. These terms are governed by the laws of India. Questions:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </article>
    </>
  )
}
