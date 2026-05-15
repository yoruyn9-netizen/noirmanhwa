
/**
 * @fileOverview Cloudinary Matrix Uplink
 * Handles direct unsigned uploads to the NoirManhwa media cloud.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'noirmanhwa',
  apiKey: '634787613265798',
  uploadPreset: 'noirmanhwa-avatar'
};

/**
 * Transmits a file to Cloudinary and returns the secure URL.
 */
export const uploadToCloudinary = async (file: File | Blob, folder: 'avatars' | 'borders' = 'avatars'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', `noirmanhwa/${folder}`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Media Uplink Failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (err) {
    console.error('[Cloudinary Error]:', err);
    throw err;
  }
};
