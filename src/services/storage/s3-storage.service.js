const crypto = require('crypto');
const path = require('path');
const AWS = require('aws-sdk');
const FileStorageAdapter = require('./abstract-file-storage.service');

class S3StorageAdapter extends FileStorageAdapter {
  constructor(config) {
    super(config);

    this.s3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });

    this.bucket = config.bucket;
  }

  async uploadFile(file) {
    const fileExtension = path.extname(file.originalname);
    const filename = `${crypto
      .randomBytes(16)
      .toString('hex')}${fileExtension}`;

    const params = {
      Bucket: this.bucket,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(params).promise();

    return {
      filename,
      path: result.Location,
      size: file.buffer.length,
      mimetype: file.mimetype,
    };
  }

  async deleteFile(filename) {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: filename,
        })
        .promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileUrl(filename) {
    // handling signed and unsigned URLs depends on the use case
    // this is just hardcoded for now
    return `https://${this.bucket}.s3.amazonaws.com/${filename}`;
  }

  async getFileStream(filename) {
    const params = {
      Bucket: this.bucket,
      Key: filename,
    };

    return this.s3.getObject(params).createReadStream();
  }

  async getFileInfo(filename) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: filename,
      };

      const headObject = await this.s3.headObject(params).promise();

      return {
        filename,
        path: this.getFileUrl(filename),
        size: headObject.ContentLength,
        mimetype: headObject.ContentType,
      };
    } catch (e) {
      throw new Error(`File ${filename} not found`);
    }
  }
}

module.exports = S3StorageAdapter;
