# GriefBridge - Intelligent Post-Bereavement Workflow & Document Management System

**Course:** ITTC 601 - Web Technology (4 credits: 3L-0T-2P)

## Overview

GriefBridge is a full-stack web application that guides Indian families through all administrative, legal, and financial procedures following a death, from death certificates to EPF claims to property mutation, through a single personalized, intelligent platform.

### Problem It Solves

When someone dies in India, grieving families must navigate 8-12 different government departments and private institutions, each with its own forms, deadlines, and documentation requirements. This process happens during acute emotional distress with no centralized guide.

GriefBridge converts this bureaucratic maze into a single, intelligent, personalized digital workflow.

## Project Structure

```
GriefBridge/
├── griefbridge-client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Login & Registration
│   │   │   ├── graph/           # D3.js Dependency Graph
│   │   │   ├── documents/       # Document Vault
│   │   │   ├── intake/          # Intake Questionnaire
│   │   │   ├── forms/           # Form Pre-filler
│   │   │   ├── reports/         # Reports & Export
│   │   │   ├── layout/          # Navbar, Sidebar
│   │   │   └── shared/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React Context for auth & case
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API client
│   │   └── App.jsx              # Main app component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── griefbridge-server/          # Node.js + Express backend
│   ├── src/
│   │   ├── routes/              # API routes
│   │   ├── controllers/         # Route handlers
│   │   ├── services/            # Business logic (IR, XML, RSS)
│   │   ├── models/              # MongoDB schemas
│   │   ├── middleware/          # Auth, upload, error handling
│   │   ├── jobs/                # Background jobs (deadline checker)
│   │   ├── data/                # Seed data & form templates
│   │   ├── xslt/                # XSLT stylesheet for PDF report
│   │   └── app.js               # Express app setup
│   ├── .env.example
│   └── package.json
└── README.md
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **D3.js** - Dependency graph visualization
- **Framer Motion** - Animations
- **GSAP** - SVG animations
- **Bootstrap 5** - Responsive layout
- **Axios** - HTTP client

### Backend
- **Node.js 18** + **Express 4** - REST API
- **MongoDB** - Database (Atlas M0 free tier)
- **GridFS** - File storage for documents
- **JWT** - Authentication
- **xmlbuilder2** - XML generation
- **XSLT** - XML-to-HTML transformation
- **Puppeteer** - HTML-to-PDF rendering
- **node-cron** - Scheduled deadline checks
- **RSS** - Deadline feed generation

## Key Features (Phase 1)

### F1: Authentication & Multi-Case Management
- User registration with bcrypt password hashing
- JWT-based stateless authentication
- Each user can manage multiple cases
- Case sharing with family members by role

### F2: Intake IR Engine
- 10-question questionnaire about deceased
- Weighted binary attribute matching algorithm
- Generates personalized, priority-ordered procedure list
- 40+ procedure corpus in MongoDB

### F3: Interactive Dependency Graph
- D3.js force-directed graph visualization
- 6 node states: NOT_STARTED, UNLOCKED, IN_PROGRESS, BLOCKED, COMPLETED, OVERDUE
- Animated state transitions with Framer Motion
- GSAP particle animations on edge completion
- Click-to-detail side panel with task information

### F4: Document Vault
- Drag-and-drop file upload (PDF, JPG, PNG)
- Multer stream-based upload to GridFS
- Auto-association of documents to procedures
- Document type tagging and status tracking

### F5: Form Pre-filler
- XML form templates with `{{PLACEHOLDER}}` tokens
- Auto-fills from case data
- Puppeteer renders to PDF
- Supports: EPF Form 20, Bank Transfer, Insurance Claim

### F6: XML Legal Bundle Export
- Cases exported as LegalXML with namespace
- SHA-256 cryptographic signing
- XSLT transformation to formatted HTML report
- ZLIB compression for download as `.gb` file

### F7: Deadline RSS Feed
- Per-case RSS feed of upcoming deadlines
- Dynamically generated on request
- Subscribable in Feedly, Outlook, Google News
- Urgency prefixes: URGENT (≤7 days), REMINDER (≤30 days)

### F8: Notification System
- node-cron hourly deadline checker
- Creates notifications for deadlines and overdue items
- AJAX polling from frontend for real-time updates (60s interval)
- Bell icon with unread badge count

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free M0 cluster)

### Backend Setup

1. **Clone/navigate to server**
   ```bash
   cd griefbridge-server
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Seed procedure corpus**
   ```bash
   npm run seed
   ```

