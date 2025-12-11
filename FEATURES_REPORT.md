# 📋 AUI Wellbeing Hub - Complete Features Report

## 🎯 Project Overview

**Hearts & Minds - AUI Wellbeing Hub** is a comprehensive mental health and wellbeing support platform designed specifically for Al Akhawayn University students. The platform provides multiple support channels including professional counseling, peer support, and crisis intervention, all within a safe and confidential digital environment.

---

## 🛠️ Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, React Router v7, Socket.io Client |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, Socket.io |
| **Database** | SQLite (development), PostgreSQL-ready schema |
| **Authentication** | JWT, bcrypt, Passport.js (Google OAuth, Microsoft OAuth) |
| **Validation** | Zod schema validation (frontend & backend) |
| **Real-time** | Socket.io for live chat |
| **Background Jobs** | BullMQ + IORedis |
| **Email** | Nodemailer |

---

## 🔐 Feature 1: Authentication & User Management

### Description
A complete authentication system supporting multiple sign-in methods with role-based access control.

### Sub-features

#### 1.1 Email/Password Registration
- User registration with email validation
- Password hashing using bcrypt (salt rounds: 10)
- Age verification with bracket classification (UNDER18 / ADULT)
- Automatic consent flow for minors
- Display name for privacy (instead of real name)

#### 1.2 OAuth Integration
- **Google OAuth 2.0:** Sign in with AUI Google accounts
- **Microsoft OAuth:** Sign in with Microsoft accounts
- Profile picture retrieval from OAuth providers
- Account linking for existing users

#### 1.3 JWT Token Authentication
- Secure token generation with 7-day expiry
- Token payload includes: user ID, email, role
- HTTP-only cookies for secure storage
- Token refresh mechanism

#### 1.4 Role-Based Access Control (RBAC)
| Role | Access Level |
|------|-------------|
| **Student** | Basic platform access, book sessions, join peer rooms |
| **Peer Supporter** | Help students, access support queue, moderate content |
| **Counselor** | Professional support, full session management, crisis response |
| **Moderator** | Content moderation, flagged message review |
| **Admin** | Full platform control, user management, analytics |

#### 1.5 Minor Protection System
- Age bracket detection during registration
- Consent requirement for users under 18
- Minor-safe room filtering
- Parental consent workflow

### Code Location
```
backend/src/controllers/auth.controller.ts
backend/src/middleware/auth.ts
backend/src/lib/google.strategy.ts
backend/src/lib/microsoft.strategy.ts
frontend/src/pages/Login.tsx
frontend/src/pages/Register.tsx
frontend/src/context/AuthContext.tsx
```

---

## 🧠 Feature 2: Triage & Assessment System

### Description
An intelligent mental health assessment system that evaluates student needs and routes them to appropriate support channels.

### Sub-features

#### 2.1 Multi-Step Assessment Form
- **Topic Selection:** Anxiety, Stress, Academic, Loneliness, Other
- **Mood Scoring:** 1-5 scale with emoji representation (😢 → 😊)
- **Urgency Level:** Low, Medium, High
- **Optional Message:** Free-text field for additional context

#### 2.2 Risk Detection Algorithm
```typescript
// Automatic detection of crisis keywords
const RISK_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'self-harm',
  'hurt myself', 'don\'t want to live', 'no reason to live'
];
```
- Real-time keyword scanning in user messages
- Automatic flagging of high-risk content
- Immediate crisis alert creation

#### 2.3 Intelligent Routing System
| Condition | Route | Action |
|-----------|-------|--------|
| Risk flag detected | **CRISIS** | Show emergency contacts, create crisis alert |
| High urgency selected | **BOOK** | Direct to counselor booking |
| Low/Medium urgency | **PEER** | Direct to peer support rooms |

#### 2.4 Route-Specific Responses
- **CRISIS Route:** Emergency numbers (141, 112), 24/7 support info, callback request option
- **BOOK Route:** Counselor availability, topic-filtered recommendations
- **PEER Route:** Suggested peer room based on topic (e.g., "anxiety-support")

### Code Location
```
backend/src/controllers/triage.controller.ts
backend/src/lib/riskDetection.ts
frontend/src/pages/Triage.tsx
frontend/src/pages/student/StudentChat.tsx
```

---

## 📅 Feature 3: Counseling Booking System

### Description
A complete appointment scheduling system for booking confidential 1-on-1 sessions with professional counselors.

