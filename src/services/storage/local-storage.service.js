// this.uploadDir is hardcoded on the server, it is always safe
/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const FileStorageAdapter = require('./abstract-file-storage.service');

class LocalStorageAdapter extends FileStorageAdapter {
  constructor(config) {
    super(config);
    this.uploadDir = config.uploadDir;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file) {
    const fileExtension = path.extname(file.originalname);
    const filename = `${crypto
      .randomBytes(16)
      .toString('hex')}${fileExtension}`;
    const fullPath = path.join(this.uploadDir, filename);

    // Write file to disk
    await fsPromises.writeFile(fullPath, file.buffer);

    // Get file stats
    const stats = await fsPromises.stat(fullPath);

    return {
      filename,
      path: fullPath,
      size: stats.size,
      mimetype: file.mimetype,
    };
  }

  async deleteFile(filename) {
    try {
      await fsPromises.unlink(path.join(this.uploadDir, filename));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileUrl(filename) {
    return path.join(this.uploadDir, filename);
  }

  async getFileStream(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.promises.access(filePath, fs.constants.F_OK);
      return fs.createReadStream(filePath);
    } catch (e) {
      throw new Error(`File ${filename} not found`);
    }
  }

  async getFileInfo(filename) {
    try {
      const filePath = await this.getFileUrl(filename);
      const stats = await fs.promises.stat(filePath);

      return {
        filename,
        path: filePath,
        size: stats.size,
        mimetype: LocalStorageAdapter.getMimeType(filename),
      };
    } catch (error) {
      throw new Error(`File ${filename} not found`);
    }
  }

  static getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

module.exports = LocalStorageAdapter;
