import { supabase, isSupabaseAvailable } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export const uploadProductImage = async (file: File): Promise<string> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
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