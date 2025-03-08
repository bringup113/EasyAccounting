const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_SOFT_DELETE',
      'USER_HARD_DELETE',
      'USER_RESTORE',
      'BOOK_TRANSFER',
      'BOOK_ARCHIVE',
      'BOOK_RESTORE',
      'BOOK_DELETE'
    ]
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['User', 'Book', 'Transaction', 'Category', 'Tag', 'Account']
  },
  details: {
    type: Object,
    default: {}
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemLog', SystemLogSchema); 