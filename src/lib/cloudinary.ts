export const CLOUDINARY_CONFIG = {
  cloudName: 'noirmanhwa',
  uploadPreset: 'noirmanhwa-avatar'
};

/**
 * Transmits a file to Cloudinary and returns the secure URL.
 * Supports both File and Blob (compressed) inputs.
 */
export const uploadToCloudinary = async (file: File | Blob, folder: string = 'avatars'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }
  return data.secure_url;
};
