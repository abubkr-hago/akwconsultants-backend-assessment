class MulterEngineStorageWrapper {
  constructor(storageAdapter) {
    this.storageAdapter = storageAdapter;
  }

  _handleFile(req, file, callback) {
    const chunks = [];

    file.stream.on('data', (chunk) => chunks.push(chunk));

    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);

        const result = await this.storageAdapter.uploadFile({
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          buffer,
        });

        callback(null, {
          destination: result.path,
          filename: result.filename,
          path: result.path,
          size: result.size,
        });
      } catch (error) {
        callback(error);
      }
    });

    file.stream.on('error', callback);
  }

  _removeFile(req, file, callback) {
    this.storageAdapter
      .deleteFile(file.filename)
      .then(() => callback(null))
      .catch(callback);
  }
}

module.exports = MulterEngineStorageWrapper;
