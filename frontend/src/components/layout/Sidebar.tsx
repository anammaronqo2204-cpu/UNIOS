import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Bot,
  Calendar,
  FileQuestion,
  Lightbulb,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tutor', icon: Bot, label: 'AI Tutor' },
  { to: '/planner', icon: Calendar, label: 'Study Planner' },
  { to: '/flashcards', icon: Lightbulb, label: 'Flashcards' },
  { to: '/exams', icon: FileQuestion, label: 'Exam Mode' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-deep-indigo text-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-vibrant-violet to-electric-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <span className="text-xl font-bold">UniOS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vibrant-violet to-electric-blue flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">
              {user?.planTier === 'premium' ? 'Premium' : 'Free'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}