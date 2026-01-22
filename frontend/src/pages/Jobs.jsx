import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Search, LayoutGrid, Calendar } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CenteredSpinner } from '../components/ui/Spinner';
import { formatSalaryRange } from '../utils/salaryParser';

/**
 * Jobs list page
 * Shows all jobs in a grid layout with search and filtering
 */
export default function Jobs() {
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
  const { data, isLoading, error } = useJobs();
  const canManageJobs = useAuthStore((state) => state.canManageJobs());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('jobsViewMode') || 'grouped';
  });

  // Save view mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('jobsViewMode', viewMode);
  }, [viewMode]);

  const STATUS_OPTIONS = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'OPEN', label: 'Open' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const allJobs = data?.jobs || [];

  // Filter and search jobs - must be defined before early returns
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // Status filter
      if (statusFilter !== 'ALL' && job.status !== statusFilter) {
        return false;
      }

      // Search filter (title, description, location)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = job.title?.toLowerCase().includes(searchLower);
        const matchesDescription = job.description?.toLowerCase().includes(searchLower);
        const matchesLocation = job.location?.toLowerCase().includes(searchLower);

        if (!matchesTitle && !matchesDescription && !matchesLocation) {
          return false;
        }
      }

      return true;
    });
  }, [allJobs, searchTerm, statusFilter]);

  // Group jobs by status with sorting
  const groupedJobs = useMemo(() => {
    const statusOrder = ['OPEN', 'DRAFT', 'CLOSED', 'ARCHIVED'];
    const groups = {};

    // Initialize groups
    statusOrder.forEach((status) => {
      groups[status] = [];
    });

    // Group filtered jobs by status and sort by creation date
    filteredJobs.forEach((job) => {
      const status = job.status || 'DRAFT';
      if (groups[status]) {
        groups[status].push(job);
      }
    });

    // Sort jobs within each group by creation date (most recent first)
    statusOrder.forEach((status) => {
      groups[status].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    // Filter out empty groups
    return statusOrder
      .filter((status) => groups[status].length > 0)
      .map((status) => ({
        status,
        label: `${status.charAt(0) + status.slice(1).toLowerCase()} Jobs`,
        jobs: groups[status],
      }));
  }, [filteredJobs]);

  // Sort jobs by creation date for flat view
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filteredJobs]);

  // Conditional renders AFTER all hooks
  if (isLoading) {
    return <CenteredSpinner message="Loading jobs..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load jobs. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your job postings and review candidates
          </p>
        </div>
        {canManageJobs && (
          <Link to="/jobs/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            className="w-full"
          />
        </div>
        <Button
          variant={viewMode === 'grouped' ? 'primary' : 'secondary'}
          onClick={() => setViewMode(viewMode === 'grouped' ? 'sorted' : 'grouped')}
          className="flex items-center gap-2"
        >
          {viewMode === 'grouped' ? (
            <>
              <Calendar className="h-4 w-4" />
              Sort by Date
            </>
          ) : (
            <>
              <LayoutGrid className="h-4 w-4" />
              Group by Status
            </>
          )}
        </Button>
      </div>

      {/* Results count */}
      {searchTerm || statusFilter !== 'ALL' ? (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredJobs.length} of {allJobs.length} jobs
        </div>
      ) : null}

      {/* Jobs display */}
      {filteredJobs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {allJobs.length === 0 ? 'No jobs' : 'No matching jobs'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {allJobs.length === 0
                ? 'Get started by creating a new job posting.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {canManageJobs && allJobs.length === 0 && (
              <div className="mt-6">
                <Link to="/jobs/new">
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      ) : viewMode === 'grouped' ? (
        // Grouped view by status
        <div className="space-y-8">
          {groupedJobs.map((group) => (
            <div key={group.status} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {group.label} ({group.jobs.length})
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.jobs.map((job) => (
                  <Link key={job._id} to={`/jobs/${job._id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle>{job.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {job.criteria?.length || 0} criteria
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {job.description}
                        </p>
                        {(job.location || (job.minSalary && job.maxSalary)) && (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {job.location && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                📍 {job.location}
                              </span>
                            )}
                            {job.minSalary && job.maxSalary && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                💰 {formatSalaryRange(job.minSalary, job.maxSalary, job.currency)}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                          <span>{job.candidateCount || 0} candidates</span>
                          <span>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Sorted view by date
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedJobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {job.criteria?.length || 0} criteria
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {job.description}
                  </p>
                  {(job.location || (job.minSalary && job.maxSalary)) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {job.location && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          📍 {job.location}
                        </span>
                      )}
                      {job.minSalary && job.maxSalary && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          💰 {formatSalaryRange(job.minSalary, job.maxSalary, job.currency)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>{job.candidateCount || 0} candidates</span>
                    <span>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
