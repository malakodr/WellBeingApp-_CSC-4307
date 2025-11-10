import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export default function FeatureCard({ icon: Icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <div 
      className="group bg-white rounded-2xl p-8 border-2 border-[#E8F3F1] hover:border-[#004B36] shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animation: 'fade-in-up 0.6s ease-out forwards'
      }}
    >
      {/* Icon Container */}
      <div className="w-16 h-16 bg-gradient-to-br from-[#004B36] to-[#007B8A] rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
        <Icon className="h-8 w-8 text-white" strokeWidth={2} />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-[#004B36] mb-3 group-hover:text-[#007B8A] transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* Hover Indicator */}
      <div className="mt-6 flex items-center gap-2 text-[#007B8A] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-sm font-semibold">Explore</span>
        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
