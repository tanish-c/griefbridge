# GriefBridge - Complete Project Implementation Guide

## Project Overview

GriefBridge is an **Intelligent Post-Bereavement Workflow & Document Management System** designed to help Indian families navigate the complex bureaucratic processes following a death.

- **Course:** ITTC 601 - Web Technology
- **Credits:** 4 (3L-0T-2P)
- **Prerequisite:** Data Structures

## Project Structure

The project is split into **two main directories**:

```
GriefBridge/
├── griefbridge-client/     # React + Vite frontend
├── griefbridge-server/     # Node.js + Express backend
└── README.md               # This file
```

## Quick Start

### 1. Backend Setup

```bash
cd griefbridge-server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT secret

# Seed the procedure corpus
npm run seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd griefbridge-client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Environment should already have VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Test the Application

1. Open browser to `http://localhost:5173`
2. Click "Start Your Case Free" or navigate to `/register`
3. Create an account
4. Complete the 13-question intake questionnaire
5. Watch the D3.js dependency graph render
6. Click nodes to see task details and mark complete

## Technology Stack Justification

Every technology is used because the problem domain demands it. See the complete mapping in [README.md](README.md#-syllabus-coverage).

### Why These Specific Technologies?

| Component | Technology | Why |
|-----------|-----------|-----|
| Graph | D3.js | Only library with SVG control for custom edge animations |
| Animations | Framer Motion + GSAP | React-integrated + SVG path particle effects |
| State Management | React Context | No external dependency, perfect for this scope |
| Authentication | JWT + httpOnly cookies | Stateless, secure (XSS protection) |
| IR Engine | Weighted attributes | Not search - deterministic matching of procedures |
| Document Storage | GridFS | Streams large files without buffering |
| XML Export | xmlbuilder2 + XSLT + Crypto | Legal standard, tamper-proof bundles |
| PDF | Puppeteer | Browser rendering, pixel-perfect output |
| Background Jobs | node-cron | No external infrastructure, runs in-process |
| Deployment | Vercel + Render | Free tiers sufficient, no credit card needed |

## Project Deliverables (Phase 1)

### Implemented

- **Authentication** - Register, login, profile management with JWT
- **Intake IR Engine** - 10-question questionnaire, weighted binary matching algorithm
- **Dependency Graph** - D3.js visualization with 6 node states and animations
- **Document Vault** - Upload, storage in GridFS, auto-association to tasks
- **Case Management** - Create/read/update/delete cases with collaborators
- **XML Export** - Build, sign, compress, download legal bundles
- **XSLT Pipeline** - Transform XML to HTML to PDF via child process
- **RSS Feed** - Deadline feed per case, subscribable in RSS readers
- **Background Jobs** - Hourly deadline checker, notification creation
- **Error Handling** - Global middleware, input validation, rate limiting

### 📅 Phase 2 (In Progress/Next)

- Form pre-filler for 10+ government forms
- Community Experiences social layer
- TF-IDF search on experiences
- Expanded procedure corpus
- Mobile responsiveness polish

### 🎯 Phase 3 (Future)

- Mobile app (React Native)
- Multi-language support
- Legal aid NGO integrations
- Government e-service APIs

## 💾 Database Setup

### MongoDB Atlas (Free M0 Cluster)

1. Go to [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create M0 free cluster
4. Create database user with password
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/griefbridge?retryWrites=true&w=majority
   ```
6. Whitelist IP (0.0.0.0/0 for demo, or specific IP for production)
7. Add to `.env` file

### Collections Created

- `users` - User accounts
- `cases` - Bereavement cases
- `documents` - Document metadata
- `procedures` - Procedure corpus (seeded)
- `notifications` - Deadline alerts
- `experiences` - Community posts (Phase 2)

### Seed Data

```bash
npm run seed    # In griefbridge-server/
```

This populates `procedures` collection with 11+ core procedures.

## Security Features

- **Password Hashing** - bcrypt with 10 salt rounds
- **JWT in httpOnly Cookies** - Not localStorage (XSS protection)
- **CORS Hardened** - Specific origin, not wildcard
- **Rate Limiting** - 5 login attempts per 15min, 100 requests per 15min
- **Input Validation** - express-validator on all inputs
- **Multer File Validation** - Only PDF/JPG/PNG, 10MB limit
- **Cryptographic Signatures** - SHA-256 on XML exports
- **GridFS Isolation** - Documents keyed by caseId  

## 📊 Key Implementation Details

### IR Engine (ir.service.js)

Procedure matching uses **weighted binary attribute scoring**:

```
For each procedure:
  score = Σ(answer[attr] × weight[attr]) / Σ(weight[attr])
  if score >= 0.5: include in case
```

Results ordered by legal priority (death cert first) then score.

### D3 Graph Integration (useGraph.js)

React + D3 integration pattern:
- D3 manages SVG DOM in `useRef` container
- React state (`selectedNode`, `nodeStates`) passed via `useEffect`
- Node clicks call React `setState` callback
- Re-renders don't destroy D3 simulation

### XML Export Pipeline (xml.service.js)

1. `xmlbuilder2` builds XML from case data
2. `crypto.createHash` signs with SHA-256
3. `execFileSync` spawns `xsltproc` (child process)
4. XSLT transforms to HTML
5. `Puppeteer` renders HTML to PDF
6. `zlib.gzipSync` compresses XML
7. Stream to client as `.gb` file

### Background Jobs (deadlineChecker.job.js)

- `node-cron` runs hourly
- Checks all active cases for:
  - Deadlines ≤ 1 day (URGENT)
  - Deadlines ≤ 7 days (URGENT)
  - Deadlines ≤ 30 days (REMINDER)
  - Overdue items (ALERT)
- Creates `Notification` records
- Frontend AJAX polls every 60s

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd griefbridge-client
npm run build
# dist/ folder auto-deployed to Vercel
```

### Backend (Render.com)

```bash
cd griefbridge-server
# GitHub repo → Render Web Service
# Set env vars: MONGODB_URI, JWT_SECRET, BASE_URL, CORS_ORIGIN
# Start command: node src/app.js
```

### Database (MongoDB Atlas)

Already free M0 cluster - no setup needed beyond .env

## Performance Considerations

- **Code Splitting** - React.lazy() for page routes (Phase 2)
- **Bundle Size** - Vite tree-shaking, only imports used
- **Database Indexes** - Compound indexes on common queries
- **Caching** - Browser caches static assets, API responses
- **Streaming** - GridFS for large document uploads
- **Pagination** - Notification list limited to 50 items

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check MongoDB connection
# Edit .env MONGODB_URI
# Make sure IP is whitelisted in Atlas

npm run seed    # Verify procedures table is populated
```

### Frontend shows blank page

```bash
# Check browser console for errors
# Verify VITE_API_URL is correct
# Backend should respond to http://localhost:5000/api/health
```

### D3 graph not rendering

```bash
# Check that activeCase has procedures
# Browser DevTools → Network → verify /api/cases returns data
# Container ref should not be null
```

### Multer file upload fails

```bash
# Check MongoDB connection
# GridFS requires 3 collections: fs.files, fs.chunks, fs.uploads
# These are created automatically
# File size must be < 10MB
```

## 📚 Documentation

- [Main README](README.md) — Project overview, architecture, features
- [Backend README](griefbridge-server/README.md) — API docs, deployment
- [Frontend README](griefbridge-client/README.md) — Component guide, development
- [Specification](SPECIFICATION.md) — Complete requirements (if created)

## 👥 Team Notes

This is a **solo project** for ITTC 601 but structured for **team scalability**:

- Features are independently scoped (can be assigned to different developers)
- Phase 1 is fully functional standalone
- Phase 2 features don't break Phase 1
- Database design supports user collaboration (roles: OWNER, CONTRIBUTOR, VIEWER)

## 🎓 Learning Outcomes

By completing this project, you'll understand:

✅ Full-stack web development (frontend, backend, database)  
✅ Information retrieval techniques (IR engine implementation)  
✅ Document processing (XML, XSLT, PDF via Puppeteer)  
✅ Data visualization (D3.js force-directed layouts)  
✅ Animation techniques (Framer Motion, GSAP)  
✅ Real-time updates (AJAX polling, WebSocket preparation)  
✅ Security best practices (JWT, bcrypt, input validation)  
✅ Cloud deployment (Vercel, Render, MongoDB Atlas)  
✅ Database design (MongoDB flexible schema)  

## 🔗 Useful Resources

- [D3.js Force Simulation](https://github.com/d3/d3-force)
- [React Router v6](https://reactrouter.com/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/schema-validation/)
- [XSLT Tutorial](https://www.w3.org/Style/XSL/)
- [Puppeteer PDF Rendering](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagetopdfoptionsv)

## ❓ FAQ

**Q: Can I use SQLite instead of MongoDB?**  
A: The project emphasizes MongoDB specifically because:
- Flexible schema for variable procedure sets
- GridFS for file storage
- Seeded with 11+ document types (Unit 5)
- Cloud deployment (Atlas free tier) matches syllabus requirement

**Q: Do I need to deploy to real servers?**  
A: For evaluation:
- Local dev is sufficient (localhost:5173 + localhost:5000)
- OR deploy to free tiers (Vercel + Render + Atlas)
- Both fully functional for demo

**Q: How do I handle XSLT if system doesn't have xsltproc?**  
A: The code gracefully falls back:
```javascript
try {
  execFileSync('xsltproc', [...]);
} catch (err) {
  console.warn('xsltproc not available, using XML only');
  // Still returns valid XML, just skips PDF
}
```

**Q: Can I build this with different tech?**  
A: Technically yes, but each tech choice here maps to the ITTC 601 syllabus specifically.

## 📝 License

Educational use only. ITTC 601 course project.

---

**Status:** Phase 1 ✅ (Production-ready for demo)  
**Total Lines:** ~2500+ (frontend) + ~1500+ (backend) = 4000+ lines  
**Time to understand:** 2 hours (architecture walk-through)  
**Time to extend:** 4-6 hours per new feature  

**Happy coding!** 🚀
