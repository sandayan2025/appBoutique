import React from 'react';
import { Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filtres</h3>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">{t('filterByCategory')}</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={selectedCategory === ''}
              onChange={() => onCategoryChange('')}
              className="mr-2 text-blue-600"
            />
            <span className="text-gray-700">{t('allCategories')}</span>
          </label>
          {categories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(category)}
                className="mr-2 text-blue-600"
              />
              <span className="text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">{t('filterByPrice')}</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Min:</span>
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="10"
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([parseInt(e.target.value), priceRange[1]])}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-800">{priceRange[0]} MAD</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Max:</span>
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="10"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-800">{priceRange[1]} MAD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;