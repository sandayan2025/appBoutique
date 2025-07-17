import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getProducts, 
  addProduct as addProductToDatabase, 
  updateProduct as updateProductInDatabase, 
  deleteProduct as deleteProductFromDatabase,
  getStoreSettings,
  updateStoreSettings as updateStoreSettingsInDatabase,
  subscribeToProducts,
  incrementProductViews,
  Product,
  StoreSettings
} from '../lib/database';
import { isSupabaseAvailable, hasValidConfig } from '../lib/supabase';

interface StoreContextType {
  products: Product[];
  storeSettings: StoreSettings;
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'views' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  incrementProductViews: (id: string) => Promise<void>;
  getLowStockProducts: () => Product[];
  getMostViewedProducts: () => Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

const defaultStoreSettings: StoreSettings = {
  name: "Ma Boutique",
  name_ar: "متجري",
  whatsapp_number: "+212600000000",
  address: "123 Rue Mohammed V, Casablanca",
  address_ar: "123 شارع محمد الخامس، الدار البيضاء",
  email: "contact@maboutique.com",
  social_links: {
    facebook: "https://facebook.com/maboutique",
    instagram: "https://instagram.com/maboutique"
  },
  welcome_message: "Bienvenue dans notre boutique ! Découvrez nos produits de qualité.",
  welcome_message_ar: "مرحباً بكم في متجرنا! اكتشفوا منتجاتنا عالية الجودة."
};

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'T-Shirt Premium',
    name_ar: 'تيشيرت فاخر',
    description: 'T-shirt 100% coton, disponible en plusieurs couleurs',
    description_ar: 'تيشيرت قطن 100%، متوفر بعدة ألوان',
    price: 150,
    stock: 25,
    category: 'Vêtements',
    category_ar: 'ملابس',
    images: ['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg'],
    is_active: true,
    views: 45,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Sac à Main Cuir',
    name_ar: 'حقيبة يد جلدية',
    description: 'Sac élégant en cuir véritable avec fermeture éclair',
    description_ar: 'حقيبة أنيقة من الجلد الطبيعي مع سحاب',
    price: 480,
    stock: 12,
    category: 'Accessoires',
    category_ar: 'إكسسوارات',
    images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'],
    is_active: true,
    views: 32,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Baskets Sport',
    name_ar: 'حذاء رياضي',
    description: 'Chaussures de sport confortables pour tous les jours',
    description_ar: 'أحذية رياضية مريحة للاستخدام اليومي',
    price: 320,
    stock: 8,
    category: 'Chaussures',
    category_ar: 'أحذية',
    images: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'],
    is_active: true,
    views: 67,
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
    
    // Subscribe to real-time product updates
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });

    return () => unsubscribe();
  }, []);

  const loadInitialData = async () => {
    // Check if Supabase is properly configured
    if (!hasValidConfig) {
      console.warn('🔥 Supabase not configured - using sample data');
      console.warn('To enable cloud features:');
      console.warn('1. Create a .env file with your Supabase configuration');
      console.warn('2. Restart the development server');
      setProducts(sampleProducts);
      setLoading(false);
      return;
    }

    if (!isSupabaseAvailable()) {
      console.warn('🔥 Supabase services not available - using sample data');
      setProducts(sampleProducts);
      setLoading(false);
      return;
    }

    try {
      const [productsData, settingsData] = await Promise.all([
        getProducts(),
        getStoreSettings()
      ]);
      
      setProducts(productsData);
      if (settingsData) {
        setStoreSettings({
          ...defaultStoreSettings,
          ...settingsData,
          social_links: {
            ...defaultStoreSettings.social_links,
            ...(settingsData.social_links || {})
          }
        });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      
      if (error.message?.includes('offline') || 
          error.code === 'unavailable' || 
          error.code === 'permission-denied' ||
          error.message?.includes('Failed to get document')) {
        console.log('Using sample data due to connectivity issues');
        setProducts(sampleProducts);
      } else {
        console.log('Using sample data due to Supabase configuration issues');
        setProducts(sampleProducts);
      }
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'views' | 'created_at' | 'updated_at'>) => {
    try {
      await addProductToDatabase(productData);
      // Products will be updated via the real-time subscription
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateProductInDatabase(id, updates);
      // Products will be updated via the real-time subscription
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteProductFromDatabase(id);
      // Products will be updated via the real-time subscription
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
    try {
      const updatedSettings = { ...storeSettings, ...settings };
      await updateStoreSettingsInDatabase(updatedSettings);
      setStoreSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating store settings:', error);
      throw error;
    }
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category && product.is_active);
  };

  const handleIncrementProductViews = async (id: string) => {
    try {
      await incrementProductViews(id);
    } catch (error) {
      console.error('Error incrementing product views:', error);
    }
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= 5);
  };

  const getMostViewedProducts = () => {
    return [...products].sort((a, b) => b.views - a.views).slice(0, 5);
  };

  return (
    <StoreContext.Provider value={{
      products,
      loading,
      storeSettings,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStoreSettings,
      getProductById,
      getProductsByCategory,
      incrementProductViews: handleIncrementProductViews,
      getLowStockProducts,
      getMostViewedProducts
    }}>
      {children}
    </StoreContext.Provider>
  );
};