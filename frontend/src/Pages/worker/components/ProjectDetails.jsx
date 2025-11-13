import React, { useState } from 'react'

const ProjectDetails = ({ project, onDone }) => {
  const [completeLoading, setCompleteLoading] = useState(false)
  if (!project) return (
    <section className="project-details-panel">
      <div className="empty-state"><h2>No project selected</h2></div>
    </section>
  )

  const id = project._id || project.id
  const type = project.projectType || 'architect'

  async function markComplete() {
    if (!confirm('Mark this project as completed?')) return
    setCompleteLoading(true)
    try {
      const form = new FormData()
      form.append('projectId', id)
      form.append('projectType', type)
      const res = await fetch('/worker/project-complete', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Failed')
      alert('Marked as completed')
      onDone && onDone()
    } catch (err) {
      console.error(err)
      alert('Error: ' + err.message)
    } finally { setCompleteLoading(false) }
  }

  return (
    <section className="project-details-panel">
      <div className="details-header">
        <h2>{project.projectName || project.compName || 'Project'}</h2>
        <p>Status: {project.status}</p>
      </div>
      <div className="details-body">
        <p><strong>Type:</strong> {type}</p>
        <p><strong>Chat ID:</strong> {project.chatId || '—'}</p>
      </div>
      <div className="project-actions">
        <button onClick={markComplete} disabled={completeLoading} className="btn-complete">{completeLoading ? 'Working...' : 'Mark as Completed'}</button>
      </div>
    </section>
  )
}

export default ProjectDetails
