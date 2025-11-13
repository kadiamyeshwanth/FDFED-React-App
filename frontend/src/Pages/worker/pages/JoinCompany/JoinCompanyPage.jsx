import React, { useState, useEffect } from 'react'
import WorkerNavbar from '../../components/worker-navbar/WorkerNavbar'
import CompanyList from './components/CompanyList'
import CompanyModal from './components/CompanyModal'
import ApplicationModal from './components/ApplicationModal'
import OffersTab from './components/OffersTab'
import RequestsTab from './components/RequestsTab'
import '../JoinCompany.css'

const JoinCompanyPage = () => {
  const [user, setUser] = useState(null)
  const [companies, setCompanies] = useState([])
  const [offers, setOffers] = useState([])
  const [jobApplications, setJobApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('join-company')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [isEmployed, setIsEmployed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCompanies, setFilteredCompanies] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const userId = localStorage.getItem('userId') // Assuming user ID is stored in localStorage
        
        // Fetch user profile
        const userRes = await fetch(`/api/workers/${userId}`)
        if (!userRes.ok) throw new Error('Failed to fetch user')
        const userData = await userRes.json()
        setUser(userData)

        // Fetch companies
        const companiesRes = await fetch('/api/worker/companies')
        if (!companiesRes.ok) throw new Error('Failed to fetch companies')
        const companiesData = await companiesRes.json()
        setCompanies(companiesData.companies || [])
        setFilteredCompanies(companiesData.companies || [])

        // Fetch offers
        const offersRes = await fetch('/api/worker/offers')
        if (!offersRes.ok) throw new Error('Failed to fetch offers')
        const offersData = await offersRes.json()
        setOffers(offersData.offers || [])

        // Fetch job applications
        const applicationsRes = await fetch('/api/worker/job-applications')
        if (!applicationsRes.ok) throw new Error('Failed to fetch job applications')
        const applicationsData = await applicationsRes.json()
        setJobApplications(applicationsData.applications || [])

        // Check employment status
        // This can be inferred from offers or from a separate endpoint
        setIsEmployed(false) // Default; adjust based on actual data
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    
    const filtered = companies.filter(company => 
      company.companyName.toLowerCase().includes(query) ||
      company.specialization.some(s => s.toLowerCase().includes(query)) ||
      (company.location.city && company.location.city.toLowerCase().includes(query))
    )
    setFilteredCompanies(filtered)
  }

  const handleViewDetails = (company) => {
    setSelectedCompany(company)
    setShowCompanyModal(true)
  }

  const handleApplyNow = (company) => {
    if (!isEmployed) {
      setSelectedCompany(company)
      setShowApplicationModal(true)
    }
  }

  const handleApplicationSubmit = async (formData) => {
    try {
      const response = await fetch(`/worker_request/${selectedCompany._id}`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      // Refresh job applications
      const applicationsRes = await fetch('/api/worker/job-applications')
      if (applicationsRes.ok) {
        const data = await applicationsRes.json()
        setJobApplications(data.applications || [])
      }

      setShowApplicationModal(false)
      alert('Application submitted successfully!')
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    }
  }

  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await fetch(`/offers/${offerId}/accept`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to accept offer')
      
      // Refresh offers
      const offersRes = await fetch('/api/worker/offers')
      if (offersRes.ok) {
        const offersData = await offersRes.json()
        setOffers(offersData.offers || [])
      }
    } catch (error) {
      console.error('Error accepting offer:', error)
    }
  }

  const handleDeclineOffer = async (offerId) => {
    try {
      const response = await fetch(`/offers/${offerId}/decline`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to decline offer')
      
      // Refresh offers
      const offersRes = await fetch('/api/worker/offers')
      if (offersRes.ok) {
        const offersData = await offersRes.json()
        setOffers(offersData.offers || [])
      }
    } catch (error) {
      console.error('Error declining offer:', error)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div>
      <WorkerNavbar user={user} />
      <div className="container">
        <h1>Join a Company</h1>

        {user && (
          <div className="profile-header">
            <img
              src={user.profileImage || 'https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg'}
              alt={user.name}
              className="profile-image"
            />
            <div className="profile-info">
              <h1>{user.name}</h1>
              <div className="profile-title">
                <p>
                  <strong>{user.professionalTitle}</strong> with {user.experience} years experience
                </p>
              </div>
            </div>
            <a href="/worker/profile-edit">
              <button className="btn btn-outline">Edit Profile</button>
            </a>
          </div>
        )}

        <div className="profile-stats">
          <div className="stat-box">
            <div className="stat-number">{companies.length}</div>
            <div className="stat-label">Companies available to join</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{offers.length}</div>
            <div className="stat-label">Offers received</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{jobApplications.length}</div>
            <div className="stat-label">Join Requests Sent</div>
          </div>
        </div>

        <ul className="nav-tabs">
          <li className="nav-item">
            <a 
              className={`nav-link ${activeTab === 'join-company' ? 'active' : ''}`}
              onClick={() => setActiveTab('join-company')}
            >
              Join a Company
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link ${activeTab === 'accept-offers' ? 'active' : ''}`}
              onClick={() => setActiveTab('accept-offers')}
            >
              Accept Offers
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link ${activeTab === 'join-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('join-requests')}
            >
              Join Requests
            </a>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 'join-company' && (
            <div className="tab-pane active">
              <div className="search-bar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for construction companies by name, projects, or location..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <CompanyList 
                companies={filteredCompanies}
                onViewDetails={handleViewDetails}
                onApplyNow={handleApplyNow}
                isEmployed={isEmployed}
              />
            </div>
          )}

          {activeTab === 'accept-offers' && (
            <div className="tab-pane active">
              <OffersTab 
                offers={offers}
                onAccept={handleAcceptOffer}
                onDecline={handleDeclineOffer}
              />
            </div>
          )}

          {activeTab === 'join-requests' && (
            <div className="tab-pane active">
              <RequestsTab applications={jobApplications} />
            </div>
          )}
        </div>
      </div>

      {showCompanyModal && selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => {
            setShowCompanyModal(false)
            setSelectedCompany(null)
          }}
          onApply={() => {
            setShowCompanyModal(false)
            setShowApplicationModal(true)
          }}
          isEmployed={isEmployed}
        />
      )}

      {showApplicationModal && selectedCompany && (
        <ApplicationModal
          company={selectedCompany}
          user={user}
          onClose={() => {
            setShowApplicationModal(false)
            setSelectedCompany(null)
          }}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  )
}

export default JoinCompanyPage
