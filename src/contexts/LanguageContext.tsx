import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'fr' | 'ar';
  setLanguage: (lang: 'fr' | 'ar') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    products: 'Produits',
    cart: 'Panier',
    admin: 'Admin',
    dashboard: 'Tableau de bord',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    
    // Product
    addToCart: 'Ajouter au panier',
    viewDetails: 'Voir détails',
    price: 'Prix',
    stock: 'Stock',
    category: 'Catégorie',
    description: 'Description',
    images: 'Images',
    
    // Cart
    quantity: 'Quantité',
    total: 'Total',
    emptyCart: 'Votre panier est vide',
    sendOrder: 'Envoyer la commande',
    
    // Admin
    login: 'Connexion',
    email: 'Email',
    password: 'Mot de passe',
    addProduct: 'Ajouter un produit',
    editProduct: 'Modifier le produit',
    deleteProduct: 'Supprimer le produit',
    productName: 'Nom du produit',
    productDescription: 'Description du produit',
    productPrice: 'Prix du produit',
    productStock: 'Stock du produit',
    productCategory: 'Catégorie du produit',
    
    // Store Settings
    storeName: 'Nom de la boutique',
    whatsappNumber: 'Numéro WhatsApp',
    address: 'Adresse',
    welcomeMessage: 'Message de bienvenue',
    
    // Actions
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    
    // Messages
    productAdded: 'Produit ajouté avec succès',
    productUpdated: 'Produit mis à jour avec succès',
    productDeleted: 'Produit supprimé avec succès',
    settingsUpdated: 'Paramètres mis à jour avec succès',
    
    // Filters
    filterByCategory: 'Filtrer par catégorie',
    filterByPrice: 'Filtrer par prix',
    allCategories: 'Toutes les catégories',
    
    // Contact
    callUs: 'Appelez-nous',
    whatsapp: 'WhatsApp',
    location: 'Localisation'
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    products: 'المنتجات',
    cart: 'السلة',
    admin: 'المدير',
    dashboard: 'لوحة التحكم',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    
    // Product
    addToCart: 'إضافة للسلة',
    viewDetails: 'عرض التفاصيل',
    price: 'السعر',
    stock: 'المخزون',
    category: 'الفئة',
    description: 'الوصف',
    images: 'الصور',
    
    // Cart
    quantity: 'الكمية',
    total: 'المجموع',
    emptyCart: 'سلتك فارغة',
    sendOrder: 'إرسال الطلب',
    
    // Admin
    login: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    addProduct: 'إضافة منتج',
    editProduct: 'تعديل المنتج',
    deleteProduct: 'حذف المنتج',
    productName: 'اسم المنتج',
    productDescription: 'وصف المنتج',
    productPrice: 'سعر المنتج',
    productStock: 'مخزون المنتج',
    productCategory: 'فئة المنتج',
    
    // Store Settings
    storeName: 'اسم المتجر',
    whatsappNumber: 'رقم الواتساب',
    address: 'العنوان',
    welcomeMessage: 'رسالة الترحيب',
    
    // Actions
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    
    // Messages
    productAdded: 'تم إضافة المنتج بنجاح',
    productUpdated: 'تم تحديث المنتج بنجاح',
    productDeleted: 'تم حذف المنتج بنجاح',
    settingsUpdated: 'تم تحديث الإعدادات بنجاح',
    
    // Filters
    filterByCategory: 'تصفية حسب الفئة',
    filterByPrice: 'تصفية حسب السعر',
    allCategories: 'جميع الفئات',
    
    // Contact
    callUs: 'اتصل بنا',
    whatsapp: 'واتساب',
    location: 'الموقع'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'fr' | 'ar'>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('store_language') as 'fr' | 'ar';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'fr' | 'ar') => {
    setLanguage(lang);
    localStorage.setItem('store_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};