import { supabase } from '../config/services';
import { UUID } from '../types/common';

/**
 * Upload a file to Supabase Storage
 * @param bucketName The storage bucket name
 * @param filePath The path where the file will be stored
 * @param file The file to upload
 * @param contentType The MIME type of the file
 * @returns The public URL of the uploaded file or null if upload fails
 */
export const uploadFile = async (
  bucketName: string,
  filePath: string,
  file: File | Blob,
  contentType?: string
): Promise<string | null> => {
  try {
    // Ensure the bucket exists
    const { data: bucketExists } = await supabase.storage.getBucket(bucketName);
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Set to false for private files
        fileSizeLimit: 52428800, // 50MB in bytes
      });
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        return null;
      }
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType,
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

/**
 * Download a file from Supabase Storage
 * @param bucketName The storage bucket name
 * @param filePath The path of the file to download
 * @returns The downloaded file as a Blob or null if download fails
 */
export const downloadFile = async (
  bucketName: string,
  filePath: string
): Promise<Blob | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);
    
    if (error) {
      console.error('Error downloading file:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in downloadFile:', error);
    return null;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param bucketName The storage bucket name
 * @param filePath The path of the file to delete
 * @returns True if deletion was successful, false otherwise
 */
export const deleteFile = async (
  bucketName: string,
  filePath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};

/**
 * List files in a bucket with optional path prefix
 * @param bucketName The storage bucket name
 * @param folderPath Optional folder path to list files from
 * @returns Array of file objects or empty array if listing fails
 */
export const listFiles = async (
  bucketName: string,
  folderPath?: string
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath || '');
    
    if (error) {
      console.error('Error listing files:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in listFiles:', error);
    return [];
  }
};

/**
 * Generate a signed URL for temporary access to a file
 * @param bucketName The storage bucket name
 * @param filePath The path of the file
 * @param expiresIn Expiration time in seconds (default: 60 minutes)
 * @returns Signed URL string or null if generation fails
 */
export const getSignedUrl = async (
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    return null;
  }
};

/**
 * Helper to generate file paths for workers comp documents
 * @param userId The user ID
 * @param documentType The type of document
 * @param fileName The file name
 * @returns A storage path string
 */
export const getWorkersCompFilePath = (
  userId: UUID,
  documentType: string,
  fileName: string
): string => {
  return `users/${userId}/workers-comp/${documentType}/${Date.now()}_${fileName}`;
}; 