import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Navbar from '../../components/layout/Navbar';
import ProductCard from '../../components/product/ProductCard';
import SearchBar from '../../components/product/SearchBar';
import CategoryFilter from '../../components/product/CategoryFilter';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getDistance, getUserLocation } from '../../utils/distance';

const UserBrowse: React.FC = () => {
  const navigate = useNavigate();
  const { state, setUserLocation } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Essential Knits', 'Tailored Pieces', 'Outerwear', 'Accessories', 'Footwear', 'Jewelry', 'Home', 'Beauty'];

  useEffect(() => {
    setLoading(true);
    // Get user's location
    if (!state.userLocation) {
      getUserLocation().then(location => {
        if (location) {
          setUserLocation(location);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [state.userLocation, setUserLocation]);

  const approvedShops = state.shops.filter(shop => shop.approved);
  
  const filteredProducts = state.products
    .filter(product => {
      const shop = approvedShops.find(s => s.id === product.shopId);
      return shop; // Only show products from approved shops
    })
    .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

  const getShopWithDistance = (shopId: string) => {
    const shop = approvedShops.find(s => s.id === shopId);
    if (!shop || !state.userLocation) return { shop, distance: undefined };

    const distance = getDistance(
      state.userLocation.latitude,
      state.userLocation.longitude,
      shop.latitude,
      shop.longitude
    );

    return { shop, distance };
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <Navbar userRole="user" />
      
      <header className="bg-cream border-b border-warm-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-serif font-bold text-warm-900 text-center">Collections</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-3xl border border-warm-200 p-6 mb-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search collections..."
            className="mb-4"
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Location Status */}
        {state.userLocation && (
          <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 mb-6 flex items-center">
            <MapPin className="w-5 h-5 text-sage-600 mr-2" />
            <span className="text-sage-800 text-sm font-medium">
              Showing nearby boutiques and artisans
            </span>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner size="lg" className="py-12" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const { shop, distance } = getShopWithDistance(product.shopId);
              
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  shop={shop}
                  distance={distance}
                  onClick={() => handleProductClick(product.id)}
                />
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <EmptyState
            icon={Package}
            title="No collections found"
            description={
              searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filters'
                : 'No collections available at the moment'
            }
          />
        )}
      </div>
    </div>
  );
};

export default UserBrowse;