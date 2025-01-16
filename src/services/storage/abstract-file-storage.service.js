/* eslint-disable class-methods-use-this */

/* eslint-disable no-unused-vars */
class FileStorageAdapter {
  constructor(config) {
    this.config = config;
  }

  async uploadFile(file) {
    throw new Error('Not implemented');
  }

  async deleteFile(filename) {
    throw new Error('Not implemented');
  }

  async getFileUrl(filename) {
    throw new Error('Not implemented');
  }

  async getFileStream(filename) {
    throw new Error('Method getFileStream() must be implemented');
  }

  async getFileInfo(filename) {
    throw new Error('Method getFileInfo() must be implemented');
  }
}

module.exports = FileStorageAdapter;
