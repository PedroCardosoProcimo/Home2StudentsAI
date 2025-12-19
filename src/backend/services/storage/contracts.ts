import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from '@/backend/lib/firebase';
import { getContract, updateContract } from '@/backend/services/contracts';

// Validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_FILE_TYPE = 'application/pdf';

/**
 * Parameters for uploading a contract PDF
 */
export interface UploadContractPdfParams {
  file: File;
  contractId: string;
  onProgress?: (progress: number) => void; // Progress from 0-100
}

/**
 * Result of a successful upload
 */
export interface UploadResult {
  url: string; // Download URL
  path: string; // Storage path (for deletion)
}

/**
 * Upload a contract PDF to Firebase Storage with progress tracking
 * Automatically replaces existing contract PDF if present
 *
 * @param params Upload parameters
 * @returns Upload result with URL and path
 * @throws Error if validation fails, contract not found, or upload fails
 */
export const uploadContractPdf = async (
  params: UploadContractPdfParams
): Promise<UploadResult> => {
  const { file, contractId, onProgress } = params;

  // Validate file type
  if (file.type !== ALLOWED_FILE_TYPE) {
    throw new Error('Only PDF files are accepted');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File must be smaller than 10MB');
  }

  // Check if contract exists
  const contract = await getContract(contractId);
  if (!contract) {
    throw new Error('Contract not found');
  }

  // Delete existing PDF if present
  if (contract.contractFilePath) {
    try {
      await deleteContractPdf(contractId);
    } catch (error) {
      // Log error but continue with upload - the new file will replace the old one anyway
      console.warn('Failed to delete existing contract PDF:', error);
    }
  }

  // Construct storage path: contracts/{contractId}/signed-contract.pdf
  const storagePath = `contracts/${contractId}/signed-contract.pdf`;
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

          // Update contract record with file URL and path
          await updateContract(contractId, {
            contractFileUrl: downloadURL,
            contractFilePath: storagePath,
            updatedBy: 'system', // TODO: Replace with actual user ID from auth context
          });

          resolve({
            url: downloadURL,
            path: storagePath,
          });
        } catch (error) {
          reject(new Error('Failed to get download URL or update contract. Please try again.'));
        }
      }
    );
  });
};

/**
 * Delete a contract PDF from Firebase Storage
 * Also updates the contract record to remove file references
 *
 * @param contractId The contract ID
 * @throws Error if contract not found or deletion fails
 */
export const deleteContractPdf = async (contractId: string): Promise<void> => {
  // Get contract to find file path
  const contract = await getContract(contractId);
  if (!contract) {
    throw new Error('Contract not found');
  }

  if (!contract.contractFilePath) {
    // No file to delete
    return;
  }

  try {
    // Delete file from Storage
    const fileRef = ref(storage, contract.contractFilePath);
    await deleteObject(fileRef);
  } catch (error: unknown) {
    if (error instanceof Error) {
      // If file doesn't exist, consider it already deleted
      if (error.message.includes('storage/object-not-found')) {
        console.warn('Contract PDF file not found in storage, continuing with cleanup');
      } else {
        throw new Error('Failed to delete contract PDF from storage');
      }
    } else {
      throw new Error('Failed to delete contract PDF from storage');
    }
  }

  // Update contract record to remove file references
  await updateContract(contractId, {
    contractFileUrl: undefined,
    contractFilePath: undefined,
    updatedBy: 'system', // TODO: Replace with actual user ID from auth context
  });
};

/**
 * Get the download URL for a contract PDF
 * If the URL is expired, regenerates it from the storage path
 *
 * @param contractId The contract ID
 * @returns Download URL or null if no file exists
 * @throws Error if contract not found
 */
export const getContractPdfUrl = async (contractId: string): Promise<string | null> => {
  // Get contract record
  const contract = await getContract(contractId);
  if (!contract) {
    throw new Error('Contract not found');
  }

  // Return null if no file exists
  if (!contract.contractFilePath) {
    return null;
  }

  // If URL exists and is likely valid, return it
  // Firebase Storage URLs are valid for a long time, but we can regenerate if needed
  if (contract.contractFileUrl) {
    return contract.contractFileUrl;
  }

  // If URL is missing but path exists, regenerate URL from path
  try {
    const fileRef = ref(storage, contract.contractFilePath);
    const downloadURL = await getDownloadURL(fileRef);

    // Update contract with new URL
    await updateContract(contractId, {
      contractFileUrl: downloadURL,
      updatedBy: 'system', // TODO: Replace with actual user ID from auth context
    });

    return downloadURL;
  } catch (error) {
    // If file doesn't exist in storage, clean up the database reference
    if (error instanceof Error && error.message.includes('storage/object-not-found')) {
      await updateContract(contractId, {
        contractFileUrl: undefined,
        contractFilePath: undefined,
        updatedBy: 'system',
      });
      return null;
    }
    throw new Error('Failed to get contract PDF URL');
  }
};
