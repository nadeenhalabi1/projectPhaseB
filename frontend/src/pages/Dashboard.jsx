import { Link, useNavigate } from 'react-router-dom';
import { Plus, Briefcase } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDashboard } from '../hooks/useDashboard';
import { useJobs } from '../hooks/useJobs';
import DashboardStats from '../components/dashboard/DashboardStats';
import JobStatusChart from '../components/dashboard/JobStatusChart';
import TopJobsTable from '../components/dashboard/TopJobsTable';
import RecentActivity from '../components/dashboard/RecentActivity';
import PendingActions from '../components/dashboard/PendingActions';
import QuickMetrics from '../components/dashboard/QuickMetrics';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

/**
 * Dashboard page
 * Overview of jobs, candidates, and recruitment analytics
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch dashboard stats
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();

  // Fetch jobs for charts
  const { data: jobsData, isLoading: jobsLoading } = useJobs();

  const jobs = jobsData?.jobs || [];
  const isLoading = dashboardLoading || jobsLoading;

  // Get recent jobs (last 5)
  const recentJobs = jobs
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here's an overview of your recruitment pipeline
          </p>
        </div>

        <Link to="/jobs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <DashboardStats
        stats={dashboardData?.stats}
        isLoading={dashboardLoading}
      />

      {/* Quick Metrics */}
      <QuickMetrics jobs={jobs} stats={dashboardData?.stats} />

      {/* Pending Actions */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
        </div>
        <div className="p-6">
          <PendingActions jobs={jobs} stats={dashboardData?.stats} />
        </div>
      </Card>

      {/* Two Column Layout: Job Status Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Job Status Distribution
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Overview of all jobs by their current status
            </p>
            <JobStatusChart jobs={jobs} isLoading={jobsLoading} />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <RecentActivity jobs={jobs} isLoading={jobsLoading} />
          </div>
        </Card>
      </div>

      {/* Top Performing Jobs */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Jobs
          </h3>
          <TopJobsTable jobs={jobs} isLoading={jobsLoading} />
        </div>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
            <Link to="/jobs">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </div>

        {recentJobs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No jobs created yet</p>
            <Link to="/jobs/new">
              <Button variant="secondary" className="mt-4">
                Create Your First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentJobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {job.title}
                        </h3>
                        <Badge variant={job.status?.toLowerCase() || 'default'}>
                          {job.status || 'ACTIVE'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{job.candidateCount || 0} candidates</span>
                        <span>•</span>
                        <span>
                          Created {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {job.candidateCount > 0 && (
                      <div className="ml-4 flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {job.candidateCount} applicants
                          </p>
                          <p className="text-xs text-gray-500">
                            {job.criteria?.length || 0} criteria
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/jobs/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/jobs')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              View All Jobs
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
