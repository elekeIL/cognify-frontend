# Cognify Frontend

AI-powered learning platform that transforms documents into bite-sized, audio-narrated lessons for workplace learning.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-000000?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## Overview

Cognify Frontend is a modern Next.js 16 application providing an intuitive interface for AI-powered document learning. Users can upload documents, view extracted themes, listen to auto-generated audio lessons, and track their learning progress.

### Key Features

- **Document Upload**: Drag-and-drop support for PDF, DOCX, and TXT files
- **Step-by-Step Processing**: Real-time visual feedback during AI processing
- **Audio Learning**: Built-in audio player with progress tracking
- **Learning Outcomes**: Auto-completion based on audio playback position
- **Progress Dashboard**: Track completed lessons, time spent, and streaks
- **Activity History**: Full timeline of user actions
- **Dark Mode**: Full dark/light theme support
- **Internationalization**: Multi-language support (EN, ES, FR, DE)
- **Responsive Design**: Optimized for desktop and mobile

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Next.js 16 | App Router, SSR/CSR, file-based routing |
| **UI Library** | React 19 | Component-based UI |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **UI Components** | Radix UI | Accessible, unstyled primitives |
| **Animation** | Framer Motion | Smooth, professional animations |
| **State** | React Context | Authentication and theme state |
| **Data Fetching** | TanStack Query | Server state management |
| **Forms** | React Hook Form + Zod | Form validation |
| **i18n** | next-intl | Internationalization |
| **HTTP Client** | Axios | API communication |

---

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun
- Cognify Backend running on `http://localhost:8000`

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd cognify

# Install dependencies
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
cognify/
├── app/
│   ├── (site)/                    # Public pages (landing, auth)
│   │   ├── auth/
│   │   │   ├── signin/            # Sign in page
│   │   │   └── signup/            # Sign up page
│   │   └── page.tsx               # Landing page
│   ├── dashboard/                 # Dashboard page
│   ├── documents/                 # Document details
│   │   └── [id]/                  # Document detail page
│   ├── history/                   # Activity history
│   ├── learning/                  # Learning/lesson view
│   │   └── [id]/                  # Lesson with audio player
│   ├── lessons/                   # Lessons list
│   ├── settings/                  # User settings
│   ├── upload/                    # Document upload page
│   ├── context/                   # App-level context
│   ├── globals.css                # Global styles
│   └── layout.tsx                 # Root layout
├── components/
│   ├── ui/                        # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   ├── About/                     # About section
│   ├── Auth/                      # Auth forms
│   ├── Common/                    # Shared components
│   ├── Docs/                      # Documentation components
│   ├── FAQ/                       # FAQ section
│   ├── Features/                  # Features showcase
│   ├── Footer/                    # Footer component
│   ├── Header/                    # Navigation header
│   ├── Hero/                      # Hero section
│   ├── ProcessingPage/            # Step-by-step processing UI
│   ├── Providers.tsx              # Context providers wrapper
│   ├── navbar.tsx                 # Main navigation
│   ├── sidebar/                   # Dashboard sidebar
│   ├── DashboardHeader/           # Dashboard header
│   ├── DocumentGrid/              # Document grid display
│   ├── QuickAccess/               # Quick access cards
│   ├── StatCard/                  # Statistics cards
│   └── WelcomeHeader/             # Welcome message
├── context/
│   └── AuthContext.tsx            # Authentication context
├── lib/
│   ├── api.ts                     # API client setup
│   ├── auth.ts                    # Auth utilities
│   └── utils.ts                   # Helper functions
├── i18n/
│   ├── request.ts                 # i18n configuration
│   └── messages/                  # Translation files
│       ├── en.json
│       ├── es.json
│       ├── fr.json
│       └── de.json
├── types/                         # TypeScript type definitions
├── public/
│   └── images/                    # Static images
├── middleware.ts                  # Next.js middleware
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features and CTA |
| `/auth/signin` | User authentication |
| `/auth/signup` | User registration |
| `/dashboard` | Main dashboard with stats and recent items |
| `/upload` | Document upload with drag-and-drop |
| `/documents/[id]` | Document details with processing status |
| `/lessons` | List of generated lessons |
| `/learning/[id]` | Lesson view with audio player |
| `/history` | Activity timeline |
| `/settings` | User profile and preferences |

---

## Key Components

### ProcessingPage
Displays step-by-step document processing with real-time status updates:
1. Text Extraction
2. Theme Extraction (AI)
3. Lesson Generation (AI)
4. Citation Extraction (AI)
5. Audio Generation (TTS)

### AudioPlayer (in Learning Page)
Custom audio player with:
- Play/pause, seek, volume controls
- Progress tracking (saved to backend)
- Learning outcome auto-completion based on playback position
- Time spent tracking

### Document Upload
- Drag-and-drop file upload
- Supports PDF, DOCX, TXT (up to 10MB)
- File type validation
- Upload progress indication

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |

---

## API Integration

The frontend communicates with the Cognify Backend API:

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptors handle JWT token refresh automatically
```

### Key API Endpoints Used

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /dashboard` - Dashboard statistics
- `POST /documents/upload` - Document upload
- `POST /documents/{id}/process/*` - Processing steps
- `GET /lessons/{id}` - Lesson details
- `PATCH /lessons/{id}/progress` - Update progress
- `GET /activities` - Activity history

---

## Internationalization

Multi-language support using `next-intl`:

```typescript
// Available languages
const languages = ['en', 'es', 'fr', 'de'];

// Usage in components
import { useTranslations } from 'next-intl';
const t = useTranslations('Dashboard');
```

Translation files are in `i18n/messages/`.

---

## Theming

Dark/light mode support using `next-themes`:

```typescript
import { useTheme } from 'next-themes';
const { theme, setTheme } = useTheme();
```

Theme preference is persisted in localStorage.

---

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### Code Style

- Use TypeScript strict mode
- Follow React hooks best practices
- Use Tailwind CSS utility classes
- Prefer composition over prop drilling

---

## Production Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` to production backend
- [ ] Configure CORS on backend for production domain
- [ ] Enable HTTPS
- [ ] Set up CDN for static assets

---

## License

This project was created as part of a Full-Stack Engineer Technical Challenge.

---

## Related

- [Cognify Backend](../cognify-backend) - FastAPI backend application
