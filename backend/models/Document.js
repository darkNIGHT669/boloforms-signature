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
  
  signedFileHash: {
    type: String,
  },
  signedFileUrl: {
    type: String,
  },
  
 
  signatureData: {
    type: Object,
    default: {},
  },
  
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
  timestamps: true, 
});


documentSchema.index({ originalFileHash: 1 });
documentSchema.index({ signedFileHash: 1 });
documentSchema.index({ createdAt: -1 });


documentSchema.methods.verifyIntegrity = function() {
  return this.originalFileHash && this.signedFileHash;
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;