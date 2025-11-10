import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-aui-green via-[#006B5A] to-aui-blue"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating Shapes - Decorative */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-aui-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your Wellbeing,{' '}
              <span className="text-aui-mint">Our Commitment.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-aui-mint mb-10 leading-relaxed max-w-xl">
              AUI Wellbeing Hub connects students with counselors, peers, and 24-hour care in a secure and inclusive space.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => navigate('/login')}
                className="group bg-white text-aui-green px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => scrollToSection('features')}
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                Learn More
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-aui-mint">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-aui-mint rounded-full"></div>
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-aui-mint rounded-full"></div>
                <span>Confidential & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-aui-mint rounded-full"></div>
                <span>Student-Focused</span>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {/* Abstract Student Illustration Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  {/* Main Circle - Students */}
                  <div className="relative w-80 h-80 mx-auto">
                    {/* Background Circle */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-full border-2 border-white/20"></div>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-10 right-10 w-16 h-16 bg-aui-mint rounded-2xl shadow-2xl transform rotate-12 flex items-center justify-center">
                      <svg className="w-10 h-10 text-aui-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    <div className="absolute bottom-10 left-10 w-20 h-20 bg-white rounded-2xl shadow-2xl transform -rotate-6 flex items-center justify-center">
                      <svg className="w-12 h-12 text-aui-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-aui-blue/20 rounded-full animate-ping"></div>
                    
                    {/* Center Icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center">
                        <svg className="w-14 h-14 text-aui-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Lines */}
                  <div className="absolute -top-4 -right-4 w-32 h-32 border-2 border-white/20 rounded-3xl transform rotate-12"></div>
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-white/20 rounded-3xl transform -rotate-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
