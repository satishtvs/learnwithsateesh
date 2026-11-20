export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'instructor' | 'admin'
  is_verified: boolean
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Machine codes the auth API returns, in words a learner understands. */
const FRIENDLY: Record<string, string> = {
  REGISTER_USER_ALREADY_EXISTS: 'An account with this email already exists. Try signing in instead.',
  LOGIN_BAD_CREDENTIALS: 'Incorrect email or password.',
  LOGIN_USER_NOT_VERIFIED: 'Please verify your email address first. Check your inbox for the link.',
  RESET_PASSWORD_BAD_TOKEN: 'This reset link is invalid or has expired. Please request a new one.',
  VERIFY_USER_BAD_TOKEN: 'This verification link is invalid or has expired.',
  VERIFY_USER_ALREADY_VERIFIED: 'Your email address is already verified. You can sign in.',
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`/api${path}`, { credentials: 'same-origin', ...init })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') detail = FRIENDLY[body.detail] ?? body.detail
      else if (body.detail && typeof body.detail.reason === 'string') detail = body.detail.reason // e.g. weak password
      else if (Array.isArray(body.detail)) {
        // FastAPI validation errors: show the human message(s), not raw JSON
        detail = body.detail
          .map((d: { msg?: string }) => String(d.msg ?? '').replace(/^Value error, /, ''))
          .filter(Boolean)
          .join('. ')
      } else detail = JSON.stringify(body.detail)
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail)
  }
  return res
}

export interface PartSummary {
  slug: string
  title: string
  is_preview: boolean
}
export interface UniversityRef {
  slug: string
  name: string
  short_name: string
}
export interface RegulationRef {
  code: string
  label: string
}
export interface BranchRef {
  slug: string
  name: string
  short_name: string
}
/** Catalogue metadata on every course (any of it may be empty). */
export interface CourseMeta {
  university: UniversityRef | null
  regulations: RegulationRef[]
  branches: BranchRef[]
  year: number | null
  semester: number | null
  subject_code: string | null
  unit_count: number
  part_count: number
  quiz_count: number
  has_preview: boolean
}
export interface CourseSummary extends CourseMeta {
  slug: string
  title: string
  description: string
  previews: PartSummary[]
}
export interface CourseOutline extends CourseSummary {
  overview_parts: PartSummary[]
  units: {
    code: string
    title: string
    label: string | null
    textbook_ref: string | null
    parts: PartSummary[]
  }[]
}
export interface Part {
  slug: string
  title: string
  youtube_id: string
  notes_md: string
  slides_url: string | null
  is_preview: boolean
  completed: boolean
  quiz_slug: string | null
  unit_code: string | null
  unit_title: string | null
  prev: PartSummary | null
  next: PartSummary | null
}

export interface CourseFilters {
  university?: string | null
  regulation?: string | null
  branch?: string | null
  year?: number | null
  semester?: number | null
  q?: string | null
}

