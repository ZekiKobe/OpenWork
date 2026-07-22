import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadMultiple, uploadSingle } from '../middleware/upload';

const router = express.Router();

// Upload single image
router.post('/image', authenticate, uploadSingle, (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
      return;
    }

    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
});

// Upload multiple images
router.post('/images', authenticate, uploadMultiple, (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
      return;
    }

    // Return array of file URLs
    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    
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
