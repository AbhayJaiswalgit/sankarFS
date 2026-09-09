import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Calendar, Filter, Plus, Search } from 'lucide-react';
import { taskService, projectService } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/utils/helpers';
import { Modal } from '@/components/ui/Modal';
import { Link } from 'react-router-dom';

const TaskModal = ({ isOpen, onClose, taskToEdit }) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    taskToEdit || { title: '', description: '', project: '', status: 'todo', priority: 'medium', dueDate: '', assignee: user._id }
  );

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectService.getProjects({ limit: 100 }).then(res => res.data.data.projects),
  });

  const { data: membersData } = useQuery({
    queryKey: ['project', formData.project, 'members'],
    queryFn: () => projectService.getProjectMembers(formData.project).then(res => res.data.data.members),
    enabled: !!formData.project,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.project) return;
    setLoading(true);
    try {
      if (taskToEdit) {
        await taskService.updateTask(taskToEdit._id, formData);
        success('Task updated');
      } else {
        await taskService.createTask(formData);
        success('Task created');
      }
      queryClient.invalidateQueries(['tasks']);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input label="Task Title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        
        <Select label="Project" required value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}>
          <option value="">Select Project</option>
          {projectsData?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </Select>
          <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Assignee" value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}>
            <option value="">Unassigned</option>
            {membersData?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </Select>
          <Input label="Due Date" type="date" value={formData.dueDate ? formData.dueDate.split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default function Tasks() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', project: '', myTasks: 'true' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectService.getProjects({ limit: 100 }).then(res => res.data.data.projects),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page, debouncedSearch, filters],
    queryFn: () => taskService.getTasks({ page, search: debouncedSearch, ...filters }).then(res => res.data.data),
  });

  const tasks = data?.tasks || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500">Manage and filter all your tasks across projects.</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>New Task</Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap lg:flex-nowrap gap-3">
          <Select className="w-full sm:w-36 h-10" value={filters.myTasks} onChange={(e) => setFilters({ ...filters, myTasks: e.target.value })}>
            <option value="true">My Tasks</option>
            <option value="false">All Tasks</option>
          </Select>
          <Select className="w-full sm:w-36 h-10" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </Select>
          <Select className="w-full sm:w-40 h-10" value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
            <option value="">All Projects</option>
            {projectsData?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description="Try adjusting your search or filters." action={<Button onClick={() => setIsModalOpen(true)}>Create Task</Button>} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 line-clamp-1 max-w-md">{task.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/projects/${task.project._id}`} className="text-indigo-600 hover:underline">{task.project.name}</Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar user={task.assignee} size="sm" />
                          <span className="text-slate-700">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 ${task.isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                        <Calendar className="w-4 h-4" />
                        {formatDate(task.dueDate)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {isModalOpen && <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