### Sub-features

#### 3.1 Counselor Discovery
- List of available counselors with profiles
- Display name and specialization
- Real-time availability status

#### 3.2 Booking Creation
```typescript
interface Booking {
  id: string;
  studentId: string;
  counselorId: string;
  startAt: DateTime;
  endAt: DateTime;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
}
```

#### 3.3 Conflict Prevention
- Automatic overlap detection
- No double-booking for counselors
- Student cannot book multiple sessions at same time

#### 3.4 Booking Status Management
| Status | Description |
|--------|-------------|
| **PENDING** | Awaiting counselor confirmation |
| **CONFIRMED** | Session confirmed by counselor |
| **CANCELLED** | Cancelled by student or counselor |
| **COMPLETED** | Session finished |

#### 3.5 My Bookings Dashboard
- Upcoming sessions list
- Past session history
- Cancel/reschedule options
- Session notes and feedback

### Code Location
```
backend/src/controllers/booking.controller.ts
backend/src/routes/booking.routes.ts
frontend/src/pages/student/StudentBooking.tsx
frontend/src/pages/student/StudentBookingNew.tsx
frontend/src/pages/MyBookingsNew.tsx
frontend/src/pages/Booking.tsx
```

---

## 💬 Feature 4: Private 1-on-1 Support Rooms

### Description
Real-time private chat rooms connecting students with peer supporters or counselors for confidential support conversations.

### Sub-features

#### 4.1 Support Request System
```typescript
interface SupportRoom {
  id: string;
  studentId: string;
  supporterId?: string;  // Assigned when claimed
  topic: string;         // stress, sleep, anxiety, academic, etc.
  urgency: string;       // low, medium, high, crisis
  status: string;        // WAITING, ACTIVE, RESOLVED, CLOSED
  routedTo: string;      // counselor or peer_supporter
  initialMessage?: string;
}
```

#### 4.2 Intelligent Routing Logic
```typescript
function determineRouting(urgency: string, topic: string): string {
  if (urgency === 'crisis') return 'counselor';
  const counselorTopics = ['anxiety', 'health', 'family'];
  if (urgency === 'high' || counselorTopics.includes(topic)) {
    return 'counselor';
  }
  return 'peer_supporter';
}
```

#### 4.3 Room Lifecycle
1. **WAITING:** Student submits request, appears in supporter queue
2. **ACTIVE:** Supporter claims room, chat becomes active
3. **RESOLVED:** Issue addressed, session ends
4. **CLOSED:** Room archived

#### 4.4 Real-time Messaging
- Socket.io powered live chat
- Message persistence in database
- Typing indicators
- Read receipts
- Message status tracking (sending → sent → delivered → read)

#### 4.5 Message Features
```typescript
interface SupportMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'system' | 'emoji';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isRead: boolean;
  isEdited: boolean;
  flagged: boolean;
  isDeleted: boolean;
}
```

#### 4.6 Supporter Queue
- Real-time queue of waiting students
- Urgency-based prioritization
- Topic categorization
- Claim mechanism for supporters

### Code Location
```
backend/src/controllers/support.controller.ts
backend/src/routes/support.routes.ts
frontend/src/pages/SupportRoom.tsx
frontend/src/pages/student/StudentSupportRoom.tsx
frontend/src/pages/student/StudentWaitingRoom.tsx
frontend/src/pages/supporter/SupporterQueue.tsx
frontend/src/pages/supporter/SupporterActiveChats.tsx
```

---

## 👥 Feature 5: Peer Support Rooms (Group Chat)

### Description
Moderated group chat rooms where students can connect with peers experiencing similar challenges.

### Sub-features

#### 5.1 Room Categories
| Room | Topic | Minor Safe |
|------|-------|------------|
| anxiety-support | Anxiety & Stress Management | ✅ Yes |
| academic-stress | Study & Exam Pressure | ✅ Yes |
| freshman-chat | New Student Connection | ✅ Yes |
| general-wellness | Mental Health & Wellbeing | ❌ No |

#### 5.2 Message System
```typescript
interface PeerMessage {
  id: string;
  roomId: string;
  authorId: string;
  body: string;
  flagged: boolean;
  flags: string[];  // JSON array of flag reasons
  createdAt: DateTime;
}
```

#### 5.3 Content Moderation
- Automatic keyword flagging
- Manual flagging by moderators
- Flagged message queue for review
- Message removal capability

