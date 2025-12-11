# 🎓 AUI Wellbeing Hub - Class Presentation Guide

## 📋 Project Overview

**Project Name:** Hearts & Minds - AUI Wellbeing Hub  
**Purpose:** A mental health and wellbeing support platform for Al Akhawayn University students  
**Type:** Full-Stack Web Application

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library for building user interfaces |
| **TypeScript** | Type-safe JavaScript for better code quality |
| **Vite** | Fast build tool and development server |
| **Tailwind CSS 4** | Utility-first CSS framework for styling |
| **Framer Motion** | Animation library for smooth UI animations |
| **React Router v7** | Client-side routing and navigation |
| **React Hook Form + Zod** | Form handling and validation |
| **Socket.io Client** | Real-time communication for chat features |
| **Chart.js / Recharts** | Data visualization for analytics |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework for REST API |
| **TypeScript** | Type-safe backend code |
| **Prisma ORM** | Database ORM for type-safe queries |
| **SQLite** | Database (development) |
| **Socket.io** | Real-time WebSocket communication |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Passport.js** | OAuth authentication (Google & Microsoft) |
| **Zod** | Schema validation |
| **Nodemailer** | Email sending |
| **BullMQ + IORedis** | Background job processing |

### Database (Prisma + SQLite)
- **11 Main Models:** User, TriageForm, Booking, PeerRoom, PeerMessage, CrisisAlert, SupportRoom, SupportMessage, PeerApplication, ActivityLog, PlatformSettings

---

## 👥 Team Member Assignments

---

## 🧑‍💻 PERSON 1: Landing Page & Introduction to Counselor Page

### Files to Present
```
frontend/src/pages/Landing.tsx
frontend/src/components/landing/
├── LandingNav.tsx
├── EnhancedHero.tsx
├── BenefitsSection.tsx
├── HowItWorksSection.tsx
├── FeatureShowcase.tsx
├── FinalCTA.tsx
└── LandingFooter.tsx

frontend/src/pages/CounselorDashboard.tsx (overview only)
```

### Key Topics to Explain

#### 1. **Landing Page Architecture** (5 min)
- **Component Composition:** Show how `Landing.tsx` assembles multiple sections
```tsx
// Landing.tsx - Clean component composition
<LandingNav />
<EnhancedHero />
<BenefitsSection />
<HowItWorksSection />
<FeatureShowcase />
<FinalCTA />
```

#### 2. **Framer Motion Animations** (5 min)
- Explain the animation system in `EnhancedHero.tsx`:
```tsx
// Animated background elements
<motion.div
  animate={{
    y: [0, -20, 0],
    opacity: [0.3, 0.5, 0.3],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>

// Staggered content animations
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
```

#### 3. **Tailwind CSS Styling** (3 min)
- Responsive design with breakpoints: `sm:`, `md:`, `lg:`
- Custom colors and gradients: `text-gradient-aui`, `bg-primary`
- Utility classes for spacing, flexbox, grid

#### 4. **React Router Navigation** (2 min)
- `<Link to="/register">` for client-side navigation
- Anchor links for in-page scrolling: `href="#how-it-works"`

#### 5. **Counselor Dashboard Overview** (5 min)
- Tab-based navigation (Overview, Chats, Peers, Analytics)
- Stats cards showing active chats, crisis alerts, peer supporters
- Real-time chat monitoring capabilities

### Demo Points
1. Show the landing page animations loading
2. Click through to show navigation
3. Demonstrate responsive design (resize browser)
4. Show the counselor dashboard tabs

---

## 🧑‍💻 PERSON 2: Counselor/Supporter Pages

### Files to Present
```
frontend/src/pages/CounselorDashboard.tsx
frontend/src/pages/supporter/
├── SupporterDashboard.tsx
├── SupporterQueue.tsx
├── SupporterActiveChats.tsx
├── SupporterCalendar.tsx
├── SupporterCaseNotes.tsx
├── SupporterResources.tsx
└── SupporterSettings.tsx
```

### Key Topics to Explain

#### 1. **Dashboard State Management** (5 min)
```tsx
// Multiple state variables for dashboard data
const [activeTab, setActiveTab] = useState<'overview' | 'chats' | 'peers' | 'analytics'>('overview');
const [chats] = useState<ActiveChat[]>(mockChats);
const [peers] = useState<PeerSupporter[]>(mockPeers);
```

