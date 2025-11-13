import React from 'react'

const ProjectList = ({ projects, loading, onSelect, selectedId }) => {
  return (
    <aside className="project-list-panel">
      <div className="project-list-container">
        {loading && <p>Loading...</p>}
        {!loading && projects.length === 0 && <p>No projects found.</p>}
        {!loading && projects.map(p => {
          const id = p._id || p.id
          return (
            <div key={id} className={`project-card ${selectedId === id ? 'active' : ''}`} onClick={() => onSelect(id)}>
              <h3>{p.projectName || p.compName || 'Project'}</h3>
              <p>Status: {p.status}</p>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default ProjectList
