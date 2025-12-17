import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '@/backend/lib/firebase';

// Validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_FILE_TYPE = 'application/pdf';

/**
 * Parameters for uploading a regulation PDF
 */
export interface UploadRegulationParams {
  file: File;
  residenceId: string;
  regulationId: string;
  onProgress?: (progress: number) => void; // Progress from 0-100
}

/**
 * Result of a successful upload
 */
export interface UploadResult {
  url: string; // Download URL
  path: string; // Storage path (for deletion)
  size: number; // File size in bytes
}

/**
 * Upload a regulation PDF to Firebase Storage with progress tracking
 * @param params Upload parameters
 * @returns Upload result with URL, path, and size
 * @throws Error if validation fails or upload fails
 */
export const uploadRegulationPDF = async (
  params: UploadRegulationParams
): Promise<UploadResult> => {
  const { file, residenceId, regulationId, onProgress } = params;

  // Validate file type
  if (file.type !== ALLOWED_FILE_TYPE) {
    throw new Error('Only PDF files are accepted');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File must be smaller than 10MB');
  }

  // Construct storage path: regulations/{residenceId}/{regulationId}.pdf
  const storagePath = `regulations/${residenceId}/${regulationId}.pdf`;
  const storageRef = ref(storage, storagePath);

  // Create upload task with resumable upload
  const uploadTask = uploadBytesResumable(storageRef, file);

  // Return a promise that resolves when upload completes
  return new Promise<UploadResult>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      // Progress callback
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      // Error callback
      (error) => {
        // Handle different error types
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error('You do not have permission to upload files'));
            break;
          case 'storage/canceled':
            reject(new Error('Upload was cancelled'));
            break;
          case 'storage/unknown':
            // Check if it's a network error
            if (error.message.includes('network')) {
              reject(new Error('Connection error. Check your internet and retry.'));
            } else {
              reject(new Error('Upload failed. Please try again.'));
            }
            break;
          default:
            reject(new Error('Upload failed. Please try again.'));
        }
      },
      // Success callback
      async () => {
        try {
          // Get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          resolve({
            url: downloadURL,
            path: storagePath,
            size: file.size,
          });
        } catch (error) {
          reject(new Error('Failed to get download URL. Please try again.'));
        }
      }
    );
  });
};

/**
 * Delete a regulation PDF from Firebase Storage
 * @param filePath The storage path of the file to delete
 * @throws Error if deletion fails
 */
export const deleteRegulationPDF = async (filePath: string): Promise<void> => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('storage/object-not-found')) {
        return;
      }
      throw error;
    }
    // If file doesn't exist, consider it a success
    throw new Error('Failed to delete file. Please try again.');
  }
};

/**
 * Sanitize a file name for logging purposes
 * Removes potentially problematic characters
 * @param fileName Original file name
 * @returns Sanitized file name
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
};
