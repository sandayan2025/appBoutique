import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from '../components/ProductCard';

const HomePage: React.FC = () => {
  const { storeSettings, products } = useStore();
  const { t, language } = useLanguage();

  const featuredProducts = products.filter(p => p.isActive).slice(0, 6);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Bonjour, je visite votre boutique en ligne et j'aimerais avoir plus d'informations.`);
    window.open(`https://wa.me/${storeSettings.whatsapp_number.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleCallClick = () => {
    window.open(`tel:${storeSettings.whatsapp_number}`, '_self');
  };

  const handleLocationClick = () => {
    const address = language === 'ar' ? storeSettings.address_ar : storeSettings.address;
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {language === 'ar' ? storeSettings.name_ar : storeSettings.name}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            {language === 'ar' ? storeSettings.welcome_message_ar : storeSettings.welcome_message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('whatsapp')}</span>
            </button>
            
            <button
              onClick={handleCallClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>{t('callUs')}</span>
            </button>
            
            <button
              onClick={handleLocationClick}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span>{t('location')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Produits Populaires</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection de produits les plus appréciés par nos clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Voir tous les produits</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Produits de Qualité</h3>
              <p className="text-gray-600">
                Nous sélectionnons soigneusement tous nos produits pour vous offrir la meilleure qualité
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Commande Facile</h3>
              <p className="text-gray-600">
                Commandez directement via WhatsApp en quelques clics seulement
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Service Client</h3>
              <p className="text-gray-600">
                Notre équipe est à votre disposition pour répondre à toutes vos questions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;