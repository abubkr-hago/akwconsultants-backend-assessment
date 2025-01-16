const LocalStorageAdapter = require('./local-storage.service');
module.exports.localStorageService = require('./local-storage.service');
module.exports.multerEngineStorageService = require('./multer-engine-storage-wrapper.service');
module.exports.s3StorageService = require('./s3-storage.service');

const uploadDir = 'tmp/uploads/';
const storageServiceSingleton = new LocalStorageAdapter({ uploadDir });
module.exports.storageServiceSingleton = storageServiceSingleton;
