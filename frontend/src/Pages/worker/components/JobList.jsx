import React, { useState } from 'react'

const JobList = ({ jobs, loading, onSelect, selectedId }) => {
  const [search, setSearch] = useState('')

  const filtered = (jobs || []).filter(j => {
    const text = JSON.stringify(j).toLowerCase()
    return text.includes(search.toLowerCase())
  })

  return (
    <aside className="job-list-panel">
      <div className="search-container">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search job offers..." />
      </div>
      <div className="jobs-container">
        {loading && <p>Loading...</p>}
        {!loading && filtered.length === 0 && <p>No job offers available.</p>}
        {!loading && filtered.map(job => {
          const id = job._id || job.id
          const title = job.projectName || job.projectName || job.projectName || job.fullName || job.customerDetails?.fullName || 'Untitled'
          return (
            <div key={id} className={`job-card ${selectedId === id ? 'active' : ''}`} onClick={() => onSelect(id)} data-id={id}>
              <span className={`job-type ${job.type || ''}`}>{(job.designRequirements && job.designRequirements.designType) || job.roomType || job.type || ''}</span>
              <h3 className="job-title">{title}</h3>
              <p className="job-budget">{job.additionalDetails?.budget || job.budget || ''}</p>
              <p className="job-summary">{(job.designRequirements && job.designRequirements.specialFeatures) || job.projectDescription || job.projectDescription || ''}</p>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default JobList
