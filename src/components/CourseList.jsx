import { useState } from 'react'

const styles = `
  .course-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
 
  .course-row {
    display: grid;
    grid-template-columns: 1fr 180px 80px 110px 130px;
    align-items: center;
    gap: 16px;
    padding: 18px 20px;
    background: #FFFFFF;
    border: 1px solid #DDE2EE;
    transition: background 0.15s, border-color 0.15s;
    position: relative;
  }
 
  .course-row:hover {
    background: #F5F7FA;
    border-color: #C8D0E0;
  }
 
  .course-row.deleting {
    opacity: 0.4;
    pointer-events: none;
  }
 
  .course-title {
    font-size: 14px;
    font-weight: 500;
    color: #0D1B4B;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
 
  .course-provider {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #64748B;
    margin-top: 3px;
  }
 
  .course-date {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #64748B;
  }
 
  .course-credits {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: #1DC8A8;
    text-align: center;
  }
 
  .course-credits-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
  }
 
  .category-badge {
    display: inline-block;
    background: #EEF1F7;
    border: 1px solid #DDE2EE;
    padding: 3px 8px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #475569;
    letter-spacing: 0.05em;
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
 
  .course-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
 
  .btn-edit {
    background: transparent;
    border: 1px solid #C8D0E0;
    color: #64748B;
    padding: 6px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    letter-spacing: 0.06em;
    transition: border-color 0.15s, color 0.15s;
  }
 
  .btn-edit:hover {
    border-color: #1DC8A8;
    color: #1DC8A8;
  }
 
  .btn-delete {
    background: transparent;
    border: 1px solid #C8D0E0;
    color: #64748B;
    padding: 6px 10px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
 
  .btn-delete:hover {
    border-color: #EF4444;
    color: #EF4444;
    background: #FEF2F2;
  }
 
  /* Confirm delete overlay */
  .confirm-overlay {
    position: absolute;
    inset: 0;
    background: #F5F7FAee;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 5;
    backdrop-filter: blur(2px);
  }
 
  .confirm-text {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #0D1B4B;
    letter-spacing: 0.04em;
  }
 
  .btn-confirm-delete {
    background: #EF4444;
    border: none;
    color: white;
    padding: 7px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    letter-spacing: 0.06em;
    transition: background 0.15s;
  }
 
  .btn-confirm-delete:hover {
    background: #DC2626;
  }
 
  .btn-cancel {
    background: transparent;
    border: 1px solid #C8D0E0;
    color: #64748B;
    padding: 7px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    letter-spacing: 0.06em;
  }
 
  .btn-cancel:hover {
    border-color: #94A3B8;
    color: #475569;
  }
 
  /* List header */
  .course-list-header {
    display: grid;
    grid-template-columns: 1fr 180px 80px 110px 130px;
    gap: 16px;
    padding: 8px 20px 10px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #94A3B8;
  }
 
  .col-right { text-align: right; }
  .col-center { text-align: center; }
`

export default function CourseList({ courses, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const handleDeleteClick = (id) => setConfirmId(id)
  const handleCancel = () => setConfirmId(null)

  const handleConfirmDelete = async (id) => {
    setConfirmId(null)
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const getTotalCredits = (course) => {
    const credits = course.course_category_credits
    if (!credits || credits.length === 0) return '—'
    const total = credits.reduce((sum, c) => sum + parseFloat(c.credits_earned || 0), 0)
    return total % 1 === 0 ? String(total) : total.toFixed(1)
  }

  const getAllCategories = (course) => {
    const credits = course.course_category_credits
    if (!credits || credits.length === 0) return []
    return credits
      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
      .map(c => c.course_categories?.name)
      .filter(Boolean)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="course-list-header">
        <span>Course</span>
        <span>Date</span>
        <span className="col-center">Credits</span>
        <span>Category</span>
        <span className="col-right">Actions</span>
      </div>
      <div className="course-list">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`course-row ${deletingId === course.id ? 'deleting' : ''}`}
          >
            {/* Confirm Delete Overlay */}
            {confirmId === course.id && (
              <div className="confirm-overlay">
                <span className="confirm-text">Delete this course?</span>
                <button className="btn-confirm-delete" onClick={() => handleConfirmDelete(course.id)}>
                  Delete
                </button>
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}

            {/* Course info */}
            <div>
              <div className="course-title">{course.course_title}</div>
              {course.provider && (
                <div className="course-provider">{course.provider}</div>
              )}
            </div>

            <div className="course-date">{formatDate(course.completion_date)}</div>

            <div>
              <div className="course-credits">{getTotalCredits(course)}</div>
              <div className="course-credits-label">credits</div>
            </div>

            <div>
              {getAllCategories(course).length > 0
                ? getAllCategories(course).map((name, i) => (
                    <span key={i} className="category-badge" style={{ marginBottom: 2, display: 'inline-block' }}>
                      {name}
                    </span>
                  ))
                : <span style={{ color: '#2e3344', fontSize: 12 }}>—</span>
              }
            </div>

            <div className="course-actions">
              <button className="btn-edit" onClick={() => onEdit(course)}>Edit</button>
              <button className="btn-delete" onClick={() => handleDeleteClick(course.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
