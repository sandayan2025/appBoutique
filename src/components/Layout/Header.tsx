import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Globe } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const { getTotalItems } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const totalItems = getTotalItems();

  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return null;
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Ma Boutique
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('home')}
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('products')}
            </Link>
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
              <User className="w-6 h-6" />
            </Link>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === 'fr' ? 'العربية' : 'Français'}
              </span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t('home')}
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t('products')}
              </Link>
              <Link to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span>{t('cart')}</span>
                {totalItems > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link to="/admin" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                <User className="w-5 h-5" />
                <span>{t('admin')}</span>
              </Link>
              <button
                onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-left"
              >
                <Globe className="w-5 h-5" />
                <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;