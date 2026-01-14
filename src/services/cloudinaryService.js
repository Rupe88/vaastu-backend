import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';

// Configure Cloudinary - ensure proper initialization
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  // Clean up API secret - remove any trailing % and ensure no extra whitespace
  // Sometimes API secret can have URL encoding characters or trailing %
  let cleanApiSecret = (config.cloudinary.apiSecret || '').trim();
  
  // Remove trailing % if present (common with URL encoding issues)
  if (cleanApiSecret.endsWith('%')) {
    cleanApiSecret = cleanApiSecret.slice(0, -1);
    console.warn('⚠️  Removed trailing % from API secret (this may indicate an encoding issue)');
    console.warn('⚠️  Please verify your API secret in Cloudinary dashboard and update .env if needed');
  }
  
  if (!cleanApiSecret) {
    console.error('✗ Cloudinary API secret is empty after cleaning');
    console.warn('⚠️  File uploads will fail. Check CLOUDINARY_API_SECRET in .env');
  } else {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName.trim(),
      api_key: config.cloudinary.apiKey.trim(),
      api_secret: cleanApiSecret,
      secure: true, // Use HTTPS
    });
    
    console.log('✓ Cloudinary configured successfully');
    console.log(`  Cloud Name: ${config.cloudinary.cloudName}`);
    console.log(`  API Key: ${config.cloudinary.apiKey.substring(0, 6)}...`);
    console.log(`  API Secret length: ${cleanApiSecret.length} characters`);
  }
} else {
  console.warn('⚠️  Cloudinary credentials not configured. File uploads will fail.');
  console.warn('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
  console.warn('   Missing:', {
    cloudName: !config.cloudinary.cloudName,
    apiKey: !config.cloudinary.apiKey,
    apiSecret: !config.cloudinary.apiSecret,
  });
}

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (file, options = {}) => {
  try {
    // Check if Cloudinary is configured
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    }

    const {
      folder = 'lms',
      transformation = {},
      publicId = null,
      resourceType = 'image',
    } = options;

    const uploadOptions = {
      folder: folder || 'lms/images',
      resource_type: resourceType || 'image',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...transformation,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (Buffer.isBuffer(file)) {
      // Upload from buffer using upload_stream
      return new Promise((resolve, reject) => {
        // Use upload_stream with proper error handling
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', {
                message: error.message,
                http_code: error.http_code,
                name: error.name,
              });
              
              // Provide more helpful error messages
              if (error.message?.includes('Invalid Signature') || error.message?.includes('signature')) {
                reject(new Error('Cloudinary authentication failed. Please verify your API secret (CLOUDINARY_API_SECRET) in .env file. The secret should not have any trailing characters like %.'));
              } else if (error.message?.includes('Invalid API Key') || error.message?.includes('401')) {
                reject(new Error('Cloudinary API key is invalid. Please check CLOUDINARY_API_KEY in .env file.'));
              } else if (error.http_code === 401) {
                reject(new Error('Cloudinary authentication failed. Please check all your credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) in .env file.'));
              } else {
                reject(error);
              }
            } else {
              resolve(result);
            }
          }
        );
        
        // Handle stream errors
        uploadStream.on('error', (error) => {
          console.error('Cloudinary stream error:', error);
          reject(error);
        });
        
        // Write the buffer directly to the stream
        uploadStream.end(file);
      });
    } else {
      // Upload from file path
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    }
  } catch (error) {
    console.error('Image upload error details:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('Invalid Signature')) {
      throw new Error('Cloudinary authentication failed. Please verify your API secret in .env file.');
    } else if (error.message?.includes('Invalid API Key')) {
      throw new Error('Cloudinary API key is invalid. Please check your credentials.');
    } else {
      throw new Error(`Image upload failed: ${error.message || error.toString()}`);
    }
  }
};

/**
 * Upload video to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadVideo = async (file, options = {}) => {
  try {
    // Check if Cloudinary is configured
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    }

    const {
      folder = 'lms/videos',
      transformation = {},
      publicId = null,
    } = options;

    const uploadOptions = {
      folder: folder || 'lms/videos',
      resource_type: 'video',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...transformation,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (Buffer.isBuffer(file)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary video upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        uploadStream.on('error', (error) => {
          console.error('Cloudinary video stream error:', error);
          reject(error);
        });
        
        uploadStream.end(file);
      });
    } else {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    }
  } catch (error) {
    console.error('Video upload error details:', error);
    throw new Error(`Video upload failed: ${error.message || error.toString()}`);
  }
};

/**
 * Upload document/PDF to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadDocument = async (file, options = {}) => {
  try {
    // Check if Cloudinary is configured
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
    }

    const {
      folder = 'lms/documents',
      publicId = null,
    } = options;

    const uploadOptions = {
      folder: folder || 'lms/documents',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (Buffer.isBuffer(file)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary document upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        uploadStream.on('error', (error) => {
          console.error('Cloudinary document stream error:', error);
          reject(error);
        });
        
        uploadStream.end(file);
      });
    } else {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    }
  } catch (error) {
    console.error('Document upload error details:', error);
    throw new Error(`Document upload failed: ${error.message || error.toString()}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Delete result
 */
export const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

/**
 * Generate image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Transformed image URL
 */
export const getImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    ...transformations,
  });
};

/**
 * Generate video URL with transformations
 * @param {string} publicId - Public ID of the video
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Transformed video URL
 */
export const getVideoUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    ...transformations,
  });
};

export default {
  uploadImage,
  uploadVideo,
  uploadDocument,
  deleteFile,
  getImageUrl,
  getVideoUrl,
};


