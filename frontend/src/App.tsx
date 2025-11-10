import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Triage } from './pages/Triage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Consent } from './pages/Consent';
import Landing from './pages/Landing';
import RoomsList from './pages/RoomsList';
import RoomPage from './pages/Room';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes (login, register, consent)
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Consent route for minors
  if (user.ageBracket === 'UNDER18' && !user.consentMinorOk) {
    return (
      <Routes>
        <Route path="/consent" element={<Consent />} />
        <Route path="*" element={<Navigate to="/consent" replace />} />
      </Routes>
    );
  }

  // Protected app routes
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar userName={user.displayName || user.name || user.email} userRole={user.role} />
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/triage" element={<Triage />} />
            <Route path="/book" element={<PlaceholderPage title="Book a Counselor" />} />
            <Route path="/rooms" element={<RoomsList />} />
            <Route path="/rooms/:slug" element={<RoomPage />} />
            <Route path="/crisis" element={<PlaceholderPage title="Crisis Support" />} />
            <Route path="/sessions" element={<PlaceholderPage title="My Sessions" />} />
            <Route path="/progress" element={<PlaceholderPage title="My Progress" />} />
            <Route path="/counselor/sessions" element={<PlaceholderPage title="Today's Sessions" />} />
            <Route path="/counselor/requests" element={<PlaceholderPage title="New Requests" />} />
            <Route path="/mod/queue" element={<PlaceholderPage title="Moderation Queue" />} />
            <Route path="/admin" element={<PlaceholderPage title="Admin Dashboard" />} />
            <Route path="/admin/metrics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="/admin/users" element={<PlaceholderPage title="User Management" />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text mb-4">{title}</h1>
        <p className="text-gray-600">This page is coming soon...</p>
      </div>
    </div>
  );
}

export default App;
