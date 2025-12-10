import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export const uploadResidenceImage = async (
  file: File,
  residenceId: string
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `residences/${residenceId}/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};

export const deleteResidenceImage = async (imageUrl: string) => {
  // Extract path from URL and delete
  const imageRef = ref(storage, imageUrl);
  await deleteObject(imageRef);
};
