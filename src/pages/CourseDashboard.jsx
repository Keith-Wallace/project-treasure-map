import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, deleteCourse } from '../api/courses'
import { supabase } from '../lib/supabase'
import CourseList from '../components/CourseList'
import RollingThreeLogo from '../assets/rolling-three-whitebg-logo.png'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
 
  .dashboard-root {
    min-height: 100vh;
    background: #F5F7FA;
    color: #0D1B4B;
    font-family: 'DM Sans', sans-serif;
    padding: 0;
  }
 
  .dashboard-header {
    border-bottom: 1px solid #DDE2EE;
    padding: 28px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F5F7FA;
    position: sticky;
    top: 0;
    z-index: 10;
  }
 
  .dashboard-logo {
    display: flex;
    align-items: center;
  }
 
  .btn-primary {
    background: #1DC8A8;
    color: #FFFFFF;
    border: none;
    padding: 10px 22px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }
 
  .btn-primary:hover {
    background: #17B398;
    transform: translateY(-1px);
  }
 
  .btn-logout {
    background: transparent;
    border: 1px solid #C8D0E0;
    color: #64748B;
    padding: 10px 18px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
 
  .btn-logout:hover {
    border-color: #EF4444;
    color: #EF4444;
  }
 
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
 
  .dashboard-body {
    max-width: 1100px;
    margin: 0 auto;
    padding: 48px 48px 80px;
  }
 
  .dashboard-title {
    font-family: 'DM Serif Display', serif;
    font-size: 42px;
    font-weight: 400;
    color: #0D1B4B;
    letter-spacing: -1px;
    margin: 0 0 4px;
    line-height: 1.1;
  }
 
  .dashboard-subtitle {
    font-size: 14px;
    color: #64748B;
    font-weight: 300;
    margin: 0 0 40px;
    font-family: 'DM Mono', monospace;
  }
 
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 48px;
  }
 
  .stat-card {
    background: #FFFFFF;
    border: 1px solid #DDE2EE;
    padding: 24px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }
 
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: #1DC8A8;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
 
  .stat-card:hover::before {
    transform: scaleX(1);
  }
 
  .stat-card:hover {
    border-color: #C8D0E0;
  }
 
  .stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #94A3B8;
    margin-bottom: 10px;
  }
 
  .stat-value {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    color: #0D1B4B;
    line-height: 1;
  }
 
  .stat-value.accent {
    color: #1DC8A8;
  }
 
  .stat-sub {
    font-size: 12px;
    color: #94A3B8;
    margin-top: 6px;
    font-weight: 300;
  }
 
  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 20px;
    border-bottom: 1px solid #DDE2EE;
    padding-bottom: 14px;
  }
 
  .section-title {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #64748B;
  }
 
  .section-count {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #94A3B8;
  }
 
  .error-msg {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #DC2626;
    padding: 14px 20px;
    font-size: 13px;
    font-family: 'DM Mono', monospace;
    margin-bottom: 24px;
  }
 
  .loading-state {
    text-align: center;
    padding: 80px 0;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #94A3B8;
    letter-spacing: 0.08em;
  }
 
  .empty-state {
    text-align: center;
    padding: 80px 0;
    border: 1px dashed #C8D0E0;
  }
 
  .empty-state p {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: #C8D0E0;
    margin: 0 0 8px;
  }
 
  .empty-state span {
    font-size: 13px;
    color: #94A3B8;
    display: block;
    margin-bottom: 28px;
  }
`


export default function CourseDashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id)
      setCourses(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (course) => {
    navigate(`/courses/edit/${course.id}`, { state: { course } })
  }

  // Helper: sum credits across course_category_credits rows for one course
  const getCourseCredits = (course) =>
    (course.course_category_credits || [])
      .reduce((sum, c) => sum + parseFloat(c.credits_earned || 0), 0)

  // Compute stats
  const currentYear = new Date().getFullYear()
  const totalCredits = courses.reduce((sum, c) => sum + getCourseCredits(c), 0)
  const creditsThisYear = courses
    .filter(c => new Date(c.completion_date).getFullYear() === currentYear)
    .reduce((sum, c) => sum + getCourseCredits(c), 0)
  const uniqueProviders = new Set(courses.map(c => c.provider).filter(Boolean)).size

  // Format: whole number if no decimal, otherwise 1 decimal place
  const fmt = (val) => val % 1 === 0 ? val : val.toFixed(1)

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">
        <header className="dashboard-header">
          <div className="dashboard-logo">
            <img src={RollingThreeLogo} alt="Rolling Three" height="125" />
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => navigate('/courses/new')}>
              + Add Course
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <main className="dashboard-body">
          <h1 className="dashboard-title">My CPE Dashboard</h1>
          <p className="dashboard-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total Credits</div>
              <div className="stat-value accent">{fmt(totalCredits)}</div>
              <div className="stat-sub">all time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Credits {currentYear}</div>
              <div className="stat-value">{fmt(creditsThisYear)}</div>
              <div className="stat-sub">this year</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Courses Logged</div>
              <div className="stat-value">{courses.length}</div>
              <div className="stat-sub">total entries</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Providers</div>
              <div className="stat-value">{uniqueProviders}</div>
              <div className="stat-sub">unique sources</div>
            </div>
          </div>

          {/* Error */}
          {error && <div className="error-msg">Error: {error}</div>}

          {/* Course List Section */}
          <div className="section-header">
            <span className="section-title">Course History</span>
            <span className="section-count">{courses.length} records</span>
          </div>

          {loading ? (
            <div className="loading-state">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <p>No courses logged yet.</p>
              <span>Start tracking your continuing education credits.</span>
              <button className="btn-primary" onClick={() => navigate('/courses/new')}>
                Add Your First Course
              </button>
            </div>
          ) : (
            <CourseList
              courses={courses}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>
    </>
  )
}