#### 2. **TypeScript Interfaces** (5 min)
```tsx
// Strongly typed data structures
interface ActiveChat {
  id: string;
  studentNickname: string;
  peerSupporterName: string;
  topic: string;
  riskLevel: 'low' | 'medium' | 'high';
  duration: number;
  hasAlert: boolean;
}

interface PeerSupporter {
  id: string;
  name: string;
  status: 'active' | 'offline' | 'busy';
  currentChats: number;
  totalSessions: number;
  specialties: string[];
}
```

#### 3. **Conditional Rendering** (3 min)
```tsx
// Tab-based content switching
{activeTab === 'overview' && (
  <div className="space-y-6 animate-fade-in">
    {/* Stats Grid */}
  </div>
)}
{activeTab === 'chats' && (
  // Chat list component
)}
```

#### 4. **Risk Level System** (5 min)
- Color coding: low (green), medium (yellow), high (red)
- Crisis alert flagging for urgent cases
- Real-time monitoring of active sessions

#### 5. **Support Queue System** (5 min)
- How supporters claim waiting students
- Urgency-based prioritization
- Topic categorization

### Demo Points
1. Show the supporter dashboard with stats
2. Navigate through different tabs
3. Explain how supporters see student requests
4. Show the queue claiming process

---

## 🧑‍💻 PERSON 3: Student Pages

### Files to Present
```
frontend/src/pages/student/
├── StudentDashboard.tsx
├── StudentBooking.tsx / StudentBookingNew.tsx
├── StudentChat.tsx
├── StudentProgress.tsx
├── StudentSupportRoom.tsx
├── StudentWaitingRoom.tsx
└── StudentSettings.tsx

frontend/src/pages/Triage.tsx
frontend/src/pages/Login.tsx
frontend/src/pages/Register.tsx
```

### Key Topics to Explain

#### 1. **useEffect for Data Fetching** (5 min)
```tsx
// Fetch dashboard data on component mount
useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  const [bookingsRes, roomsRes, moodRes] = await Promise.allSettled([
    api.getMyBookings(),
    api.getMySupportRooms(),
    api.getMoodHistory(7)
  ]);
  // Handle responses...
};
```

#### 2. **Mood Tracking Feature** (5 min)
```tsx
// Mood selection with visual feedback
const moods = [
  { value: 1, icon: Frown, label: 'Struggling', color: 'text-red-500' },
  { value: 2, icon: Meh, label: 'Not Great', color: 'text-orange-500' },
  { value: 3, icon: Smile, label: 'Okay', color: 'text-yellow-500' },
  // ...
];

const handleSaveMood = async () => {
  await api.saveMood(selectedMood);
  setMoodSaved(true);
};
```

#### 3. **Loading States & Error Handling** (3 min)
```tsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Conditional rendering based on state
if (loading) return <DashboardSkeleton />;
if (error) return <ErrorDisplay message={error} />;
```

#### 4. **API Integration** (5 min)
```tsx
// API wrapper for backend communication
import { api } from '../../lib/api';

// Making API calls
const bookings = await api.getMyBookings();
const rooms = await api.getMySupportRooms();
await api.saveMood(selectedMood);
```

#### 5. **Custom Hooks - useAuth** (5 min)
```tsx
// Authentication context usage
const { user } = useAuth();

// Access user data
const userName = user?.displayName;
const userRole = user?.role;
```

### Demo Points
1. Show student dashboard with mood tracker
2. Demonstrate booking a counseling session
3. Show the triage form flow
4. Explain how students request support

---

## 🧑‍💻 PERSON 4: Admin Pages

### Files to Present
```
frontend/src/pages/admin/
├── AdminDashboard.tsx
├── AdminUsers.tsx
├── AdminPeerApplications.tsx
├── AdminAnalytics.tsx
├── AdminReports.tsx
├── AdminSettings.tsx
├── AdminAlerts.tsx
└── AdminActivity.tsx
```

### Key Topics to Explain

#### 1. **Admin Dashboard Metrics** (5 min)
```tsx
// Fetching platform-wide metrics
const [metrics, setMetrics] = useState<Metrics>({
  totalUsers: 0,
  activeSupport: 0,
  sessionsThisWeek: 0,
  avgWaitTime: '0m',
  userGrowth: '+0%'
});

useEffect(() => {
  const fetchDashboardData = async () => {
    const [appsRes, metricsRes] = await Promise.allSettled([
      api.getPeerApplications('pending'),
      api.getMetrics(),
    ]);
    // Process data...
  };
  fetchDashboardData();
}, []);
```