#### 5.4 Minor Protection
- Age-appropriate room filtering
- Minor-safe room indicators
- Content restrictions for protected rooms

### Code Location
```
backend/src/controllers/peerRoom.controller.ts
backend/src/routes/peerRoom.routes.ts
frontend/src/pages/RoomsList.tsx
frontend/src/pages/Room.tsx
```

---

## 🚨 Feature 6: Crisis Detection & Response

### Description
Automated crisis detection system that identifies high-risk situations and triggers immediate intervention protocols.

### Sub-features

#### 6.1 Crisis Alert System
```typescript
interface CrisisAlert {
  id: string;
  userId?: string;        // Nullable for anonymous
  message: string;
  source: string;         // 'chat', 'triage', 'general'
  roomSlug?: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: DateTime;
}
```

#### 6.2 Trigger Sources
- **Triage Form:** Risk keywords in assessment
- **Chat Messages:** Flagged crisis content
- **Manual Report:** User-submitted crisis reports

#### 6.3 Alert Dashboard
- Real-time crisis alert notifications
- Alert status management
- Response tracking
- Escalation protocols

#### 6.4 Emergency Resources
- Morocco emergency numbers: 141, 112
- 24/7 crisis support information
- Callback request system
- Professional intervention routing

### Code Location
```
backend/src/controllers/crisis.controller.ts
backend/src/routes/crisis.routes.ts
backend/src/jobs/crisisAlert.job.ts
frontend/src/pages/admin/AdminAlerts.tsx
```

---

## 📊 Feature 7: Mood Tracking & Progress

### Description
Personal wellness tracking allowing students to log daily moods and visualize their mental health trends over time.

### Sub-features

#### 7.1 Mood Check-In
```typescript
const moods = [
  { value: 1, icon: Frown, label: 'Struggling', color: 'red' },
  { value: 2, icon: Meh, label: 'Not Great', color: 'orange' },
  { value: 3, icon: Neutral, label: 'Okay', color: 'yellow' },
  { value: 4, icon: Smile, label: 'Good', color: 'lime' },
  { value: 5, icon: Heart, label: 'Great', color: 'green' }
];
```

#### 7.2 Mood History
- Daily mood entries
- 7-day trend analysis
- Average mood calculation
- Streak tracking

#### 7.3 Visual Trends
```typescript
interface MoodData {
  average: number;            // Average mood score
  trend: 'up' | 'down' | 'stable';  // Direction
  streak: number;             // Consecutive days
}
```

#### 7.4 Progress Dashboard
- Mood history visualization with charts
- Weekly/monthly summaries
- Personalized insights
- Wellness recommendations

### Code Location
```
frontend/src/pages/student/StudentDashboard.tsx
frontend/src/pages/student/StudentProgress.tsx
frontend/src/lib/api.ts (getMoodHistory, saveMood)
```

---

## 🎓 Feature 8: Peer Application System

### Description
Application and approval workflow for students wanting to become trained peer supporters.

### Sub-features

#### 8.1 Application Form
```typescript
interface PeerApplication {
  id: string;
  fullName: string;
  auiEmail: string;
  school: string;
  major: string;
  yearOfStudy: string;
  phoneNumber: string;
  motivation: string;         // Why they want to help
  experience: string;         // Prior experience
  availability: string;       // Hours per week
  communicationStyle: string; // empathetic, structured, active-listening
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  activationToken?: string;
}
```

#### 8.2 Application Review
- Admin review dashboard
- Application details view
- Approve/Reject actions
- Rejection reason logging

#### 8.3 Account Activation
- Email notification on approval
- Activation token generation
- Password setup for new peer accounts
- Role upgrade from student to peer_supporter

### Code Location
```
backend/src/controllers/peerApplication.controller.ts
backend/src/routes/peerApplication.routes.ts
frontend/src/pages/BecomePeer.tsx
frontend/src/pages/admin/AdminPeerApplications.tsx
frontend/src/pages/ActivatePeer.tsx
```

---

## 👨‍💼 Feature 9: Admin Dashboard & Analytics

### Description
Comprehensive administrative interface for platform management, user oversight, and analytics.

### Sub-features

