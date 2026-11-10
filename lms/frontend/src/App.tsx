import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CertificatePage, MyCertificates } from './certificate'
import { AdminLive, LivePage } from './live'
import { AdminHome, CourseEditor, QuizEditor } from './admin'
import { AuthProvider } from './auth'
import { CoursePage } from './course-detail'
import { CoursesPage, LessonPage } from './courses'
import { DashboardHome, DashboardLayout, EnrolledCourses, ProfilePage, QuizAttempts } from './dashboard'
import { AuthLayout } from './auth-ui'
import { Shell } from './layout'
import { ForgotPassword, Home, Login, Register, ResetPassword, VerifyEmail } from './pages'
import { QuizPage, QuizzesPage } from './quiz'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/courses/:slug" element={<CoursePage />} />
              <Route path="/courses/:slug/lessons/:lessonSlug" element={<LessonPage />} />
              <Route path="/courses/:slug/quizzes/:quizSlug" element={<QuizPage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/live" element={<AdminLive />} />
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
      </AuthProvider>
    </QueryClientProvider>
  )
}
