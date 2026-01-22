import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../ui/Card';
import Table from '../ui/Table';

/**
 * ScoreBreakdown component
 * Shows detailed score breakdown with table and chart
 */
export default function ScoreBreakdown({ scores = [], overallScore = 0 }) {
  /**
   * Prepare chart data
   */
  const chartData = scores.map((score) => ({
    name: score.criterionName || 'Unknown',
    value: score.weightedValue || 0,
    weight: score.weight || 0,
    maxValue: (score.weight || 0) * 100, // Maximum possible contribution (weight as decimal * 100)
  }));

  // Calculate dynamic domain - chart goes from 0 to max criterion weight
  const maxDomain = Math.max(...chartData.map(d => d.maxValue), 10);

  /**
   * Custom tooltip for chart
   */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = data.maxValue > 0 ? ((data.value / data.maxValue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Score: {data.value.toFixed(2)} / {data.maxValue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            Weight: {(data.weight * 100).toFixed(0)}% • Achievement: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  /**
   * Get color for bar based on value
   */
  const getBarColor = (value) => {
    if (value >= 0.7) return '#10B981'; // green
    if (value >= 0.4) return '#F59E0B'; // yellow/orange
    return '#EF4444'; // red
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-linkedin-500 to-linkedin-600 text-white">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Overall Score</h3>
          <div className="text-5xl font-bold mb-2">
            {overallScore.toFixed(2)}
          </div>
          <p className="text-linkedin-100">out of 100</p>
        </div>
      </Card>

      {/* Score Breakdown Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Score Breakdown</h3>
          <p className="text-sm text-gray-500 mt-1">
            Detailed breakdown of each evaluation criterion
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Criterion</Table.Header>
                <Table.Header>Raw Value</Table.Header>
                <Table.Header>Weight</Table.Header>
                <Table.Header>Contribution</Table.Header>
                <Table.Header>Explanation</Table.Header>
              </Table.Row>
            </Table.Head>

            <Table.Body>
              {scores.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-8 text-gray-500">
                    No score data available
                  </Table.Cell>
                </Table.Row>
              ) : (
                scores.map((score, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>
                      <div className="font-medium text-gray-900">
                        {score.criterionName || 'Unknown'}
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="font-medium text-gray-900">
                        {(score.rawValue || 0).toFixed(2)} out of 10.0
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="text-gray-900 font-medium">
                        {((score.weight || 0) * 100).toFixed(0)}%
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="text-linkedin-600 font-semibold">
                        {(score.weightedValue || 0).toFixed(2)}%
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="max-w-md">
                        <p className="text-gray-600 text-sm whitespace-normal break-words">
                          {score.explanation || 'No explanation available'}
                        </p>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Visualization Chart */}
      {scores.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Weighted Contributions
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Visual representation of how each criterion contributes to the overall score. Gray bars show the maximum possible contribution based on weight.
            </p>
          </div>

          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, maxDomain]} />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip content={<CustomTooltip />} />

                {/* Shadow bar showing maximum possible value */}
                <Bar dataKey="maxValue" fill="#E5E7EB" radius={[0, 4, 4, 0]} />

                {/* Actual score bar */}
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
