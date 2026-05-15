/**
 * @fileOverview Cloudinary Matrix Uplink
 * Handles direct unsigned uploads to the NoirManhwa media cloud.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'noirmanhwa',
  uploadPreset: 'noirmanhwa-avatar'
};

/**
 * Transmits a file to Cloudinary and returns the secure URL.
 */
export const uploadToCloudinary = async (file: File | Blob, folder: string = 'avatars'): Promise<string> => {
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
