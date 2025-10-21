const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM gallery';
    let params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [images] = await db.query(query, params);
    
    // Add full URL to image paths
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imagesWithFullUrl = images.map(img => ({
      ...img,
      image_path: img.image_path.startsWith('http') ? img.image_path : `${baseUrl}${img.image_path}`
    }));
    
    return successResponse(res, { images: imagesWithFullUrl });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return errorResponse(res, 'Error fetching images', 500);
  }
});

// Upload image to gallery
router.post('/upload', adminProtect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    const { title, description, category = 'general' } = req.body;
    // The upload middleware saves to uploads/others/, so we need to include 'others' in path
    const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
    const fileSize = req.file.size;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const [result] = await db.query(
      'INSERT INTO gallery (title, description, image_path, category, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title || req.file.originalname, description || '', imagePath, category, fileSize, req.admin.id]
    );

    return successResponse(res, {
      id: result.insertId,
      image_path: `${baseUrl}${imagePath}`,
      title,
      category
    }, 'Image uploaded successfully', 201);
  } catch (error) {
    console.error('Error uploading image:', error);
    return errorResponse(res, 'Error uploading image', 500);
  }
});

// Upload multiple images
router.post('/upload-multiple', adminProtect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No image files uploaded', 400);
    }

    const { category = 'general' } = req.body;
    const uploadedImages = [];
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    for (const file of req.files) {
      const imagePath = `/${file.path.replace(/\\/g, '/')}`;
      const [result] = await db.query(
        'INSERT INTO gallery (title, image_path, category, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?)',
        [file.originalname, imagePath, category, file.size, req.admin.id]
      );

      uploadedImages.push({
        id: result.insertId,
        image_path: `${baseUrl}${imagePath}`,
        title: file.originalname
      });
    }

    return successResponse(res, { images: uploadedImages }, `${uploadedImages.length} images uploaded successfully`, 201);
  } catch (error) {
    console.error('Error uploading images:', error);
    return errorResponse(res, 'Error uploading images', 500);
  }
});

// Delete image from gallery
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    const [images] = await db.query('SELECT image_path FROM gallery WHERE id = ?', [req.params.id]);
    
    if (images.length === 0) {
      return errorResponse(res, 'Image not found', 404);
    }

    const imagePath = images[0].image_path;
    
    // Delete from database
    await db.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    
    // Delete physical file
    const filePath = path.join(__dirname, '../../uploads', path.basename(imagePath));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return successResponse(res, null, 'Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    return errorResponse(res, 'Error deleting image', 500);
  }
});

// Update image details
router.put('/:id', adminProtect, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    await db.query(
      'UPDATE gallery SET title = ?, description = ?, category = ? WHERE id = ?',
      [title, description, category, req.params.id]
    );

    return successResponse(res, null, 'Image updated successfully');
  } catch (error) {
    console.error('Error updating image:', error);
    return errorResponse(res, 'Error updating image', 500);
  }
});

module.exports = router;
