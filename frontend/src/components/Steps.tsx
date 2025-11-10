import { CheckCircle2, UserCheck, Shield } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Check-In Quickly',
    description: 'Share how you feel in 60 seconds with our confidential triage system.',
    icon: CheckCircle2,
  },
  {
    number: '02',
    title: 'Get Guided to Support',
    description: 'Receive personalized recommendations and connect with the right resources.',
    icon: UserCheck,
  },
  {
    number: '03',
    title: 'Connect Safely',
    description: 'Access counselors, peer support, and ongoing care in a secure environment.',
    icon: Shield,
  },
];

export default function Steps() {
  return (
    <section className="py-20 bg-[#E8F3F1]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold text-[#004B36] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting support is simple. Just three steps to better wellbeing.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="max-w-6xl mx-auto relative">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#004B36] via-[#007B8A] to-[#004B36] opacity-20"></div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative group"
                style={{ 
                  animationDelay: `${index * 0.15}s`,
                  animation: 'fade-in-up 0.6s ease-out forwards'
                }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-[#007B8A]">
                  {/* Step Number Badge */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#004B36] to-[#007B8A] rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <span className="text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                    {/* Decorative circle */}
                    <div className="absolute top-2 left-2 w-20 h-20 bg-[#007B8A]/20 rounded-2xl transform rotate-6"></div>
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <step.icon className="w-10 h-10 text-[#007B8A]" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-[#004B36] mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow Connector - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-4 z-20">
                    <svg className="w-8 h-8 text-[#007B8A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Ready to take the first step towards better wellbeing?
          </p>
          <div className="inline-flex items-center gap-2 text-[#004B36] font-semibold group cursor-pointer">
            <span>Get started now</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
