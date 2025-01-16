const httpStatus = require('http-status');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { fileService } = require('../services');
const { storageServiceSingleton } = require('../services/storage');

const pump = promisify(pipeline);

const createFiles = catchAsync(async (req, res) => {
  const { files, user } = req;
  const userId = user._id;
  if (!files || files.length === 0)
    throw new ApiError(httpStatus.BAD_REQUEST, 'No documents uploaded');
  const documents = files.map((file) => ({
    userId,
    filename: file.filename,
    url: file.path,
    size: file.size,
    mimetype: file.mimetype,
  }));
  const fileDocuments = await fileService.createFile(documents);
  if (fileDocuments.length > 1)
    res.status(httpStatus.CREATED).send(fileDocuments);
  else res.status(httpStatus.CREATED).send(fileDocuments[0]);
});

const getFiles = catchAsync(async (req, res) => {
  const { user } = req;
  const filter = pick(req.query, ['filename', 'userId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (user.role !== 'admin') filter.userId = req.user._id;
  const result = await fileService.queryFiles(filter, options);
  res.send(result);
});

const getFile = catchAsync(async (req, res) => {
  const file = await fileService.getFileById(req.params.fileId);
  try {
    await storageServiceSingleton.getFileInfo(file.filename);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  res.send(file);
});

const streamFile = catchAsync(async (req, res) => {
  const { user } = req;
  const userId = user._id;
  const filter = { _id: req.params.fileId };
  if (user.role !== 'admin') filter.userId = userId;
  const { results } = await fileService.queryFiles(filter, {});
  const file = results[0];
  if (!file) throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  let fileInfo;
  try {
    fileInfo = await storageServiceSingleton.getFileInfo(file.filename);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  try {
    const { filename } = file;
    const stream = await storageServiceSingleton.getFileStream(filename);

    const { range } = req.headers;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileInfo.size - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileInfo.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': fileInfo.mimetype,
      });

      await pump(stream, res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileInfo.size,
        'Content-Type': fileInfo.mimetype,
        'Accept-Ranges': 'bytes',
      });

      await pump(stream, res);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send('Error streaming file');
    }
  }
});

const updateFile = catchAsync(async (req, res) => {
  const kycSubmission = await fileService.updateFileById(
    req.params.filename,
    req.body,
  );
  res.send(kycSubmission);
});

const deleteFile = catchAsync(async (req, res) => {
  await fileService.deleteFileById(req.params.filename);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createFiles,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  streamFile,
};
