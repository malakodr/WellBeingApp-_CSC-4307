import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  Search,
  ChevronDown,
  X,
  AlertCircle,
  BookOpen,
  MessageSquare
} from 'lucide-react';
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
  rejectionReason?: string;
}

export function AdminPeerApplications() {
  const [applications, setApplications] = useState<PeerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<PeerApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = filter === 'all' ? undefined : filter;
      const response = await api.getPeerApplications(statusParam);
      setApplications(response.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: PeerApplication) => {
    if (!confirm(`Are you sure you want to approve ${app.fullName}'s application? This will create their peer supporter account.`)) {
      return;
    }

    try {
      setProcessing(true);
      await api.request(`/peer-applications/${app.id}/approve`, { method: 'POST' });
      await fetchApplications();
      setShowDetailModal(false);
      setSelectedApp(null);
    } catch (err: any) {
      alert(err.message || 'Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;

    try {
      setProcessing(true);
      await api.request(`/peer-applications/${selectedApp.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectionReason }),
      });
      await fetchApplications();
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedApp(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.fullName.toLowerCase().includes(query) ||
        app.auiEmail.toLowerCase().includes(query) ||
        app.major.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peer Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage peer supporter applications</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
            {applications.filter(a => a.status === 'PENDING').length} Pending
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or major..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006341] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="appearance-none pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006341] focus:border-transparent bg-white"
            >
              <option value="all">All Applications</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchApplications}
            className="ml-auto text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006341]"></div>
            <p className="text-gray-500 mt-4">Loading applications...</p>
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'Try adjusting your search query'
              : filter !== 'all'
              ? `No ${filter.toLowerCase()} applications`
              : 'No peer supporter applications yet'}
          </p>
        </div>
      ) : (
        /* Applications List */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#006341]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-[#006341]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{app.fullName}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{app.auiEmail}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {app.major} • {app.yearOfStudy}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {app.school}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Applied {formatDate(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowDetailModal(true);
                      }}
                      className="px-4 py-2 text-sm font-medium text-[#006341] hover:bg-[#006341]/5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {app.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(app)}
                          disabled={processing}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRejectModal(true);
                          }}
                          disabled={processing}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedApp(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#006341]/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-[#006341]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedApp.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedApp.auiEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedApp.phoneNumber}</span>
                  </div>
                  <div className="mt-2">{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Academic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">School:</span>
                    <p className="font-medium text-gray-900">{selectedApp.school}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Major:</span>
                    <p className="font-medium text-gray-900">{selectedApp.major}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Year of Study:</span>
                    <p className="font-medium text-gray-900">{selectedApp.yearOfStudy}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Availability:</span>
                    <p className="font-medium text-gray-900">{selectedApp.availability}</p>
                  </div>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Motivation
                </h4>
                <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{selectedApp.motivation}</p>
              </div>

              {/* Experience */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Prior Experience
                </h4>
                <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{selectedApp.experience}</p>
              </div>

              {/* Communication Style */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Communication Style</h4>
                <span className="inline-block px-3 py-1 bg-[#006341]/10 text-[#006341] rounded-full text-sm font-medium capitalize">
                  {selectedApp.communicationStyle}
                </span>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedApp.status === 'REJECTED' && selectedApp.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Rejection Reason</h4>
                  <p className="text-red-700">{selectedApp.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {selectedApp.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    disabled={processing}
                    className="px-6 py-2 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp)}
                    disabled={processing}
                    className="px-6 py-2 text-sm font-medium text-white bg-[#006341] hover:bg-[#005535] rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Approve Application'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Reject Application</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to reject <strong>{selectedApp.fullName}</strong>'s application?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for the rejection..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006341] focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing ? 'Rejecting...' : 'Reject Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
