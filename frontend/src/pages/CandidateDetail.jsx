import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User, Calendar, FileText, Phone } from 'lucide-react';
import { useCandidate, useUpdateCandidateStatus, useUpdateCandidateData } from '../hooks/useCandidates';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import ScoreBreakdown from '../components/candidates/ScoreBreakdown';

/**
 * CandidateDetail page
 * Shows detailed candidate information with score breakdown
 */
export default function CandidateDetail() {
  const { jobId, candidateId } = useParams();
  const navigate = useNavigate();

  const { data: candidateData, isLoading, error } = useCandidate(candidateId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateCandidateStatus();
  const { mutate: updateCandidateData, isPending: isSaving } = useUpdateCandidateData();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Status options
  const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PROCESSED', label: 'Processed' },
    { value: 'SHORTLISTED', label: 'Shortlisted' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  ];

  // Try both access patterns to handle different response structures
  const candidate = candidateData?.candidate || candidateData?.data?.candidate;

  // Initialize form when candidate data loads
  useEffect(() => {
    if (candidate) {
      setEditForm({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
      });
    }
  }, [candidate]);

  /**
   * Handle status change
   */
  const handleStatusChange = (newStatus) => {
    updateStatus({ candidateId, status: newStatus });
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (jobId) {
      navigate(`/jobs/${jobId}`);
    } else {
      navigate(-1);
    }
  };

  /**
   * Handle form submission
   */
  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateCandidateData({
      candidateId,
      updates: editForm,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  /**
   * Handle cancel
   */
  const handleEditCancel = () => {
    // Reset form to original values
    if (candidate) {
      setEditForm({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading candidate</p>
          <p className="text-gray-500 mt-2">{error.message}</p>
          <Button onClick={handleBack} variant="secondary" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Candidate not found</p>
          <Button onClick={handleBack} variant="secondary" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={handleBack}
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>

          <Button
            onClick={() => isEditing ? handleEditCancel() : setIsEditing(true)}
            variant={isEditing ? 'secondary' : 'primary'}
            size="sm"
            disabled={isSaving}
          >
            {isEditing ? 'Cancel' : 'Edit Candidate'}
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {candidate.name || 'Unknown Candidate'}
            </h1>
            <p className="text-gray-500 mt-1">
              Rank #{candidate.rank || 'N/A'} • Overall Score: {(candidate.overallScore || 0).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={candidate.status?.toLowerCase() || 'pending'} size="lg">
              {candidate.status || 'PENDING'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Candidate Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Candidate Information
              </h2>
            </div>

            <div className="p-6">
              {isEditing ? (
                // EDIT MODE - Form inputs
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <Input
                    label="Name"
                    name="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    placeholder="Enter candidate name"
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                  />

                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter phone number (optional)"
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleEditCancel}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                // VIEW MODE - Read-only display
                <div className="space-y-4">
                  {/* Name */}
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">
                        {candidate.name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {candidate.email || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  {candidate.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {candidate.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Uploaded</p>
                      <p className="font-medium text-gray-900">
                        {candidate.createdAt
                          ? new Date(candidate.createdAt).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Status Update Card */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Update Status
              </h2>
            </div>

            <div className="p-6">
              <Select
                value={candidate.status || 'PENDING'}
                onChange={handleStatusChange}
                options={STATUS_OPTIONS}
                disabled={isUpdating}
              />

              {isUpdating && (
                <p className="text-sm text-gray-500 mt-2">Updating...</p>
              )}
            </div>
          </Card>

          {/* Resume Text Card */}
          {candidate.resumeText && (
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Resume Text
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {candidate.resumeText}
                  </pre>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Score Breakdown */}
        <div className="lg:col-span-2">
          <ScoreBreakdown
            scores={candidate.scores || []}
            overallScore={candidate.overallScore || 0}
          />
        </div>
      </div>
    </div>
  );
}
