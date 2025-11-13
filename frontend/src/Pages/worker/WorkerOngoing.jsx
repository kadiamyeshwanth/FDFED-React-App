import React, { useEffect, useState } from 'react'
import WorkerNavbar from './components/worker-navbar/WorkerNavbar'
import ProjectList from './components/ProjectList'
import ProjectDetails from './components/ProjectDetails'
import './WorkerOngoing.css'

const WorkerOngoing = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/worker/ongoing-projects')
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        if (mounted) {
          setProjects(data.projects || [])
          if (data.projects && data.projects.length) setSelectedId(data.projects[0]._id || data.projects[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const refresh = async () => {
    try {
      const res = await fetch('/api/worker/ongoing-projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <WorkerNavbar />
      <div className="worker-ongoing-page">
        <ProjectList projects={projects} loading={loading} onSelect={setSelectedId} selectedId={selectedId} />
        <ProjectDetails project={projects.find(p => (p._id || p.id) === selectedId)} onDone={refresh} />
      </div>
    </div>
  )
}

export default WorkerOngoing
