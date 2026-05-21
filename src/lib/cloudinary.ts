/**
 * @fileOverview Cloudinary Matrix Uplink
 * Handles direct unsigned uploads to the NoirManhwa media cloud.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'dx0bsrs3z',
  uploadPreset: 'noirmanhwa-avatar'
};

/**
 * Transmits a file to Cloudinary and returns the secure URL.
 * Supports both avatar and banner uploads with automatic compression.
 */
export const uploadToCloudinary = async (file: File | Blob, folder: string = 'avatars'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', `noirmanhwa/${folder}`);
  
  // Auto-compression parameters
  formData.append('quality', 'auto');
  formData.append('fetch_format', 'auto');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error(data.error?.message || 'Media Uplink Failed');
    }

    return data.secure_url;
  } catch (err) {
    console.error('[Cloudinary Error]:', err);
    throw err;
  }
};

