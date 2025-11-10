import { HeartPulse, CalendarClock, UsersRound, Shield, CheckCircle } from 'lucide-react';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import Steps from '../components/Steps';
import Footer from '../components/Footer';

export default function Landing() {
  const features = [
    {
      icon: HeartPulse,
      title: 'Triage Check-In',
      description: 'Share how you feel in 60 seconds. Our confidential system helps identify the support you need right now.'
    },
    {
      icon: CalendarClock,
      title: 'Book a Session',
      description: 'Get matched with an AUI counselor instantly. Schedule private sessions that fit your schedule.'
    },
    {
      icon: UsersRound,
      title: 'Join Peer Spaces',
      description: 'Talk anonymously with supportive peers in safe, moderated spaces designed for student wellbeing.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-aui-green mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Support That Fits Your Life
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you need immediate help or ongoing support, we're here for you every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <Steps />

      {/* Trust & Privacy Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-linear-to-br from-aui-mint to-white rounded-3xl shadow-2xl p-12 border-2 border-aui-mint">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-linear-to-br from-aui-green to-aui-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Shield className="h-10 w-10 text-white" strokeWidth={2} />
              </div>
              <h2 
                className="text-4xl font-bold text-aui-green mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Your Privacy, Our Priority
              </h2>
              <p className="text-xl text-gray-600">
                Your data is private. All sessions are encrypted and confidential, in line with AUI policies.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {[
                'End-to-end encrypted conversations',
                'Secure data storage & protection',
                'Licensed professional counselors',
                '24/7 crisis support available',
                'Anonymous peer support options',
                'Complete privacy control'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-aui-blue shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-aui-green/10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-aui-green rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-xs">AUI</span>
                </div>
                <span className="font-semibold">For AUI Students</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-aui-blue" />
                <span className="font-semibold">Verified & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
