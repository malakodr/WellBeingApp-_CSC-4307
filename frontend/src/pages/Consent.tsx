import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Consent = () => {
  const navigate = useNavigate();
  const { giveConsent, error, clearError } = useAuth();
  
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      return;
    }

    setIsSubmitting(true);
    try {
      await giveConsent();
      navigate('/');
    } catch (err) {
      console.error('Consent submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text mb-2">
              Confidentiality & Limits of Support
            </h1>
            <p className="text-gray-600">
              Please read and accept before continuing
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 space-y-4 max-h-96 overflow-y-auto">
            <div>
              <h2 className="text-lg font-semibold text-text mb-2">
                1. Confidentiality Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Everything you share in the AUI Wellbeing Hub is confidential and private. 
                Your conversations with counselors and peer support messages are protected 
                and will not be shared with parents, teachers, or other students without your permission.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-text mb-2">
                2. Mandatory Disclosure Exceptions
              </h2>
              <p className="text-gray-700 leading-relaxed">
                There are important exceptions where we must share information to keep you safe:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2 ml-4">
                <li>If you are in immediate danger or at risk of harming yourself</li>
                <li>If you are at risk of harming someone else</li>
                <li>If there is suspected abuse or neglect that needs to be reported</li>
                <li>If required by law or court order</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-text mb-2">
                3. Crisis Support
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you are experiencing a crisis, our system will alert trained counselors 
                immediately. In serious situations, we may contact emergency services or your 
                emergency contacts to ensure your safety.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-text mb-2">
                4. Scope of Support
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This platform provides peer support and counseling guidance, but it is not a 
                substitute for emergency medical care or professional therapy. For emergencies, 
                please call emergency services or visit the nearest hospital.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-text mb-2">
                5. Your Rights
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to ask questions, request information about your data, 
                and withdraw from the platform at any time. You can also request copies of 
                your conversations or ask for certain information to be deleted.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition">
              <input
                type="checkbox"
                id="consent"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (error) clearError();
                }}
                className="mt-1 h-5 w-5 text-primary focus:ring-2 focus:ring-primary rounded"
              />
              <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                <span className="font-semibold">I understand and agree</span> to the confidentiality 
                policy and limits of support. I understand that my information will be kept private 
                except in cases where my safety or others' safety is at risk.
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreed || isSubmitting}
              className="w-full bg-primary hover:bg-[#009944] text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'I Understand and Agree'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500">
            By clicking "I Understand and Agree", you acknowledge that you have read and 
            understood the confidentiality policy and agree to the terms outlined above.
          </p>
        </div>
      </div>
    </div>
  );
};
