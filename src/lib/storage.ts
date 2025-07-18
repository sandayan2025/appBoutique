import { supabase, isSupabaseAvailable } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export const uploadProductImage = async (file: File): Promise<string> => {
  if (!isSupabaseAvailable()) {
    // Return a placeholder image URL for development
    console.warn('⚠️ Supabase not available - using placeholder image');
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center`;
  }

  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      // Handle bucket not found error
      if (uploadError.message.includes('Bucket not found')) {
        console.warn('🪣 SUPABASE STORAGE BUCKET NOT FOUND');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.warn('To enable image uploads, create the storage bucket:');
        console.warn('1. Go to Storage in your Supabase dashboard');
        console.warn('2. Click "New bucket"');
        console.warn('3. Name it exactly: product-images');
        console.warn('4. Set it to "Public bucket"');
        console.warn('5. Create the bucket');
        console.warn('6. Set up storage policies (see README.md)');
        console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Return a placeholder image URL
        return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center`;
      }
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    // Handle network-level Supabase request failures
    if (error instanceof Error && 
        (error.message.includes('Supabase request failed') || 
         error.message.includes('Bucket not found') ||
         error.message.includes('Failed to fetch'))) {
      console.warn('⚠️ Supabase storage request failed - using placeholder image');
      console.warn('Storage error:', error.message);
    } else {
      console.warn('Error uploading image:', error);
    }
    // Return placeholder image as fallback
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center`;
  }
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  if (!isSupabaseAvailable()) {
    return;
  }

  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Get 'products/filename.ext'

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadProductImage(file));
  return Promise.all(uploadPromises);
};