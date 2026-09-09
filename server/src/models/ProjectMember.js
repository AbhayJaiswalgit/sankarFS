const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'manager', 'member'],
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one record per user per project
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });
projectMemberSchema.index({ project: 1 });
projectMemberSchema.index({ user: 1 });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
