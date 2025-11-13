# Worker Pages Folder Structure

This document outlines the organized folder structure for Worker pages in the React application.

## Directory Structure

```
frontend/src/Pages/worker/
│
├── pages/                              # Individual page modules
│   ├── Jobs/                           # Jobs listing & details page
│   │   ├── JobsPage.jsx                # Main page component
│   │   └── components/
│   │       ├── JobList.jsx             # Left sidebar with job list
│   │       └── JobDetails.jsx          # Right panel with job details & proposal form
│   │
│   ├── OngoingProjects/                # Ongoing projects page
│   │   ├── OngoingProjectsPage.jsx     # Main page component
│   │   └── components/
│   │       ├── ProjectList.jsx         # Project list sidebar
│   │       └── ProjectDetails.jsx      # Project details & completion action
│   │
│   ├── JoinCompany/                    # Join company & offers page
│   │   ├── JoinCompanyPage.jsx         # Main page component
│   │   └── components/
│   │       ├── CompanyList.jsx         # Companies list
│   │       ├── CompanyModal.jsx        # Company details modal
│   │       ├── ApplicationModal.jsx    # Application form modal
│   │       ├── OffersTab.jsx           # Offers tab content
│   │       └── RequestsTab.jsx         # Join requests tab content
│   │
│   ├── Jobs.css                        # Jobs page styles
│   ├── OngoingProjects.css             # Ongoing projects styles
│   └── JoinCompany.css                 # Join company styles
│
├── components/                         # Shared components
│   ├── worker-navbar/                  # Worker navigation bar
│   │   ├── WorkerNavbar.jsx
│   │   ├── WorkerNavbar.css
│   │   └── sub-components/             # Navbar sub-components
│   │
│   ├── worker-home/                    # Worker home dashboard
│   │   ├── WorkerHome.jsx
│   │   ├── WorkerHome.css
│   │   └── sub-components/             # Home sub-components
│   │       ├── WorkerHomeTop.jsx
│   │       ├── WorkerHomeMiddle.jsx
│   │       └── WorkerHomeBottom.jsx
│   │
│   └── shared/                         # Shared UI components (future)
│
├── Worker.jsx                          # Worker main router component
└── README.md                           # Documentation
```

## Component Organization

### Pages Module (`pages/`)
Contains individual page modules, each with:
- A main page component (`*Page.jsx`)
- A dedicated `components/` folder for page-specific components
- A CSS file for page styles
- Imports from shared components

### Page-Specific Components
- `JobList.jsx` & `JobDetails.jsx` - For Jobs page
- `ProjectList.jsx` & `ProjectDetails.jsx` - For OngoingProjects page
- `CompanyList.jsx`, `CompanyModal.jsx`, `ApplicationModal.jsx`, `OffersTab.jsx`, `RequestsTab.jsx` - For JoinCompany page

### Shared Components (`components/`)
- `worker-navbar/` - Navigation bar (shared across all pages)
- `worker-home/` - Home dashboard (shared across all pages)
- `shared/` - Common UI components for reuse

## Naming Conventions

1. **Page Components**: Named with `*Page.jsx` suffix (e.g., `JobsPage.jsx`)
2. **Feature Components**: Named descriptively (e.g., `JobList.jsx`, `CompanyModal.jsx`)
3. **CSS Files**: Match component name (e.g., `Jobs.css` for Jobs pages)
4. **Folders**: PascalCase for component folders, kebab-case for utility folders

## Import Paths

### From Page to Components
```jsx
// Within JobsPage.jsx
import JobList from './components/JobList'
import JobDetails from './components/JobDetails'
import '../Jobs.css'
```

### From Page to Shared Components
```jsx
// Within JoinCompanyPage.jsx
import WorkerNavbar from '../../components/worker-navbar/WorkerNavbar'
```

## Benefits of This Structure

✅ **Scalability** - Easy to add new pages following the same pattern
✅ **Reusability** - Shared components are centralized
✅ **Maintainability** - Clear separation of concerns
✅ **Clarity** - Quick to find components and understand hierarchy
✅ **Modular** - Each page is self-contained with its dependencies
