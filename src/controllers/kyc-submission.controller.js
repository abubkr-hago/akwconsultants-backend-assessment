const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { kycSubmissionsService } = require('../services');
const { createFile } = require('../services/file.service');

const createKycSubmission = catchAsync(async (req, res) => {
  const { user } = req;
  const userId = user._id;
  if (!req.files || req.files.length === 0)
    throw new ApiError(httpStatus.BAD_REQUEST, 'No documents uploaded');
  const documents = await createFile(
    req.files.map((file) => ({
      userId,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    })),
  );
  const body = { ...req.body, documents };
  if (user.role !== 'admin') {
    body.userId = user._id;
  } else if (!body.userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'userId is required');
  }
  const kycSubmission = await kycSubmissionsService.createKycSubmission(body);
  res.status(httpStatus.CREATED).send(kycSubmission);
});

const getKycSubmissions = catchAsync(async (req, res) => {
  const { user } = req;
  const userId = user._id;
  const filter = pick(req.query, ['name', 'email', 'userId', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (user.role !== 'admin') filter.userId = userId;
  const result = await kycSubmissionsService.queryKycSubmissions(
    filter,
    options,
  );
  res.send(result);
});

const getKycSubmission = catchAsync(async (req, res) => {
  const { user } = req;
  const userId = user._id;
  const filter = { _id: req.params.kycSubmissionId };
  if (user.role !== 'admin') filter.userId = userId;
  const { results } = await kycSubmissionsService.queryKycSubmissions(
    filter,
    {},
  );
  const kycSubmission = results[0];
  if (!kycSubmission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kyc Submission not found');
  }
  res.send(kycSubmission);
});

const updateKycSubmission = catchAsync(async (req, res) => {
  const { user } = req;
  const userId = user._id;
  const { kycSubmissionId } = req.params;
  const body = { ...req.body };
  if (user.role === 'admin') body.adminId = userId;
  const kycSubmission = await kycSubmissionsService.updateKycSubmissionById(
    kycSubmissionId,
    body,
  );
  res.send(kycSubmission);
});

module.exports = {
  createKycSubmission,
  getKycSubmissions,
  getKycSubmission,
  updateKycSubmission,
};
