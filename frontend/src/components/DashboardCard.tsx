import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  buttonText?: string;
  badge?: number;
}

export function DashboardCard({ 
  icon: Icon, 
  title, 
  description, 
  to, 
  buttonText = 'Get Started',
  badge 
}: DashboardCardProps) {
  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
      
      <Link
        to={to}
        className="inline-flex items-center text-primary font-medium text-sm hover:text-primary/80 transition-colors"
      >
        {buttonText}
        <svg 
          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
