import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Phone, Calendar, Clock, School, BookOpen, MessageSquare, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

interface PeerApplication {
  id: string;
  fullName: string;
  auiEmail: string;
  school: string;
  major: string;
  yearOfStudy: string;
  phoneNumber: string;
  motivation: string;
  experience: string;
  availability: string;
  communicationStyle: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  studentIdFileUrl?: string;
}

export function AdminPeerApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<PeerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await api.getPeerApplication(id!);
      setApplication(response.application);
    } catch (error) {
      console.error('Error fetching application:', error);
      alert('Failed to load application');
      navigate('/admin/peer-applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this application? This will create a user account and send credentials to the applicant.')) {
      return;
    }

    try {
      await api.approveApplication(id!);
      alert('Application approved successfully! User account created and email sent.');
      navigate('/admin/peer-applications');
    } catch (error: any) {
      console.error('Error approving application:', error);
      alert(error.response?.data?.error || 'Failed to approve application');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    try {
      await api.rejectApplication(id!, reason || undefined);
      alert('Application rejected and email sent to applicant.');
      navigate('/admin/peer-applications');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application? This will also delete the associated user account if one exists.')) {
      return;
    }

    try {
      await api.deleteApplication(id!);
      alert('Application deleted successfully');
      navigate('/admin/peer-applications');
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006341]"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending Review</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  const appliedDate = new Date(application.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/peer-applications')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
          <p className="text-gray-600">Review peer tutor application</p>
        </div>
        {getStatusBadge(application.status)}
      </div>

      {/* Applicant Information */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#006341]/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-[#006341]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{application.fullName}</h2>
              <p className="text-gray-600">{application.major}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{application.auiEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{application.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <School className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">School</p>
                <p className="font-medium">{application.school}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Year of Study</p>
                <p className="font-medium">{application.yearOfStudy}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Availability</p>
                <p className="font-medium">{application.availability}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Communication Style</p>
                <p className="font-medium">{application.communicationStyle}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Applied on {appliedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Application Responses</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Why do you want to become a peer supporter?</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{application.motivation}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Previous Experience</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{application.experience}</p>
          </div>
        </div>
      </div>

      {/* Rejection Reason (if applicable) */}
      {application.status === 'REJECTED' && application.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-semibold text-red-900 mb-2">Rejection Reason</h3>
          <p className="text-red-800">{application.rejectionReason}</p>
          {application.reviewedAt && (
            <p className="text-sm text-red-600 mt-2">
              Rejected on {new Date(application.reviewedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {application.status === 'PENDING' && (
            <>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Application
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <XCircle className="w-5 h-5" />
                Reject Application
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Delete Application
          </button>
        </div>
      </div>
    </div>
  );
}
