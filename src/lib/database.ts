import { supabase, isSupabaseAvailable } from './supabase';

export interface Product {
  id: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  price: number;
  stock: number;
  category: string;
  category_ar?: string;
  images: string[];
  is_active: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id?: string;
  name: string;
  name_ar?: string;
  whatsapp_number: string;
  address: string;
  address_ar?: string;
  email: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  logo?: string;
  welcome_message: string;
  welcome_message_ar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Visit {
  id?: string;
  product_id?: string;
  page: string;
  source?: string;
  ip_address?: string;
  user_agent: string;
  referrer: string;
  location?: {
    country?: string;
    city?: string;
  };
  created_at: string;
}

export interface Order {
  id?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  source?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

// Products
export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getProduct = async (id: string): Promise<Product | null> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

export const addProduct = async (product: Omit<Product, 'id' | 'views' | 'created_at' | 'updated_at'>): Promise<string> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{
      ...product,
      views: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const incrementProductViews = async (id: string): Promise<void> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { error } = await supabase.rpc('increment_product_views', {
    product_id: id
  });

  if (error) throw error;
};

// Store Settings
export const getStoreSettings = async (): Promise<StoreSettings | null> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

export const updateStoreSettings = async (settings: StoreSettings): Promise<void> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { error } = await supabase
    .from('store_settings')
    .upsert([settings]);

  if (error) throw error;
};

// Analytics
export const trackVisit = async (visitData: Omit<Visit, 'id' | 'created_at'>): Promise<void> => {
  if (!isSupabaseAvailable()) {
    return; // Silently fail if Supabase not available
  }

  try {
    const { error } = await supabase
      .from('visits')
      .insert([visitData]);

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
};

// Orders
export const addOrder = async (order: Omit<Order, 'id' | 'created_at'>): Promise<string> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getOrders = async (startDate?: Date, endDate?: Date): Promise<Order[]> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available');
  }

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (startDate && endDate) {
    query = query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

// Real-time subscriptions
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  if (!isSupabaseAvailable()) {
    return () => {}; // Return empty unsubscribe function
  }

  const subscription = supabase
    .channel('products')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' },
      () => {
        // Refetch products when changes occur
        getProducts().then(callback).catch(console.error);
      }
    )
    .subscribe();

  // Initial fetch
  getProducts().then(callback).catch(console.error);

  return () => {
    subscription.unsubscribe();
  };
};