import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, AlertTriangle, Plus, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { Product, Category } from '../../types';
import { getAllProducts, deleteProduct, getAllCategories } from '../../services/productService';

interface SortConfig {
  key: keyof Product;
  direction: 'ascending' | 'descending';
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'descending'
  });
  
  // Load products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        setLoading(true);
        await deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const requestSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = [...products];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    return filtered;
  };
  
  const filteredProducts = getFilteredProducts();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Products
        </h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-80 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
          />
        </div>
        
        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading && products.length === 0 ? (
        <div className="flex justify-center py-8">
          <LoaderSpinner size="lg" color="blue" />
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {searchQuery || selectedCategory 
              ? 'No products found matching your criteria' 
              : 'No products in the database yet'}
          </h3>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            {searchQuery || selectedCategory 
              ? 'Try adjusting your search query or filters.'
              : 'Get started by adding your first product.'}
          </p>
          {searchQuery || selectedCategory ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/admin/products/new" className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-navy">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => requestSort('name')}
                    >
                      Product
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'ascending'
                          ? <ArrowUp className="w-4 h-4 ml-1" />
                          : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => requestSort('category')}
                    >
                      Category
                      {sortConfig.key === 'category' && (
                        sortConfig.direction === 'ascending'
                          ? <ArrowUp className="w-4 h-4 ml-1" />
                          : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => requestSort('price')}
                    >
                      Price
                      {sortConfig.key === 'price' && (
                        sortConfig.direction === 'ascending'
                          ? <ArrowUp className="w-4 h-4 ml-1" />
                          : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => requestSort('stock')}
                    >
                      Stock
                      {sortConfig.key === 'stock' && (
                        sortConfig.direction === 'ascending'
                          ? <ArrowUp className="w-4 h-4 ml-1" />
                          : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-light-navy divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product.image} 
                            alt={product.name} 
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/40x40?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <Link 
                            to={`/product/${product.id}`}
                            className="text-xs text-neon-blue hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View product
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const cat = categories.find(c => c.id === product.category_id);
                        return cat ? (
                          <span className="flex items-center gap-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-dark-navy text-gray-800 dark:text-soft-gray">
                            {cat.image && <img src={cat.image} alt={cat.name} className="w-5 h-5 rounded object-cover" />}
                            {cat.name}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-dark-navy text-gray-800 dark:text-soft-gray">-</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ₹{product.price.toLocaleString()}
                        {product.discount_price && (
                          <span className="ml-2 text-xs text-red-500 line-through">
                            ₹{product.discount_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.stock > 0 ? product.stock : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/products/edit/${product.id}`}
                        className="text-neon-blue hover:text-blue-800 dark:hover:text-blue-400 mr-4"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;