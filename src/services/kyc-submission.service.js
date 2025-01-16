const httpStatus = require('http-status');
const { KycSubmission } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a KycSubmission
 * @param {Object} kycSubmissionBody
 * @returns {Promise<KycSubmission>}
 */
const createKycSubmission = async (kycSubmissionBody) => {
  return KycSubmission.create(kycSubmissionBody);
};

/**
 * Query for KycSubmissions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryKycSubmissions = async (filter, options) => {
  return KycSubmission.paginate(filter, options);
};

/**
 * Get KycSubmission by id
 * @param {ObjectId} id
 * @returns {Promise<KycSubmission>}
 */
const getKycSubmissionById = async (id) => {
  return KycSubmission.findById(id);
};

/**
 * Update KycSubmission by id
 * @param {ObjectId} kycSubmissionId
 * @param {Object} updateBody
 * @returns {Promise<KycSubmission>}
 */
const updateKycSubmissionById = async (kycSubmissionId, updateBody) => {
  return KycSubmission.findOneAndUpdate({ _id: kycSubmissionId }, updateBody, {
    returnDocument: 'after',
  });
};

/**
 * Delete KycSubmission by id
 * @param {ObjectId} KycSubmissionId
 * @returns {Promise<KycSubmission>}
 */
const deleteKycSubmissionById = async (KycSubmissionId) => {
  const kycSubmission = await KycSubmission.findOneAndDelete({
    _id: KycSubmissionId,
  });
  if (!kycSubmission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'KycSubmission not found');
  }
  return kycSubmission;
};

module.exports = {
  createKycSubmission,
  queryKycSubmissions,
  getKycSubmissionById,
  updateKycSubmissionById,
  deleteKycSubmissionById,
};
