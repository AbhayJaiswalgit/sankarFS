import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Briefcase, CheckSquare, CheckCircle, Clock, Plus, Activity,
  AlertCircle, ChevronRight
} from 'lucide-react';
import { analyticsService, taskService } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelative } from '@/utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <Card hover className="overflow-hidden">
    <CardBody className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardBody>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => analyticsService.getDashboard().then(res => res.data.data),
  });

  const { data: myTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'my', 'pending'],
    queryFn: () => taskService.getTasks({ myTasks: true, limit: 5 }).then(res => res.data.data.tasks),
  });

  const summary = analyticsData?.summary || { totalProjects: 0, activeProjects: 0, myTasksCount: 0, completedTasksCount: 0 };
  const projectProgress = analyticsData?.projectProgress || [];
  const recentActivity = analyticsData?.recentActivity || [];
  const productivityData = analyticsData?.productivityData || [];

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-500">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="secondary" icon={Briefcase}>Projects</Button>
          </Link>
          <Link to="/tasks">
            <Button icon={Plus}>New Task</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Active Projects"
          value={summary.activeProjects}
          icon={Activity}
          color="bg-blue-100 text-blue-600"
          loading={analyticsLoading}
        />
        <StatCard
          title="Total Projects"
          value={summary.totalProjects}
          icon={Briefcase}
          color="bg-indigo-100 text-indigo-600"
          loading={analyticsLoading}
        />
        <StatCard
          title="My Pending Tasks"
          value={summary.myTasksCount}
          icon={Clock}
          color="bg-amber-100 text-amber-600"
          loading={analyticsLoading}
        />
        <StatCard
          title="Tasks Completed"
          value={summary.completedTasksCount}
          icon={CheckCircle}
          color="bg-emerald-100 text-emerald-600"
          loading={analyticsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {analyticsLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : projectProgress.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No active projects"
                  description="You are not part of any active projects yet."
                  action={<Link to="/projects"><Button>Browse Projects</Button></Link>}
                  className="rounded-none border-0"
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {projectProgress.map(project => (
                    <Link key={project._id} to={`/projects/${project._id}`} className="block p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{project.name}</h4>
                          <p className="text-sm text-slate-500">
                            {project.taskStats.total} total tasks • {project.taskStats.done} completed
                          </p>
                        </div>
                        <Avatar user={project.owner} size="sm" />
                      </div>
                      <ProgressBar progress={project.progress} showLabel height="h-2" />
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Productivity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardBody>
              {analyticsLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => {
                          const [, m, d] = val.split('-');
                          return `${m}/${d}`;
                        }}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        name="Tasks Completed"
                        stroke="#6366f1" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }}
                        activeDot={{ r: 6, fill: '#6366f1' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* My Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {tasksLoading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : myTasksData?.length === 0 ? (
                <div className="p-8 text-center border-b border-slate-100">
                  <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-900">All caught up!</p>
                  <p className="text-xs text-slate-500">You have no pending tasks.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myTasksData?.map(task => (
                    <div key={task._id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">
                          {task.title}
                        </h4>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500 truncate max-w-[120px]">
                          {task.project.name}
                        </span>
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
            <CardFooter className="py-3 px-4 flex justify-center">
              <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                View all tasks <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </CardFooter>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardBody className="p-0 max-h-[400px] overflow-y-auto">
              {analyticsLoading ? (
                <div className="p-5 space-y-6">
                  {[1, 2, 3].map(i => <div key={i} className="flex gap-3"><Skeleton className="w-8 h-8 rounded-full shrink-0" /><div className="space-y-2 w-full"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/4" /></div></div>)}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No recent activity</div>
              ) : (
                <div className="p-5">
                  <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
                    {recentActivity.map((activity, idx) => (
                      <div key={activity._id} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-500" />
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm text-slate-800">
                            <span className="font-semibold">{activity.actor?.name}</span>
                            {' '}
                            {activity.action === 'task_completed' ? 'completed task' :
                             activity.action === 'task_created' ? 'created task' :
                             activity.action === 'comment_added' ? 'commented on' :
                             activity.action === 'task_status_changed' ? `moved task to ${activity.metadata.to}` :
                             activity.action === 'project_created' ? 'created project' :
                             'updated'}
                            {' '}
                            <span className="font-medium text-slate-900">
                              {activity.task?.title || activity.metadata?.projectName || 'an item'}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatRelative(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