/** Query string for the filters that are set, e.g. "?university=jntuh&year=3". */
export function filterQuery(f: CourseFilters): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(f)) {
    if (v !== null && v !== undefined && String(v).trim() !== '') p.set(k, String(v).trim())
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export async function listCourses(filters: CourseFilters = {}): Promise<CourseSummary[]> {
  return (await request(`/courses${filterQuery(filters)}`)).json()
}

// ---------------------------------------------------------------- catalogue and "my syllabus"
export interface Regulation {
  code: string
  label: string
  joined_year: number | null
}
export interface Branch {
  slug: string
  name: string
  short_name: string
}
export interface University {
  slug: string
  name: string
  short_name: string
  regulations: Regulation[]
  branches: Branch[]
}
export interface Matrix {
  university: string
  regulation: string | null
  branches: { slug: string; short_name: string }[]
  semesters: { key: string; label: string; year: number; semester: number }[]
  cells: { branch: string; year: number; semester: number; count: number }[]
}
export interface SyllabusFields {
  university: string | null
  regulation: string | null
  branch: string | null
  joined_year: number | null
  year: number | null
  semester: number | null
}

export async function getCatalogue(): Promise<{ universities: University[] }> {
  return (await request('/catalogue')).json()
}
export async function getMatrix(university: string, regulation: string | null): Promise<Matrix> {
  return (await request(`/catalogue/matrix${filterQuery({ university, regulation })}`)).json()
}
export async function suggestRegulation(university: string, joinedYear: number): Promise<string | null> {
  const r = await request(`/catalogue/suggest-regulation?university=${encodeURIComponent(university)}&joined_year=${joinedYear}`)
  return (await r.json()).regulation
}
export async function getMySyllabus(): Promise<SyllabusFields> {
  return (await request('/me/syllabus')).json()
}
export async function putMySyllabus(s: SyllabusFields): Promise<SyllabusFields> {
  return (
    await request('/me/syllabus', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    })
  ).json()
}
export async function getCourse(slug: string): Promise<CourseOutline> {
  return (await request(`/courses/${encodeURIComponent(slug)}`)).json()
}
export async function getPart(course: string, part: string): Promise<Part> {
  return (await request(`/courses/${encodeURIComponent(course)}/parts/${encodeURIComponent(part)}`)).json()
}

export interface CourseProgress {
  course_slug: string
  course_title: string
  total: number
  completed: number
  percent: number
  started: boolean
  completed_slugs: string[]
  resume: PartSummary | null
  quizzes_total: number
  quizzes_passed: number
  last_seen_at: string | null
}

