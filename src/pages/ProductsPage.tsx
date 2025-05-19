import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { getAllProducts, getAllCategories } from '../services/productService';
import { Product, Category } from '../types';

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [sortBy, setSortBy] = useState('popularity');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  
  // Fetch products and categories from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching products data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter products when filters change
  useEffect(() => {
    if (!products.length) return;
    
    let filtered = [...products];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category_id
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }
    
    // Filter by price range
    filtered = filtered.filter(p => {
      const price = p.discount_price || p.price;
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    // Filter by rating
    if (minRating !== null) {
      filtered = filtered.filter(p => (p.rating || 0) >= minRating);
    }
    
    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case 'rating-high':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'rating-low':
        filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, priceRange, minRating, sortBy, products]);
  
  // Handle category change from URL params on component mount
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);
  
  // Sync searchQuery with search param from URL
  useEffect(() => {
    setSearchQuery(searchParam || '');
  }, [searchParam]);
  
  return (
    <div className="pt-16 bg-gray-50 dark:bg-dark-navy min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-neon-blue to-neon-violet py-12 px-4">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Explore Our Products
          </h1>
          <p className="text-white/80 max-w-2xl">
            Browse our extensive collection of electronics and IoT components. From Arduino to sensors, 
            we have everything you need for your next project.
          </p>
        </div>
      </div>
      
      <div className="container-custom py-8">
        {/* Search and Sort Controls */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-light-navy focus:outline-none focus:ring-2 focus:ring-neon-blue transition-shadow"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden btn-secondary flex items-center justify-center"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-soft-gray">
              <SlidersHorizontal className="w-5 h-5" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none font-medium text-neon-blue dark:text-neon-blue focus:outline-none cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating-high">Rating: High to Low</option>
                <option value="rating-low">Rating: Low to High</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Filters</h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categories</h4>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`text-sm ${!selectedCategory ? 'font-medium text-neon-blue' : 'text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue'}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`text-sm ${selectedCategory === category.id ? 'font-medium text-neon-blue' : 'text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue'}`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Price Range */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-soft-gray">
                    <span>₹{priceRange.min.toLocaleString()}</span>
                    <span>₹{priceRange.max.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Minimum Rating</h4>
                <div className="flex flex-wrap gap-2">
                  {[5, 4, 3, 2, 1].map(star => (
                    <button
                      key={star}
                      onClick={() => setMinRating(star === minRating ? null : star)}
                      className={`px-2 py-1 rounded border text-sm flex items-center space-x-1 ${minRating === star ? 'bg-neon-blue text-white border-neon-blue' : 'bg-white dark:bg-dark-navy border-gray-300 dark:border-gray-700 text-gray-700 dark:text-soft-gray hover:bg-neon-blue/10'}`}
                      aria-label={`Show ${star}+ stars`}
                    >
                      <span>{'★'.repeat(star)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Filters - Shown when toggle is clicked */}
          {showMobileFilters && (
            <div className="md:hidden bg-white dark:bg-light-navy rounded-lg shadow-sm p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-gray-500 dark:text-soft-gray" />
                </button>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categories</h4>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`text-sm ${!selectedCategory ? 'font-medium text-neon-blue' : 'text-gray-600 dark:text-soft-gray'}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`text-sm ${selectedCategory === category.id ? 'font-medium text-neon-blue' : 'text-gray-600 dark:text-soft-gray'}`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Price Range */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-soft-gray">
                    <span>₹{priceRange.min.toLocaleString()}</span>
                    <span>₹{priceRange.max.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Minimum Rating</h4>
                <div className="flex flex-wrap gap-2">
                  {[5, 4, 3, 2, 1].map(star => (
                    <button
                      key={star}
                      onClick={() => setMinRating(star === minRating ? null : star)}
                      className={`px-2 py-1 rounded border text-sm flex items-center space-x-1 ${minRating === star ? 'bg-neon-blue text-white border-neon-blue' : 'bg-white dark:bg-dark-navy border-gray-300 dark:border-gray-700 text-gray-700 dark:text-soft-gray hover:bg-neon-blue/10'}`}
                      aria-label={`Show ${star}+ stars`}
                    >
                      <span>{'★'.repeat(star)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Products Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <LoaderSpinner size="lg" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-light-navy rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No products found</h3>
                <p className="text-gray-600 dark:text-soft-gray mb-4">
                  {products.length === 0 
                    ? "There are currently no products in our catalog."
                    : "Try adjusting your filters or search query."}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                      setPriceRange({ min: 0, max: 50000 });
                    }}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-soft-gray">
                    Showing <span className="font-medium">{filteredProducts.length}</span> products
                    {selectedCategory && <span> in <span className="font-medium">{categories.find(c => c.id === selectedCategory)?.name || ''}</span></span>}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;