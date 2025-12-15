const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  // Original PDF info
  originalFileName: {
    type: String,
    required: true,
  },
  originalFileHash: {
    type: String,
    required: true,
  },
  
  // Signed PDF info
  signedFileHash: {
    type: String,
  },
  signedFileUrl: {
    type: String,
  },
  
  // Signature metadata
  signatureData: {
    type: Object,
    default: {},
  },
  
  // Field positions (for audit trail)
  fields: [{
    type: {
      type: String,
      enum: ['text', 'signature', 'image', 'date', 'radio'],
    },
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
    pageNumber: Number,
  }],
  
  // Audit trail
  status: {
    type: String,
    enum: ['created', 'signed', 'verified'],
    default: 'created',
  },
  signedAt: {
    type: Date,
  },
  
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Indexes for faster queries
documentSchema.index({ originalFileHash: 1 });
documentSchema.index({ signedFileHash: 1 });
documentSchema.index({ createdAt: -1 });

// Method to verify document integrity
documentSchema.methods.verifyIntegrity = function() {
  return this.originalFileHash && this.signedFileHash;
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;