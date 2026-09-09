import { useQuery } from '@tanstack/react-query';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { BarChart2, Activity } from 'lucide-react';
import { analyticsService } from '@/api/services';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '@/utils/helpers';

const COLORS = {
  todo: '#64748b',       // slate-500
  in_progress: '#3b82f6', // blue-500
  review: '#8b5cf6',      // violet-500
  done: '#10b981',        // emerald-500
  low: '#64748b',         // slate-500
  medium: '#f59e0b',      // amber-500
  high: '#f97316',        // orange-500
  urgent: '#ef4444',      // red-500
};

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => analyticsService.getDashboard().then(res => res.data.data),
  });

  const statusDist = data?.statusDistribution || { todo: 0, in_progress: 0, review: 0, done: 0 };
  const priorityDist = data?.priorityDistribution || { low: 0, medium: 0, high: 0, urgent: 0 };
  
  const statusData = Object.entries(statusDist).map(([key, value]) => ({
    name: getStatusLabel(key),
    value,
    color: COLORS[key],
  })).filter(item => item.value > 0);

  const priorityData = Object.entries(priorityDist).map(([key, value]) => ({
    name: getPriorityLabel(key),
    value,
    color: COLORS[key],
  })).filter(item => item.value > 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500">Visual overview of your team's workload and productivity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : statusData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-slate-500">No task data available</div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : priorityData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-slate-500">No task data available</div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontWeight: 500 }} width={80} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