4. **Start dev server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client**
   ```bash
   cd griefbridge-client
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   # VITE_API_URL should point to your backend
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## API Documentation

### Authentication Routes
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (requires JWT)
- `PATCH /api/auth/profile` - Update profile (requires JWT)

### Case Routes (require JWT)
- `POST /api/cases` - Create case with intake answers
- `GET /api/cases` - Get user's cases
- `GET /api/cases/:id` - Get single case
- `PATCH /api/cases/:id/procedures/:procedureId` - Update procedure status
- `DELETE /api/cases/:id` - Delete case

### Document Routes (require JWT)
- `POST /api/documents` - Upload document (multipart/form-data)
- `GET /api/documents/case/:caseId` - Get case documents
- `DELETE /api/documents/:id` - Delete document
- `PATCH /api/documents/:id` - Update document type

### RSS & Export Routes
- `GET /api/cases/:id/rss` - Get RSS feed for case deadlines (public)
- `GET /api/forms/export/xml/:id` - Download XML bundle (requires JWT)
- `GET /api/forms/export/pdf/:id` - Download PDF report (requires JWT)

## Database Schema

### User Collection
```javascript
{
  email: String (unique),
  passwordHash: String,
  fullName: String,
  cases: [{ caseId: ObjectId, role: String }],
  notificationPrefs: { email: Boolean, rss: Boolean },
  createdAt: Date
}
```

### Case Collection
```javascript
{
  caseId: String, // e.g., "GB-2024-001847"
  ownerId: ObjectId,
  deceased: {
    name: String,
    dateOfDeath: Date,
    state: String,
    intakeAnswers: { /* 10 boolean fields */ }
  },
  procedures: [{
    procedureId: String,
    title: String,
    department: String,
    status: enum['NOT_STARTED', 'UNLOCKED', ...],
    deadline: Date,
    dependencies: [String],
    completedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Document Collection
```javascript
{
  caseId: ObjectId,
  type: String,
  filename: String,
  gridfsId: ObjectId,
  uploadedBy: ObjectId,
  uploadedAt: Date,
  associatedProcedures: [String],
  verificationStatus: enum['PENDING', 'VERIFIED', 'REJECTED']
}
```

## Deployment

### Frontend (Vercel)
```bash
cd griefbridge-client
npm run build
# Deploy dist/ to Vercel
```

### Backend (Render)
```bash
cd griefbridge-server
# Push to GitHub
# Connect to Render.com
# Set environment variables (MONGODB_URI, JWT_SECRET)
# Deploy
```

### Database (MongoDB Atlas)
1. Create free M0 cluster on atlas.mongodb.com
2. Create database user with password
3. Whitelist Render IP (or 0.0.0.0/0 for demo)
4. Copy connection string to environment variables

## Syllabus Coverage

| Unit | Topic | Implementation |
|------|-------|-----------------|
| 1 | HTML5/CSS3 | Semantic forms, responsive layout |
| 1 | Bootstrap 5 | Mobile-first responsive UI |
| 1 | Web 2.0 | Community experiences layer (Phase 2) |
| 1 | Client-Server/HTTP | REST API, JWT in cookies, multipart uploads |
| 2 | Information Retrieval | Weighted binary attribute matching IR engine |
| 2 | Web IR Architecture | TF-IDF search on community experiences (Phase 2) |
| 3 | XML | LegalXML-structured case export |
| 3 | XSLT | Transforms XML to HTML report via child process |
| 3 | XPath | Extracts procedures & deadlines from XML |
| 3 | RSS/Atom | Per-case deadline RSS feed |
| 4 | React.js | Full SPA with Router, State, Hooks, Context |
| 4 | React Router | 6 protected pages with role-based access |
| 4 | React State/Props | Dependency graph state propagation |
| 4 | AJAX | Polling for notifications, live updates |
| 5 | Node.js + Express | REST API, business logic server-side |
| 5 | Node.js Streams | Multer piping to GridFS |
| 5 | ZLIB | Compresses XML bundle for download |
| 5 | Crypto | SHA-256 signatures for legal bundles |
| 5 | Child Process | XSLT via spawned xsltproc |
| 5 | MongoDB | Flexible schema, GridFS storage |

## Future Work (Phase 2 & 3)

### Phase 2
- Form pre-filler for 10+ government forms
- XML → PDF pipeline completeness
- Expanded RSS feed with subscription UI
- Community Experiences layer
- TF-IDF search on experiences
- Expanded procedure corpus (40+)

### Phase 3
- Mobile app (React Native)
- Multi-language support (Hindi, Marathi, Tamil)
- Live video guidance for procedures
- Integration with government e-services
- Blockchain for document verification
- Legal aid NGO partnerships

## Security Notes

- **JWT in httpOnly cookies** - not localStorage (XSS protection)
- **Password hashing with bcrypt** - never store plaintext
- **CORS hardened** - specific origin only, not wildcard
- **Rate limiting** on auth endpoints
- **Input validation** via express-validator
- **Multer file type validation** - only PDF/JPG/PNG
- **GridFS storage** - secure document isolation by caseId
- **SHA-256 signing** - detects tampering with legal bundles

## Demo Walkthrough

1. **Register**: Create account at `/register`
2. **Create Case**: Answer 10-question intake on `POST /api/cases`
3. **View Workflow**: D3.js graph renders personalized procedures
4. **Upload Document**: Drag-drop document to vault
5. **Track Progress**: Click nodes, mark complete
6. **Export**: Download XML bundle or PDF report

## Team & Attribution

**Course:** ITTC 601 - Web Technology  
**Institution:** [Your Institution]  
**Credits:** 4 (3L-0T-2P)

## License

Educational use only. ITTC 601 course project.

---

**Built with:** React, D3.js, Node.js, MongoDB, XSLT, Puppeteer  
**Deploy on:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)  
**Free tier sufficient** for full demo and evaluation.
