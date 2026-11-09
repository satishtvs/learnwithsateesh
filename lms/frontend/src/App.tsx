import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import { CoursePage, CoursesPage, LearningPage, LessonPage } from './courses'
import { AuthLayout, Shell } from './layout'
import { Home, Login, Register } from './pages'
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
            </Route>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
