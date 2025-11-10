# 🧠 AUI Wellbeing Hub

A modern, responsive dashboard for mental health and wellbeing support built with React, TypeScript, and TailwindCSS.

## ✨ Features

- **Role-Based Dashboard**: Different views for Students, Counselors, Moderators, and Admins
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Fade-in and hover effects for a polished user experience
- **Collapsible Sidebar**: Space-efficient navigation with icon tooltips
- **User Profiles**: Avatar display with role badges and dropdown menu
- **Mock Data System**: Ready for backend integration with clean separation of concerns

## 🎨 Design System

### Colors
- **Primary Green**: `#00B050` - Calm, supportive actions
- **Accent Magenta**: `#C63FA4` - Highlights and alerts
- **Background**: `#F8F9FA` - Clean, minimal backdrop
- **Text**: `#2E2E2E` - High contrast readability

### Typography
- **Font**: Inter (Google Fonts)
- **Style**: Clean, modern, professional

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── DashboardCard.tsx
│   ├── Sidebar.tsx
│   └── Topbar.tsx
├── pages/               # Page components
│   └── Dashboard.tsx
├── hooks/               # Custom React hooks
│   └── useUser.ts
├── lib/                 # Utility functions
│   └── utils.ts
├── App.tsx              # Main app with routing
└── main.tsx             # App entry point
```

## 🧩 Key Components

### Dashboard Cards
Modular cards that display different features based on user role:
- Triage & Quick Help
- Book a Counselor
- Peer Rooms
- Crisis Support
- My Sessions & Progress

**Role-Specific Cards:**
- **Counselor**: Today's Sessions, New Requests
- **Moderator**: Flagged Posts (with badge)
- **Admin**: Analytics, User Management

### Sidebar Navigation
Collapsible sidebar with:
- Icon-based navigation
- Active state highlighting
- Role-based menu filtering
- Smooth collapse/expand animation

### Topbar
User information display with:
- Avatar with initials
- Role badge (color-coded)
- Dropdown menu (Profile, Settings, Logout)

## 🎭 User Roles

The app supports 4 user roles with conditional UI:

1. **Student** - Access to personal wellbeing tools
2. **Counselor** - Session management and student requests
3. **Moderator** - Content moderation for peer rooms
4. **Admin** - Full analytics and user management

## 🔧 Tech Stack

- **Framework**: Vite + React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Utilities**: clsx, tailwind-merge

## 🎯 Mock Data

Currently uses the `useUser()` hook for mock data:

```typescript
{
  name: 'Mohamed Tantaoui',
  role: 'student',
  lastMood: '😊',
  upcomingSessions: 2,
  flaggedPosts: 3,
}
```

**To change the user role**, edit `src/hooks/useUser.ts` and change the `role` field to:
- `'student'`
- `'counselor'`
- `'moderator'`
- `'admin'`

## 📱 Responsive Breakpoints

- **Mobile**: 1 column grid
- **Tablet**: 2 column grid
- **Desktop**: 3 column grid

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Authentication system
- [ ] Real-time notifications
- [ ] Chat functionality for peer rooms
- [ ] Mood tracking charts
- [ ] Session booking calendar
- [ ] Admin analytics dashboard

## 🤝 Contributing

This is a project for AUI. Follow the existing code style and component patterns when adding new features.

## 📄 License

Private project for AUI Wellbeing Hub.

---

**Built with ❤️ for student mental health and wellbeing**
