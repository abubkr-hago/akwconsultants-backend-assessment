const mongoose = require('mongoose');
const validator = require('validator');
const { FileSchema } = require('./file.model');
const { toJSON, paginate } = require('./plugins');

const kycSubmissionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    documents: {
      type: [FileSchema],
      required: true,
      validate: {
        validator(array) {
          return array && array.length > 0;
        },
        message: 'At least one document is required',
      },
    },
    reviewDate: {
      type: Date,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      validate: {
        validator(value) {
          // Require rejection reason if status is rejected
          if (this.status === 'rejected') {
            return !!value;
          }
          return true;
        },
        message: 'Rejection reason is required when status is rejected',
      },
    },
  },
  {
    timestamps: true,
  },
);

// ensure reviewDate is set when status changes from pending
kycSubmissionSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.reviewDate = new Date();
  }
  next();
});

// Index for faster queries
kycSubmissionSchema.index({ createdAt: -1, status: 1, userId: 1 });

kycSubmissionSchema.plugin(toJSON);
kycSubmissionSchema.plugin(paginate);

/**
 * @typedef KycSubmission
 */
const KycSubmission = mongoose.model('KycSubmission', kycSubmissionSchema);

module.exports = KycSubmission;
