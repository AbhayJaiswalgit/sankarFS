import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, Clock, CheckCircle } from 'lucide-react';
import { taskService } from '@/api/services';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { PriorityBadge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/helpers';

// --- Sortable Task Card ---
const SortableTaskCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id, data: { type: 'Task', task } });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-3 group hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => onClick(task)}>
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">{task.title}</h4>
        <div {...attributes} {...listeners} className="text-slate-300 hover:text-slate-500 cursor-grab px-1 -mr-2" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-2">
          {task.dueDate && <span className={`text-[10px] font-medium ${task.isOverdue ? 'text-red-600' : 'text-slate-500'}`}>{formatDate(task.dueDate, 'MMM d')}</span>}
          {task.assignee ? <Avatar user={task.assignee} size="xs" /> : <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 border-dashed" />}
        </div>
      </div>
    </div>
  );
};

// --- Kanban Column ---
const KanbanColumn = ({ status, title, tasks, onTaskClick }) => {
  return (
    <div className="bg-slate-50/50 rounded-2xl flex flex-col h-[calc(100vh-320px)] min-h-[500px] border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="flex-1 p-3 overflow-y-auto kanban-col">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Board Component ---
export default function KanbanBoard({ projectId, tasks, onTaskClick }) {
  const queryClient = useQueryClient();
  const { error } = useToast();

  const [activeTask, setActiveTask] = useState(null);
  
  // Local state for optimistic updates
  const [localTasks, setLocalTasks] = useState(tasks);
  
  useMemo(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }) => taskService.updateTask(id, { status }),
    onError: () => {
      error('Failed to update task status');
      queryClient.invalidateQueries(['project', projectId, 'tasks']);
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ];

  const handleDragStart = (event) => {
    const { active } = event;
    const task = localTasks.find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Is it dropped over another task?
    const overTask = localTasks.find(t => t._id === overId);
    // Or is it dropped over a column (empty area)?
    const isOverColumn = columns.find(c => c.id === overId);

    const activeTask = localTasks.find(t => t._id === activeId);
    if (!activeTask) return;

    let newStatus = activeTask.status;

    if (overTask && overTask._id !== activeId) {
      newStatus = overTask.status;
    } else if (isOverColumn) {
      newStatus = isOverColumn.id;
    }

    if (newStatus !== activeTask.status) {
      // Optimistic update
      setLocalTasks(prev => prev.map(t => t._id === activeId ? { ...t, status: newStatus } : t));
      // API call
      updateTaskStatus.mutate({ id: activeId, status: newStatus });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(col => {
          const colTasks = localTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} id={col.id} className="relative">
              {/* Drop target for empty columns */}
              <div className="absolute inset-0 z-0" />
              <KanbanColumn status={col.id} title={col.title} tasks={colTasks} onTaskClick={onTaskClick} />
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="bg-white p-3 rounded-xl shadow-xl border border-indigo-500 opacity-90 scale-105 rotate-2">
            <h4 className="text-sm font-medium text-slate-900 mb-2">{activeTask.title}</h4>
            <PriorityBadge priority={activeTask.priority} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
