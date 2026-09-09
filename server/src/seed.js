require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Project = require('./models/Project');
const ProjectMember = require('./models/ProjectMember');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Activity = require('./models/Activity');
const Notification = require('./models/Notification');

const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Project.deleteMany({}), ProjectMember.deleteMany({}),
    Task.deleteMany({}), Comment.deleteMany({}), Activity.deleteMany({}), Notification.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create users
  const users = await User.insertMany([
    { name: 'Alex Rivera', email: 'admin@nova.dev', password: await bcrypt.hash('password123', 12), role: 'admin', bio: 'Full-stack engineer & NOVA admin' },
    { name: 'Jordan Kim', email: 'jordan@nova.dev', password: await bcrypt.hash('password123', 12), role: 'manager', bio: 'Product manager with 5 years experience' },
    { name: 'Sam Patel', email: 'sam@nova.dev', password: await bcrypt.hash('password123', 12), role: 'member', bio: 'Frontend developer' },
    { name: 'Taylor Chen', email: 'taylor@nova.dev', password: await bcrypt.hash('password123', 12), role: 'member', bio: 'Backend developer & API specialist' },
    { name: 'Morgan Lee', email: 'morgan@nova.dev', password: await bcrypt.hash('password123', 12), role: 'member', bio: 'UI/UX designer' },
  ]);
  console.log('👥 Created 5 users');

  const [alex, jordan, sam, taylor, morgan] = users;

  // Create projects
  const projects = await Project.insertMany([
    {
      name: 'NOVA Platform Launch',
      description: 'Core platform development for the NOVA team productivity SaaS product. Includes authentication, project management, and analytics features.',
      status: 'active',
      priority: 'high',
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-10-31'),
      owner: alex._id,
      color: '#6366f1',
    },
    {
      name: 'Marketing Website Redesign',
      description: 'Redesign the marketing website with modern UI, improved SEO, and conversion-optimized landing pages.',
      status: 'active',
      priority: 'medium',
      startDate: new Date('2026-09-01'),
      dueDate: new Date('2026-09-30'),
      owner: jordan._id,
      color: '#0ea5e9',
    },
    {
      name: 'Mobile App Beta',
      description: 'React Native mobile app for iOS and Android with core project management features.',
      status: 'planning',
      priority: 'high',
      startDate: new Date('2026-10-01'),
      dueDate: new Date('2026-12-31'),
      owner: alex._id,
      color: '#10b981',
    },
  ]);
  console.log('📁 Created 3 projects');

  const [novaPlatform, marketingWebsite, mobileApp] = projects;

  // Create project memberships
  await ProjectMember.insertMany([
    { project: novaPlatform._id, user: alex._id, role: 'owner' },
    { project: novaPlatform._id, user: jordan._id, role: 'manager' },
    { project: novaPlatform._id, user: sam._id, role: 'member' },
    { project: novaPlatform._id, user: taylor._id, role: 'member' },
    { project: novaPlatform._id, user: morgan._id, role: 'member' },
    { project: marketingWebsite._id, user: jordan._id, role: 'owner' },
    { project: marketingWebsite._id, user: sam._id, role: 'member' },
    { project: marketingWebsite._id, user: morgan._id, role: 'member' },
    { project: mobileApp._id, user: alex._id, role: 'owner' },
    { project: mobileApp._id, user: taylor._id, role: 'manager' },
    { project: mobileApp._id, user: sam._id, role: 'member' },
  ]);
  console.log('🤝 Created project memberships');

  // Create tasks
  const tasks = await Task.insertMany([
    // NOVA Platform tasks
    { title: 'Set up Express server with MongoDB', description: 'Initialize the backend with Express.js, connect to MongoDB Atlas, set up middleware chain.', project: novaPlatform._id, assignee: taylor._id, createdBy: alex._id, status: 'done', priority: 'urgent', dueDate: new Date('2026-08-15'), completedAt: new Date('2026-08-14') },
    { title: 'Design authentication flow', description: 'Create JWT-based auth with httpOnly cookies. Implement register, login, logout, and token refresh.', project: novaPlatform._id, assignee: taylor._id, createdBy: alex._id, status: 'done', priority: 'urgent', dueDate: new Date('2026-08-20'), completedAt: new Date('2026-08-19') },
    { title: 'Build dashboard UI', description: 'Create the main dashboard with summary cards, project progress, my tasks widget, and activity feed.', project: novaPlatform._id, assignee: sam._id, createdBy: jordan._id, status: 'done', priority: 'high', dueDate: new Date('2026-09-05'), completedAt: new Date('2026-09-04') },
    { title: 'Implement Kanban board', description: 'Build drag-and-drop Kanban board using @dnd-kit with optimistic updates and backend sync.', project: novaPlatform._id, assignee: sam._id, createdBy: alex._id, status: 'in_progress', priority: 'high', dueDate: new Date('2026-09-15') },
    { title: 'Create analytics charts', description: 'Integrate Recharts for task completion, priority distribution, and productivity trends.', project: novaPlatform._id, assignee: sam._id, createdBy: jordan._id, status: 'in_progress', priority: 'medium', dueDate: new Date('2026-09-20') },
    { title: 'Design system & component library', description: 'Build reusable UI components: Button, Input, Modal, Badge, Avatar, Card, Skeleton, etc.', project: novaPlatform._id, assignee: morgan._id, createdBy: alex._id, status: 'done', priority: 'high', dueDate: new Date('2026-08-25'), completedAt: new Date('2026-08-23') },
    { title: 'Notification system', description: 'Real-time notifications for task assignments, comments, and project updates.', project: novaPlatform._id, assignee: taylor._id, createdBy: alex._id, status: 'review', priority: 'medium', dueDate: new Date('2026-09-25') },
    { title: 'Mobile responsive design', description: 'Ensure all pages are responsive across desktop, tablet, and mobile breakpoints.', project: novaPlatform._id, assignee: morgan._id, createdBy: jordan._id, status: 'todo', priority: 'high', dueDate: new Date('2026-10-01') },
    { title: 'Write API documentation', description: 'Document all REST endpoints with request/response examples in README.', project: novaPlatform._id, assignee: taylor._id, createdBy: alex._id, status: 'todo', priority: 'low', dueDate: new Date('2026-10-15') },
    { title: 'Security audit & hardening', description: 'Implement helmet, rate limiting, input sanitization, and CORS configuration.', project: novaPlatform._id, assignee: taylor._id, createdBy: alex._id, status: 'todo', priority: 'urgent', dueDate: new Date('2026-10-20') },
    // Marketing website tasks
    { title: 'Redesign hero section', description: 'Create a compelling hero with animated gradient, clear value proposition, and CTA buttons.', project: marketingWebsite._id, assignee: morgan._id, createdBy: jordan._id, status: 'done', priority: 'high', dueDate: new Date('2026-09-10'), completedAt: new Date('2026-09-09') },
    { title: 'SEO optimization', description: 'Add meta tags, structured data, sitemap, and optimize page load performance.', project: marketingWebsite._id, assignee: sam._id, createdBy: jordan._id, status: 'in_progress', priority: 'medium', dueDate: new Date('2026-09-25') },
    { title: 'Blog section setup', description: 'Create blog listing and detail pages with MDX support.', project: marketingWebsite._id, assignee: sam._id, createdBy: jordan._id, status: 'todo', priority: 'low', dueDate: new Date('2026-09-28') },
    // Mobile app tasks
    { title: 'Project architecture planning', description: 'Define folder structure, navigation, state management approach for React Native app.', project: mobileApp._id, assignee: taylor._id, createdBy: alex._id, status: 'in_progress', priority: 'high', dueDate: new Date('2026-10-15') },
    { title: 'UI/UX wireframes', description: 'Create wireframes for all core screens: dashboard, projects, tasks, profile.', project: mobileApp._id, assignee: morgan._id, createdBy: alex._id, status: 'todo', priority: 'high', dueDate: new Date('2026-10-20') },
  ]);
  console.log('✅ Created 15 tasks');

  // Create comments
  await Comment.insertMany([
    { task: tasks[3]._id, user: jordan._id, content: 'Great progress on the Kanban! The drag-and-drop feels really smooth. One thing — can we add keyboard navigation support for accessibility?' },
    { task: tasks[3]._id, user: sam._id, content: 'Good catch, Jordan! I\'ll add aria-label attributes and keyboard event handlers. Should be done by EOD.' },
    { task: tasks[3]._id, user: alex._id, content: 'Also make sure the optimistic update rolls back cleanly on API failure. We don\'t want the UI to get out of sync.' },
    { task: tasks[4]._id, user: jordan._id, content: 'The line chart looks great! Could we also add a 30-day view toggle?' },
    { task: tasks[4]._id, user: sam._id, content: 'Absolutely, I\'ll add a date range selector to switch between 7-day and 30-day views.' },
    { task: tasks[6]._id, user: taylor._id, content: 'Notification system is working end-to-end. Tested task assignment, comment, and project invitation triggers. Ready for review!' },
    { task: tasks[6]._id, user: alex._id, content: 'Excellent work! Make sure the unread count updates in real-time when the notification dropdown is open.' },
    { task: tasks[0]._id, user: taylor._id, content: 'Server is up and running with MongoDB Atlas. All indexes created and health check endpoint working.' },
    { task: tasks[10]._id, user: morgan._id, content: 'Hero section is live on staging. Used the gradient animation technique we discussed — really pops!' },
  ]);
  console.log('💬 Created 9 comments');

  // Create activities
  const now = new Date();
  const hoursAgo = (h) => new Date(now - h * 3600000);

  await Activity.insertMany([
    { actor: alex._id, project: novaPlatform._id, action: 'project_created', metadata: { projectName: 'NOVA Platform Launch' }, createdAt: hoursAgo(72) },
    { actor: taylor._id, project: novaPlatform._id, task: tasks[0]._id, action: 'task_completed', metadata: { taskTitle: 'Set up Express server with MongoDB' }, createdAt: hoursAgo(60) },
    { actor: taylor._id, project: novaPlatform._id, task: tasks[1]._id, action: 'task_completed', metadata: { taskTitle: 'Design authentication flow' }, createdAt: hoursAgo(48) },
    { actor: sam._id, project: novaPlatform._id, task: tasks[2]._id, action: 'task_completed', metadata: { taskTitle: 'Build dashboard UI' }, createdAt: hoursAgo(24) },
    { actor: morgan._id, project: novaPlatform._id, task: tasks[5]._id, action: 'task_completed', metadata: { taskTitle: 'Design system & component library' }, createdAt: hoursAgo(36) },
    { actor: sam._id, project: novaPlatform._id, task: tasks[3]._id, action: 'task_status_changed', metadata: { taskTitle: 'Implement Kanban board', from: 'todo', to: 'in_progress' }, createdAt: hoursAgo(12) },
    { actor: taylor._id, project: novaPlatform._id, task: tasks[6]._id, action: 'task_status_changed', metadata: { taskTitle: 'Notification system', from: 'in_progress', to: 'review' }, createdAt: hoursAgo(6) },
    { actor: jordan._id, project: marketingWebsite._id, action: 'project_created', metadata: { projectName: 'Marketing Website Redesign' }, createdAt: hoursAgo(48) },
    { actor: morgan._id, project: marketingWebsite._id, task: tasks[10]._id, action: 'task_completed', metadata: { taskTitle: 'Redesign hero section' }, createdAt: hoursAgo(8) },
    { actor: jordan._id, project: novaPlatform._id, task: tasks[3]._id, action: 'comment_added', metadata: { taskTitle: 'Implement Kanban board' }, createdAt: hoursAgo(3) },
    { actor: alex._id, project: mobileApp._id, action: 'member_added', metadata: { projectName: 'Mobile App Beta' }, createdAt: hoursAgo(2) },
  ]);
  console.log('📋 Created 11 activities');

  // Create notifications
  await Notification.insertMany([
    { recipient: sam._id, actor: alex._id, type: 'task_assigned', message: 'Alex Rivera assigned you a task: "Implement Kanban board"', relatedProject: novaPlatform._id, relatedTask: tasks[3]._id, read: false, createdAt: hoursAgo(12) },
    { recipient: sam._id, actor: jordan._id, type: 'task_commented', message: 'Jordan Kim commented on task: "Implement Kanban board"', relatedProject: novaPlatform._id, relatedTask: tasks[3]._id, read: false, createdAt: hoursAgo(3) },
    { recipient: taylor._id, actor: alex._id, type: 'task_assigned', message: 'Alex Rivera assigned you a task: "Security audit & hardening"', relatedProject: novaPlatform._id, relatedTask: tasks[9]._id, read: false, createdAt: hoursAgo(5) },
    { recipient: morgan._id, actor: jordan._id, type: 'task_assigned', message: 'Jordan Kim assigned you a task: "Mobile responsive design"', relatedProject: novaPlatform._id, relatedTask: tasks[7]._id, read: false, createdAt: hoursAgo(10) },
    { recipient: taylor._id, actor: alex._id, type: 'project_invitation', message: 'Alex Rivera added you to project "Mobile App Beta"', relatedProject: mobileApp._id, read: true, createdAt: hoursAgo(2) },
    { recipient: jordan._id, actor: alex._id, type: 'project_invitation', message: 'Alex Rivera added you to project "NOVA Platform Launch"', relatedProject: novaPlatform._id, read: true, createdAt: hoursAgo(72) },
  ]);
  console.log('🔔 Created 6 notifications');

  console.log('\n✨ Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Demo Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:   admin@nova.dev   / password123');
  console.log('Manager: jordan@nova.dev  / password123');
  console.log('Member:  sam@nova.dev     / password123');
  console.log('Member:  taylor@nova.dev  / password123');
  console.log('Member:  morgan@nova.dev  / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
