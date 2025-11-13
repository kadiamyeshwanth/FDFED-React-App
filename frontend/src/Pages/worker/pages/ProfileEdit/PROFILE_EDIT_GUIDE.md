# Profile Edit Feature - Implementation Guide

## Overview

The Profile Edit page has been successfully converted from EJS server-side template to a modern React component. This feature allows workers to edit their professional information, specialties, and portfolio projects with image uploads.

## File Structure

```
frontend/src/Pages/worker/pages/ProfileEdit/
├── ProfileEditPage.jsx          # Main page component
├── ProfileEdit.css              # Page styles
└── components/
    ├── PersonalInfoSection.jsx   # Personal information form section
    ├── AboutSection.jsx          # Bio/about section
    ├── SpecialtiesSection.jsx    # Specialties selection component
    ├── ProjectsSection.jsx       # Projects management container
    └── ProjectItem.jsx           # Individual project form
```

## Component Architecture

### ProfileEditPage.jsx (Main Container)
- **Purpose**: Main container component for the profile edit form
- **State Management**:
  - `formData`: Personal info, title, experience, about, specialties, profile image
  - `projects`: Array of project objects
  - `loading`: Initial data load state
  - `submitting`: Form submission state
  - `error`/`success`: Status messages
- **Key Features**:
  - Fetches existing worker profile on mount
  - Manages form state across all child components
  - Handles form submission with FormData for multipart uploads
  - Protected route with auth check

### PersonalInfoSection.jsx
- Displays profile image preview with circular crop
- Name field (read-only, cannot be changed)
- Professional title input
- Years of experience input
- Profile image upload with preview

### AboutSection.jsx
- Textarea for professional biography
- Character counter
- Input change handling

### SpecialtiesSection.jsx
- Checkbox grid for specialty selection
- Available specialties:
  - Sustainable design
  - Urban planning
  - Residential architecture
  - Commercial architecture
  - Interior design
  - Landscape architecture
  - BIM (Building Information Modeling)
  - CAD Design
  - Renovation & Restoration
  - Public Infrastructure
- Tag display for selected specialties
- Quick remove buttons from tags

### ProjectsSection.jsx
- Container for project list
- Add/Remove project functionality
- Projects management state
- Delegates to ProjectItem for individual project UI

### ProjectItem.jsx
- Individual project form
- Fields:
  - Project name
  - Year (with validation)
  - Location
  - Description (textarea)
  - Project image with preview
- Remove button with data validation
- Image preview with dashed border

## Backend Integration

### New API Endpoint

**GET `/api/worker/profile`**
- **Protected**: Yes (requires authentication)
- **Description**: Fetches authenticated worker's profile data
- **Response**:
```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "professionalTitle": "Architect",
    "experience": 5,
    "about": "Experienced architect...",
    "specialties": ["Sustainable design", "Urban planning"],
    "profileImage": "path/to/image.jpg",
    "projects": [
      {
        "name": "Modern Office Complex",
        "year": 2023,
        "location": "New York",
        "description": "...",
        "image": "path/to/image.jpg"
      }
    ]
  }
}
```

### Existing Endpoints Used

**POST `/worker/profile/update`**
- **Protected**: Yes (requires authentication)
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `name`: Worker name (from database, included for completeness)
  - `title`: Professional title
  - `experience`: Years of experience
  - `about`: Professional biography
  - `specialties[]`: Array of specialty strings
  - `profileImage`: Profile image file (optional)
  - `projectName-{i}`: Project name (where i is 1, 2, 3...)
  - `projectYear-{i}`: Project year
  - `projectLocation-{i}`: Project location
  - `projectDescription-{i}`: Project description
  - `projectImage-{i}`: Project image file (optional)
- **Response**:
```json
{
  "message": "Profile updated successfully!",
  "redirect": "/workersettings"
}
```

**Error Response**:
```json
{
  "message": "Error message"
}
```

## Data Flow

### 1. Page Load
```
Component Mount
    ↓
isAuthenticated check
    ↓
Fetch /api/worker/profile
    ↓
Parse response
    ↓
Update state with worker data
    ↓
Render form with pre-filled data
```

### 2. Form Submission
```
User clicks "Update Profile"
    ↓
handleSubmit() triggered
    ↓
Create FormData object
    ↓
Append all form fields and files
    ↓
POST to /worker/profile/update
    ↓
Server processes and updates database
    ↓
Show success message
    ↓
Redirect to worker dashboard
```

### 3. Project Management
```
Add Project:
  Click "Add Project" → Create new project object → Update projects array → Re-render

Edit Project:
  Change any field → updateProject() → Update projects array → Re-render

Upload Image:
  Select file → FileReader → Create preview → Store in project state

Remove Project:
  Click "Remove" → Filter out project → Update projects array → Re-render
```

