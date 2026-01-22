import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { ArrowLeft, FileText, Users, Upload, Edit, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { useJob, useUpdateJob, useDeleteJob } from '../hooks/useJobs';
import { useCandidates } from '../hooks/useCandidates';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import { CenteredSpinner } from '../components/ui/Spinner';
import CandidatesTable from '../components/candidates/CandidatesTable';
import ResumeUploader from '../components/resumes/ResumeUploader';
import { formatSalaryRange } from '../utils/salaryParser';
import ConfirmDialog from '../components/common/ConfirmDialog';

/**
 * Job detail page
 * Tabs: Overview, Candidates, Upload
 */
export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useJob(jobId);
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates(jobId);
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const [selectedTab, setSelectedTab] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const JOB_STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'OPEN', label: 'Open' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const handleStatusChange = (newStatus) => {
    updateJob.mutate({ jobId, updates: { status: newStatus } });
  };

  /**
   * Handle upload completion - switch to Candidates tab
   */
  const handleUploadComplete = () => {
    setSelectedTab(1); // Switch to Candidates tab (index 1)
  };

  /**
   * Handle job deletion
   */
  const handleDeleteJob = async () => {
    try {
      await deleteJob.mutateAsync(jobId);
      navigate('/jobs'); // Navigate back to jobs list after successful deletion
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Delete job error:', error);
    }
  };

  if (isLoading) {
    return <CenteredSpinner message="Loading job details..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load job. Please try again.</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/jobs')}
          className="mt-4"
        >
          Back to Jobs
        </Button>
      </div>
    );
  }

  const job = data?.job;

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Job not found.</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/jobs')}
          className="mt-4"
        >
          Back to Jobs
        </Button>
      </div>
    );
  }

  const tabs = [
    { name: 'Overview', icon: FileText },
    { name: 'Candidates', icon: Users },
    { name: 'Upload', icon: Upload },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Created {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <Select
                value={job.status || 'OPEN'}
                onChange={handleStatusChange}
                options={JOB_STATUS_OPTIONS}
                size="sm"
                className="w-32"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate(`/jobs/${jobId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteJob.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteJob.isPending ? 'Processing...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                clsx(
                  'flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none',
                  selected
                    ? 'border-linkedin-500 text-linkedin-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Overview tab */}
          <Tab.Panel>
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Job Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {job.description}
                </p>
              </Card>

              {job.requirements && job.requirements.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Requirements
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {(job.location || (job.minSalary && job.maxSalary)) && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.location && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Location
                        </p>
                        <p className="mt-1 text-gray-900">{job.location}</p>
                      </div>
                    )}
                    {job.minSalary && job.maxSalary && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Salary Range
                        </p>
                        <p className="mt-1 text-gray-900">
                          {formatSalaryRange(job.minSalary, job.maxSalary, job.currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Evaluation Criteria
                </h3>
                <div className="space-y-3">
                  {job.criteria?.map((criterion, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {criterion.name}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {criterion.description}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            Type: {criterion.dataType}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-lg font-semibold text-linkedin-600">
                            {criterion.weight}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Tab.Panel>

          {/* Candidates tab */}
          <Tab.Panel>
            <CandidatesTable
              jobId={jobId}
              candidates={candidatesData?.candidates || []}
              isLoading={candidatesLoading}
            />
          </Tab.Panel>

          {/* Upload tab */}
          <Tab.Panel>
            <Card>
              <ResumeUploader
                jobId={jobId}
                onUploadComplete={handleUploadComplete}
              />
            </Card>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteJob}
        title="Delete Job"
        message={`Are you sure you want to delete "${job.title}"? This will permanently delete the job and all associated candidates. This action cannot be undone.`}
        confirmText="Delete Job"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteJob.isPending}
      />
    </div>
  );
}
