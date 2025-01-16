const express = require('express');
const multer = require('multer');
const MulterEngineStorageWrapper = require('../../services/storage/multer-engine-storage-wrapper.service');
const auth = require('../../middlewares/auth');
const adminsOnly = require('../../middlewares/adminsOnly');
const validate = require('../../middlewares/validate');
const { kycSubmissionController } = require('../../controllers');
const { kycSubmissionValidation } = require('../../validations');
const { storageServiceSingleton } = require('../../services/storage');

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
    return cb(new Error('Only image and pdf files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: new MulterEngineStorageWrapper(storageServiceSingleton),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

const router = express.Router();

router
  .route('/')
  .post(
    auth(),
    upload.array('files', 2), // front and back images for IDs
    validate(kycSubmissionValidation.createKycSubmission),
    kycSubmissionController.createKycSubmission,
  )
  .get(
    adminsOnly(),
    validate(kycSubmissionValidation.getKycSubmissions),
    kycSubmissionController.getKycSubmissions,
  );

router
  .route('/:kycSubmissionId')
  .get(
    adminsOnly(),
    validate(kycSubmissionValidation.getKycSubmission),
    kycSubmissionController.getKycSubmission,
  )
  .patch(
    adminsOnly(),
    validate(kycSubmissionValidation.updateKycSubmission),
    kycSubmissionController.updateKycSubmission,
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: KYC Submissions
 *   description: KYC verification submission management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     KycSubmission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           description: Full name of the applicant
 *         email:
 *           type: string
 *           format: email
 *           description: Email of the applicant
 *         userId:
 *           type: string
 *           description: ID of the user submitting KYC
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/File'
 *           minItems: 1
 *           description: Array of uploaded document files (ID front and back)
 *         reviewDate:
 *           type: string
 *           format: date-time
 *           description: Date when the submission was reviewed
 *         adminId:
 *           type: string
 *           description: ID of the admin who reviewed the submission
 *         rejectionReason:
 *           type: string
 *           description: Required reason if status is rejected
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     KycSubmissionResponse:
 *       type: object
 *       properties:
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/KycSubmission'
 *         page:
 *           type: number
 *         limit:
 *           type: number
 *         totalPages:
 *           type: number
 *         totalResults:
 *           type: number
 */

/**
 * @swagger
 * /kyc-submissions:
 *   post:
 *     summary: Create a new KYC submission
 *     description: Users can submit their KYC verification documents.
 *     tags: [KYC Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - files
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Maximum 2 files (front and back of ID)
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KycSubmission'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all KYC submissions
 *     description: Only admins can retrieve all submissions.
 *     tags: [KYC Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field (e.g. createdAt:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Maximum number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Current page
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KycSubmissionResponse'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /kyc-submissions/{kycSubmissionId}:
 *   get:
 *     summary: Get a KYC submission
 *     description: Only admins can retrieve individual submissions.
 *     tags: [KYC Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycSubmissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: KYC submission id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KycSubmission'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a KYC submission
 *     description: Only admins can update submissions (typically to approve or reject them).
 *     tags: [KYC Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycSubmissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: KYC submission id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejectionReason:
 *                 type: string
 *                 description: Required if status is rejected
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KycSubmission'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
