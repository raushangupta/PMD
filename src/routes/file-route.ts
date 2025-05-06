import { Router, Request, Response } from 'express';
import multer from 'multer';
import { s3, BUCKET } from '../aws'

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
/**
 * @swagger
 * /api/file/upload:
 *   post:
 *     summary: Upload a file to S3
 *     tags:
 *       - File
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 key:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');

  const params = {
    Bucket: BUCKET,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };


  try {
    await s3.upload(params).promise();
    res.status(201).json({ message: 'File uploaded', key: file.originalname });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

/**
 * @swagger
 * /api/file/{key}:
 *   get:
 *     summary: Download a file from S3 by key
 *     tags:
 *       - File
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The key (file name) of the file in S3
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File retrieved successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: File not found
 */
router.get('/:key', async (req: Request, res: Response) => {
  const key = req.params.key;

  const params = {
    Bucket: BUCKET,
    Key: key,
  };

  try {
    const file = await s3.getObject(params).promise();
    res.setHeader('Content-Type', file.ContentType!);
    res.send(file.Body);
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

/**
 * @swagger
 * /file/{key}:
 *   delete:
 *     summary: Delete a file from S3 by key
 *     tags:
 *       - File
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The key (file name) of the file to delete from S3
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File deleted
 *                 key:
 *                   type: string
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: File not found
 *       500:
 *         description: Server error
 */
router.delete('/:key', async (req: Request, res: Response) => {
  const key = req.params.key;

  const params = {
    Bucket: BUCKET,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;