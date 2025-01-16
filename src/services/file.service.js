const httpStatus = require('http-status');
const { File } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a File
 * @param {Object} fileBody
 * @returns {Promise<File>}
 */
const createFile = async (fileBody) => {
  return File.create(fileBody);
};

/**
 * Query for Files
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryFiles = async (filter, options) => {
  return File.paginate(filter, options);
};

/**
 * Get File by id
 * @param {ObjectId} id
 * @returns {Promise<File>}
 */
const getFileById = async (id) => {
  return File.findById(id);
};

/**
 * Update File by id
 * @param {ObjectId} fileId
 * @param {Object} updateBody
 * @returns {Promise<File>}
 */
const updateFileById = async (fileId, updateBody) => {
  return File.findByIdAndUpdate(fileId, updateBody);
};

/**
 * Delete File by id
 * @param {ObjectId} KycSubmissionId
 * @returns {Promise<File>}
 */
const deleteFileById = async (KycSubmissionId) => {
  const file = await File.findByIdAndDelete(KycSubmissionId);
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  return file;
};

module.exports = {
  createFile,
  queryFiles,
  getFileById,
  updateFileById,
  deleteFileById,
};
