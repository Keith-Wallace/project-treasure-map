import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { addCourse, updateCourse } from '../api/courses'
import { getCategories } from '../api/categories'
import { supabase } from '../lib/supabase'
import RollingThreeLogo from '../assets/rolling-three-whitebg-logo.png'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
 
  .form-root {
    min-height: 100vh;
    background: #F5F7FA;
    color: #0D1B4B;
    font-family: 'DM Sans', sans-serif;
  }
 
  .form-header {
    border-bottom: 1px solid #DDE2EE;
    padding: 28px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F5F7FA;
  }
 
  .form-header-left {
    display: flex;
    align-items: center;
    gap: 24px;
  }
 
  .back-btn {
    background: transparent;
    border: none;
    color: #64748B;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    cursor: pointer;
    letter-spacing: 0.06em;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.15s;
  }
 
  .back-btn:hover { color: #1DC8A8; }
 
  .form-logo {
    display: flex;
    align-items: center;
  }
 
  .form-body {
    max-width: 680px;
    margin: 0 auto;
    padding: 60px 48px 80px;
  }
 
  .form-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #1DC8A8;
    margin-bottom: 10px;
  }
 
  .form-title {
    font-family: 'DM Serif Display', serif;
    font-size: 38px;
    font-weight: 400;
    letter-spacing: -0.8px;
    color: #0D1B4B;
    margin: 0 0 48px;
    line-height: 1.15;
  }
 
  .field-group {
    margin-bottom: 28px;
  }
 
  .field-label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #64748B;
    margin-bottom: 8px;
  }
 
  .field-required {
    color: #1DC8A8;
    margin-left: 3px;
  }
 
  .field-input,
  .field-select,
  .field-textarea {
    width: 100%;
    background: #FFFFFF;
    border: 1px solid #DDE2EE;
    color: #0D1B4B;
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
    appearance: none;
  }
 
  .field-input:focus,
  .field-select:focus,
  .field-textarea:focus {
    border-color: #1DC8A8;
  }
 
  .field-input::placeholder,
  .field-textarea::placeholder {
    color: #C8D0E0;
  }
 
  .field-select {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748B' stroke-width='1.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 36px;
  }
 
  .field-select option {
    background: #FFFFFF;
  }
 
  .field-textarea {
    resize: vertical;
    min-height: 90px;
  }
 
  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
 
  .field-hint {
    font-size: 12px;
    color: #94A3B8;
    margin-top: 6px;
    font-weight: 300;
  }
 
  .form-divider {
    border: none;
    border-top: 1px solid #DDE2EE;
    margin: 40px 0;
  }
 
  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 40px;
  }
 
  .btn-submit {
    background: #1DC8A8;
    color: #FFFFFF;
    border: none;
    padding: 13px 32px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    min-width: 160px;
  }
 
  .btn-submit:hover:not(:disabled) {
    background: #17B398;
    transform: translateY(-1px);
  }
 
  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
 
  .btn-cancel {
    background: transparent;
    border: 1px solid #C8D0E0;
    color: #64748B;
    padding: 13px 24px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    cursor: pointer;
    letter-spacing: 0.08em;
    transition: border-color 0.15s, color 0.15s;
  }
 
  .btn-cancel:hover {
    border-color: #94A3B8;
    color: #475569;
  }
 
  .error-banner {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #DC2626;
    padding: 14px 20px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    margin-bottom: 32px;
  }
 
  .success-banner {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    color: #16A34A;
    padding: 14px 20px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    margin-bottom: 32px;
  }
`


const EMPTY_FORM = {
  title: '',
  provider: '',
  course_type: '',
  credits: '',
  completion_date: '',
  category_id: '',
  notes: '',
}

export default function CourseForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  // If editing, course data is passed via router state
  const existingCourse = location.state?.course || null
  const isEditing = !!id

  const [form, setForm] = useState(() => {
    if (existingCourse) {
      const creditRow = existingCourse.course_category_credits?.[0]
      return {
        title: existingCourse.course_title || '',
        provider: existingCourse.provider || '',
        course_type: existingCourse.course_type || '',
        credits: creditRow?.credits_earned ?? '',
        completion_date: existingCourse.completion_date?.split('T')[0] || '',
        category_id: creditRow?.category_id || '',
        notes: existingCourse.notes || '',
      }
    }
    return EMPTY_FORM
  })

  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
  getCategories()
    .then(setCategories)
    .catch(err => setError(err.message))
}, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        course_title: form.title.trim(),
        provider: form.provider.trim() || null,
        course_type: form.course_type || null,
        completion_date: form.completion_date || null,
        notes: form.notes.trim() || null,
        user_id: user.id,
        credits: form.credits,
        category_id: form.category_id || null,
      }

      let savedCourse

      if (isEditing) {
        savedCourse = await updateCourse(id, payload)
      } else {
        savedCourse = await addCourse(payload)
      }

      setSuccess(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="form-root">
        <header className="form-header">
          <div className="form-header-left">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back
            </button>
            <div className="form-logo"><img src={RollingThreeLogo} alt="Rolling Three" height="125" /></div>
          </div>
        </header>

        <main className="form-body">
          <div className="form-eyebrow">{isEditing ? 'Edit Record' : 'New Record'}</div>
          <h1 className="form-title">
            {isEditing ? 'Update Course' : 'Log a Course'}
          </h1>

          {error && <div className="error-banner">Error: {error}</div>}
          {success && (
            <div className="success-banner">
              {isEditing ? 'Course updated.' : 'Course logged.'} Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Course Title */}
            <div className="field-group">
              <label className="field-label">
                Course Title <span className="field-required">*</span>
              </label>
              <input
                className="field-input"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Advanced Tax Planning Strategies"
                required
              />
            </div>

            {/* Provider + Date */}
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Provider / Sponsor</label>
                <input
                  className="field-input"
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  placeholder="e.g. AICPA, Becker, Surgent"
                />
              </div>
              <div className="field-group">
                <label className="field-label">
                  Completion Date <span className="field-required">*</span>
                </label>
                <input
                  className="field-input"
                  type="date"
                  name="completion_date"
                  value={form.completion_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Credits + Category */}
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">
                  Credit Hours <span className="field-required">*</span>
                </label>
                <input
                  className="field-input"
                  type="number"
                  name="credits"
                  value={form.credits}
                  onChange={handleChange}
                  placeholder="e.g. 2.0"
                  min="0"
                  step="0.5"
                  required
                />
                <div className="field-hint">Enter in 0.5 increments</div>
              </div>
              <div className="field-group">
                <label className="field-label">Category</label>
                <select
                  className="field-select"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="form-divider" />

            {/* Notes */}
            <div className="field-group">
              <label className="field-label">Notes</label>
              <textarea
                className="field-textarea"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any additional notes about this course..."
              />
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting
                  ? (isEditing ? 'Saving...' : 'Logging...')
                  : (isEditing ? 'Save Changes' : 'Log Course')
                }
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}
