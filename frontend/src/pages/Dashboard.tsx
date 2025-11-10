import { useUser } from '../hooks/useUser';
import { DashboardCard } from '../components/DashboardCard';
import {
  HeartPulse,
  CalendarClock,
  UsersRound,
  AlertTriangle,
  ClipboardList,
  ChartBar,
  Calendar,
  FileText,
  Flag,
  BarChart3,
  UserCog,
} from 'lucide-react';

export function Dashboard() {
  const user = useUser();

  return (
    <div className="min-h-screen bg-background animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            Good to see you again, {user.name.split(' ')[0]} {user.lastMood}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your wellbeing today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Universal Cards - Visible to all */}
          <DashboardCard
            icon={HeartPulse}
            title="How are you feeling today?"
            description="Take a 60-second check-in to find the right kind of support."
            to="/triage"
            buttonText="Start Triage"
          />

          <DashboardCard
            icon={CalendarClock}
            title="Book a Counselor"
            description="Book a confidential 1-on-1 session with a professional counselor."
            to="/book"
            buttonText="Schedule Now"
          />

          <DashboardCard
            icon={UsersRound}
            title="Join Peer Rooms"
            description="Join a moderated, anonymous peer space to connect with others."
            to="/rooms"
            buttonText="Browse Rooms"
          />

          <DashboardCard
            icon={AlertTriangle}
            title="Crisis & 24/7 Support"
            description="Need help now? Access emergency contacts or request immediate support."
            to="/crisis"
            buttonText="Get Help"
          />

          <DashboardCard
            icon={ClipboardList}
            title="My Sessions"
            description="View your upcoming and past counseling sessions."
            to="/sessions"
            buttonText="View Sessions"
            badge={user.upcomingSessions}
          />

          <DashboardCard
            icon={ChartBar}
            title="My Progress"
            description="See your recent mood trends and wellness activity."
            to="/progress"
            buttonText="View Progress"
          />

          {/* Counselor-specific cards */}
          {user.role === 'counselor' && (
            <>
              <DashboardCard
                icon={Calendar}
                title="Today's Sessions"
                description="View and manage your scheduled counseling sessions for today."
                to="/counselor/sessions"
                buttonText="View Schedule"
              />

              <DashboardCard
                icon={FileText}
                title="New Requests"
                description="Review new booking requests from students seeking support."
                to="/counselor/requests"
                buttonText="Review Requests"
              />
            </>
          )}

          {/* Moderator-specific cards */}
          {user.role === 'moderator' && (
            <DashboardCard
              icon={Flag}
              title="Flagged Posts"
              description="Review flagged content from peer rooms that needs moderation."
              to="/mod/queue"
              buttonText="Review Queue"
              badge={user.flaggedPosts}
            />
          )}

          {/* Admin-specific cards */}
          {user.role === 'admin' && (
            <>
              <DashboardCard
                icon={BarChart3}
                title="Analytics Dashboard"
                description="View platform metrics, usage statistics, and key insights."
                to="/admin/metrics"
                buttonText="View Analytics"
              />

              <DashboardCard
                icon={UserCog}
                title="Manage Users & Capacity"
                description="Manage user accounts, roles, and counselor availability."
                to="/admin/users"
                buttonText="Manage Users"
              />
            </>
          )}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{user.upcomingSessions || 0}</p>
                <p className="text-sm text-gray-600">Upcoming Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-xl">
                <HeartPulse className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">7 days</p>
                <p className="text-sm text-gray-600">Current Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UsersRound className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">3</p>
                <p className="text-sm text-gray-600">Active Peer Groups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
