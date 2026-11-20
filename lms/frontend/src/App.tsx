import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CertificatePage, MyCertificates } from './certificate'
import { AuthProvider } from './auth'
import { CoursePage } from './course-detail'
import { CoursesPage } from './courses'
import { DashboardHome, DashboardLayout, EnrolledCourses, ProfilePage, QuizAttempts } from './dashboard'
import { AuthLayout } from './auth-ui'
import { Home } from './landing'
import { Shell } from './layout'
import { PrivacyPage, TermsPage } from './legal'
import { ForgotPassword, Login, Register, ResetPassword, VerifyEmail } from './pages'
import { QuizPage } from './quiz'
import { SyllabusProvider } from './syllabus'

// Loaded on demand: the part page (Markdown renderer), live sessions and the instructor area.
const PartPage = lazy(() => import('./part').then((m) => ({ default: m.PartPage })))
const LivePage = lazy(() => import('./live').then((m) => ({ default: m.LivePage })))
const AdminLive = lazy(() => import('./live').then((m) => ({ default: m.AdminLive })))
const AdminHome = lazy(() => import('./admin').then((m) => ({ default: m.AdminHome })))
const AdminLearners = lazy(() => import('./admin').then((m) => ({ default: m.AdminLearners })))
const CourseEditor = lazy(() => import('./admin').then((m) => ({ default: m.CourseEditor })))
const QuizEditor = lazy(() => import('./admin').then((m) => ({ default: m.QuizEditor })))

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SyllabusProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Shell />}>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/learning" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="courses" element={<EnrolledCourses />} />
                  <Route path="quizzes" element={<QuizAttempts />} />
                  <Route path="certificates" element={<MyCertificates />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="/quizzes" element={<Navigate to="/dashboard/quizzes" replace />} />
                <Route path="/courses/:slug" element={<CoursePage />} />
                <Route path="/courses/:slug/parts/:partSlug" element={<PartPage />} />
                <Route path="/courses/:slug/quizzes/:quizSlug" element={<QuizPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/live" element={<LivePage />} />
                <Route path="/admin" element={<AdminHome />} />
                <Route path="/admin/live" element={<AdminLive />} />
                <Route path="/admin/learners" element={<AdminLearners />} />
                <Route path="/admin/courses/:id" element={<CourseEditor />} />
                <Route path="/admin/quizzes/:id" element={<QuizEditor />} />
              </Route>
              <Route path="/certificates/:code" element={<CertificatePage />} />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify" element={<VerifyEmail />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SyllabusProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
