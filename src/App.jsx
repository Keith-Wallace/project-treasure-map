import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import CourseList from './components/CourseList'
import CourseDashboard from './pages/CourseDashboard'
import CourseForm from './pages/CourseForm'

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  // Still checking
  if (session === undefined) return null

  // Not logged in → redirect
  if (!session) return <Navigate to="/login" replace />

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard — course list + stats */}
        <Route path="/" element={<ProtectedRoute><CourseDashboard /></ProtectedRoute>} />

        <Route path="/courses" element={<ProtectedRoute><CourseList /></ProtectedRoute>} />

        {/* Add new course */}
        <Route path="/courses/new" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />

        {/* Edit existing course */}
        <Route path="/courses/edit/:id" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<ProtectedRoute><Navigate to="/" replace /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