#### 2. **Peer Application Review System** (5 min)
```tsx
interface PeerApplication {
  id: string;
  motivation: string;
  experience: string;
  availability: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    displayName: string;
    email: string;
  };
}

// Approve/Reject functionality
const handleReviewApplication = async (applicationId: string, status: 'approved' | 'rejected') => {
  await api.reviewPeerApplication(applicationId, { status });
  // Refresh applications list
};
```

#### 3. **Metrics Cards Design** (3 min)
```tsx
// Visual metrics with icons and growth indicators
<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
      <Users className="w-6 h-6 text-blue-600" />
    </div>
    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
      {metrics.userGrowth}
    </span>
  </div>
  <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
  <p className="text-sm text-gray-600 mt-1">Total Users</p>
</div>
```

#### 4. **User Management Features** (5 min)
- View all users with role filters
- Approve/reject peer applications
- User activity tracking
- Platform settings management

#### 5. **Analytics & Reporting** (5 min)
- System-wide statistics
- User growth trends
- Session analytics
- Wait time monitoring

### Demo Points
1. Show admin dashboard overview
2. Demonstrate peer application review
3. Show user management interface
4. Explain analytics and reporting

---

## 🧑‍💻 PERSON 5: Backend & Database

### Files to Present
```
backend/prisma/schema.prisma
backend/src/app.ts
backend/src/server.ts
backend/src/controllers/
├── auth.controller.ts
├── support.controller.ts
├── admin.controller.ts
├── booking.controller.ts
├── triage.controller.ts
└── crisis.controller.ts
backend/src/middleware/auth.ts
backend/src/lib/prisma.ts
```

### Key Topics to Explain

#### 1. **Prisma Schema & Database Models** (7 min)
```prisma
// User model with relations
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  password       String
  name           String?
  displayName    String?
  role           String   // 'student', 'counselor', 'moderator', 'admin'
  ageBracket     String?  // 'UNDER18' or 'ADULT'
  
  // OAuth fields
  oauthProvider    String?  // 'google', 'microsoft'
  oauthProviderId  String?
  
  // Relations
  triageForms         TriageForm[]
  bookingsAsStudent   Booking[]   @relation("StudentBookings")
  bookingsAsCounselor Booking[]   @relation("CounselorBookings")
  crisisAlerts        CrisisAlert[]
}

// Support Room for private 1-on-1 chats
model SupportRoom {
  id          String   @id @default(cuid())
  studentId   String
  supporterId String?
  topic       String
  urgency     String   // 'low', 'medium', 'high', 'crisis'
  status      String   @default("WAITING")
  routedTo    String   // 'counselor', 'peer_supporter'
  
  student    User  @relation("SupportRoomStudent", ...)
  supporter  User? @relation("SupportRoomSupporter", ...)
  messages   SupportMessage[]
}
```

#### 2. **Express App Setup** (5 min)
```typescript
// app.ts - Application configuration
import express from 'express';
import cors from 'cors';
import passport from 'passport';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
  app.use(express.json());
  app.use(passport.initialize());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/admin', adminRoutes);

  return app;
};
```

#### 3. **Authentication System** (5 min)
```typescript
// JWT token generation
const token = jwt.sign(
  { sub: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

// Password hashing with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, user.password);

// OAuth with Passport.js (Google & Microsoft)
setupGoogleStrategy();
setupMicrosoftStrategy();
```

#### 4. **Request Validation with Zod** (3 min)
```typescript
// Schema validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  age: z.number().int().min(13).max(100),
  role: z.enum(['student', 'counselor', 'moderator', 'admin']),
});

// Validation in controller
const validatedData = registerSchema.parse(req.body);
```

#### 5. **Support Routing Logic** (5 min)
```typescript
// Intelligent routing based on urgency and topic
function determineRouting(urgency: string, topic: string): string {
  // Crisis always goes to professional counselor
  if (urgency === 'crisis') return 'counselor';
  
  // High urgency or sensitive topics go to counselor
  const counselorTopics = ['anxiety', 'health', 'family'];
  if (urgency === 'high' || counselorTopics.includes(topic)) {
    return 'counselor';
  }
  
  // Medium/low urgency can go to peer supporters
  return 'peer_supporter';
}
```

