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

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`/api${path}`, { credentials: 'same-origin', ...init })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail)
  }
  return res
}

export interface LessonSummary {
  slug: string
  title: string
  is_preview: boolean
}
export interface CourseSummary {
  slug: string
  title: string
  description: string
  lesson_count: number
  previews: LessonSummary[]
}
export interface CourseOutline extends CourseSummary {
  overview_lessons: LessonSummary[]
  chapters: {
    code: string
    title: string
    unit: string | null
    textbook_ref: string | null
    lessons: LessonSummary[]
  }[]
}
export interface Lesson {
  slug: string
  title: string
  youtube_id: string
  notes_md: string
  slides_url: string | null
  is_preview: boolean
  completed: boolean
  chapter_code: string | null
  chapter_title: string | null
  prev: LessonSummary | null
  next: LessonSummary | null
}

export async function listCourses(): Promise<CourseSummary[]> {
  return (await request('/courses')).json()
}
export async function getCourse(slug: string): Promise<CourseOutline> {
  return (await request(`/courses/${encodeURIComponent(slug)}`)).json()
}
export async function getLesson(course: string, lesson: string): Promise<Lesson> {
  return (await request(`/courses/${encodeURIComponent(course)}/lessons/${encodeURIComponent(lesson)}`)).json()
}

export interface CourseProgress {
  course_slug: string
  course_title: string
  total: number
  completed: number
  percent: number
  started: boolean
  completed_slugs: string[]
  resume: LessonSummary | null
}

export async function getCourseProgress(course: string): Promise<CourseProgress> {
  return (await request(`/courses/${encodeURIComponent(course)}/progress`)).json()
}
export async function getAllProgress(): Promise<CourseProgress[]> {
  return (await request('/progress')).json()
}
export async function setLessonCompleted(course: string, lesson: string, completed: boolean): Promise<CourseProgress> {
  return (
    await request(`/courses/${encodeURIComponent(course)}/lessons/${encodeURIComponent(lesson)}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
  ).json()
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

export async function getProviders(): Promise<{ google: boolean }> {
  return (await request('/auth/providers')).json()
}

/** Starts the Google flow: ask the API for the consent URL, then navigate to it. */
export async function startGoogleLogin(): Promise<void> {
  const { authorization_url } = await (await request('/auth/google/authorize')).json()
  window.location.href = authorization_url
}
