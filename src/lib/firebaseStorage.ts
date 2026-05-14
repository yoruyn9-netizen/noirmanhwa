
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

const { storage } = initializeFirebase();

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
