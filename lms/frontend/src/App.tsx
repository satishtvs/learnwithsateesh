import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminHome, CourseEditor, QuizEditor } from './admin'
import { AuthProvider } from './auth'
import { CoursePage, CoursesPage, LearningPage, LessonPage } from './courses'
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
              <Route path="/learning" element={<LearningPage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/courses/:slug" element={<CoursePage />} />
              <Route path="/courses/:slug/lessons/:lessonSlug" element={<LessonPage />} />
              <Route path="/courses/:slug/quizzes/:quizSlug" element={<QuizPage />} />
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/courses/:id" element={<CourseEditor />} />
              <Route path="/admin/quizzes/:id" element={<QuizEditor />} />
            </Route>
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