#### 6. **Admin Metrics API** (5 min)
```typescript
// Aggregate queries with Prisma
const [totalUsers, studentCount, counselorCount, ...] = await Promise.all([
  prisma.user.count(),
  prisma.user.count({ where: { role: 'student' } }),
  prisma.user.count({ where: { role: 'counselor' } }),
  prisma.booking.count({ where: { status: 'PENDING' } }),
  prisma.crisisAlert.count(),
]);
```

### Demo Points
1. Show Prisma schema structure
2. Explain REST API endpoints
3. Demonstrate authentication flow
4. Show how data flows from frontend to database

---

## 🔑 Key Features Summary (For Everyone)

### 1. **User Roles**
- **Student:** Access wellbeing resources, book sessions, chat with supporters
- **Peer Supporter:** Trained students who help fellow students
- **Counselor:** Professional mental health counselors
- **Admin:** Platform management and oversight

### 2. **Core Features**
- 🔐 **Authentication:** Email/password + Google/Microsoft OAuth
- 📝 **Triage System:** Initial assessment to route students appropriately
- 💬 **Real-time Chat:** Private 1-on-1 support rooms with Socket.io
- 📅 **Booking System:** Schedule counseling appointments
- 📊 **Mood Tracking:** Daily mood logging with trends
- 🚨 **Crisis Detection:** Automatic flagging of concerning content
- 📈 **Analytics Dashboard:** Platform usage statistics

### 3. **Security Features**
- JWT token authentication
- Password hashing with bcrypt
- Minor consent protection (age brackets)
- Activity logging for audit trail

---

## 📁 Project Structure Overview

```
wellBeingAPP/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client, utilities
│   │   ├── context/         # React context providers
│   │   └── types/           # TypeScript definitions
│   └── package.json
│
├── backend/                  # Express + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── seed.ts          # Initial data seeding
│   │   └── migrations/      # Database migrations
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Auth, error handling
│   │   ├── lib/             # Prisma client, utilities
│   │   └── sockets/         # WebSocket handlers
│   └── package.json
│
└── PRESENTATION_GUIDE.md    # This file!
```

---

## 🚀 How to Run the Project

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 💡 Presentation Tips

1. **Keep it visual:** Show the actual UI while explaining code
2. **Use live demos:** Navigate through your assigned pages
3. **Explain the "why":** Not just what the code does, but why you chose that approach
4. **Highlight teamwork:** Mention how your part connects to others
5. **Be ready for questions:** Know your code well enough to answer questions

---

## ⏱️ Suggested Time Allocation Per Person

| Section | Time |
|---------|------|
| Introduction & Overview | 2 min |
| Main Code Walkthrough | 12-15 min |
| Demo | 3-5 min |
| Q&A Buffer | 2-3 min |
| **Total per person** | ~20 min |

---

## 👥 Team Contributions & Responsibilities (For Report)

### 📊 Contribution Summary Table

| Team Member | Area | Primary Responsibility | Files Count | Key Deliverables |
|-------------|------|------------------------|-------------|------------------|
| **Member 1** | Landing Page & Counselor Intro | Frontend - First impressions & counselor overview | 8 files | Landing page, animations, navigation |
| **Member 2** | Counselor/Supporter Pages | Frontend - Support staff interfaces | 8 files | Queue system, chat monitoring, supporter dashboard |
| **Member 3** | Student Pages | Frontend - Student experience | 12 files | Dashboard, booking, triage, mood tracking, auth |
| **Member 4** | Admin Pages | Frontend - Platform manage ment | 10 files | Metrics, user management, applications, analytics |
| **Member 5** | Backend & Database | Backend - API & data layer | 25+ files | REST API, database, authentication, real-time |

---

### 👤 Member 1: Landing Page & Counselor Introduction

**Responsibility:** Create the first impression of the platform and introduce counselor features

#### Main Tasks:
| Task | Status |
|------|--------|
| Landing page layout and structure | ✅ |
| Hero section with Framer Motion animations | ✅ |
| Benefits section design | ✅ |
| How It Works guide section | ✅ |
| Feature showcase section | ✅ |
| Navigation bar (responsive) | ✅ |
| Footer component | ✅ |
| Counselor dashboard overview (tabs, stats) | ✅ |

#### Technologies Applied:
- React component composition
- Framer Motion animations
- Tailwind CSS responsive design
- React Router navigation

---