#### 9.1 Platform Metrics
```typescript
interface Metrics {
  totalUsers: number;
  studentCount: number;
  counselorCount: number;
  moderatorCount: number;
  adminCount: number;
  totalBookings: number;
  pendingBookings: number;
  totalTriages: number;
  highRiskTriages: number;
  crisisAlerts: number;
  activePeerRooms: number;
  totalMessages: number;
  flaggedMessages: number;
  avgWaitTime: string;
  userGrowth: string;
}
```

#### 9.2 User Management
- View all users with role filters
- User details and activity history
- Role modification
- Account suspension/activation

#### 9.3 Analytics Dashboard
- User growth charts
- Session statistics
- Mood trend analysis
- Peak usage times

#### 9.4 Activity Logging
```typescript
interface ActivityLog {
  id: string;
  userId?: string;
  action: string;    // LOGIN, APPROVE_APPLICATION, DELETE_USER, etc.
  entity?: string;   // User, PeerApplication, Settings, etc.
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string; // JSON
  createdAt: DateTime;
}
```

#### 9.5 System Alerts
```typescript
interface SystemAlert {
  id: string;
  type: string;      // CRISIS, HIGH_WAIT_TIME, PEAK_USAGE, SYSTEM_HEALTH
  severity: string;  // LOW, MEDIUM, HIGH, CRITICAL
  title: string;
  message: string;
  isRead: boolean;
  createdAt: DateTime;
}
```

#### 9.6 Platform Settings
- General configuration
- Support settings
- Email templates
- Security policies

### Code Location
```
backend/src/controllers/admin.controller.ts
backend/src/routes/admin.routes.ts
frontend/src/pages/admin/AdminDashboard.tsx
frontend/src/pages/admin/AdminUsers.tsx
frontend/src/pages/admin/AdminAnalytics.tsx
frontend/src/pages/admin/AdminReports.tsx
frontend/src/pages/admin/AdminActivity.tsx
frontend/src/pages/admin/AdminSettings.tsx
```

---

## 🖥️ Feature 10: Counselor/Supporter Dashboard

### Description
Specialized interface for counselors and peer supporters to manage their support activities.

### Sub-features

#### 10.1 Overview Dashboard
- Active chat count
- Crisis alerts count
- Active peer supporters
- Today's session count

#### 10.2 Active Chats Monitoring
```typescript
interface ActiveChat {
  id: string;
  studentNickname: string;    // Anonymous display
  peerSupporterName: string;
  topic: string;
  riskLevel: 'low' | 'medium' | 'high';
  duration: number;           // Minutes
  hasAlert: boolean;
}
```

#### 10.3 Peer Supporter Management
```typescript
interface PeerSupporter {
  id: string;
  name: string;
  status: 'active' | 'offline' | 'busy';
  currentChats: number;
  totalSessions: number;
  specialties: string[];
}
```

#### 10.4 Session Analytics
- Sessions per day/week
- Average session duration
- Topic distribution
- Resolution rates

### Code Location
```
frontend/src/pages/CounselorDashboard.tsx
frontend/src/pages/supporter/SupporterDashboard.tsx
frontend/src/pages/supporter/SupporterQueue.tsx
frontend/src/pages/supporter/SupporterActiveChats.tsx
frontend/src/pages/supporter/SupporterCalendar.tsx
```

---

## 🎨 Feature 11: Modern UI/UX Design

### Description
A modern, accessible, and responsive user interface following design patterns from leading mental health apps (BetterHelp, Calm, Headspace).

### Sub-features

#### 11.1 Landing Page
- Animated hero section with Framer Motion
- Benefits showcase
- How it works guide
- Feature highlights
- Call-to-action sections

#### 11.2 Responsive Design
- Mobile-first approach
- Tailwind CSS breakpoints: sm, md, lg, xl
- Bottom navigation for mobile
- Side navigation for desktop

#### 11.3 Animation System
```typescript
// Framer Motion animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
```

#### 11.4 Component Library
- Reusable UI components
- Consistent styling
- Loading skeletons
- Empty states
- Error displays

