import api from './axiosInstance';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

export const projectService = {
  getProjects: (params) => api.get('/projects', { params }),
  createProject: (data) => api.post('/projects', data),
  getProjectById: (id) => api.get(`/projects/${id}`),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getProjectMembers: (id) => api.get(`/projects/${id}/members`),
  addProjectMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeProjectMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
};

export const commentService = {
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProjectAnalytics: (id) => api.get(`/analytics/projects/${id}`),
};

export const activityService = {
  getActivities: (params) => api.get('/activities', { params }),
};