### 👤 Member 2: Counselor/Supporter Pages

**Responsibility:** Build interfaces for counselors and peer supporters to manage support activities

#### Main Tasks:
| Task | Status |
|------|--------|
| Counselor dashboard with tabs | ✅ |
| Supporter main dashboard | ✅ |
| Support queue (waiting students) | ✅ |
| Active chats monitoring | ✅ |
| Supporter calendar | ✅ |
| Case notes management | ✅ |
| Resources page | ✅ |
| Settings page | ✅ |
| Risk level color coding | ✅ |

#### Technologies Applied:
- TypeScript interfaces for data types
- React state management
- Tab-based navigation
- Status indicators and badges

---

### 👤 Member 3: Student Pages

**Responsibility:** Create all student-facing pages and user authentication

#### Main Tasks:
| Task | Status |
|------|--------|
| Student dashboard with quick actions | ✅ |
| Mood tracking system (emoji picker, history) | ✅ |
| Counselor booking interface | ✅ |
| Booking confirmation page | ✅ |
| Triage assessment form | ✅ |
| Chat/support request flow | ✅ |
| Progress visualization | ✅ |
| Login page with validation | ✅ |
| Register page with age verification | ✅ |
| Auth context and useAuth hook | ✅ |
| Support room interface | ✅ |
| Waiting room with status | ✅ |

#### Technologies Applied:
- React Hook Form + Zod validation
- useEffect for data fetching
- Context API for auth state
- API integration
- Loading states and error handling

---

### 👤 Member 4: Admin Pages

**Responsibility:** Build administrative dashboard and platform management tools

#### Main Tasks:
| Task | Status |
|------|--------|
| Admin dashboard with metrics | ✅ |
| User management (list, filter, actions) | ✅ |
| Peer application review system | ✅ |
| Analytics page with charts | ✅ |
| Reports page | ✅ |
| Activity logs viewer | ✅ |
| System alerts management | ✅ |
| Platform settings | ✅ |
| Become a Peer application form | ✅ |
| Peer account activation flow | ✅ |

#### Technologies Applied:
- Recharts for data visualization
- Metrics cards with growth indicators
- Approve/reject workflows
- Search and filter functionality

---

### 👤 Member 5: Backend & Database

**Responsibility:** Design and implement the entire backend API and database

#### Main Tasks:
| Task | Status |
|------|--------|
| Prisma schema (11 models) | ✅ |
| Database migrations | ✅ |
| Express app setup | ✅ |
| Authentication controller (register, login, OAuth) | ✅ |
| JWT token management | ✅ |
| Google OAuth integration | ✅ |
| Microsoft OAuth integration | ✅ |
| Triage controller with routing logic | ✅ |
| Booking controller | ✅ |
| Support room controller | ✅ |
| Crisis detection (risk keywords) | ✅ |
| Admin metrics API | ✅ |
| Auth middleware | ✅ |
| Error handling middleware | ✅ |
| Socket.io for real-time chat | ✅ |
| Database seeding script | ✅ |

#### Technologies Applied:
- Express.js REST API
- Prisma ORM with SQLite
- JWT + bcrypt for security
- Passport.js for OAuth
- Zod schema validation
- Socket.io WebSockets

---

## 🔄 Collaboration Process

### Branch Strategy
```
main (production-ready)
├── feature/team-member-1
├── feature/team-member-2
├── feature/team-member-3
├── feature/team-member-4
└── feature/team-member-5
```

### Integration Workflow
1. Each member worked on their feature branch
2. Regular commits with clear messages
3. Pull requests for code review
4. Testing before merging
5. Final integration on main branch

---

## 📅 Project Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Planning | Week 1-2 | Requirements, design, tech selection |
| Backend | Week 3-4 | API, database, authentication |
| Frontend | Week 5-6 | All pages and components |
| Integration | Week 7-8 | Connect frontend to backend |
| Testing | Week 9 | Bug fixes, refinements |
| Final | Week 10 | Documentation, presentation prep |

---

## 📦 Final Submission

**GitHub Repository:** [aui-wellbeing-hub](https://github.com/mohamedelarakitantaoui/aui-wellbeing-hub)  
**Owner:** mohamedelarakitantaoui  
**Deadline:** Saturday at Midnight

### Push Final Version:
```bash
git add .
git commit -m "Final version - Project complete"
git push origin main
```

---

**Good luck with your presentation! 🎉**
