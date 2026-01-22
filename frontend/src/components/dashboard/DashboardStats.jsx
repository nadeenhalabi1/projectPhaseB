import Card from '../ui/Card';
import { Briefcase, CheckCircle, Users, Upload } from 'lucide-react';
import Spinner from '../ui/Spinner';

/**
 * Dashboard statistics cards
 * Displays key metrics in a grid layout
 */
export default function DashboardStats({ stats, isLoading }) {
  const cards = [
    {
      label: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Jobs',
      value: stats?.activeJobs || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Total Candidates',
      value: stats?.totalCandidates || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
              <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
