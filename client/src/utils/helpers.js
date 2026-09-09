import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt) : '—';
};

export const formatRelative = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return new Date() > new Date(dueDate);
};

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const truncate = (str, len = 60) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const getPriorityColor = (priority) => {
  const map = {
    urgent: 'bg-red-100 text-red-700 border-red-200',
    high:   'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low:    'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[priority] || map.medium;
};

export const getStatusColor = (status) => {
  const map = {
    todo:        'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    review:      'bg-violet-100 text-violet-700 border-violet-200',
    done:        'bg-emerald-100 text-emerald-700 border-emerald-200',
    planning:    'bg-slate-100 text-slate-600 border-slate-200',
    active:      'bg-blue-100 text-blue-700 border-blue-200',
    on_hold:     'bg-amber-100 text-amber-700 border-amber-200',
    completed:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return map[status] || map.todo;
};

export const getStatusLabel = (status) => {
  const map = {
    todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done',
    planning: 'Planning', active: 'Active', on_hold: 'On Hold', completed: 'Completed',
  };
  return map[status] || status;
};

export const getPriorityLabel = (priority) => {
  const map = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
  return map[priority] || priority;
};
