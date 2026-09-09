import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List as ListIcon, Users, Calendar, Plus, ChevronLeft } from 'lucide-react';
import { projectService, taskService } from '@/api/services';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { AvatarGroup } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import KanbanBoard from './KanbanBoard';
import { formatDate } from '@/utils/helpers';
// TaskModal will be reused from Tasks.jsx or implemented here. For simplicity, we assume we have a way to add tasks.
// In a real app we'd extract TaskModal to a shared component.

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [view, setView] = useState('kanban'); // 'kanban' or 'list'
  
  const { data: projectData, isLoading: projLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProjectById(projectId).then(res => res.data.data.project),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['project', projectId, 'tasks'],
    queryFn: () => taskService.getTasks({ project: projectId, limit: 100 }).then(res => res.data.data.tasks),
  });

  if (projLoading) return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  if (!projectData) return <div className="p-8 text-center">Project not found</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Back button */}
      <Link to="/projects" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Projects
      </Link>

      {/* Header Area */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{projectData.name}</h1>
            <StatusBadge status={projectData.status} />
            <PriorityBadge priority={projectData.priority} />
          </div>
          <p className="text-slate-600 mb-6 max-w-3xl leading-relaxed">
            {projectData.description || 'No description provided.'}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Due {formatDate(projectData.dueDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <AvatarGroup users={projectData.members} max={3} size="xs" />
                <span>{projectData.members.length} members</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-64 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between text-sm mb-2 font-medium text-slate-700">
            <span>Progress</span>
            <span>{projectData.progress}%</span>
          </div>
          <ProgressBar progress={projectData.progress} />
          <div className="mt-3 text-xs text-slate-500 text-center">
            {projectData.taskStats.done} of {projectData.taskStats.total} tasks completed
          </div>
        </div>
      </div>

      {/* Board Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center shadow-sm">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            onClick={() => setView('kanban')}
          >
            <LayoutGrid className="w-4 h-4" /> Board
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            onClick={() => setView('list')}
          >
            <ListIcon className="w-4 h-4" /> List
          </button>
        </div>
        <Button icon={Plus}>Add Task</Button>
      </div>

      {/* Main Content Area */}
      {tasksLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : view === 'kanban' ? (
        <KanbanBoard projectId={projectId} tasks={tasksData || []} onTaskClick={(task) => console.log('Edit task', task)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasksData?.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{task.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3">{formatDate(task.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
