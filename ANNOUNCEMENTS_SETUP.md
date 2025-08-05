# Announcements Management System

This document provides a comprehensive guide for setting up and using the Barangay Announcements Management System.

## 🚀 Quick Setup

### 1. Set up the Firebase Collection

Run the setup script to create the announcements collection with sample data:

```bash
npm run setup-announcements
```

### 2. Test the Collection

Verify that the collection was created successfully:

```bash
npm run test-announcements
```

### 3. Start the Development Server

```bash
npm run dev
```

## 📋 Features

### Admin Features (System Management)
- ✅ Create new announcements
- ✅ Edit existing announcements
- ✅ Delete announcements
- ✅ View all announcements with filtering
- ✅ Search announcements by title/description
- ✅ Filter by status (Published, Draft, Archived)
- ✅ Filter by category (Community, Health, Governance, etc.)
- ✅ Preview announcements before publishing
- ✅ Statistics dashboard

### Public Features (Landing Page)
- ✅ Display published announcements
- ✅ Category-based styling
- ✅ Responsive design
- ✅ Fallback to sample data if API fails

## 🗄️ Database Schema

### Announcements Collection Structure

```javascript
{
  id: "auto-generated-document-id",
  title: "Announcement Title",
  description: "Detailed description of the announcement",
  category: "Community|Health|Governance|Education|Safety|Events",
  status: "published|draft|archived",
  color: "green|yellow|blue|purple|red|pink",
  imageUrl: "optional-image-url",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  createdBy: "admin-user-id",
  views: 0,
  isActive: true
}
```

### Categories and Colors

| Category | Color | Description |
|----------|-------|-------------|
| Community | Green | Community events, clean-up drives, etc. |
| Health | Yellow | Health-related announcements, vaccinations |
| Governance | Blue | Council meetings, official notices |
| Education | Purple | Educational programs, scholarships |
| Safety | Red | Safety alerts, emergency notices |
| Events | Pink | Festivals, celebrations, special events |

## 🔧 API Endpoints

### GET /api/announcements
Fetch all announcements with optional filters.

**Query Parameters:**
- `status`: Filter by status (published, draft, archived)
- `limit`: Limit number of results
- `category`: Filter by category

**Example:**
```bash
GET /api/announcements?status=published&limit=6
```

### POST /api/announcements
Create a new announcement.

**Required Fields:**
- `title`: Announcement title
- `description`: Announcement description
- `category`: Announcement category

**Optional Fields:**
- `status`: Default is "draft"
- `color`: Auto-assigned based on category
- `imageUrl`: Optional image URL

### PUT /api/announcements/[id]
Update an existing announcement.

### DELETE /api/announcements/[id]
Delete an announcement.

## 🛡️ Security Rules

The Firestore security rules for announcements:

```javascript
match /announcements/{announcementId} {
  // Anyone can read published announcements
  allow read: if resource.data.status == 'published' || isAdmin();
  // Only admins can create, update, or delete announcements
  allow create, update, delete: if isAdmin();
}
```

## 🎨 UI Components

### AnnouncementForm
A comprehensive form component for creating and editing announcements with:
- Real-time preview
- Category selection with auto-color assignment
- Status management
- Image URL support
- Validation

### AnnouncementsManagement
Admin dashboard component with:
- Statistics cards
- Search and filtering
- CRUD operations
- Notification system

### BarangayAnnouncements (Landing Page)
Public display component with:
- Responsive grid layout
- Category-based styling
- Fallback data support
- View tracking

## 🔄 State Management

### useAnnouncements Hook
Custom hook for managing announcements data:

```javascript
const {
  announcements,
  loading,
  error,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncement,
  refetch
} = useAnnouncements({
  status: 'published',
  limit: 6,
  autoFetch: true
});
```

## 📱 Usage Examples

### Creating an Announcement
1. Navigate to System Management > Announcements
2. Click "Create New"
3. Fill in the form:
   - Title: "Monthly Clean-up Drive"
   - Description: "Join us for community clean-up..."
   - Category: "Community"
   - Status: "Published"
4. Click "Create"

### Editing an Announcement
1. Find the announcement in the list
2. Click "Edit"
3. Modify the fields
4. Click "Update"

### Publishing a Draft
1. Find the draft announcement
2. Click "Edit"
3. Change status to "Published"
4. Click "Update"

## 🧪 Testing

### Manual Testing
1. **Setup Test:**
   ```bash
   npm run setup-announcements
   ```

2. **Collection Test:**
   ```bash
   npm run test-announcements
   ```

3. **UI Testing:**
   - Start dev server: `npm run dev`
   - Navigate to System Management > Announcements
   - Test CRUD operations
   - Check landing page displays published announcements

### API Testing
Test the API endpoints using curl or Postman:

```bash
# Get all announcements
curl http://localhost:3000/api/announcements

# Get published announcements
curl http://localhost:3000/api/announcements?status=published&limit=3

# Create announcement
curl -X POST http://localhost:3000/api/announcements \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test description","category":"Community"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Collection not found:**
   - Run `npm run setup-announcements`
   - Check Firebase credentials in environment variables

2. **API errors:**
   - Verify Firebase Admin SDK configuration
   - Check Firestore security rules
   - Ensure proper authentication

3. **UI not updating:**
   - Check browser console for errors
   - Verify API responses
   - Clear browser cache

4. **Landing page shows fallback data:**
   - Check if announcements collection has published data
   - Verify API endpoint is working
   - Check network tab for failed requests

### Environment Variables Required

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
```

## 📈 Performance Considerations

1. **Indexing:** Firestore will automatically create indexes for queries
2. **Pagination:** Use limit parameter for large datasets
3. **Caching:** Consider implementing client-side caching for better performance
4. **Image Optimization:** Use optimized images for better loading times

## 🔮 Future Enhancements

- [ ] Image upload functionality
- [ ] Rich text editor for descriptions
- [ ] Scheduled publishing
- [ ] Email notifications for new announcements
- [ ] Announcement templates
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Social media integration

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase console logs
3. Check browser developer tools
4. Verify environment variables
5. Test with the provided scripts

---

**Last Updated:** January 2025
**Version:** 1.0.0 