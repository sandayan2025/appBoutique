import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { storeSettings } = useStore();
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              {language === 'ar' ? storeSettings.name_ar : storeSettings.name}
            </h3>
            <p className="text-gray-300 mb-4">
              {language === 'ar' ? storeSettings.welcome_message_ar : storeSettings.welcome_message}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('contact')}</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{storeSettings.whatsapp_number}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{storeSettings.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{language === 'ar' ? storeSettings.address_ar : storeSettings.address}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              {storeSettings.social_links.facebook && (
                <a href={storeSettings.social_links.facebook} target="_blank" rel="noopener noreferrer"
                   className="text-gray-300 hover:text-blue-400 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {storeSettings.social_links.instagram && (
                <a href={storeSettings.social_links.instagram} target="_blank" rel="noopener noreferrer"
                   className="text-gray-300 hover:text-pink-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {storeSettings.social_links.twitter && (
                <a href={storeSettings.social_links.twitter} target="_blank" rel="noopener noreferrer"
                   className="text-gray-300 hover:text-blue-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {storeSettings.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;