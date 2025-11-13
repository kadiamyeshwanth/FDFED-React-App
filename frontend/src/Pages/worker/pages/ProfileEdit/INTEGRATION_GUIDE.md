# Profile Edit Page - Integration & Usage Guide

## Quick Start

### 1. Import in Your Router

```jsx
// In your main App.jsx or router file
import ProfileEditPage from './Pages/worker/pages/ProfileEdit/ProfileEditPage';

// Add to your Routes
<Route 
  path="/worker/profile-edit" 
  element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} 
/>
```

### 2. Add Navigation Link

```jsx
// In your navbar or navigation component
import { Link } from 'react-router-dom';

<Link to="/worker/profile-edit" className="nav-link">
  Edit Profile
</Link>
```

## Component Props & Features

### ProfileEditPage

**No props required** - Component handles everything internally via hooks

**Features:**
- Auto-fetches user data on mount
- Protected with authentication check
- Manages form state for all sections
- Handles multipart file uploads
- Shows loading, success, and error states

```jsx
<ProfileEditPage />
```

## Form Structure

### Section 1: Personal Information
```
Profile Image: Circular preview + file input
Name: Read-only display (from database)
Professional Title: Text input (editable)
Years of Experience: Number input (editable)
```

### Section 2: About
```
Professional Biography: Textarea
Character Counter: Real-time count
```

### Section 3: Specialties
```
Checkboxes: 10 specialty options
Tags: Display selected with quick remove
```

### Section 4: Projects
```
Add Project Button: Create new project entry
Project Items:
  - Name (required)
  - Year (required, 1900-2100)
  - Location (required)
  - Description (required)
  - Image (optional)
  - Remove Button
```

## API Endpoints

### Fetch Profile Data
```
GET /api/worker/profile
Content-Type: application/json
Authorization: Bearer {token}

Response:
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "professionalTitle": "Architect",
    "experience": 5,
    "about": "...",
    "specialties": ["Sustainable design"],
    "profileImage": "url/to/image.jpg",
    "projects": [...]
  }
}
```

### Update Profile
```
POST /worker/profile/update
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Fields:
- name (string)
- title (string)
- experience (number)
- about (string)
- specialties (array)
- profileImage (file, optional)
- projectName-1, projectYear-1, etc. (strings/numbers)
- projectImage-1, projectImage-2, etc. (files, optional)

Response:
{
  "message": "Profile updated successfully!",
  "redirect": "/workersettings"
}
```

## File Structure Reference

```
frontend/src/Pages/worker/pages/ProfileEdit/
├── ProfileEditPage.jsx              # Main container component
├── components/
│   ├── PersonalInfoSection.jsx      # Personal info form section
│   ├── AboutSection.jsx             # Bio section
│   ├── SpecialtiesSection.jsx       # Specialties selector
│   ├── ProjectsSection.jsx          # Projects container
│   └── ProjectItem.jsx              # Individual project form
├── ProfileEdit.css                  # All styles
├── PROFILE_EDIT_GUIDE.md            # Detailed technical guide
└── FEATURE_SUMMARY.md               # Feature overview
```

## Styling Customization

### CSS Variables (can be extracted to theme)
```css
--primary-green: #27ae60;
--primary-dark: #2c3e50;
--danger-red: #e74c3c;
--bg-light: #f5f7fa;
--border-color: #ddd;
```

### Key CSS Classes
- `.profile-edit-container` - Main wrapper
- `.form-section` - Each form section
- `.form-input`, `.form-textarea` - Form fields
- `.specialties-grid` - Specialties layout
- `.project-item` - Project card
- `.profile-preview` - Image preview circle

## State Management

### Form Data State
```js
{
  name: string,           // Read-only
  title: string,          // Editable
  experience: number,     // Editable
  about: string,          // Editable
  specialties: array,     // Editable
  profileImage: file,     // Upload
  profileImagePreview: string, // Data URL preview
}
```

### Projects State
```js
[
  {
    id: number,           // Unique identifier
    name: string,
    year: number,
    location: string,
    description: string,
    imageFile: file,      // New upload
    imagePreview: string, // Data URL
    image: string,        // Existing image URL
  },
  ...
]
```

### Loading States
```js
loading: boolean,    // Initial data load
submitting: boolean, // Form submission
error: string,       // Error message
success: string,     // Success message
```

## Error Handling

### User-Facing Errors
```
Network Error:
"Failed to load profile data"
"Failed to update profile"

Authentication Error:
Redirect to login page (401)

Validation Error:
"Required fields must be filled"

Server Error:
"Failed to update profile: {message}"
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Profile data not loading | Not authenticated | Login first |
| Images not uploading | File size too large | Check Multer limits |
| Form not submitting | Missing required fields | Fill all required fields |
| 404 on API call | Route not registered | Check workerRoutes.js |
| CORS error | Domain mismatch | Check server CORS config |

## Performance Optimization

### Current Implementation
- Uses `.lean()` for database queries (faster read)
- FileReader API for instant image previews
- Lazy loading of components
- Conditional rendering based on state

### Future Optimizations
- Image compression before upload
- Debounced form saves
- Lazy load images in projects list
- Memoize child components

## Accessibility Features

- ✅ Semantic HTML (labels, form elements)
- ✅ ARIA labels on icon buttons
- ✅ Keyboard navigation support
- ✅ Color contrast on text
- ✅ Focus indicators on form fields

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dependencies
- React 18+
- React Router 6+
- Modern browsers with FileReader API

## Deployment Checklist

- [ ] Backend API endpoint `/api/worker/profile` is deployed
- [ ] POST `/worker/profile/update` endpoint is working
- [ ] Multer middleware is configured on server
- [ ] Upload directory has write permissions
- [ ] Database models are up to date
- [ ] Frontend component is imported in router
- [ ] Navigation link added to navbar
- [ ] CORS is configured if needed
- [ ] Environment variables are set
- [ ] Error handling is in place
- [ ] Testing completed

## Support & Troubleshooting

### Enable Debug Logging
```js
// Add to ProfileEditPage.jsx for debugging
useEffect(() => {
  console.log('Form data:', formData);
  console.log('Projects:', projects);
}, [formData, projects]);
```

### Test API Endpoints
```bash
# Test fetching profile
curl -X GET http://localhost:5000/api/worker/profile \
  -H "Cookie: your_session_cookie"

# Test updating profile (requires FormData)
curl -X POST http://localhost:5000/worker/profile/update \
  -F "title=Architect" \
  -F "experience=5" \
  -H "Cookie: your_session_cookie"
```

## Related Documentation

- `PROFILE_EDIT_GUIDE.md` - Technical implementation details
- `FEATURE_SUMMARY.md` - Feature overview
- `../FOLDER_STRUCTURE.md` - Project structure
- `../../WORKER_CONVERSION_STATUS.md` - Overall progress

---

**Last Updated**: November 13, 2025
**Status**: ✅ Production Ready
**Version**: 1.0
