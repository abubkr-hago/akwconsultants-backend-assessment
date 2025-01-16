const express = require('express');
const auth = require('../../middlewares/auth');
const { streamFile } = require('../../controllers/file.controller');

const router = express.Router();

router.use('/:fileId', auth(), streamFile);

module.exports = router;

/**
 * @swagger
 * /files/{fileId}:
 *   get:
 *     summary: Stream a file
 *     description: Streams the contents of a file identified by the provided file ID. Supports partial downloads via range requests.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the file to stream
 *       - in: header
 *         name: range
 *         required: false
 *         schema:
 *           type: string
 *         description: Byte range for partial downloads (RFC 7233)
 *         example: bytes=0-1048575
 *     responses:
 *       "200":
 *         description: File stream successful
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *             description: MIME type of the file
 *           Content-Length:
 *             schema:
 *               type: integer
 *             description: Size of the file in bytes
 *           Content-Disposition:
 *             schema:
 *               type: string
 *             description: Suggested filename for download
 *       "206":
 *         description: Partial content (for range requests)
 *         headers:
 *           Content-Range:
 *             schema:
 *               type: string
 *             example: bytes 0-1048575/5242880
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "416":
 *         description: Requested range not satisfiable
 */
