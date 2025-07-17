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
        console.error('🪣 SUPABASE STORAGE BUCKET NOT FOUND');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('To enable image uploads, create the storage bucket:');
        console.error('1. Go to Storage in your Supabase dashboard');
        console.error('2. Click "New bucket"');
        console.error('3. Name it exactly: product-images');
        console.error('4. Set it to "Public bucket"');
        console.error('5. Create the bucket');
        console.error('6. Set up storage policies (see README.md)');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
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
    console.error('Error uploading image:', error);
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