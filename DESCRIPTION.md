# GriefBridge - Project Description

**An Intelligent Post-Bereavement Workflow & Document Management System**

---

## Table of Contents
1. [Executive Overview](#executive-overview)
2. [The Problem](#the-problem)
3. [The Solution](#the-solution)
4. [Core Features](#core-features)
5. [System Architecture](#system-architecture)
6. [How It Works](#how-it-works)
7. [Technical Innovation](#technical-innovation)
8. [Use Cases](#use-cases)
9. [Impact & Benefits](#impact--benefits)
10. [Scalability & Future](#scalability--future)

---

## Executive Overview

GriefBridge is a full-stack web application designed to guide Indian families through all administrative, legal, and financial procedures following a death. It transforms a confusing bureaucratic maze into a single, personalized, intelligent digital workflow.

**Key Fact:** When someone dies in India, grieving families must navigate 8-12 different government departments and private institutions, each with its own forms, deadlines, and documentation requirements. This happens during acute emotional distress with no centralized guide.

**GriefBridge Solution:** One intelligent platform. One personalized workflow. All procedures in one place.

---

## The Problem

### The Administrative Burden After Death

When a person dies in India, their family faces an enormous administrative burden:

**Multiple Departments to Navigate:**
- Municipal Corporation (Death Certificate)
- Pension office (EPF claims, pension transfer)
- Banks (account transfer, frozen account access)
- Insurance companies (death claim processing)
- Property registration office (property mutation, transfer)
- Income Tax (death intimation, final return filing)
- RTO (vehicle transfer, cancellation)
- GST authority (business closure, GST transfer)
- Employer HR (final settlement, gratuity)
- Plus dozens more depending on the deceased's assets and liabilities

**The Chaos:**
- **No centralized information** - Each department has different forms and requirements
- **Unclear deadlines** - Legal deadlines vary (some 30 days, some 6 months, some 1 year)
- **Hidden dependencies** - Some procedures must be done before others (e.g., Death Certificate before property transfer)
- **Emotional distress** - All this happens while grieving families are in acute emotional pain
- **Lost documents** - Families often don't know which documents are needed or where to find them
- **Duplicate work** - Same information entered in multiple forms
- **Language barriers** - Complex legal documents in Hindi/English or regional languages

**Current State:** Families rely on:
- Expensive lawyers (₹10,000-50,000+)
- Unreliable consultants
- Word-of-mouth advice
- Trial and error
- Multiple visits to government offices

**Result:** 2-6 months of stress and confusion, and significant financial expense.

---

## The Solution

### GriefBridge: One Platform for All Procedures

GriefBridge centralizes all post-death administrative procedures into a single, intelligent platform.

**Core Value Propositions:**

1. **Personalization** - Procedures are customized based on family circumstances (income, assets, property, business)
2. **Prioritization** - Legal deadlines are tracked and procedures are prioritized by urgency
3. **Guidance** - Step-by-step instructions for each procedure, state-specific variations
4. **Document Management** - Central vault for all required documents
5. **Automation** - Forms are pre-filled with available data, reducing manual entry
6. **Real-time Tracking** - Families see their progress across all procedures
7. **Zero Cost** - Completely free (no consultant fees, no lawyer needed)

---

## Core Features

### 1. **Intelligent Intake Questionnaire**

**What:** A 13-step form that gathers information about the deceased and their assets/liabilities.

**How:** Uses 10 binary decision questions:
- Is the deceased a government employee?
- Does the deceased have EPF/gratuity?
- Does the deceased have property?
- Does the deceased have a bank account?
- Does the deceased own a vehicle?
- Does the deceased have an insurance policy?
- Is there a pending income tax return?
- Does the deceased have a business?
- Is there a mortgage/loan?
- Are there minor children?

**Why:** These 10 questions cover 95% of common scenarios and determine which procedures are applicable.

**Technical Implementation:** 
- React form with validation
- Progress tracking
- Can be saved and resumed

---

### 2. **Information Retrieval (IR) Engine**

**What:** The intelligent matching algorithm that determines which procedures are relevant.

**How It Works:**
- Each of the 43+ procedures in the corpus has a "requirement vector" (10 binary attributes)
- User's answers are compared against each procedure's requirements using weighted dot product
- Scores are normalized (0-1 scale) and procedures with score ≥0.5 are recommended
- Results are sorted by legal priority and deadline urgency

**Example:**
```
User answers: [is_govt_emp=true, has_epf=true, has_property=false, ...]

Procedure: PENSION_TRANSFER
  Requirements: [is_govt_emp=true, has_epf=true, ...]
  Score: 0.95 (very relevant)
  
Procedure: PROPERTY_MUTATION  
  Requirements: [has_property=true, ...]
  Score: 0.0 (not relevant)
```

**Why:** Instead of showing all 43 procedures to every user, the system shows only the 4-8 procedures actually relevant to their situation.

**Technical Implementation:**
- Backend: ir.service.js (normalized scoring algorithm)
- Database: Procedure collection with requirement vectors
- Frontend: Results display as interactive D3.js visualization

---

### 3. **D3.js Dependency Graph Visualization**

**What:** An interactive force-directed graph showing all procedures and their dependencies.

**Visual Elements:**
- **Nodes:** Each procedure as a circular node with a color indicating status
- **Edges:** Arrows showing dependencies between procedures
- **Status Colors:**
  - Gray: NOT_STARTED (not available yet)
  - Light Blue: UNLOCKED (can be started)
  - Blue: IN_PROGRESS (currently being worked on)
  - Orange: BLOCKED (waiting for dependencies to complete)
  - Green: COMPLETED (finished)
  - Red: OVERDUE (deadline passed)

**Interactions:**
- Click any node to see detailed information
- Mark procedures as complete with one click
- Dependent procedures automatically unlock
- Drag nodes to rearrange
- Zoom and pan to navigate

**Example Flow:**
```
User clicks "Mark Complete" on Death Certificate
  ↓
Death Certificate turns green
  ↓
Dependent procedures (Bank Transfer, Insurance Claim) automatically turn light blue
  ↓
User can now start those procedures
```

**Why:** Helps families understand the workflow visually without reading long documents.

**Technical Implementation:**
- Frontend: D3.js v7 force simulation
- State Management: React Context + useGraph hook
- Animations: GSAP + Framer Motion
- Real-time Updates: Socket.io events

---

### 4. **Contextual Procedure Guides**

**What:** Detailed step-by-step guides for each procedure with state-specific variations.

**Content for Each Procedure:**
- **What:** What is this procedure and why is it needed?
- **Where:** Which department/institution to contact (with addresses/phone numbers)
- **How:** Step-by-step instructions (8-12 steps usually)
- **Time & Cost:** How long does it take? How much does it cost?
- **Required Documents:** What documents are needed?
- **Legal Importance:** Why is this legally important?
- **Common Challenges:** What problems do families encounter?
- **Tips:** Insider tips to make the process smoother
- **Website/Contact:** Official government website and contact numbers

**State Variations:**
- Procedures vary by state (Death Certificate process differs in Delhi vs Mumbai vs Bangalore)
- Each procedure has default + state-specific guides
- System automatically shows the correct guide based on user's state

**Example (Death Certificate):**
```
Default:
  Where: Municipal Corporation Civil Registration Department
  How: [Generic 7-step process]
  Time: 7-10 days
  
Delhi-specific:
  Where: EDMC/NDMC/SDMC office OR online portal (igris.delhi.gov.in)
  How: [Delhi-specific 6-step process]
  Time: 3-7 days
  Cost: Free (vs ₹50-100 in other states)
```

**Why:** Families don't need to search the internet for state-specific procedures. Everything is built-in.

**Technical Implementation:**
- Backend: procedureGuide.service.js
- Data: procedures.guide.json (1,000+ lines of detailed guides)
- Frontend: Expandable panel showing guides

---

### 5. **Document Vault with GridFS**

**What:** Centralized storage for all documents needed across procedures.

**Features:**
- Drag-and-drop file upload
- Automatic association with relevant procedures
- Type validation (PDF, JPEG, PNG only)
- No file size limits (uses GridFS for >16MB files)
- Search and categorize documents

**Document Types Tracked:**
- Death Certificate
- Bank statements
- Insurance policies
- Property documents
- ID proofs
- Pension/EPF certificates
- Medical reports
- Will and testament
- Tax returns
- Employer documents

**Why:** Families can upload documents once and use them across multiple procedures instead of gathering the same document multiple times.

**Technical Implementation:**
- Frontend: Drag-drop upload UI
- Backend: Multer stream-based upload + GridFS storage
- Database: Document collection with GridFS references
- No memory buffering (streams documents directly to disk)

---

### 6. **Intelligent Form Pre-filler**

**What:** Auto-completes government and institutional forms using case data.

**Supported Forms:**
1. EPF Form 20 (Pension claim)
2. EPF Form 10D (withdrawal for non-government employees)
3. Bank Nomination Form (update nominee)
4. Life Insurance Claim Form
5. Succession Affidavit (legal form)
6. Income Tax Final Return (ITR-1)
7. Aadhar Death Update (UIDAI)
8. Vehicle Transfer Form (RTO)

**How It Works:**
```
Step 1: User answers intake questionnaire
  ↓
Step 2: System extracts relevant data from case
  · Deceased name, DOB, address, date of death
  · Family member details (nominee, beneficiary)
  · Procedure-specific data
  ↓
Step 3: Form template receives data via variable substitution
  · {{DECEASED_NAME}} → "Rajesh Kumar"
  · {{NOMINEE_NAME}} → "Priya Kumar"
  ↓
Step 4: User reviews and fills missing fields
  ↓
Step 5: Export as PDF or submit digitally
```

**Why:** Eliminates repetitive data entry. The same information entered once is reused across 8+ forms.

**Technical Implementation:**
- Backend: formPreFiller.service.js
- Templates: HTML templates with {{PLACEHOLDER}} syntax
- Generation: Puppeteer renders HTML to PDF
- Export: Direct download or print-ready format

---

### 7. **PDF Report Generation**

**What:** Generates comprehensive PDF reports of the entire case workflow.

**Report Types:**

**Type 1: Summary Report**
- Case overview (deceased details, filing date)
- Procedure checklist with status
- Next steps
- Deadline summary

**Type 2: Comprehensive Report**
- Complete procedure details
- Full guides for all procedures
- Required documents list
- Contact information and websites
- Timeline with milestones

**Type 3: Timeline Report**
- Chronological view of all procedures
- Expected completion dates
- Dependency map
- Milestone tracking

**Why:** Families can share reports with lawyers, accountants, or other stakeholders without revealing sensitive case details.

**Technical Implementation:**
- Backend: pdfReport.service.js + Puppeteer
- HTML Templates: Dynamic generation based on case data
- Styling: CSS embedded in PDF
- Export: Direct download as .pdf file

---

### 8. **XML Legal Bundle Export**

**What:** Exports the entire case as a cryptographically-signed LegalXML document.

**What's Included:**
- Deceased information
- All procedures with status and dates
- Document metadata
- Case timeline
- Legal signature (SHA-256)

**Security Features:**
- SHA-256 cryptographic signing
- Watermark with case ID
- Timestamp of export
- Tamper detection (signature verification)

**Format:**
- LegalXML structured format (industry standard for e-government)
- XSLT transformation to HTML report
- ZLIB compression to .gb file format
- Can be submitted to government authorities or kept as archived proof

**Why:** Creates a legally-sound, exportable record of the entire case workflow for government submissions or personal records.

**Technical Implementation:**
- Backend: xml.service.js
- Generation: xmlbuilder2 for XML creation
- Transformation: xsltproc (XSLT processor) for HTML rendering
- Compression: ZLIB gzip compression
- Signing: Crypto SHA-256 hashing

---

### 9. **Real-Time Notifications**

**What:** Background job that continuously monitors deadlines and alerts families.

**How It Works:**
```
Every hour (via node-cron):
  1. Check all procedures with deadlines
  2. Calculate days until deadline
  3. Create alerts based on thresholds:
     · CRITICAL: Deadline tomorrow or overdue
     · URGENT: ≤7 days until deadline
     · REMINDER: ≤30 days until deadline
  4. Store notifications in database
  5. Push notifications via Socket.io in real-time
```

**Notification Types:**
- Deadline approaching (7, 30, 90 days)
- Deadline overdue
- Procedure status changed
- Document uploaded
- Blocked procedure can now be started

**Why:** Families never miss a legal deadline. Automatic reminders ensure nothing falls through the cracks.

**Technical Implementation:**
- Backend: deadlineChecker.job.js (node-cron)
- Real-time: Socket.io for live push notifications
- Storage: Notification collection in MongoDB
- Frontend: Bell icon with unread badge + notification panel

---

### 10. **Community Experiences & TF-IDF Search**

**What:** Community members share their experiences navigating each procedure.

**Features:**
- Share experience navigating a procedure
- Include location (city/state) and time taken
- Tag experiences (quick-process, helpful-staff, etc.)
- Mark as anonymous if desired
- Upvote and bookmark helpful experiences

**Search by:**
- Query text (TF-IDF semantic search)
- Tags (quick-process, government-friendly, etc.)
- Location (show experiences from your city)
- Trending (most upvoted in last 30 days)
- Related (similar experiences by content similarity)

**TF-IDF Algorithm:**
```
Tokenize query: "pension transfer quick processing"
  ↓
For each experience in database:
  1. Calculate Term Frequency (TF)
     TF(word) = count(word in experience) / total_words
  2. Calculate Inverse Document Frequency (IDF)
     IDF(word) = log(total_experiences / experiences_containing_word)
  3. Calculate TF-IDF score
     Score(word) = TF × IDF
  4. Sum scores for all query words
  ↓
Rank experiences by total score
  ↓
Return top 10 results
```

**Why:** Real stories from people who've done this before are more valuable than generic guides. Families feel less alone and get practical insights.

**Technical Implementation:**
- Backend: experiences.service.js (TF-IDF implementation)
- Search: Query parsing + tokenization + scoring
- Database: Experience collection with full-text indexable content
- Frontend: Search UI with filter options
- API: 8 endpoints for create/search/trending/stats/bookmarks

---

### 11. **Real-Time WebSocket Collaboration**

**What:** Socket.io integration for real-time updates across devices.

**Real-time Events:**
- Procedure status changes (broadcast to family members)
- New documents uploaded (notify all viewers)
- Deadline alerts (push to all connected devices)
- Experience shared (notify subscribers)
- User typing indicator (collaborative form filling)
- Online status (see who else is viewing the case)

**Why:** If one family member marks a procedure complete, others see it instantly without refreshing. Multiple people can work on the case simultaneously without conflicts.

**Technical Implementation:**
- Backend: socket.service.js (Socket.io server)
- Authentication: JWT token verification for socket connections
- Rooms: Cases organized in Socket.io rooms (case_${caseId})
- Events: Emitted on CRUD operations via controllers
- Frontend: Socket.io client setup in CaseContext

---

## System Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│                      (React 18 + Vite)                       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │ Home     │ Auth     │Dashboard │ Intake   │ Graph    │   │
│  │          │ Pages    │          │ Form     │ Viz      │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘   │
│  ┌──────────┬──────────┬──────────┐                          │
│  │ Context  │ Hooks    │ Services │ (State & API calls)     │
│  └──────────┴──────────┴──────────┘                          │
└─────────────────────────────────────────────────────────────┘
                        HTTP REST API
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                   (Express + Node.js)                        │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐  │
│  │ Routes   │Ctrl      │Services  │Middleware            │  │
│  │ (20+)    │(6)       │(9)       │Auth/Upload/Error     │  │
│  └──────────┴──────────┴──────────┴──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Business Logic (IR, XML, PDF, RSS, Notifications)  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Jobs: Deadline Checker (node-cron every hour)       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ WebSocket Service (Socket.io real-time events)      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     MongoDB Connection String
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│                   (MongoDB Atlas Cloud)                      │
│  ┌──────┬──────┬──────────┬───────────┬─────────┬──────────┐ │
│  │User  │Case  │Document  │Procedure  │Notif    │Exp       │ │
│  │      │      │(GridFS)  │(Corpus)   │         │          │ │
│  └──────┴──────┴──────────┴───────────┴─────────┴──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Registration
  ↓
Login (JWT token)
  ↓
Create Case (13-step intake form)
  ↓
IR Engine Matches Procedures
  ↓
D3 Graph Displays Procedures & Dependencies
  ↓
User Uploads Documents / Marks Procedures Complete
  ↓
Real-time Updates via Socket.io
  ↓
Deadline Checker Job Runs Hourly
  ↓
Notifications Created & Pushed
  ↓
User Can Export XML, PDF, or RSS Feed
```

---

## How It Works

### End-to-End User Journey

**Step 1: Registration & Login**
```
User → Registration form → Email verification → Login
                             ↓
                        JWT token in httpOnly cookie
```

**Step 2: Create Case**
```
User → 13-step intake form → Answers 10 decision questions
                               ↓
                          Case created in MongoDB
```

**Step 3: IR Engine Processing**
```
Backend receives intake answers
  ↓
IR Engine scores all 43 procedures
  ↓
Procedures with score ≥0.5 are included
  ↓
Sorted by legal priority + deadline
  ↓
Results returned to frontend (4-8 procedures typically)
```

**Step 4: Visualize Workflow**
```
Frontend receives procedures + dependencies
  ↓
D3.js renders force-directed graph
  ↓
User sees:
  · All procedures needed for their situation
  · Dependencies (some blocked until others complete)
  · Status of each procedure
  · Deadlines and priorities
```

**Step 5: View Procedure Details**
```
User clicks procedure node
  ↓
Side panel opens showing:
  · Procedure guide (step-by-step instructions)
  · Required documents
  · Estimated time & cost
  · State-specific variations
  · Contact information
  · Community experiences (user ratings/tips)
```

**Step 6: Upload Documents**
```
User drags document into vault
  ↓
File streams to GridFS
  ↓
Auto-associated with relevant procedures
  ↓
Searchable across case
```

**Step 7: Track Progress**
```
User marks procedure as "In Progress"
  ↓
Status updates in real-time
  ↓
Other viewers see it instantly (Socket.io)
  ↓
Once complete, dependent procedures unlock
  ↓
Animations play showing progress
```

**Step 8: Get Alerts**
```
node-cron job runs every hour
  ↓
Checks all case procedures with deadlines
  ↓
If deadline < 7 days: Create URGENT notification
  ↓
Notification pushed to user real-time via Socket.io
  ↓
Bell icon shows unread count
```

**Step 9: Export & Share**
```
User chooses export type:
  · PDF Report (immediately downloadable)
  · XML Bundle (cryptographically signed)
  · RSS Feed (deadline feed, subscribable)
  ↓
Shared with lawyer, accountant, or government
```

---

## Technical Innovation

### 1. **Weighted Information Retrieval**
- Custom normalized dot-product scoring
- Handles 43+ procedures efficiently
- Personalized results in <100ms

### 2. **D3.js + React Integration**
- Force-directed simulation with collision detection
- Real-time node dragging and zooming
- Smooth animations with GSAP
- Responsive to window resizing

### 3. **GridFS File Storage**
- Stream-based upload (no memory buffering)
- Supports files >16MB without issues
- Automatic indexing by case/procedure

### 4. **TF-IDF Semantic Search**
- Custom tokenization + scoring
- Ranks experiences by relevance
- Cosine similarity for related items

### 5. **XML/XSLT Pipeline**
- LegalXML structured export
- xsltproc child process for HTML transformation
- ZLIB compression to .gb format
- SHA-256 cryptographic signing

### 6. **Node-cron Job Scheduling**
- Hourly deadline checker
- Non-blocking operation
- Automatic notification creation
- Socket.io real-time push

### 7. **Socket.io Real-time Events**
- JWT authentication for socket connections
- Room-based broadcasting
- Multi-device support (same user, multiple sockets)
- Persistent connection tracking

---

## Use Cases

### Use Case 1: Government Employee's Family
```
Deceased: Government employee with EPF, pension

Intake Answers:
  - is_govt_emp: YES
  - has_epf: YES
  - has_property: YES
  - has_insurance: YES
  
Procedures Generated:
  1. Death Certificate (foundation)
  2. EPF Form 20 (pension claim) 
  3. Bank Account Transfer
  4. Insurance Claim
  5. Property Mutation
  6. Income Tax Death Intimation
  
Result: 6 procedures instead of showing all 43
Timeline: 3-4 months to complete all procedures
Cost: ₹0 (vs ₹50,000+ for lawyer)
```

### Use Case 2: Business Owner
```
Deceased: Business owner with company, property, loans

Intake Answers:
  - has_business: YES
  - has_property: YES
  - has_mortgages: YES
  
Procedures Generated:
  1. Death Certificate
  2. GST Registration Closure
  3. Income Tax Final Return
  4. Property Transfer
  5. Mortgage Payoff Notification
  6. Bank Account Settlement
  
Result: Specific to business closure + property transfer workflow
```

### Use Case 3: Simple Estate
```
Deceased: Senior with bank account and life insurance

Intake Answers:
  - has_bank_account: YES
  - has_insurance: YES
  - has_property: NO
  - has_business: NO
  
Procedures Generated:
  1. Death Certificate
  2. Bank Account Transfer
  3. Insurance Claim
  
Result: Only 3 procedures needed
Timeline: 1-2 months
```

---

## Impact & Benefits

### For Grieving Families
✅ **One platform, not 8-12 departments**
- All procedures in one place
- No more hunting for government websites
- No more confusion about requirements

✅ **Saves time (2-6 months → potentially 1 month)**
- Clear priority and sequence
- Parallel processing where possible
- No repeated trips to offices

✅ **Free (vs ₹20,000-100,000 for lawyer)**
- No consultant fees
- No document authentication charges
- No repeated paperwork costs

✅ **Peace of mind**
- Deadlines are tracked automatically
- Reminders prevent missed deadlines
- Nothing falls through the cracks

✅ **Emotional support**
- Community experiences show you're not alone
- Real tips from people who've done it
- Validation and encouragement

### For Government/Society
✅ **Reduced government office burden**
- Fewer confused citizens visiting offices
- Better prepared applicants (documents ready)
- Fewer incomplete applications

✅ **Improved compliance**
- Families meet deadlines (via automatic reminders)
- Faster settlement of estates
- Fewer backlogs in courts

✅ **Digital government evolution**
- Demonstrates citizen-centric e-government
- Showcases technology for social good
- Model for other administrative workflows

---

## Scalability & Future

### Current Scale (Phase 1)
- ✅ 43 procedures in corpus
- ✅ 6 MongoDB collections
- ✅ 33 API endpoints
- ✅ 20+ React components
- ✅ Real-time Socket.io support
- ✅ Single server deployment

### Phase 2 Enhancements (Planned)
- Expand to 100+ procedures
- Mobile app (React Native)
- Multi-language support (Hindi, Marathi, Tamil, Telugu)
- Live video guidance for complex procedures
- Government e-services integration
- SMS notifications (for users without smartphones)

### Phase 3 Vision (Future)
- Integration with government portals
- Blockchain for document verification
- Nationwide expansion across India
- NGO/Legal aid partnerships
- Machine learning for predictive reminders
- Integration with financial advisors

---

## Conclusion

GriefBridge transforms the post-bereavement administrative process from a confusing nightmare into a clear, manageable, organized workflow. By combining intelligent algorithms, thoughtful design, and real community input, it empowers grieving families to handle complex legal and financial procedures with confidence.

**The core belief:** When families lose someone, they shouldn't also lose themselves in bureaucracy. GriefBridge gives them back their time, money, and peace of mind.

---

**Project Created:** 2024  
**Course:** ITTC 601 - Web Technology  
**Institution:** [Your Institution]  
**Status:** Phase 1 Complete, Phase 2 Ready  
**License:** Educational Use Only
