# GriefBridge Frontend

React + Vite application for GriefBridge — Post-Bereavement Workflow Management

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:5000` (or configured via `.env`)

### Installation

```bash
npm install
cp .env.example .env
# Edit .env if backend is not on localhost:5000
npm run dev
```

### Environment Variables

```
VITE_API_URL=http://localhost:5000
```

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login & Register forms
│   ├── graph/         # D3.js dependency graph
│   ├── documents/     # Document vault
│   ├── intake/        # Intake questionnaire
│   ├── forms/         # Form preview & generation
│   ├── reports/       # Reports & export
│   ├── layout/        # Navigation & layout
│   └── shared/        # Reusable components
├── pages/
│   ├── Home.jsx       # Landing page
│   ├── Auth.jsx       # Auth page wrapper
│   └── Dashboard.jsx  # Main dashboard
├── context/
│   ├── AuthContext.jsx — User auth state
│   └── CaseContext.jsx — Case & procedure state
├── hooks/
│   ├── useAuth.js     — Auth context hook
│   ├── useCase.js     — Case context hook
│   └── useGraph.js    — D3 graph integration
├── services/
│   └── api.js         — Axios with JWT interceptor
├── App.jsx            — Main app component
└── index.css          — Global styles
```

## Key Components

### DependencyGraph
- D3.js force-directed graph visualization
- 6-state node system (NOT_STARTED, UNLOCKED, IN_PROGRESS, BLOCKED, COMPLETED, OVERDUE)
- Click-to-detail side panel
- Animated state transitions

### IntakeWizard
- 13-step questionnaire (3 personal info + 10 yes/no questions)
- Generates personalized workflow via IR engine
- Multi-step form with progress tracking

### Dashboard
- Case selector dropdown
- Graph visualization area
- Real-time completion percentage
- Responsive mobile layout

## Development

```bash
npm run dev       # Start Vite dev server on :5173
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # ESLint check
```

## Deployment

### Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Set `VITE_API_URL` environment variable
4. Auto-deploys on git push

```bash
npm run build     # Creates dist/
# Deploy dist/ folder
```

## Technologies

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **D3.js** — Data visualization
- **Framer Motion** — Component animations
- **GSAP** — SVG animations
- **Bootstrap 5** — Responsive CSS framework
- **Axios** — HTTP client
- **React Router** — Client-side routing

## Key Features

- ✅ JWT authentication (localStorage + axios interceptor)
- ✅ Multi-case management
- ✅ D3.js dependency graph with animations
- ✅ Intake questionnaire with IR engine
- ✅ Document upload & management
- ✅ Real-time notifications (AJAX polling)
- ✅ Responsive mobile design
- ✅ Form pre-filler (Phase 2)
- ✅ XML export & PDF reports (Phase 2)

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is an educational project for ITTC 601 — Web Technology course.

---

**API Backend:** http://localhost:5000 (configurable)  
**Dev Server:** http://localhost:5173  
**Production Build:** `dist/` folder
