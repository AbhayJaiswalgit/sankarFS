const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'project_created',
        'project_updated',
        'project_deleted',
        'project_completed',
        'task_created',
        'task_updated',
        'task_status_changed',
        'task_assigned',
        'task_completed',
        'task_deleted',
        'member_added',
        'member_removed',
        'comment_added',
        'comment_deleted',
      ],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ task: 1 });

module.exports = mongoose.model('Activity', activitySchema);
