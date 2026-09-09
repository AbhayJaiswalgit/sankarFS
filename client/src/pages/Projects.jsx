import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Briefcase, Calendar, CheckSquare, Users } from 'lucide-react';
import { projectService } from '@/api/services';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { AvatarGroup } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';

const ProjectModal = ({ isOpen, onClose, projectToEdit }) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    projectToEdit || { name: '', description: '', status: 'planning', priority: 'medium', dueDate: '' }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setLoading(true);
    try {
      if (projectToEdit) {
        await projectService.updateProject(projectToEdit._id, formData);
        success('Project updated');
      } else {
        await projectService.createProject(formData);
        success('Project created');
      }
      queryClient.invalidateQueries(['projects']);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={projectToEdit ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input label="Project Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </Select>
          <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <Input label="Due Date" type="date" value={formData.dueDate ? formData.dueDate.split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Simple debounce
  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', page, debouncedSearch, statusFilter],
    queryFn: () => projectService.getProjects({ page, search: debouncedSearch, status: statusFilter }).then((res) => res.data.data),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openNewProject = () => { setEditingProject(null); setIsModalOpen(true); };
  const openEditProject = (p) => { setEditingProject(p); setIsModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    setDeleteLoading(true);
    try {
      await projectService.deleteProject(deleteConfirm.id);
      success('Project deleted');
      queryClient.invalidateQueries(['projects']);
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (err) {
      error(err.message || 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const projects = data?.projects || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500">Manage and track all your team's projects.</p>
        </div>
        <Button icon={Plus} onClick={openNewProject}>New Project</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <Select className="w-40 h-10" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}><CardBody className="p-5 space-y-4"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-full mt-4" /></CardBody></Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={Briefcase} title="No projects found" description="Get started by creating a new project." action={<Button onClick={openNewProject}>Create Project</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const isOwner = project.owner._id === user?._id || user?.role === 'admin';
            return (
              <Card key={project._id} hover className="flex flex-col">
                <CardBody className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <StatusBadge status={project.status} />
                    <Dropdown
                      trigger={<button className="p-1 text-slate-400 hover:text-slate-600 rounded"><MoreVertical className="w-4 h-4" /></button>}
                    >
                      <DropdownItem onClick={() => navigate(`/projects/${project._id}`)}>View Details</DropdownItem>
                      {isOwner && (
                        <>
                          <DropdownItem onClick={() => openEditProject(project)}>Edit Project</DropdownItem>
                          <div className="border-t border-slate-100 my-1"></div>
                          <DropdownItem danger onClick={() => setDeleteConfirm({ isOpen: true, id: project._id })}>Delete Project</DropdownItem>
                        </>
                      )}
                    </Dropdown>
                  </div>
                  <Link to={`/projects/${project._id}`} className="group mb-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.name}</h3>
                  </Link>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                    {project.description || 'No description provided.'}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(project.dueDate)}</div>
                      <div className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" />{project.taskStats.done}/{project.taskStats.total}</div>
                    </div>
                    
                    <ProgressBar progress={project.progress} showLabel />
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <AvatarGroup users={project.members} max={3} />
                      <Badge variant="default" className="text-[10px] uppercase tracking-wider">{project.priority}</Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {isModalOpen && <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectToEdit={editingProject} />}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Project?"
        message="This will permanently delete this project and all its tasks. This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
