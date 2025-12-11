/**
 * Become Peer Entry Component
 * Reusable component for promoting peer mentor applications
 * Variants: button, menu, card, link
 */

import { Link } from 'react-router-dom';
import { HandHeart, ArrowRight, Sparkles } from 'lucide-react';

interface BecomePeerEntryProps {
  variant?: 'button' | 'menu' | 'card' | 'link';
  className?: string;
}

export function BecomePeerEntry({ variant = 'button', className = '' }: BecomePeerEntryProps) {
  const baseRoute = '/student/become-peer';

  // Menu Item Variant (for sidebar/profile menu)
  if (variant === 'menu') {
    return (
      <Link
        to={baseRoute}
        className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#006341]/5 hover:text-[#006341] rounded-xl transition-all group ${className}`}
      >
        <HandHeart className="w-5 h-5 text-[#006341] group-hover:scale-110 transition-transform" />
        <span className="font-medium">Become a Peer Mentor</span>
        <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[#006341] group-hover:translate-x-1 transition-all" />
      </Link>
    );
  }

  // Card Variant (for dashboard promotional card)
  if (variant === 'card') {
    return (
      <div className={`bg-linear-to-br from-[#006341]/5 via-[#006341]/10 to-emerald-100/50 rounded-3xl p-6 border border-[#006341]/20 shadow-sm hover:shadow-md transition-all ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#006341] rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <HandHeart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">Want to Help Others?</h3>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              Apply to become a peer mentor at AUI and make a difference in students' lives.
            </p>
            <Link
              to={baseRoute}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006341] text-white rounded-full font-semibold text-sm hover:bg-[#005030] hover:shadow-lg transition-all group"
            >
              Become a Peer Mentor
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Button Variant (for CTAs)
  if (variant === 'button') {
    return (
      <Link
        to={baseRoute}
        className={`inline-flex items-center gap-2 px-6 py-3 bg-[#006341] text-white rounded-full font-semibold hover:bg-[#005030] hover:shadow-lg transition-all group ${className}`}
      >
        <HandHeart className="w-5 h-5" />
        Become a Peer Mentor
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  }

  // Link Variant (for footer/subtle placements)
  if (variant === 'link') {
    return (
      <Link
        to={baseRoute}
        className={`inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#006341] font-medium transition-colors ${className}`}
      >
        <HandHeart className="w-4 h-4" />
        Become a Peer Mentor
      </Link>
    );
  }

  return null;
}
