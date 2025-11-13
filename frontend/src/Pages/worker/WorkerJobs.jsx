import React, { useEffect, useState } from 'react'
import WorkerNavbar from './components/worker-navbar/WorkerNavbar'
import JobList from './components/JobList'
import JobDetails from './components/JobDetails'
import './WorkerJobs.css'

const WorkerJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/worker/jobs')
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        if (mounted) {
          setJobs(data.jobs || [])
          if (data.jobs && data.jobs.length) setSelectedJobId(data.jobs[0]._id || data.jobs[0].id)
        }
      } catch (err) {
        console.error('Error loading jobs', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const refreshJobs = async () => {
    try {
      const res = await fetch('/api/worker/jobs')
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <WorkerNavbar />
      <div className="worker-jobs-page">
        <JobList jobs={jobs} loading={loading} onSelect={setSelectedJobId} selectedId={selectedJobId} />
        <JobDetails job={jobs.find(j => (j._id || j.id) === selectedJobId)} onChange={refreshJobs} />
      </div>
    </div>
  )
}

export default WorkerJobs
