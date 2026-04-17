# GriefBridge

**An Intelligent Post-Bereavement Workflow & Document Management System**

GriefBridge is a full-stack web application designed for Indian families to navigate the complex administrative, legal, and financial procedures following a death. The platform transforms a confusing bureaucratic maze into a single, personalized, intelligent digital workflow—reducing stress during an already difficult time.

[Live Demo](#getting-started) • [Documentation](#documentation) • [Contributing](#contributing) • [License](#license)

## The Problem

When someone dies in India, their family faces an overwhelming administrative burden. Grieving families must navigate **8-12 different government departments and private institutions**, each with its own forms, deadlines, and documentation requirements—all while dealing with acute emotional distress.

**Typical journey involves:**
- Municipal Corporation (Death Certificate)
- Pension office (EPF claims, pension transfer)
- Banks (account transfer, frozen account access)
- Insurance companies (death claim processing)
- Property registration office (property mutation, transfer)
- Income Tax (death intimation, final return filing)
- RTO (vehicle transfer, cancellation)
- Employer HR (final settlement, gratuity)

**GriefBridge Solution:** One intelligent platform consolidates all procedures, deadlines, and documentation into a personalized workflow tailored to each family's unique circumstances.

## Key Features

### 1. Authentication & Multi-Case Management
- User registration with bcrypt password hashing
- JWT-based stateless authentication (httpOnly cookies)
- Each user can manage multiple cases independently
- Role-based case sharing with family members

### 2. Intelligent Intake & Matching Engine
- 13-step intake questionnaire (demographic + 10 yes/no attributes)
- Weighted binary attribute matching algorithm (normalized dot product)
- Returns personalized, priority-ordered procedure list from 40+ corpus
- Cases dynamically generated based on user profile

### 3. Interactive Dependency Graph Visualization
- D3.js force-directed graph with real-time state updates
- 6 node states: NOT_STARTED, UNLOCKED, IN_PROGRESS, BLOCKED, COMPLETED, OVERDUE
- Animated state transitions using Framer Motion & GSAP
- Click-to-detail side panel showing full task information
- Particle animations on task completion

### 4. Document Vault
- Drag-and-drop file upload (PDF, JPG, PNG)
- Multer stream-based upload to MongoDB GridFS
- Auto-association of documents to procedures
- Document type tagging and verification status tracking

### 5. Form Pre-filler
- XML form templates with `{{PLACEHOLDER}}` tokens
- Auto-fills from case data (name, dates, amounts)
- Puppeteer renders to PDF with formatting preserved
- Supports: EPF Form 20, Bank Transfer, Insurance Claim forms

### 6. XML Legal Bundle Export
- Cases exported as LegalXML with namespace validation
- SHA-256 cryptographic signing of bundles
- XSLT transformation to formatted HTML report
- ZLIB compression for download as `.gb` file format

### 7. Deadline RSS Feed
- Per-case RSS 2.0 feed of upcoming deadlines
- Dynamically generated on-request, no pre-computation
- Subscribable in Feedly, Outlook, Google News, Apple News
- Urgency prefixes: URGENT (≤7 days), REMINDER (≤30 days)

### 8. Notification System
- Hourly background job checking for approaching deadlines
- Automatic notification creation for overdue items
- AJAX polling (60s interval) for real-time updates
- Bell icon with unread badge count

## Project Structure

```
GriefBridge/
├── griefbridge-client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/              # Login & Registration (private)
│   │   │   ├── graph/             # D3.js Dependency Graph
│   │   │   ├── documents/         # Document Vault
│   │   │   ├── intake/            # Intake Questionnaire
│   │   │   ├── forms/             # Form Pre-filler
│   │   │   ├── reports/           # Reports & Export
│   │   │   ├── layout/            # Navbar, Sidebar
│   │   │   └── shared/            # Reusable UI components
│   │   ├── pages/                 # Page-level components
│   │   ├── context/               # React Context (AuthContext, CaseContext)
│   │   ├── hooks/                 # Custom hooks (useAuth, useCase, useGraph)
│   │   ├── services/              # Axios API client
│   │   ├── App.jsx                # Router & layout wrapper
│   │   └── main.jsx               # React DOM mount
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
│
├── griefbridge-server/
│   ├── src/
│   │   ├── routes/                # API endpoint definitions
│   │   ├── controllers/           # Route handlers & business logic
│   │   ├── services/              # IR engine, XML, PDF, RSS providers
│   │   ├── models/                # MongoDB schemas & validation
│   │   ├── middleware/            # Auth, file upload, error handler
│   │   ├── jobs/                  # Background tasks (deadline checker)
│   │   ├── data/                  # Seed corpus, form templates, XSLT stylesheets
│   │   ├── xslt/                  # XML-to-HTML transformation stylesheets
│   │   └── app.js                 # Express app setup & middleware
│   ├── .env.example
│   └── package.json
│
└── README.md                       # This file
```

## Technology Stack

### Frontend
- **React 18** - Component-based UI
- **Vite** - Lightning-fast build tool
- **D3.js v7** - Force-directed graph visualization
- **Framer Motion** - Smooth animations
- **GSAP** - SVG particle effects
- **Bootstrap 5** - Responsive layout system
- **Axios** - HTTP client with interceptors
- **React Router v6** - Protected routes, role-based access

### Backend
- **Node.js 18** + **Express 4** - REST API server
- **MongoDB Atlas** - NoSQL database (free M0 tier supported)
- **GridFS** - File storage for documents >16MB limit
- **JWT** - Stateless authentication
- **bcrypt** - Password hashing (10 rounds)
- **xmlbuilder2** - XML generation & validation
- **xsltproc** - XSLT transformation via child process
- **Puppeteer** - HTML-to-PDF rendering
- **node-cron** - Scheduled background jobs
- **RSS** - RSS 2.0 feed generation
- **zlib** - Compression for export bundles

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (free M0 cluster)
- Git

### Backend Setup

```bash
cd griefbridge-server
npm install

# Copy .env template and configure
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
nano .env
```

**Required .env variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/griefbridge
JWT_SECRET=your-min-64-character-random-string-here
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173
```

```bash
# Seed procedure corpus into MongoDB
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd griefbridge-client
npm install

# Copy .env template and configure
cp .env.example .env
# VITE_API_URL should point to your backend
echo "VITE_API_URL=http://localhost:5000/api" >> .env
```

```bash
# Start development server with HMR
npm run dev
# Frontend runs on http://localhost:5173
```

### First Run

1. Open browser to `http://localhost:5173`
2. Click **"Start Free"** or navigate to `/register`
3. Create an account with your email and password
4. Complete the **13-step intake questionnaire** (takes ~5 minutes)
5. View your **personalized dependency graph** showing all relevant procedures
6. Click any node to see detailed task information
7. Mark tasks complete to see animations and unlock dependent tasks
8. Upload documents to your secure vault
9. Export your case as XML or PDF for archived records

**What happens behind the scenes:** The intake questionnaire captures key information about the deceased and family circumstances. Our weighted matching algorithm analyzes this against 40+ procedures to create your personalized workflow—no generic lists, just what's actually relevant to you.

## API Documentation

### Authentication Routes
```
POST   /api/auth/register          # Create new user account
POST   /api/auth/login             # Login with credentials
GET    /api/auth/profile           # Get user profile (requires JWT)
PATCH  /api/auth/profile           # Update profile (requires JWT)
POST   /api/auth/logout            # Clear JWT cookie
```

### Case Routes (all require JWT)
```
POST   /api/cases                  # Create new case with intake answers
GET    /api/cases                  # Get all user's cases
GET    /api/cases/:caseId          # Get single case details
PATCH  /api/cases/:caseId/procedures/:procedureId  # Update procedure status
DELETE /api/cases/:caseId          # Delete case and associated data
GET    /api/cases/:caseId/rss      # Get RSS feed for case (public, no JWT needed)
```

### Document Routes (require JWT)
```
POST   /api/documents              # Upload document to case
GET    /api/documents/case/:caseId # Get all documents for case
DELETE /api/documents/:docId       # Delete specific document
PATCH  /api/documents/:docId       # Update document type/tags
```

### Export Routes (require JWT)
```
GET    /api/forms/export/xml/:caseId    # Download XML bundle (.gb file)
GET    /api/forms/export/pdf/:caseId    # Download PDF report
```

### Notification Routes (require JWT)
```
GET    /api/notifications               # Get user's notifications
GET    /api/notifications/unread/count  # Get unread count
PATCH  /api/notifications/:notifId/read # Mark notification as read
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  passwordHash: String (bcrypt),
  fullName: String,
  cases: [{
    caseId: ObjectId,
    role: enum['OWNER', 'EDITOR', 'VIEWER']
  }],
  notificationPrefs: {
    emailAlerts: Boolean,
    rssSubscribed: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Case Collection
```javascript
{
  _id: ObjectId,
  caseId: String (unique, e.g., "GB-2024-001847"),
  ownerId: ObjectId (ref: User),
  deceased: {
    fullName: String,
    dateOfBirth: Date,
    dateOfDeath: Date,
    state: String,
    intakeAnswers: {
      isRural: Boolean,
      ownedProperty: Boolean,
      [... 8 more attributes]
    }
  },
  procedures: [{
    procedureId: String,
    title: String,
    department: String,
    requirementVector: [Number],
    status: enum['NOT_STARTED', 'UNLOCKED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'OVERDUE'],
    deadline: Date,
    dependencies: [String],
    completedAt: Date
  }],
  totalProcedures: Number,
  completedProcedures: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Document Collection
```javascript
{
  _id: ObjectId,
  caseId: ObjectId (ref: Case),
  filename: String,
  contentType: String,
  size: Number,
  gridfsId: ObjectId,
  documentType: enum['PROOF', 'FORM', 'RECEIPT', 'OTHER'],
  associatedProcedures: [String],
  verificationStatus: enum['PENDING', 'VERIFIED', 'REJECTED'],
  uploadedBy: ObjectId (ref: User),
  uploadedAt: Date,
  tags: [String]
}
```

### Procedure Collection
```javascript
{
  _id: ObjectId,
  procedureId: String (unique),
  title: String,
  description: String,
  department: String,
  requirementVector: [Number],
  dependencies: [String],
  estimatedDays: Number,
  requiredDocuments: [String],
  formTemplates: [ObjectId],
  createdAt: Date
}
```

### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  caseId: ObjectId (ref: Case),
  procedureId: String,
  type: enum['DEADLINE', 'MILESTONE', 'OVERDUE', 'UPDATE'],
  message: String,
  urgency: enum['LOW', 'MEDIUM', 'HIGH'],
  isRead: Boolean,
  createdAt: Date,
  expiresAt: Date (TTL index: 30 days)
}
```

## Deployment

### Frontend Deployment (Vercel)
```bash
# Prerequisites: Vercel account, GitHub repo connected

cd griefbridge-client
npm run build
# dist/ folder automatically deployed by Vercel

# Set environment variables in Vercel dashboard:
# VITE_API_URL = https://your-backend-url/api
```

### Backend Deployment (Render/Railway/Heroku)
```bash
# Prerequisites: Git repository pushed to GitHub

cd griefbridge-server
# Connect repository to deployment platform
# Set environment variables:
MONGODB_URI=<your-atlas-connection-string>
JWT_SECRET=<generate-secure-random-string>
NODE_ENV=production
PORT=5000
CORS_ORIGIN=<your-frontend-url>

# Package.json has build/start scripts
npm run build  # (if applicable)
npm start
```

### MongoDB Atlas Setup
1. Create free M0 cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user with strong password
3. Whitelist deployment IP (or 0.0.0.0/0 for demo)
4. Copy connection string to backend `MONGODB_URI`

## Development Workflow

### Starting Development Environment
**Terminal 1 - Backend:**
```bash
cd griefbridge-server
npm run dev
# Runs on :5000 with nodemon auto-reload
```

**Terminal 2 - Frontend:**
```bash
cd griefbridge-client
npm run dev
# Runs on :5173 with Vite HMR
```

**Browser:**
Navigate to `http://localhost:5173`

### Available Commands

**Backend:**
```bash
npm run dev      # Start dev server with auto-reload
npm run seed     # Populate MongoDB with procedure corpus
npm start        # Start production server
```

**Frontend:**
```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production (dist/)
npm run preview  # Preview production build locally
npm run lint     # Run ESLint checks
```

## Key Implementation Details

### Information Retrieval Engine
The matching algorithm uses weighted binary attributes:
```
match_score = (dot_product(user_answers, procedure_requirements)) / ||procedure_requirements||
procedures_sorted = sorted(procedures_by_match_score, descending)
```

This ensures personalized procedure lists based on deceased's profile and family circumstances.

### Dependency Graph Visualization
- D3.js force-directed layout with physics simulation
- SVG nodes with 6 state-based colors
- Click handlers for side-panel detail view
- Animated transitions for state changes
- Particle effects on edge completion (GSAP)

### XML Export Pipeline
1. Convert case data to LegalXML format with namespace
2. Sign bundle with SHA-256 cryptographic hash
3. Transform via XSLT to HTML report (xsltproc binary)
4. Compress with ZLIB to `.gb` format
5. Generate download link

### PDF Form Rendering
- Puppeteer headless browser renders HTML
- Form templates with `{{PLACEHOLDER}}` fields
- Configurable timeout (default 30s)
- Supports landscape/portrait orientations

## Performance Considerations

- **Frontend:** Code splitting via React.lazy() for future optimization
- **Backend:** MongoDB indexes on frequently queried fields (caseId, userId)
- **Files:** GridFS handles documents >16MB without memory buffering
- **Notifications:** node-cron job runs hourly, not on every request
- **D3 Graph:** Optimized for 40-50 nodes; further optimization possible with force-directed clustering

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (12+)
- IE11: ⚠️ Requires polyfills (not recommended)

## Security Measures

- **Passwords:** Bcrypt hashing with 10 salt rounds
- **Tokens:** JWT stored in httpOnly cookies (XSS-safe)
- **CORS:** Configured to specific origin(s)
- **Validation:** Input sanitization on all endpoints
- **File Upload:** MIME type validation, size limits
- **XML Signing:** SHA-256 cryptographic signing
- **Database:** MongoDB Atlas network access control

## Contributing

Contributions are welcome! Whether it's bug fixes, new features, documentation improvements, or translations, your help makes GriefBridge better for everyone.

**Contribution Steps:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with a clear description

**Development Standards:**
- Write clean, readable code with comments for complex logic
- Test your changes before submitting
- Follow the existing code style
- Update documentation as needed

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- D3.js community for excellent visualization libraries
- MongoDB documentation and tutorials
- Express.js and Node.js ecosystems
- React and Vite communities for modern tooling

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the project maintainers.

---

**For Developers:** See `griefbridge-client/README.md` and `griefbridge-server/README.md` for component-specific documentation and development guidelines.

**Questions?** Open an issue on GitHub or reach out to the community.