## CSS Features

### Design System
- **Primary Color**: #27ae60 (Green for CTA)
- **Primary Dark**: #2c3e50 (Headers and text)
- **Secondary Red**: #e74c3c (Delete/remove actions)
- **Backgrounds**: #f5f7fa to #c3cfe2 (Gradient)

### Key Components
- **Form Sections**: Bordered, with bottom padding and divider lines
- **Profile Preview**: Circular image (150px), centered, with shadow
- **Specialties Grid**: Responsive multi-column layout
- **Project Items**: Card-style with hover effects
- **Buttons**: Consistent styling with hover states and disabled states
- **Alerts**: Slide-down animation, color-coded (red/green)

### Responsiveness
- Mobile: Single column, adjusted spacing
- Tablet: 2-column grids where appropriate
- Desktop: Full multi-column layout

## Form Validation

### Client-side
- Required fields validation by HTML5
- File type validation (images only)
- Year range validation (1900 - current year)
- Number inputs for experience and year

### Server-side
- All field validation in updateWorkerProfile()
- File size/type validation via Multer middleware
- User ID verification from JWT/session

## Error Handling

### Frontend
1. Network errors → Display error alert
2. 401 Unauthorized → Redirect to login
3. 404 Not found → Show error message
4. 500 Server error → Display user-friendly error

### Backend
- Try-catch blocks in all functions
- Validation of worker ID
- File upload error handling
- Database operation error handling

## Security Considerations

1. **Authentication**: All endpoints require `isAuthenticated` middleware
2. **Authorization**: Workers can only edit their own profile (user_id from JWT)
3. **File Uploads**: 
   - Multer middleware validates file types
   - Files stored in designated upload directory
   - File size limits enforced
4. **Data Sanitization**: Mongoose schema validation
5. **CORS**: Credentials included in fetch requests

## Usage Example

### Integrating into Router

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileEditPage from './Pages/worker/pages/ProfileEdit/ProfileEditPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/worker/profile-edit" element={<ProfileEditPage />} />
      </Routes>
    </Router>
  );
}
```

### Linking from Navigation

```jsx
<Link to="/worker/profile-edit">Edit Profile</Link>
```

## Testing Checklist

- [ ] Profile page loads without errors
- [ ] Worker data pre-fills correctly
- [ ] Profile image upload and preview works
- [ ] Can add multiple projects
- [ ] Can remove projects
- [ ] Specialties can be selected/deselected
- [ ] Character counter works for bio
- [ ] Form submission with all fields works
- [ ] Form submission with partial fields works (image optional)
- [ ] Success message displays
- [ ] Redirect after successful update
- [ ] Error messages display appropriately
- [ ] Responsive design works on mobile
- [ ] Read-only fields cannot be edited
- [ ] File uploads are sent as multipart

## Known Limitations

1. **Project Image Updates**: If a project already has an image and no new image is uploaded, the old image is retained
2. **Name Field**: Cannot be edited (read-only) - must be changed in user account settings
3. **Single Profile Image**: Only one profile image (previous one is replaced)

## Future Enhancements

1. [ ] Image cropping tool for profile image
2. [ ] Drag-and-drop for file uploads
3. [ ] Project gallery with multiple images per project
4. [ ] Certificate file uploads
5. [ ] Services offered section
6. [ ] Portfolio gallery integration
7. [ ] Auto-save draft functionality
8. [ ] Undo/redo functionality

## Troubleshooting

### Profile data not loading
- Check if user is authenticated (check browser cookies/localStorage)
- Verify `/api/worker/profile` endpoint is properly registered
- Check browser console for errors

### Images not uploading
- Verify Multer middleware is configured
- Check file upload directory has write permissions
- Verify file size is within limits
- Check file type is valid image format

### Form not submitting
- Verify `/worker/profile/update` endpoint exists
- Check FormData is properly constructed
- Verify credentials are included in fetch request
- Check browser console for network errors

## Migration Notes

**From EJS to React:**
- Removed server-side form validation (now client-side + server-side)
- Removed page navigation (now handled by React Router)
- Improved UX with instant image previews
- Better project management with dynamic add/remove
- Responsive design improvements
- Better error messages and user feedback

## API Endpoint Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/worker/profile` | Get worker profile data | Yes |
| POST | `/worker/profile/update` | Update worker profile | Yes |

## Related Files

- **Backend**: `FFSD/controllers/workerController.js` - `apiGetWorkerProfile()` and `updateWorkerProfile()`
- **Backend Routes**: `FFSD/routes/workerRoutes.js` - Route registration
- **Models**: `FFSD/models/index.js` - Worker schema definition

---

**Status**: ✅ Complete and Ready for Testing  
**Last Updated**: November 13, 2025  
**Component Status**: Production Ready
