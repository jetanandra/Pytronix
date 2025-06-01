import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useProfile } from '../../context/ProfileContext';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { wishlist, addProductToWishlist, removeProductFromWishlist, loading } = useProfile();
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  // Check if product is in wishlist
  const isWishlisted = wishlist.some(item => item.product_id === product.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeProductFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addProductToWishlist(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  // Calculate discount percentage if discount_price exists
  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;
    
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card h-full group"
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        {/* Product Image */}
        <div className="relative overflow-hidden h-48 md:h-56 bg-gray-100 dark:bg-dark-navy">
          {product.discount_price && (
            <div className="absolute top-2 left-2 bg-neon-green text-white text-xs font-bold px-2 py-1 rounded z-10">
              {discountPercentage}% OFF
            </div>
          )}
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button 
              className={`p-2 bg-white/80 dark:bg-dark-navy/80 rounded-full hover:bg-white dark:hover:bg-dark-navy transition-all ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-soft-gray'} transition-colors`} />
            </button>
          </div>
          
          {/* Quick Add Overlay - Shows on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              className="btn-primary flex items-center justify-center space-x-2 px-4 py-2 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
        
        {/* Product Details */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-500 dark:text-soft-gray">
              {product.category}
            </p>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm ml-1 text-gray-600 dark:text-soft-gray">
                {product.rating} ({product.reviews})
              </span>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-800 dark:text-soft-white mb-1 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-soft-gray mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {product.discount_price ? (
                <>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{product.discount_price.toLocaleString()}
                  </span>
                  <span className="ml-2 text-sm line-through text-gray-500 dark:text-soft-gray">
                    ₹{product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>
            
            {product.stock > 0 ? (
              <div className="flex items-center text-neon-green text-xs font-medium">
                <Zap className="w-4 h-4 mr-1" />
                In Stock
              </div>
            ) : (
              <div className="text-red-500 text-xs font-medium">
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;