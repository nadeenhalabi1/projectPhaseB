import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Spinner from '../ui/Spinner';
import { useMemo } from 'react';

/**
 * Pie chart showing job status distribution
 * Displays the breakdown of jobs by status (OPEN, CLOSED, DRAFT, ARCHIVED)
 */
export default function JobStatusChart({ jobs, isLoading }) {
  const chartData = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    const statusCounts = jobs.reduce((acc, job) => {
      const status = job.status || 'DRAFT';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const COLORS = {
      OPEN: '#10b981',    // green
      CLOSED: '#6b7280',  // gray
      DRAFT: '#3b82f6',   // blue
      ARCHIVED: '#f59e0b' // amber
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: count,
      color: COLORS[status] || '#6b7280',
    }));
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No job data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
