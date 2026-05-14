
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';
import imageCompression from 'browser-image-compression';

const { storage } = initializeFirebase();

/**
 * High-performance image upload with compression and progress tracking.
 */
export async function uploadProfileImage(
  userId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  // 1. Compression (Max 1200px, 0.85 quality)
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  
  const compressedFile = await imageCompression(file, options);
  
  // 2. Storage Reference
  const storageRef = ref(storage, `profiles/${userId}/${Date.now()}.jpg`);
  const uploadTask = uploadBytesResumable(storageRef, compressedFile);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
