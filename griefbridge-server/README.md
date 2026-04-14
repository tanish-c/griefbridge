# GriefBridge Backend API

REST API server for GriefBridge - Post-Bereavement Workflow Management System

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free M0 cluster)

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed      # Seed procedure corpus
npm run dev       # Start development server
```

### Environment Variables

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/griefbridge
JWT_SECRET=your-64-character-secret-key-here
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Auth

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile

### Cases

- `POST /api/cases` - Create new case
- `GET /api/cases` - List user's cases
- `GET /api/cases/:id` - Get single case
- `PATCH /api/cases/:id/procedures/:procedureId` - Update procedure status
- `DELETE /api/cases/:id` - Delete case
- `GET /api/cases/:id/rss` - Get RSS feed

### Documents

- `POST /api/documents` - Upload document
- `GET /api/documents/case/:caseId` - List documents
- `DELETE /api/documents/:id` - Delete document
- `PATCH /api/documents/:id` - Update document

### Forms & Export

- `GET /api/forms/export/xml/:id` - Export XML bundle
- `GET /api/forms/export/pdf/:id` - Export PDF report

### Notifications

- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread/count` - Count unread
- `PATCH /api/notifications/:id/read` - Mark as read

## Architecture

### Services

- **ir.service.js** - Intake IR engine (weighted attribute matching)
- **xml.service.js** - XML building, signing, XSLT, ZLIB compression
- **rss.service.js** - RSS feed generation
- **notification.service.js** - Deadline checking and alerts

### Background Jobs

- **deadlineChecker.job.js** - Runs hourly, creates deadline notifications

### Middleware

- **auth.middleware.js** - JWT verification
- **upload.middleware.js** - Multer + GridFS configuration
- **error.middleware.js** - Global error handler

## Development

```bash
npm run dev        # Start with nodemon
npm run seed       # Seed procedures corpus
npm start          # Production start
```

## Deployment

### Render.com

1. Connect GitHub repository
2. Set environment variables
3. Build: `npm install`
4. Start: `node src/app.js`
5. Auto-deploys on git push

### MongoDB Atlas

1. Create free M0 cluster
2. Create database user
3. Whitelist IP (or 0.0.0.0/0 for demo)
4. Copy connection string

## Key Files

- `src/app.js` - Express app setup
- `src/models/` - MongoDB schemas
- `src/services/` - Business logic
- `src/controllers/` - Route handlers
- `src/routes/` — API routes
- `src/xslt/caseReport.xsl` — XML-to-HTML stylesheet
