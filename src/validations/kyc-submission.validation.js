const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createKycSubmission = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
  }),
};

const getKycSubmissions = {
  query: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    userId: Joi.string().custom(objectId),
    status: Joi.string().valid('pending', 'approved', 'rejected'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getKycSubmission = {
  params: Joi.object().keys({
    kycSubmissionId: Joi.string().custom(objectId),
  }),
};

const updateKycSubmission = {
  params: Joi.object().keys({
    kycSubmissionId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().required().valid('pending', 'approved', 'rejected'),
    rejectionReason: Joi.string().when('status', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};

module.exports = {
  createKycSubmission,
  getKycSubmissions,
  getKycSubmission,
  updateKycSubmission,
};