export async function getCourseProgress(course: string): Promise<CourseProgress> {
  return (await request(`/courses/${encodeURIComponent(course)}/progress`)).json()
}
export async function getAllProgress(): Promise<CourseProgress[]> {
  return (await request('/progress')).json()
}
export async function setPartCompleted(course: string, part: string, completed: boolean): Promise<CourseProgress> {
  return (
    await request(`/courses/${encodeURIComponent(course)}/parts/${encodeURIComponent(part)}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
  ).json()
}

export interface QuizSummary {
  slug: string
  title: string
  unit_code: string | null
  question_count: number
  pass_percent: number
  best_percent: number | null
  passed: boolean
}
export interface CourseQuiz extends QuizSummary {
  course_slug: string
  course_title: string
}
export interface QuizQuestion {
  id: number
  prompt: string
  options: string[]
}
export interface QuizDetail {
  slug: string
  title: string
  unit_code: string | null
  unit_title: string | null
  pass_percent: number
  questions: QuizQuestion[]
  best_percent: number | null
  passed: boolean
}
export interface QuestionResult {
  question_id: number
  chosen: number | null
  correct_index: number
  correct: boolean
  explanation: string
}
export interface AttemptResult {
  score: number
  total: number
  percent: number
  passed: boolean
  pass_percent: number
  results: QuestionResult[]
}

export interface MyAttempt {
  quiz_slug: string
  quiz_title: string
  course_slug: string
  course_title: string
  score: number
  total: number
  percent: number
  passed: boolean
  created_at: string
}
export async function getMyAttempts(limit = 200): Promise<MyAttempt[]> {
  return (await request(`/me/quiz-attempts?limit=${limit}`)).json()
}
export async function updateMe(fields: { full_name: string }): Promise<User> {
  return (
    await request('/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
  ).json()
}

export async function listAllQuizzes(): Promise<CourseQuiz[]> {
  return (await request('/quizzes')).json()
}
export async function listCourseQuizzes(course: string): Promise<QuizSummary[]> {
  return (await request(`/courses/${encodeURIComponent(course)}/quizzes`)).json()
}
export async function getQuiz(course: string, quiz: string): Promise<QuizDetail> {
  return (await request(`/courses/${encodeURIComponent(course)}/quizzes/${encodeURIComponent(quiz)}`)).json()
}
export async function submitAttempt(
  course: string,
  quiz: string,
  answers: Record<number, number | null>,
): Promise<AttemptResult> {
  return (
    await request(`/courses/${encodeURIComponent(course)}/quizzes/${encodeURIComponent(quiz)}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
  ).json()
}

// ---------------------------------------------------------------- instructor admin
export interface AdminCourse {
  id: number
  slug: string
  title: string
  description: string
  published: boolean
  position: number
  unit_count: number
  part_count: number
  quiz_count: number
}
export interface AdminUnit {
  id: number
  code: string
  title: string
  label: string | null
  textbook_ref: string | null
  position: number
}
export interface AdminPart {
  id: number
  unit_id: number | null
  slug: string
  title: string
  youtube_id: string
  notes_md: string
  slides_url: string | null
  position: number
  published: boolean
  is_preview: boolean
}
export interface AdminQuiz {
  id: number
  course_id: number
  slug: string
  title: string
  unit_id: number | null
  pass_percent: number
  published: boolean
  position: number
  question_count: number
}
export interface AdminQuestion {
  id: number
  position: number
  prompt: string
  options: string[]
  correct_index: number
  explanation: string
}
export interface AdminCourseDetail {
  course: AdminCourse
  units: AdminUnit[]
  parts: AdminPart[]
  quizzes: AdminQuiz[]
}
export interface AdminQuizDetail {
  quiz: AdminQuiz
  questions: AdminQuestion[]
}

async function adminCall<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await request(`/admin${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return (res.status === 204 ? undefined : await res.json()) as T
}

export interface AdminOverview {
  learners: number
  active_7d: number
  parts_completed: number
  attempts: number
  pass_rate: number | null
  courses: { id: number; title: string; published: boolean; learners: number; completions: number; part_count: number }[]
  recent_attempts: { learner: string; quiz_title: string; course_title: string; score: number; total: number; passed: boolean; created_at: string }[]
}

export const admin = {
  liveSessions: () => adminCall<AdminLiveSession[]>('GET', '/live-sessions'),
  saveLive: (id: number | undefined, b: LiveForm) =>
    id === undefined ? adminCall<AdminLiveSession>('POST', '/live-sessions', b) : adminCall<AdminLiveSession>('PUT', `/live-sessions/${id}`, b),
  deleteLive: (id: number) => adminCall<void>('DELETE', `/live-sessions/${id}`),
  overview: () => adminCall<AdminOverview>('GET', '/overview'),
  courses: () => adminCall<AdminCourse[]>('GET', '/courses'),
  course: (id: number) => adminCall<AdminCourseDetail>('GET', `/courses/${id}`),
  createCourse: (b: { title: string; description?: string; slug?: string }) => adminCall<AdminCourse>('POST', '/courses', b),
  updateCourse: (id: number, b: Partial<Pick<AdminCourse, 'title' | 'slug' | 'description' | 'published'>>) =>
    adminCall<AdminCourse>('PATCH', `/courses/${id}`, b),

  createUnit: (course: number, b: { code: string; title: string; label?: string | null; textbook_ref?: string | null }) =>
    adminCall<AdminUnit>('POST', `/courses/${course}/units`, b),
  updateUnit: (id: number, b: Partial<Omit<AdminUnit, 'id' | 'position'>>) => adminCall<AdminUnit>('PATCH', `/units/${id}`, b),
  deleteUnit: (id: number) => adminCall<void>('DELETE', `/units/${id}`),
  moveUnit: (id: number, direction: 'up' | 'down') => adminCall<void>('POST', `/units/${id}/move`, { direction }),

  createPart: (course: number, b: PartForm) => adminCall<AdminPart>('POST', `/courses/${course}/parts`, b),
  updatePart: (id: number, b: Partial<PartForm>) => adminCall<AdminPart>('PATCH', `/parts/${id}`, b),
  deletePart: (id: number) => adminCall<void>('DELETE', `/parts/${id}`),
  movePart: (id: number, direction: 'up' | 'down') => adminCall<void>('POST', `/parts/${id}/move`, { direction }),

  createQuiz: (course: number, b: { title: string; unit_id?: number | null; pass_percent?: number }) =>
    adminCall<AdminQuiz>('POST', `/courses/${course}/quizzes`, b),
  quiz: (id: number) => adminCall<AdminQuizDetail>('GET', `/quizzes/${id}`),
  updateQuiz: (id: number, b: Partial<Pick<AdminQuiz, 'title' | 'unit_id' | 'pass_percent' | 'published'>>) =>
    adminCall<AdminQuiz>('PATCH', `/quizzes/${id}`, b),
  deleteQuiz: (id: number) => adminCall<void>('DELETE', `/quizzes/${id}`),
  moveQuiz: (id: number, direction: 'up' | 'down') => adminCall<void>('POST', `/quizzes/${id}/move`, { direction }),

  createQuestion: (quiz: number, b: QuestionForm) => adminCall<AdminQuestion>('POST', `/quizzes/${quiz}/questions`, b),
  updateQuestion: (id: number, b: Partial<QuestionForm>) => adminCall<AdminQuestion>('PATCH', `/questions/${id}`, b),
  deleteQuestion: (id: number) => adminCall<void>('DELETE', `/questions/${id}`),
  moveQuestion: (id: number, direction: 'up' | 'down') => adminCall<void>('POST', `/questions/${id}/move`, { direction }),
}

export interface PartForm {
  title: string
  youtube: string
  unit_id: number | null
  notes_md: string
  slides_url: string | null
  published: boolean
  is_preview: boolean
}
export interface QuestionForm {
  prompt: string
  options: string[]
  correct_index: number
  explanation: string
}

export async function getMe(): Promise<User | null> {
  try {
    return await (await request('/me')).json()
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null
    throw e
  }
}

export async function login(email: string, password: string): Promise<void> {
  await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  })
}

export async function register(email: string, password: string, full_name: string): Promise<void> {
  await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  })
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' })
}

export async function getProviders(): Promise<{ google: boolean; email: boolean }> {
  return (await request('/auth/providers')).json()
}

const jsonPost = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})
export async function forgotPassword(email: string): Promise<void> {
  await request('/auth/forgot-password', jsonPost({ email }))
}
export async function resetPassword(token: string, password: string): Promise<void> {
  await request('/auth/reset-password', jsonPost({ token, password }))
}
export async function verifyEmail(token: string): Promise<void> {
  await request('/auth/verify', jsonPost({ token }))
}

/** Starts the Google flow: ask the API for the consent URL, then navigate to it. */
export async function startGoogleLogin(): Promise<void> {
  const { authorization_url } = await (await request('/auth/google/authorize')).json()
  window.location.href = authorization_url
}

export interface Certificate {
  code: string
  learner_name: string
  course_slug: string
  course_title: string
  part_count: number
  issued_at: string
}
export async function claimCertificate(course: string): Promise<Certificate> {
  return (await request(`/courses/${encodeURIComponent(course)}/certificate`, { method: 'POST' })).json()
}
export async function getMyCertificates(): Promise<Certificate[]> {
  return (await request('/me/certificates')).json()
}
export async function getCertificate(code: string): Promise<Certificate> {
  return (await request(`/certificates/${encodeURIComponent(code)}`)).json()
}

export interface LiveSession {
  id: number
  title: string
  description: string
  starts_at: string
  duration_minutes: number
  status: 'upcoming' | 'live' | 'past'
  course_slug: string | null
  course_title: string | null
  join_url: string | null
  recording_youtube_id: string | null
}
export interface AdminLiveSession extends LiveSession {
  published: boolean
  course_id: number | null
  join_url_raw: string
}
export interface LiveForm {
  title: string
  description: string
  starts_at: string
  duration_minutes: number
  join_url: string
  recording: string
  course_id: number | null
  published: boolean
}
export async function listLiveSessions(): Promise<LiveSession[]> {
  return (await request('/live-sessions')).json()
}
