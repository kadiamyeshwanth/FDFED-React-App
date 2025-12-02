# Company Portal - Complete Features & Hooks Analysis

## Table of Contents
1. [Company.jsx - Main Router](#1-companyjsx---main-router)
2. [CompanyNavbar - Navigation with Real-time Notifications](#2-companynavbar)
3. [CompanyDashboard - Overview & Analytics](#3-companydashboard)
4. [CompanyBids - Bidding System](#4-companybids)
5. [CompanyOngoing - Project Management](#5-companyongoing)
6. [CompanyProjectRequests - Proposal System](#6-companyprojectrequests)
7. [CompanyRevenue - Financial Dashboard](#7-companyrevenue)
8. [CompanyHiring - Worker Management](#8-companyhiring)
9. [CompanyEmployees - Employee Directory](#9-companyemployees)
10. [CompanySettings - Profile Management](#10-companysettings)
11. [CompanyPublicProfile - Public View](#11-companypublicprofile)
12. [CompanyAddNewProject - Project Updates](#12-companyaddnewproject)

---

## 1. Company.jsx - Main Router

### **Purpose**
Main routing container for the entire company portal. Acts as the layout wrapper with nested routing.

### **React Hooks Used**
- **None directly** (uses React Router v6 components)

### **Key Features**
- ✅ **Nested Routing** - Routes match patterns like `/companydashboard/*`
- ✅ **Layout Structure** - Renders `CompanyNavbar` once for all routes
- ✅ **Route Configuration** - Centralized route definitions
- ✅ **Fallback Route** - Defaults to dashboard if no match

### **React Router Features**
```javascript
<Routes>
  <Route path="*" element={<Routes>...</Routes>} />
</Routes>
```
- `Routes` - Container for route definitions
- `Route` - Individual route mapping
- Nested `Routes` for sub-routing

### **Routing Pattern**
```
/companydashboard/
  ├── companydashboard      → CompanyDashboard
  ├── companybids           → CompanyBids
  ├── companyongoing_projects → CompanyOngoing
  ├── project_requests      → CompanyProjectRequests
  ├── companyrevenue        → CompanyRevenue
  ├── companyhiring         → CompanyHiring
  ├── my-employees          → CompanyEmployees
  ├── companySettings       → CompanySettings
  └── addnewproject         → CompanyAddNewProject
```

---

## 2. CompanyNavbar

### **Purpose**
Persistent navigation bar with real-time notification system for unviewed customer messages.

### **React Hooks Used**

#### **`useState`**
```javascript
const [hasUnviewedComplaints, setHasUnviewedComplaints] = useState(false);
```
- Manages notification badge visibility
- Boolean state for red dot indicator

#### **`useEffect`**
```javascript
useEffect(() => {
  const fetchUnviewedComplaints = async () => { /* ... */ };
  fetchUnviewedComplaints();
  const interval = setInterval(fetchUnviewedComplaints, 30000);
  return () => clearInterval(interval);
}, []);
```
- **Initial fetch** on component mount
- **Polling mechanism** - checks every 30 seconds
- **Cleanup function** - clears interval on unmount
- **Empty dependency array** `[]` - runs once

### **Key Features**
- ✅ **Real-time Notifications** - Polling for new messages
- ✅ **Visual Indicators** - Red badge on "Ongoing Projects" link
- ✅ **Navigation Links** - React Router `Link` components
- ✅ **Settings Access** - Gear icon for quick settings
- ✅ **Responsive Layout** - Flexbox navigation

### **Advanced Patterns**
```javascript
const interval = setInterval(fetchUnviewedComplaints, 30000);
return () => clearInterval(interval); // Cleanup to prevent memory leaks
```

### **API Integration**
- Endpoint: `/api/company/unviewed-customer-messages`
- Method: GET
- Credentials: include (cookies)
- Response: `{ unviewedByProject: [{_id, count}] }`

---

## 3. CompanyDashboard

### **Purpose**
Main dashboard showing statistics, recent bids, projects timeline with progress tracking.

### **React Hooks Used**

#### **`useState`** (Multiple States)
```javascript
const [data, setData] = useState({
  activeProjects: 0,
  completedProjects: 0,
  revenue: 0,
  bids: [],
  projects: [],
  calculateProgress: () => 0,
  calculateDaysRemaining: () => 0,
});
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showModal, setShowModal] = useState(false);
const [selectedBid, setSelectedBid] = useState(null);
```

**State Organization:**
- **Aggregate data** - Complex object with stats and helper functions
- **UI states** - loading, error, modal visibility
- **Selection state** - Currently selected bid for modal

#### **`useEffect`** (Data Fetching)
```javascript
useEffect(() => {
  const fetchData = async () => {
    // Fetch, transform, set state
  };
  fetchData();
}, []); // Run once on mount
```

### **Key Features**
- ✅ **Statistics Dashboard** - Active/completed projects, revenue
- ✅ **Bids Management** - View and accept bids
- ✅ **Timeline View** - Visual project progress bars
- ✅ **Modal System** - Bid review with proposal input
- ✅ **Date Calculations** - Progress percentage and days remaining
- ✅ **Budget Validation** - Cannot exceed customer's budget

### **Advanced Calculations**
```javascript
const calculateProgress = (startDate, timeline) => {
  const totalMonths = parseInt(timeline, 10);
  const start = new Date(startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + totalMonths);
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsedDuration = now.getTime() - start.getTime();
  return Math.floor((elapsedDuration / totalDuration) * 100);
};
```

### **Component Composition**
- `DashboardStats` - Statistics cards
- `BidsList` - Recent bidding opportunities
- `ProjectsList` - Pending projects
- `TimelineProjects` - Active projects with progress
- `BidReviewModal` - Bid submission modal

---

## 4. CompanyBids

### **Purpose**
Two-tab system: Place bids on projects and track bid statuses.

### **React Hooks Used**

#### **`useState`** (Complex State Management)
```javascript
const [activeTab, setActiveTab] = useState("place-bid");
const [bids, setBids] = useState([]);
const [companyBids, setCompanyBids] = useState([]);
const [selectedBid, setSelectedBid] = useState(null);
const [bidAmount, setBidAmount] = useState("");
const [alert, setAlert] = useState(null);
const [expanded, setExpanded] = useState(new Set());
```

**State Types:**
- **Tab state** - Active view controller
- **Data arrays** - Available bids, company's bids
- **Form state** - Bid amount input
- **UI state** - Alerts, expansions
- **Set state** - Efficient floor plan expand/collapse tracking

#### **`useRef`**
```javascript
const formRef = useRef(null);
```
- Reference to form DOM element
- Used for scrolling or direct manipulation

#### **`useSearchParams`** (React Router)
```javascript
const [searchParams, setSearchParams] = useSearchParams();
const bidId = searchParams.get("bidId");
```
- Manage URL query parameters
- Deep linking to specific bids
- Alert messages via URL params

#### **`useEffect`** (Multiple)

**Effect 1: Alert Handling**
```javascript
useEffect(() => {
  const success = searchParams.get("success");
  const error = searchParams.get("error");
  if (success === "bid_submitted") {
    setAlert({ type: "success", msg: "..." });
  }
  // Clean up URL params
  setSearchParams(p => { p.delete("success"); return p; });
}, [searchParams, setSearchParams]);
```

**Effect 2: Data Loading**
```javascript
useEffect(() => {
  const load = async () => {
    const res = await fetch("...");
    const data = await res.json();
    setBids(data.bids);
    
    // Auto-select bid from URL
    const bidId = searchParams.get("bidId");
    if (bidId) {
      const found = data.bids.find(b => b._id === bidId);
      setSelectedBid(found);
    }
  };
  load();
}, [searchParams]);
```

### **Key Features**
- ✅ **Two-Tab Interface** - Place bids vs Track status
- ✅ **URL State Management** - Deep linking to bids
- ✅ **Budget Validation** - Cannot exceed estimated budget
- ✅ **Floor Plan Expansion** - Set-based toggle for multiple items
- ✅ **Alert System** - Success/error messages from URL
- ✅ **Real-time Updates** - Auto-refresh after bid submission

### **Advanced Patterns**

**Set-based State for Expansion**
```javascript
const toggleFloor = (bidId) => {
  setExpanded(prev => {
    const n = new Set(prev);
    n.has(bidId) ? n.delete(bidId) : n.add(bidId);
    return n;
  });
};
```
- More efficient than array for lookups
- Immutable state updates

**URL-driven Selection**
```javascript
const selectBid = (bid) => {
  setSelectedBid(bid);
  setSearchParams({ bidId: bid._id }); // Update URL
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

---

## 5. CompanyOngoing

### **Purpose**
Comprehensive project management with milestone tracking, customer communication, and complaint system.

### **React Hooks Used**

#### **`useState`** (Extensive State)
```javascript
const [projects, setProjects] = useState([]);
const [metrics, setMetrics] = useState(null);
const [filter, setFilter] = useState("all");
const [expandedDetails, setExpandedDetails] = useState({});
const [expandedUpdates, setExpandedUpdates] = useState({});
const [showComplaintModal, setShowComplaintModal] = useState(null);
const [complaintText, setComplaintText] = useState({});
const [unviewedComplaints, setUnviewedComplaints] = useState({});
```

**State Patterns:**
- **Object-based expansions** - `{ projectId: boolean }`
- **String modal identifier** - `"${projectId}_${milestone}"`
- **Nested text storage** - Multiple complaints by key

#### **`useNavigate`** (React Router)
```javascript
const navigate = useNavigate();
// Later: navigate("/some-path");
```

#### **`useEffect`** (Compound Data Loading)
```javascript
useEffect(() => {
  const fetchData = async () => {
    // Fetch projects
    const res = await fetch("...");
    const data = await res.json();
    setProjects(data.projects);
    
    // Fetch unviewed complaints
    try {
      const complaintsRes = await fetch("...");
      const complaintsData = await complaintsRes.json();
      const complaintsMap = {};
      complaintsData.unviewedByProject.forEach(item => {
        complaintsMap[item._id] = item.count;
      });
      setUnviewedComplaints(complaintsMap);
    } catch (err) { /* ... */ }
  };
  fetchData();
}, []);
```

**Pattern:** Multiple API calls in single effect

### **Key Features**
- ✅ **Project Filtering** - All/Finished/Pending
- ✅ **Expandable Sections** - Details and updates (mutual exclusion)
- ✅ **Milestone Tracking** - Visual checkpoints with approval status
- ✅ **Complaint System** - Company-to-customer messaging
- ✅ **Read Status Tracking** - Mark messages as viewed
- ✅ **Metrics Dashboard** - Aggregate statistics
- ✅ **Date Formatting** - Localized date display

### **Advanced Patterns**

**Mutual Exclusion Toggle**
```javascript
const toggleDetails = (id) => {
  setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  setExpandedUpdates(prev => ({ ...prev, [id]: false })); // Close other
};

const toggleUpdates = (id) => {
  setExpandedUpdates(prev => ({ ...prev, [id]: !prev[id] }));
  setExpandedDetails(prev => ({ ...prev, [id]: false })); // Close other
};
```

**Optimistic UI Updates**
```javascript
const toggleUpdates = async (id) => {
  // Clear notification immediately
  setUnviewedComplaints(prev => {
    const updated = { ...prev };
    delete updated[id];
    return updated;
  });
  
  try {
    await fetch(`/api/mark-messages-viewed/${id}`, { method: 'POST' });
  } catch (err) {
    // Restore on failure
    setUnviewedComplaints(prev => ({ ...prev, [id]: 1 }));
  }
};
```

---

## 6. CompanyProjectRequests

### **Purpose**
View customer project submissions and respond with proposals or rejections.

### **React Hooks Used**

#### **`useState`** (Form & Modal Management)
```javascript
const [projects, setProjects] = useState([]);
const [selectedProject, setSelectedProject] = useState(null);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [showProposalModal, setShowProposalModal] = useState(false);
const [maxBudget, setMaxBudget] = useState(0);
const [proposalData, setProposalData] = useState({
  projectId: "",
  price: "",
  description: "",
});
const [proposalErrors, setProposalErrors] = useState({});
```

#### **`useEffect`** (Auto-fetch)
```javascript
useEffect(() => {
  fetchProjects();
}, []);
```

### **Key Features**
- ✅ **Project Cards** - Visual project list
- ✅ **Detailed Modals** - Full project information
- ✅ **Proposal System** - Submit price and scope
- ✅ **Validation** - Real-time form validation
- ✅ **Budget Constraints** - Cannot exceed customer budget
- ✅ **Minimum Price** - ₹10,000 threshold
- ✅ **Character Limits** - Scope of work validation
- ✅ **Status Tracking** - Pending/Accepted/Rejected/Proposal Sent

### **Validation Functions**
```javascript
const validatePrice = (price) => {
  const numPrice = parseFloat(price) || 0;
  const errors = {};
  
  if (numPrice < 10000) {
    errors.price = "Price must be at least ₹10,000";
  } else if (maxBudget > 0 && numPrice > maxBudget) {
    errors.price = `Must be ≤ ₹${maxBudget}`;
  }
  
  return errors;
};

const validateDescription = (desc) => {
  const errors = {};
  if (desc.trim().length < 10) {
    errors.description = "Minimum 10 characters";
  }
  return errors;
};
```

**Pattern:** Separate validation functions for reusability

### **Real-time Validation**
```javascript
const handleProposalChange = (e) => {
  const { name, value } = e.target;
  setProposalData(prev => ({ ...prev, [name]: value }));
  
  // Clear error as user types
  if (proposalErrors[name]) {
    setProposalErrors(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }
};
```

---

## 7. CompanyRevenue

### **Purpose**
Financial dashboard showing revenue metrics, project earnings, and payment tracking.

### **React Hooks Used**

#### **`useState`**
```javascript
const [projects, setProjects] = useState([]);
const [metrics, setMetrics] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [selectedProject, setSelectedProject] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
```

#### **`useEffect`**
```javascript
useEffect(() => {
  const fetchData = async () => {
    const res = await fetch("/api/companyrevenue");
    const data = await res.json();
    setProjects(data.projects);
    setMetrics(data.metrics);
  };
  fetchData();
}, []);
```

### **Key Features**
- ✅ **Revenue Metrics** - Total/Pending/Received
- ✅ **Projects Table** - Sortable revenue data
- ✅ **Sidebar Statistics** - Quick stats overview
- ✅ **Detail Modal** - Individual project finances
- ✅ **Currency Formatting** - Intl.NumberFormat
- ✅ **Date Calculations** - End date computation
- ✅ **Status Indicators** - Visual payment status

### **Helper Functions**
```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN");
};

const calculateEndDate = (project) => {
  if (project.status === "completed") {
    return formatDate(project.updatedAt);
  }
  const endDate = new Date(project.createdAt);
  endDate.setMonth(endDate.getMonth() + parseInt(project.projectTimeline));
  return formatDate(endDate);
};
```

**Pattern:** Centralized formatting functions passed to children

---

## 8. CompanyHiring

### **Purpose**
Three-tab system for finding workers, managing applications, and tracking hire requests.

### **React Hooks Used**

#### **`useState`** (Complex Filtering State)
```javascript
const [activeTab, setActiveTab] = useState("find-workers");
const [workers, setWorkers] = useState([]);
const [workerRequests, setWorkerRequests] = useState([]);
const [requestedWorkers, setRequestedWorkers] = useState([]);
const [profileModalWorker, setProfileModalWorker] = useState(null);
const [hireModalOpen, setHireModalOpen] = useState(false);
const [hireForm, setHireForm] = useState({
  position: "",
  location: "",
  salary: "",
  workerId: "",
  workerName: ""
});
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
```

#### **`useEffect`** (Mount-only Fetch)
```javascript
useEffect(() => {
  let mounted = true;
  fetch("/api/companyhiring")
    .then(res => res.json())
    .then(data => {
      if (!mounted) return; // Prevent state update if unmounted
      setWorkers(data.workers);
    });
  return () => { mounted = false; }; // Cleanup
}, []);
```

**Pattern:** Prevent state updates after unmount

#### **`useMemo`** (Performance Optimization)
```javascript
const filteredWorkers = useMemo(() => {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return workers;
  return workers.filter(w => {
    const name = (w.name || "").toLowerCase();
    const skills = (w.specialties || []).join(" ").toLowerCase();
    return name.includes(q) || skills.includes(q);
  });
}, [workers, searchTerm]);
```

**Why useMemo?**
- Expensive filtering operation
- Only recomputes when dependencies change
- Prevents unnecessary re-renders

#### **`useCallback`** (Debounced Search)
```javascript
function useDebounced(fn, wait = 300) {
  const timeoutRef = React.useRef(null);
  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fn(...args), wait);
  }, [fn, wait]);
}

const debouncedSearch = useDebounced((v) => setSearchTerm(v), 250);
```

**Custom Hook Pattern:**
- `useRef` for timeout storage
- `useCallback` for stable function reference
- Debouncing prevents excessive state updates

### **Key Features**
- ✅ **Three Tabs** - Find/Requests/Requested
- ✅ **Debounced Search** - Performance optimization
- ✅ **Memoized Filtering** - Efficient re-renders
- ✅ **Status Filtering** - All/Accepted/Pending/Rejected
- ✅ **Profile Modal** - Worker details
- ✅ **Hire Modal** - Send job offers
- ✅ **Form Validation** - Position, location, salary
- ✅ **Request Management** - Accept/reject applications

### **Advanced Patterns**

**Multi-field Search**
```javascript
return workers.filter(w => {
  const searchable = [
    w.name,
    w.email,
    ...w.specialties
  ].join(" ").toLowerCase();
  return searchable.includes(searchTerm);
});
```

**Compound Filtering**
```javascript
const filteredRequestedWorkers = useMemo(() => {
  return requestedWorkers.filter(r => {
    const statusMatch = statusFilter === "all" || r.status === statusFilter;
    const searchMatch = !searchTerm || 
      `${r.worker?.name} ${r.positionApplying}`.includes(searchTerm);
    return statusMatch && searchMatch;
  });
}, [requestedWorkers, searchTerm, statusFilter]);
```

---

## 9. CompanyEmployees

### **Purpose**
Simple employee directory showing current hires.

### **React Hooks Used**

#### **`useState`**
```javascript
const [employees, setEmployees] = useState([]);
const [loading, setLoading] = useState(true);
```

#### **`useEffect`**
```javascript
useEffect(() => {
  fetch("/api/my-employees", { credentials: "include" })
    .then(res => res.json())
    .then(data => setEmployees(data.employees || []))
    .finally(() => setLoading(false));
}, []);
```

### **Key Features**
- ✅ **Employee Cards** - Grid layout
- ✅ **Loading State** - Skeleton/spinner
- ✅ **Empty State** - No employees message
- ✅ **Component Composition** - Separated into sub-components

### **Component Structure**
```
CompanyEmployees
├── EmployeesHeader
├── LoadingOrEmpty
└── EmployeesGrid
    └── EmployeeCard (mapped)
```

---

## 10. CompanySettings

### **Purpose**
Comprehensive company profile management with worker and customer profiles.

### **React Hooks Used**

#### **`useState`** (Complex Nested State)
```javascript
const [company, setCompany] = useState({
  workerProfile: { name: "", location: "", ... },
  customerProfile: { name: "", completedProjects: [], ... }
});
const [activeSection, setActiveSection] = useState("profile");
const [editingWorker, setEditingWorker] = useState(false);
const [editingCustomer, setEditingCustomer] = useState(false);
const [workerForm, setWorkerForm] = useState({ ... });
const [customerForm, setCustomerForm] = useState({ ... });
```

#### **`useRef`** (File Input Management)
```javascript
const projectFileInputs = useRef([]);
const certificateFileInputs = useRef([]);
```

**Why refs for files?**
- Files can't be stored in state (not serializable)
- Direct DOM access for FormData appending
- Avoid unnecessary re-renders

#### **`useEffect`** (Data Initialization)
```javascript
useEffect(() => {
  fetchCompany();
}, []);

async function fetchCompany() {
  const res = await fetch("/api/companysettings");
  const data = await res.json();
  setCompany(data.company);
  
  // Initialize forms from server data
  setWorkerForm({
    companyName: data.company.workerProfile.name,
    specializations: data.company.workerProfile.specializations.join(", "),
    // ...
  });
  
  // Initialize file refs
  projectFileInputs.current = data.company.customerProfile.completedProjects
    .map(() => ({ before: null, after: null }));
}
```

### **Key Features**
- ✅ **Sidebar Navigation** - Profile/Security/Help
- ✅ **Dual Profiles** - Worker & Customer tabs
- ✅ **Edit Modes** - Display ↔ Edit toggle
- ✅ **Dynamic Arrays** - Openings, projects
- ✅ **File Uploads** - Images, certificates
- ✅ **Image Previews** - FileReader for base64
- ✅ **FormData** - Multipart uploads
- ✅ **Validation** - Client-side checks
- ✅ **Password Change** - Security section

### **Advanced File Handling**

**Image Preview with FileReader**
```javascript
function handleBeforeImageChange(e, idx) {
  const file = e.target.files[0];
  projectFileInputs.current[idx].before = file;
  
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      updateProject(idx, "beforeImage", reader.result); // Base64 for preview
    };
    reader.readAsDataURL(file);
  }
}
```

**FormData Construction**
```javascript
const fd = new FormData();
fd.append("profileType", "customer");
fd.append("projectsCompleted", customerForm.projectsCompleted);
fd.append("completedProjects", JSON.stringify(projectsPayload));

// Append files with custom names
projectFileInputs.current.forEach((files, idx) => {
  if (files.before) {
    fd.append("projectBeforeImages", files.before, 
      `project_before_${idx}.${files.before.name.split('.').pop()}`);
  }
});
```

### **Component Refactoring**
Now broken into smaller components:
- `SettingsSidebar` - Navigation
- `ProfileSection` - Tab container
- `WorkerProfileDisplay` / `WorkerProfileForm`
- `CustomerProfileDisplay` / `CustomerProfileForm`
- `SecuritySection` - Password management
- `HelpSection` - FAQ

---

## 11. CompanyPublicProfile

### **Purpose**
Public-facing company profile for customers to view before hiring.

### **React Hooks Used**

#### **`useState`**
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [companyData, setCompanyData] = useState(null);
```

#### **`useEffect`**
```javascript
useEffect(() => {
  fetchCompanyProfile();
}, []);
```

### **Key Features**
- ✅ **Public View** - Read-only profile
- ✅ **Profile Header** - Company info
- ✅ **About Section** - Company description
- ✅ **Specializations** - Skills/services
- ✅ **Team Members** - Employee showcase
- ✅ **Completed Projects** - Portfolio with images
- ✅ **Did You Know** - Interesting facts
- ✅ **Loading States** - Spinner and error handling

### **Component Structure**
```
CompanyPublicProfile
├── ProfileHeader
├── AboutSection
├── Specializations
├── TeamMembers
└── CompletedProjects
```

---

## 12. CompanyAddNewProject

### **Purpose**
Complex form for updating project progress with milestone tracking and customer approval workflow.

### **React Hooks Used**

#### **`useState`** (Extensive Form State)
```javascript
const [completionPercentage, setCompletionPercentage] = useState(0);
const [selectedMilestone, setSelectedMilestone] = useState("");
const [milestoneMessage, setMilestoneMessage] = useState("");
const [showMilestoneInput, setShowMilestoneInput] = useState(false);
const [targetCompletionDate, setTargetCompletionDate] = useState("");
const [currentPhase, setCurrentPhase] = useState("");
const [mainImage, setMainImage] = useState(null);
const [additionalImages, setAdditionalImages] = useState([]);
const [completionImages, setCompletionImages] = useState([]);
const [existingMilestones, setExistingMilestones] = useState([]);
const [maxCompletedMilestone, setMaxCompletedMilestone] = useState(0);
const [nextCheckpoint, setNextCheckpoint] = useState(25);
const [revisionMode, setRevisionMode] = useState(false);
const [customerFeedback, setCustomerFeedback] = useState("");
const [conversationHistory, setConversationHistory] = useState([]);
const [errors, setErrors] = useState([]);
```

#### **`useSearchParams`** (URL State)
```javascript
const [searchParams] = useSearchParams();
const projectId = searchParams.get("projectId");
const updateCheckpoint = searchParams.get("updateCheckpoint");
```

#### **`useNavigate`**
```javascript
const navigate = useNavigate();
// After success:
navigate("/companydashboard/companyongoing_projects");
```

#### **`useEffect`** (Complex Data Loading)
```javascript
useEffect(() => {
  const loadProject = async () => {
    const res = await fetch("/api/companyongoing_projects");
    const json = await res.json();
    const found = json.projects.find(p => p._id === projectId);
    
    if (found) {
      setCompletionPercentage(found.completionPercentage);
      setExistingMilestones(found.milestones);
      
      // Calculate next checkpoint
      const approvedCheckpoints = found.milestones
        .filter(m => m.isCheckpoint && m.isApprovedByCustomer)
        .map(m => m.percentage);
      const lastApproved = Math.max(...approvedCheckpoints, 0);
      const next = [25, 50, 75, 100].find(c => c > lastApproved) || 100;
      setNextCheckpoint(next);
      
      // Check for revision mode
      if (updateCheckpoint) {
        const milestone = found.milestones.find(
          m => m.percentage === parseInt(updateCheckpoint) && m.needsRevision
        );
        if (milestone) {
          setRevisionMode(true);
          setCustomerFeedback(milestone.customerFeedback);
        }
      }
    }
  };
  loadProject();
}, [projectId, updateCheckpoint]);
```

### **Key Features**
- ✅ **Milestone System** - 25%, 50%, 75%, 100% checkpoints
- ✅ **Customer Approval** - Cannot proceed until approved
- ✅ **Revision Workflow** - Handle customer feedback
- ✅ **Progress Constraints** - Cannot skip checkpoints
- ✅ **File Uploads** - Main, additional, completion images
- ✅ **Validation** - Comprehensive form validation
- ✅ **Date Constraints** - Must be future dates
- ✅ **Character Limits** - 500 chars for messages
- ✅ **Phase Tracking** - Current construction phase
- ✅ **Update History** - Recent changes log

### **Complex Validation Logic**

```javascript
const getMaxAllowedPercentage = () => {
  if (revisionMode) {
    return parseInt(selectedMilestone); // Can update same checkpoint
  }
  
  // Check for pending checkpoint
  const pendingCheckpoint = existingMilestones.find(
    m => m.isCheckpoint && !m.isApprovedByCustomer && !m.needsRevision
  );
  
  if (pendingCheckpoint) {
    return null; // Blocked until approval
  }
  
  return nextCheckpoint; // Can update up to next checkpoint
};

const validate = () => {
  const errors = [];
  const milestone = parseInt(selectedMilestone);
  const floor = getCheckpointFloor();
  const maxAllowed = getMaxAllowedPercentage();
  
  if (milestone < floor) {
    errors.push(`Cannot go below ${floor}%`);
  }
  
  if (maxAllowed === null) {
    errors.push("Waiting for customer approval");
  } else if (milestone > maxAllowed) {
    errors.push(`Cannot exceed ${maxAllowed}%`);
  }
  
  if ([25, 50, 75, 100].includes(milestone) && !milestoneMessage) {
    errors.push("Checkpoint message required");
  }
  
  return errors;
};
```

### **File Validation**
```javascript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const validateFile = (file) => {
  if (!file) return true;
  if (!allowedTypes.includes(file.type)) return false;
  if (file.size > MAX_FILE_SIZE) return false;
  return true;
};
```

### **Component Composition**
```
CompanyAddNewProject
├── RevisionAlert
├── ValidationSummary
├── ProgressHeader
├── MilestoneInput
├── MilestoneMessageBox
├── CheckpointsOverview
├── TargetCompletionDateInput
├── CurrentPhaseSelect
├── FileUploadGroup
├── CompletionImagesUpload
├── RecentUpdates
└── FormButtons
```

---

## Summary: All React Hooks Used Across Company Portal

### **1. useState** (Every Component)
- Simple values (strings, numbers, booleans)
- Objects (forms, nested data)
- Arrays (lists, collections)
- Sets (for efficient lookups)
- Null/undefined (selection states)

### **2. useEffect**
- Data fetching on mount
- Polling/intervals with cleanup
- URL parameter handling
- Computed values from props
- Side effects (scrolling, API calls)

### **3. useRef**
- File input references
- Timeout storage (debouncing)
- Form references
- Preventing stale closures

### **4. useMemo**
- Expensive filtering operations
- Derived data calculations
- Performance optimization

### **5. useCallback**
- Debounced functions
- Stable function references
- Event handlers passed to children

### **6. React Router Hooks**
- `useNavigate` - Programmatic navigation
- `useSearchParams` - URL query params
- `Link` - Declarative navigation

### **7. Custom Hooks**
- `useDebounced` - Search optimization

---

## Common Patterns & Best Practices

### **1. Loading States**
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetch = async () => {
    try {
      setLoading(true);
      // ... fetch
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);
```

### **2. Cleanup Functions**
```javascript
useEffect(() => {
  let mounted = true;
  const interval = setInterval(() => { /* ... */ }, 30000);
  
  return () => {
    mounted = false;
    clearInterval(interval);
  };
}, []);
```

### **3. Form Validation**
- Separate validation functions
- Real-time error clearing
- Comprehensive checks before submit

### **4. Modal Management**
- Boolean or string identifiers
- Selection state for modal data
- Close handlers clear state

### **5. Component Composition**
- Small, focused components
- Props for data flow
- Callbacks for events

### **6. API Integration**
- Credentials: include (cookies)
- Error handling
- Loading states
- Success feedback

---

## Technologies Summary

- **React 18** - Component library
- **React Router v6** - Routing
- **Fetch API** - HTTP requests
- **FormData** - File uploads
- **FileReader** - Image previews
- **Intl.NumberFormat** - Currency formatting
- **Date API** - Date calculations
- **Set** - Efficient data structures
- **CSS Modules** - Component styles

---

## Why Complaint Routes Were Created

### **Purpose of Complaint System**
The complaint/messaging system enables **bidirectional communication** between companies and customers during ongoing projects, with admin oversight and mediation.

### **Database Schema**
```javascript
const complaintSchema = new mongoose.Schema({
  projectId: { type: ObjectId, ref: 'ConstructionProjectSchema', required: true },
  milestone: { type: Number, enum: [0, 25, 50, 75, 100], required: true },
  senderType: { type: String, enum: ['company', 'customer'], required: true },
  senderId: { type: ObjectId, required: true },
  message: { type: String, required: true },
  isViewed: { type: Boolean, default: false },
  replies: [
    {
      adminId: { type: ObjectId, ref: 'Admin' },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});
```

### **API Routes Structure**

#### **Base Path:** `/api/complaints`

**1. Submit Complaint**
```javascript
POST /api/complaints
Body: {
  projectId: ObjectId,
  milestone: 0 | 25 | 50 | 75 | 100,  // Specific checkpoint or general (0)
  senderType: 'company' | 'customer',
  senderId: ObjectId,
  message: String
}
```

**2. Get Unviewed Count (Admin)**
```javascript
GET /api/complaints/unviewed/count
Response: {
  unviewedByProject: [
    { _id: projectId, count: Number }
  ]
}
```

**3. Get Unviewed Count (Company - Customer Messages Only)**
```javascript
GET /api/complaints/company/unviewed/count
Response: {
  unviewedByProject: [
    { _id: projectId, count: Number }
  ]
}
```
- **Filters:** Only shows complaints from `senderType: 'customer'`
- **Use Case:** Company navbar notification badge

**4. Get All Complaints for Project (Admin)**
```javascript
GET /api/complaints/:projectId
Response: {
  complaints: [...]
}
```
- **Side Effect:** Marks all complaints as viewed when fetched

**5. Admin Reply to Complaint**
```javascript
POST /api/complaints/:complaintId/reply
Body: {
  adminId: ObjectId,
  message: String
}
```

### **Why Separate Routes vs Chat System?**

#### **Complaints System** (What we have)
✅ **Milestone-specific** - Tied to project checkpoints (25%, 50%, 75%, 100%)
✅ **Admin mediation** - Admin can view and reply to resolve disputes
✅ **Notification system** - Unviewed count for each role
✅ **Project-centric** - All complaints linked to specific project phases
✅ **Audit trail** - Permanent record of issues at each milestone

#### **Chat System** (Different purpose)
- Real-time messaging
- General conversation
- Not tied to specific milestones
- Usually doesn't require admin intervention

### **Use Cases in Company Portal**

**1. CompanyNavbar**
```javascript
useEffect(() => {
  const fetchUnviewedComplaints = async () => {
    const res = await fetch('/api/company/unviewed-customer-messages');
    const data = await res.json();
    setHasUnviewedComplaints(data.unviewedByProject.length > 0);
  };
  
  // Poll every 30 seconds
  const interval = setInterval(fetchUnviewedComplaints, 30000);
  return () => clearInterval(interval);
}, []);
```
- Shows red badge when customers have sent messages
- Real-time notification system

**2. CompanyOngoing**
```javascript
const handleOpenComplaint = (projectId, milestone) => {
  setShowComplaintModal(`${projectId}_${milestone}`);
};

const handleSubmitComplaint = async (projectId, milestone) => {
  await fetch('/api/complaints', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      milestone: milestone === 'general' ? 0 : milestone,
      senderType: 'company',
      message: complaintText
    })
  });
};
```
- Company can send complaints about specific milestones
- Customer complaints appear with unread counts

**3. Mark as Viewed**
```javascript
const toggleUpdates = async (id) => {
  // Optimistic update
  setUnviewedComplaints(prev => {
    const updated = { ...prev };
    delete updated[id];
    return updated;
  });
  
  await fetch(`/api/company/mark-messages-viewed/${id}`, {
    method: 'POST'
  });
};
```

### **Why It's Better Than Generic Chat**

**1. Context-Aware**
- Each complaint knows exactly which milestone it's about
- "Issue at 50% completion" is clearer than "general message"

**2. Workflow Integration**
- Tied to approval/revision workflow
- Customer can request revisions at checkpoints
- Company responds with updates

**3. Admin Oversight**
- Admin can see all complaints across all projects
- Can intervene and mediate disputes
- Maintains quality control

**4. Notification Precision**
- Company only gets notified about customer complaints
- Reduces noise from internal updates
- Focused communication channel

**5. Audit & Compliance**
- Permanent record of issues
- Timeline of resolution attempts
- Legal/dispute evidence

### **Real-World Flow Example**

```
1. Customer submits project → Company accepts
2. Company updates to 25% completion
3. Customer reviews and sees issue
4. Customer: POST /api/complaints
   {
     milestone: 25,
     senderType: 'customer',
     message: "Foundation cracks visible"
   }
5. Company navbar shows red badge (unviewed count)
6. Company opens CompanyOngoing → sees notification
7. Company: POST /api/complaints
   {
     milestone: 25,
     senderType: 'company',
     message: "Will fix immediately, minor settling"
   }
8. If unresolved → Admin can view and reply
9. All messages stored with milestone context
```

### **Database Query Optimization**

**Aggregation for Unviewed Counts**
```javascript
const unviewedByProject = await Complaint.aggregate([
  { $match: { isViewed: false, senderType: 'customer' } },
  { $group: { _id: '$projectId', count: { $sum: 1 } } }
]);
```
- **Efficient:** Single query for all projects
- **Grouped:** Returns count per project
- **Filtered:** Only customer complaints for company view

### **Alternative Approaches Considered**

**❌ Using Chat System**
- Too generic, loses milestone context
- No built-in admin mediation
- Harder to filter by project phase

**❌ Email Notifications**
- Outside app, breaks workflow
- No real-time updates
- Can't track viewed status

**❌ Comments on Milestones**
- Comments are for updates, not issues
- No notification system
- Can't escalate to admin

**✅ Dedicated Complaint Routes** (Current approach)
- Purpose-built for dispute resolution
- Milestone-aware
- Role-based filtering
- Admin mediation built-in

---

This analysis provides a complete overview of all hooks, patterns, and features used throughout the company portal. Each component demonstrates different React concepts and real-world application patterns.
