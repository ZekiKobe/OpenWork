import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadMultiple, uploadSingle, getUploadedFileUrl } from '../middleware/upload';

const router = express.Router();

router.post('/image', authenticate, uploadSingle, (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
      return;
    }

    const fileUrl = getUploadedFileUrl(req.file);

    res.status(200).json({
      success: true,
      url: fileUrl,
      filename: (req.file as any).key || req.file.filename
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
});

router.post('/images', authenticate, uploadMultiple, (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
      return;
    }

    const fileUrls = req.files.map((file) => getUploadedFileUrl(file));

    res.status(200).json({
      success: true,
      urls: fileUrls,
      count: req.files.length
    });
  } catch (error: any) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload images'
    });
  }
});

export default router;
