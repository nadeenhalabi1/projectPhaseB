import { TrendingUp, Target, Clock, Award } from 'lucide-react';
import Card from '../ui/Card';

/**
 * Quick Metrics Grid
 * Additional helpful metrics for recruiters
 */
export default function QuickMetrics({ jobs, stats }) {
  const metrics = [
    {
      label: 'Avg Candidates/Job',
      value: jobs && jobs.length > 0
        ? (stats?.totalCandidates / jobs.length).toFixed(1)
        : '0',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Jobs This Week',
      value: jobs?.filter(job => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(job.createdAt) > weekAgo;
      }).length || 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Hiring',
      value: jobs?.filter(job => job.status === 'OPEN' && job.candidateCount > 0).length || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Top Job Candidates',
      value: jobs && jobs.length > 0
        ? Math.max(...jobs.map(j => j.candidateCount || 0))
        : 0,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label}>
            <div className="flex flex-col items-center text-center p-4">
              <div className={`w-12 h-12 rounded-full ${metric.bgColor} flex items-center justify-center mb-2`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {metric.value}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {metric.label}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