#### 11.5 Theme System
- AUI brand colors (Green: #004B36, #006341)
- Light/dark mode support
- Custom gradients
- Accessible color contrasts

### Code Location
```
frontend/src/components/landing/*
frontend/src/components/ui/*
frontend/src/components/shared/*
frontend/tailwind.config.js
frontend/src/index.css
```

---

## 🔒 Feature 12: Security & Privacy

### Description
Comprehensive security measures to protect user data and ensure confidential support.

### Sub-features

#### 12.1 Data Protection
- Password hashing with bcrypt
- JWT token encryption
- HTTP-only cookies
- CORS configuration

#### 12.2 Privacy Features
- Anonymous display names
- No real name exposure in chats
- Confidential session logs
- Data minimization

#### 12.3 Access Control
- Role-based route protection
- Middleware authentication
- Resource ownership validation
- Admin action logging

#### 12.4 Audit Trail
- Activity logging for all actions
- IP address tracking
- User agent logging
- Metadata storage

### Code Location
```
backend/src/middleware/auth.ts
backend/src/lib/activityLogger.ts
backend/prisma/schema.prisma (ActivityLog, AuditLog)
```

---

## 📱 Feature 13: Real-time Communication

### Description
WebSocket-powered real-time features for instant messaging and notifications.

### Sub-features

#### 13.1 Socket.io Integration
- Bi-directional communication
- Room-based messaging
- Event broadcasting
- Connection management

#### 13.2 Live Chat Features
- Instant message delivery
- Typing indicators
- Online presence
- Message read receipts

#### 13.3 Real-time Notifications
- New message alerts
- Crisis notifications
- Queue updates
- Session reminders

### Code Location
```
backend/src/sockets/*
backend/src/server.ts
frontend/src/lib/socket.ts
```

---

## 📧 Feature 14: Email Notifications

### Description
Automated email system for important platform communications.

### Sub-features

#### 14.1 Transactional Emails
- Account registration confirmation
- Password reset links
- Peer application status updates
- Booking confirmations

#### 14.2 Email Templates
- HTML formatted emails
- Consistent branding
- Mobile-responsive design

### Code Location
```
backend/src/lib/email.ts
```

---

## 🗄️ Database Schema Overview

### Core Models (11 Total)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | User accounts | id, email, role, displayName, ageBracket |
| **TriageForm** | Mental health assessments | topic, moodScore, urgency, riskFlag, route |
| **Booking** | Counselor appointments | studentId, counselorId, startAt, status |
| **PeerRoom** | Group chat rooms | slug, title, topic, isMinorSafe |
| **PeerMessage** | Group chat messages | roomId, authorId, body, flagged |
| **SupportRoom** | Private 1-on-1 chats | studentId, supporterId, topic, urgency, status |
| **SupportMessage** | Private chat messages | roomId, senderId, content, status |
| **CrisisAlert** | Emergency alerts | userId, message, source, status |
| **PeerApplication** | Peer supporter applications | fullName, motivation, status |
| **ActivityLog** | User action logging | action, entity, metadata |
| **PlatformSettings** | System configuration | key, value, category |

---

## 🚀 API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/microsoft` | Microsoft OAuth |

### Triage
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/triage` | Submit triage form |
| GET | `/api/triage/my` | Get my triage history |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/counselors` | List counselors |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | Get my bookings |
| PATCH | `/api/bookings/:id` | Update booking status |

### Support Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/support/request` | Request support |
| GET | `/api/support/my-rooms` | Get my support rooms |
| GET | `/api/support/queue` | Get support queue (supporters) |
| POST | `/api/support/:id/claim` | Claim a room |
| POST | `/api/support/:id/messages` | Send message |

### Crisis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crisis/alert` | Create crisis alert |
| GET | `/api/crisis/alerts` | Get alerts (staff) |
| PATCH | `/api/crisis/alerts/:id` | Update alert status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/metrics` | Get platform metrics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/activity` | Get activity logs |

---

## 📈 Future Enhancements (Roadmap)

1. **Video Counseling:** Integrated video calling for sessions
2. **Mobile App:** React Native mobile application
3. **AI Chatbot:** 24/7 AI-powered first response
4. **Wellness Resources:** Educational content library
5. **Group Sessions:** Group counseling capabilities
6. **Push Notifications:** Mobile push for alerts
7. **Calendar Integration:** Google/Outlook calendar sync
8. **Analytics AI:** Predictive mental health insights

---

## 📝 Conclusion

The AUI Wellbeing Hub is a comprehensive mental health support platform that combines:

- ✅ Multiple support channels (professional, peer, self-help)
- ✅ Intelligent routing based on user needs
- ✅ Crisis detection and intervention
- ✅ Real-time communication
- ✅ Privacy-first design
- ✅ Modern, accessible UI/UX
- ✅ Comprehensive admin tools
- ✅ Scalable architecture

The platform addresses the mental health needs of university students by providing accessible, confidential, and immediate support through multiple channels.

---

## 👥 Team Contributions & Responsibilities

### Overview

This project was developed collaboratively by a team of 5 members, each responsible for specific parts of the application. Below is a detailed breakdown of each team member's contributions, responsibilities, and main tasks.

---

### 👤 Team Member 1: Landing Page & Counselor Introduction

**Primary Responsibility:** Frontend - Landing Page & Counselor Dashboard Overview

#### Files Worked On:
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
frontend/src/pages/CounselorDashboard.tsx (partial)
```

#### Main Tasks Completed:
| Task | Description | Status |
|------|-------------|--------|
| Landing Page Design | Created the main landing page layout and structure | ✅ Complete |
| Hero Section | Implemented animated hero with Framer Motion | ✅ Complete |
| Benefits Section | Designed and built the benefits showcase | ✅ Complete |
| How It Works | Created step-by-step guide section | ✅ Complete |
| Feature Showcase | Built feature highlights section | ✅ Complete |
| Navigation | Implemented responsive navigation bar | ✅ Complete |
| Footer | Created landing page footer | ✅ Complete |
| Animations | Added Framer Motion animations throughout | ✅ Complete |
| Counselor Dashboard Intro | Built initial counselor dashboard overview | ✅ Complete |

#### Technologies Used:
- React 19 with TypeScript
- Framer Motion for animations
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

#### Key Contributions:
1. **Animated Background Elements:** Implemented floating animated shapes using Framer Motion
2. **Responsive Design:** Ensured landing page works on mobile, tablet, and desktop
3. **Brand Styling:** Applied AUI brand colors and consistent design language
4. **Call-to-Action Buttons:** Created engaging CTA buttons with hover effects
5. **Component Composition:** Structured landing page as modular, reusable components

---

### 👤 Team Member 2: Counselor/Supporter Pages

**Primary Responsibility:** Frontend - Counselor & Peer Supporter Dashboards

#### Files Worked On:
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
frontend/src/layouts/SupporterLayout.tsx
```

#### Main Tasks Completed:
| Task | Description | Status |
|------|-------------|--------|
| Counselor Dashboard | Built complete counselor monitoring interface | ✅ Complete |
| Supporter Dashboard | Created peer supporter main dashboard | ✅ Complete |
| Support Queue | Implemented real-time queue for waiting students | ✅ Complete |
| Active Chats View | Built interface for managing active conversations | ✅ Complete |
| Calendar Integration | Created supporter calendar for scheduling | ✅ Complete |
| Case Notes | Built case notes management system | ✅ Complete |
| Resources Page | Created resources library for supporters | ✅ Complete |
| Settings Page | Implemented supporter settings and preferences | ✅ Complete |
| Risk Level Display | Color-coded risk indicators (low/medium/high) | ✅ Complete |

#### Technologies Used:
- React 19 with TypeScript
- Tailwind CSS for styling
- React state management (useState, useEffect)
- TypeScript interfaces for type safety

#### Key Contributions:
1. **Real-time Queue System:** Built interface showing waiting students with urgency levels
2. **Tab-Based Navigation:** Implemented Overview/Chats/Peers/Analytics tabs
3. **Status Indicators:** Created visual status badges (active, offline, busy)
4. **Stats Dashboard:** Built metrics cards showing key performance indicators
5. **Chat Monitoring:** Interface for counselors to monitor ongoing peer support sessions

---

### 👤 Team Member 3: Student Pages

**Primary Responsibility:** Frontend - Student-Facing Pages & User Experience

#### Files Worked On:
```
frontend/src/pages/student/
├── StudentDashboard.tsx
├── StudentBooking.tsx
├── StudentBookingNew.tsx
├── BookingConfirmationPage.tsx
├── StudentChat.tsx
├── StudentProgress.tsx
├── StudentSupportRoom.tsx
├── StudentWaitingRoom.tsx
└── StudentSettings.tsx
frontend/src/pages/Login.tsx
frontend/src/pages/Register.tsx
frontend/src/pages/Triage.tsx
frontend/src/layouts/StudentLayout.tsx
frontend/src/context/AuthContext.tsx
frontend/src/hooks/useAuth.ts
```

#### Main Tasks Completed:
| Task | Description | Status |
|------|-------------|--------|
| Student Dashboard | Built main student dashboard with mood tracking | ✅ Complete |
| Mood Tracker | Implemented daily mood check-in with emoji selection | ✅ Complete |
| Booking System UI | Created counselor booking interface | ✅ Complete |
| Triage Form | Built mental health assessment questionnaire | ✅ Complete |
| Chat Interface | Designed student chat request flow | ✅ Complete |
| Progress Page | Created mood trends and progress visualization | ✅ Complete |
| Login/Register | Built authentication forms with validation | ✅ Complete |
| Support Room UI | Implemented private chat room interface | ✅ Complete |
| Waiting Room | Created waiting room with status updates | ✅ Complete |
| Auth Context | Implemented authentication state management | ✅ Complete |

#### Technologies Used:
- React 19 with TypeScript
- React Hook Form + Zod for form validation
- Tailwind CSS for styling
- Chart.js / Recharts for mood visualizations
- Context API for auth state

#### Key Contributions:
1. **Mood Tracking System:** Interactive mood selection with visual feedback and history
2. **Triage Flow:** Multi-step assessment with intelligent routing
3. **Booking Flow:** Complete booking experience from selection to confirmation
4. **Authentication:** Login, register, and session management
5. **Loading States:** Skeleton loaders and error handling throughout
6. **API Integration:** Connected all pages to backend endpoints

---

### 👤 Team Member 4: Admin Pages

**Primary Responsibility:** Frontend - Admin Dashboard & Platform Management

#### Files Worked On:
```
frontend/src/pages/admin/
├── AdminDashboard.tsx
├── AdminUsers.tsx
├── AdminPeerApplications.tsx
├── AdminAnalytics.tsx
├── AdminReports.tsx
├── AdminActivity.tsx
├── AdminAlerts.tsx
└── AdminSettings.tsx
frontend/src/layouts/AdminLayout.tsx
frontend/src/pages/BecomePeer.tsx
frontend/src/pages/ActivatePeer.tsx
```

#### Main Tasks Completed:
| Task | Description | Status |
|------|-------------|--------|
| Admin Dashboard | Built platform overview with key metrics | ✅ Complete |
| User Management | Created user listing, filtering, and management | ✅ Complete |
| Peer Applications | Built application review and approval system | ✅ Complete |
| Analytics Page | Implemented platform analytics with charts | ✅ Complete |
| Reports Page | Created reporting and export functionality | ✅ Complete |
| Activity Logs | Built audit trail and activity monitoring | ✅ Complete |
| Alerts Page | Implemented crisis and system alerts management | ✅ Complete |
| Settings Page | Created platform configuration interface | ✅ Complete |
| Peer Application Form | Built "Become a Peer" application form | ✅ Complete |
| Peer Activation | Created account activation flow for approved peers | ✅ Complete |

#### Technologies Used:
- React 19 with TypeScript
- Tailwind CSS for styling
- Recharts for analytics visualizations
- React state management

#### Key Contributions:
1. **Metrics Dashboard:** Real-time platform statistics (users, sessions, wait times)
2. **User Growth Charts:** Visual representation of user registration trends
3. **Application Review System:** Approve/reject workflow with notifications
4. **Activity Logging UI:** Searchable, filterable activity history
5. **Alert Management:** Crisis alert handling with status updates
6. **Platform Settings:** Configurable platform parameters

---

### 👤 Team Member 5: Backend & Database

**Primary Responsibility:** Backend API, Database Design, & Server Infrastructure

#### Files Worked On:
```
backend/prisma/
├── schema.prisma (11 database models)
├── seed.ts
└── migrations/

backend/src/
├── app.ts
├── server.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── admin.controller.ts
│   ├── booking.controller.ts
│   ├── crisis.controller.ts
│   ├── peerApplication.controller.ts
│   ├── peerRoom.controller.ts
│   ├── support.controller.ts
│   ├── triage.controller.ts
│   └── user.controller.ts
├── routes/
│   ├── auth.routes.ts
│   ├── admin.routes.ts
│   ├── booking.routes.ts
│   ├── crisis.routes.ts
│   ├── support.routes.ts
│   └── triage.routes.ts
├── middleware/
│   ├── auth.ts
│   └── error.ts
├── lib/
│   ├── prisma.ts
│   ├── riskDetection.ts
│   ├── email.ts
│   ├── google.strategy.ts
│   └── microsoft.strategy.ts
└── sockets/
```

#### Main Tasks Completed:
| Task | Description | Status |
|------|-------------|--------|
| Database Schema | Designed and implemented 11 Prisma models | ✅ Complete |
| Authentication API | Built JWT + OAuth authentication system | ✅ Complete |
| User Management API | Created user CRUD operations | ✅ Complete |
| Triage API | Implemented triage submission and routing | ✅ Complete |
| Booking API | Built counselor booking system | ✅ Complete |
| Support Room API | Created private chat room management | ✅ Complete |
| Crisis Detection | Implemented risk keyword detection | ✅ Complete |
| Admin API | Built metrics and management endpoints | ✅ Complete |
| OAuth Integration | Integrated Google & Microsoft sign-in | ✅ Complete |
| Real-time Chat | Implemented Socket.io for live messaging | ✅ Complete |
| Database Migrations | Created and managed schema migrations | ✅ Complete |
| Seed Data | Built database seeding script | ✅ Complete |

#### Technologies Used:
- Node.js with Express.js
- TypeScript for type safety
- Prisma ORM with SQLite
- JWT for authentication
- Passport.js for OAuth
- Socket.io for real-time
- Zod for validation
- bcrypt for password hashing

#### Key Contributions:
1. **Database Architecture:** Designed relational schema with proper indexes and relations
2. **REST API Design:** Created RESTful endpoints following best practices
3. **Authentication System:** JWT tokens, OAuth, role-based access control
4. **Risk Detection Algorithm:** Automatic crisis keyword detection
5. **Intelligent Routing:** Triage-based routing to appropriate support channels
6. **Real-time Infrastructure:** WebSocket setup for instant messaging
7. **Security Implementation:** Password hashing, token management, CORS configuration

---

## 📊 Contribution Summary Table

| Team Member | Area | Pages/Files | Lines of Code (Approx.) |
|-------------|------|-------------|------------------------|
| Member 1 | Landing Page & Counselor Intro | 8 files | ~1,500 |
| Member 2 | Counselor/Supporter Pages | 8 files | ~2,000 |
| Member 3 | Student Pages | 12 files | ~3,000 |
| Member 4 | Admin Pages | 10 files | ~2,500 |
| Member 5 | Backend & Database | 25+ files | ~4,000 |

---

## 🔄 Collaboration & Communication

### Tools Used:
- **GitHub:** Version control and code collaboration
- **GitHub Issues:** Task tracking and bug reports
- **Pull Requests:** Code review and merging

### Branch Strategy:
```
main (production)
├── feature/team-member-1 (Landing & Counselor)
├── feature/team-member-2 (Supporter pages)
├── feature/team-member-3 (Student pages)
├── feature/team-member-4 (Admin pages)
└── feature/team-member-5 (Backend)
```

### Integration Process:
1. Each member worked on their assigned feature branch
2. Regular commits with descriptive messages
3. Pull requests for merging into main
4. Code review by at least one other team member
5. Final integration testing before merge

---

## 📅 Project Timeline

| Week | Phase | Activities |
|------|-------|------------|
| Week 1-2 | Planning | Requirements gathering, tech stack selection, database design |
| Week 3-4 | Backend Development | API implementation, authentication, database setup |
| Week 5-6 | Frontend Development | Page implementation, component building |
| Week 7-8 | Integration | Frontend-backend connection, testing |
| Week 9 | Polish | Bug fixes, UI refinements, documentation |
| Week 10 | Final | Final testing, report writing, presentation prep |

---

## ✅ Final Checklist

- [x] All features implemented and functional
- [x] Frontend connected to backend
- [x] Database seeded with sample data
- [x] Authentication working (email + OAuth)
- [x] All pages responsive on mobile/desktop
- [x] Code pushed to GitHub repository
- [x] Documentation complete
- [x] Team contributions documented

---

## 📦 GitHub Repository

**Repository:** [aui-wellbeing-hub](https://github.com/mohamedelarakitantaoui/aui-wellbeing-hub)  
**Owner:** mohamedelarakitantaoui  
**Final Version Branch:** main  
**Deadline:** Saturday at Midnight

### Final Push Commands:
```bash
# Ensure all changes are committed
git add .
git commit -m "Final version - Project complete"

# Push to your feature branch
git push origin feature/team-member-2

# Create pull request and merge to main
# Or push directly to main if authorized
git checkout main
git merge feature/team-member-2
git push origin main
```

---

*Generated for AUI Wellbeing Hub Project Report*
