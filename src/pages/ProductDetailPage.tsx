import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Info, ChevronRight, Truck, Shield } from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { Product, ProductReview } from '../types';
import { getProductById, getCategoryById } from '../services/productService';
import { getProductReviews, getUserReviewForProduct } from '../services/reviewService';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import ReviewList from '../components/product/ReviewList';
import ReviewForm from '../components/product/ReviewForm';
import RatingSummary from '../components/product/RatingSummary';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addProductToWishlist, removeProductFromWishlist, wishlist } = useProfile();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'warranty' | 'reviews'>('details');
  
  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  
  // Wishlist state
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Product ID not provided');
          return;
        }
        
        const productData = await getProductById(id);
        
        if (productData) {
          setProduct(productData);
          setActiveImage(productData.image); // Set the main image as active initially
          // Fetch category name if category_id exists
          if (productData.category_id) {
            const cat = await getCategoryById(productData.category_id);
            setCategory(cat?.name || '');
          } else {
            setCategory('');
          }
        } else {
          setError(`Product not found. The ID "${id}" might not be a valid UUID.`);
        }
      } catch (err) {
        console.error('Error in ProductDetailPage:', err);
        setError('Failed to load product details. Please ensure the product ID is a valid UUID.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  // Load reviews and user's review when product changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (product?.id) {
        try {
          setReviewsLoading(true);
          const reviewData = await getProductReviews(product.id);
          setReviews(reviewData);
          
          if (user) {
            const userReviewData = await getUserReviewForProduct(product.id);
            setUserReview(userReviewData);
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
        } finally {
          setReviewsLoading(false);
        }
      }
    };

    fetchReviews();
  }, [product?.id, user]);
  
  // Set the active tab when url hash changes
  useEffect(() => {
    const hash = location.hash;
    if (hash === '#warranty') {
      setActiveTab('warranty');
    } else if (hash === '#reviews') {
      setActiveTab('reviews');
    } else {
      setActiveTab('details');
    }
  }, [location.hash]);

  // Check if product is in wishlist
  const isWishlisted = product ? wishlist.some(item => item.product_id === product.id) : false;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please sign in to use your wishlist');
      return;
    }
    if (!product) return;
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

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Calculate rating counts for the rating summary
  const calculateRatingCounts = () => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      counts[review.rating] = (counts[review.rating] || 0) + 1;
    });
    
    return counts;
  };
  
  // Filter reviews by rating
  const filteredReviews = selectedRating
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews;
  
  const handleSubmitReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    // Refresh reviews
    if (product?.id) {
      setReviewsLoading(true);
      Promise.all([
        getProductReviews(product.id),
        user ? getUserReviewForProduct(product.id) : null
      ]).then(([reviewsData, userReviewData]) => {
        setReviews(reviewsData);
        setUserReview(userReviewData);
        setReviewsLoading(false);
        // Also update the product rating in the UI to reflect the new review
        if (product) {
          setProduct({
            ...product,
            rating: reviewsData.length > 0 
              ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
              : product.rating,
            reviews: reviewsData.length
          });
        }
      }).catch(error => {
        console.error('Error refreshing reviews:', error);
        setReviewsLoading(false);
      });
    }
  };
  
  const handleEditReview = (review: ProductReview) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{error || "Product not found"}</h1>
        <p className="text-gray-600 dark:text-soft-gray mb-6">
          The product you are looking for does not exist or could not be loaded. 
          Please ensure you're using a valid product ID.
        </p>
        <Link to="/products" className="btn-primary flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </div>
    );
  }

  // Calculate discount percentage if discount_price exists
  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-soft-gray mb-6">
          <Link to="/" className="hover:text-neon-blue dark:hover:text-neon-blue transition">Home</Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <Link to="/products" className="hover:text-neon-blue dark:hover:text-neon-blue transition">Products</Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <Link 
            to={`/products?category=${product.category_id ? encodeURIComponent(product.category_id) : ''}`}
            className="hover:text-neon-blue dark:hover:text-neon-blue transition"
          >
            {category}
          </Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <span className="truncate max-w-[200px]">{product.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Product Images Section */}
          <div>
            {/* Main Image */}
            <div className="bg-white dark:bg-light-navy rounded-lg overflow-hidden h-80 md:h-96 mb-4">
              <img 
                src={activeImage || product.image} 
                alt={product.name} 
                className="w-full h-full object-contain" 
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 0 && (
              <div className="flex flex-row gap-4 overflow-x-auto pb-2">
                {[product.image, ...product.images].filter(Boolean).map((img, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 bg-white dark:bg-light-navy rounded-lg overflow-hidden cursor-pointer border-2 flex-shrink-0 ${
                      activeImage === img
                        ? 'border-neon-blue'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info Section */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h1>
            
            {/* Ratings & Category */}
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div className="flex items-center mb-2 md:mb-0">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 text-gray-700 dark:text-soft-gray">{product.rating.toFixed(1)}</span>
                </div>
                <span className="mx-2 text-gray-400">|</span>
                <Link to={`#reviews`} onClick={() => setActiveTab('reviews')} className="text-neon-blue hover:underline">
                  {product.reviews} {product.reviews === 1 ? 'review' : 'reviews'}
                </Link>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-soft-gray">
                Category:
                {product.category_id && category ? (
                  <Link
                    to={`/products?category=${product.category_id}`}
                    className="ml-1 text-neon-blue hover:underline"
                  >
                    {category}
                  </Link>
                ) : (
                  <span className="ml-1 text-gray-400">N/A</span>
                )}
              </div>
            </div>
            
            {/* Price Section */}
            <div className="mb-6">
              {discountPercentage > 0 ? (
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{product.discount_price?.toLocaleString()}
                  </span>
                  <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="ml-2 bg-neon-green text-white text-xs font-bold px-2 py-1 rounded">
                    {discountPercentage}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
              
              <p className="text-sm text-gray-600 dark:text-soft-gray mt-1">
                Includes all taxes
              </p>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h2>
              <p className="text-gray-700 dark:text-soft-gray">
                {product.description}
              </p>
            </div>
            
            {/* Availability */}
            <div className="mb-6">
              <div className="flex items-center text-gray-700 dark:text-soft-gray">
                <Info className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="font-medium mr-2">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-green-600 dark:text-green-400">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Out of Stock</span>
                )}
              </div>
            </div>
            
            {/* Shipping Note */}
            {product.stock > 0 && (
              <div className="mb-6 p-3 bg-gray-50 dark:bg-dark-navy rounded-lg flex items-start">
                <Truck className="w-5 h-5 text-neon-blue mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 dark:text-soft-gray text-sm">
                    <span className="font-medium">Fast Delivery:</span> Ships within 24-48 hours
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Free shipping on orders above ₹1000
                  </p>
                </div>
              </div>
            )}
            
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-l-lg border border-gray-300 dark:border-gray-700 ${
                      quantity <= 1
                        ? 'bg-gray-100 dark:bg-dark-navy text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-gray-50 dark:bg-dark-navy text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= product.stock) {
                        setQuantity(value);
                      }
                    }}
                    min="1"
                    max={product.stock}
                    className="w-14 h-10 text-center border-t border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-light-navy text-gray-700 dark:text-soft-gray"
                  />
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className={`w-10 h-10 flex items-center justify-center rounded-r-lg border border-gray-300 dark:border-gray-700 ${
                      quantity >= product.stock
                        ? 'bg-gray-100 dark:bg-dark-navy text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-gray-50 dark:bg-dark-navy text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 btn-primary flex items-center justify-center ${
                  product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`flex-1 sm:flex-none px-6 py-2 border-2 rounded-lg flex items-center justify-center transition-colors ${isWishlisted ? 'bg-red-50 border-red-500 text-red-600' : 'border-neon-blue text-neon-blue hover:bg-neon-blue/10'} ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={wishlistLoading}
              >
                <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>
            
            {/* Warranty Note */}
            <div className="flex items-start text-gray-700 dark:text-soft-gray mb-4">
              <Shield className="w-5 h-5 mr-2 text-neon-blue flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                This product comes with a standard warranty. See warranty tab for more details.
              </p>
            </div>
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-soft-gray mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Link 
                      key={index}
                      to={`/products?search=${encodeURIComponent(tag)}`}
                      className="inline-block px-3 py-1 text-xs bg-gray-100 dark:bg-dark-navy text-gray-800 dark:text-soft-gray rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Product details tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <a 
                href="#details" 
                onClick={() => setActiveTab('details')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-neon-blue text-neon-blue'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-soft-gray dark:hover:border-gray-600'
                }`}
              >
                Details & Specifications
              </a>
              <a 
                href="#warranty" 
                onClick={() => setActiveTab('warranty')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'warranty'
                    ? 'border-neon-blue text-neon-blue'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-soft-gray dark:hover:border-gray-600'
                }`}
              >
                Warranty & Returns
              </a>
              <a 
                href="#reviews" 
                onClick={() => setActiveTab('reviews')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'reviews'
                    ? 'border-neon-blue text-neon-blue'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-soft-gray dark:hover:border-gray-600'
                }`}
              >
                Reviews ({product.reviews || 0})
              </a>
            </nav>
          </div>
          
          {/* Details & Specs Content */}
          {activeTab === 'details' && (
            <div id="details" className="py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Full Description Section */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Product Details
                  </h2>
                  
                  {product.full_description ? (
                    <div className="prose prose-blue max-w-none dark:prose-invert">
                      <ReactMarkdown>{product.full_description}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-soft-gray">
                      {product.description}
                    </p>
                  )}
                </div>
                
                {/* Specifications Table */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Specifications
                  </h2>
                  
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {Object.entries(product.specifications).map(([key, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-dark-navy' : 'bg-white dark:bg-light-navy'}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{key}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-soft-gray">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-soft-gray">
                      No detailed specifications available for this product.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Warranty & Returns Content */}
          {activeTab === 'warranty' && (
            <div id="warranty" className="py-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Warranty & Return Policy
              </h2>
              
              {product.warranty_info ? (
                <div className="prose prose-blue max-w-none dark:prose-invert">
                  <p className="text-gray-700 dark:text-soft-gray whitespace-pre-line">
                    {product.warranty_info}
                  </p>
                </div>
              ) : (
                <div className="prose prose-blue max-w-none dark:prose-invert">
                  <h3>Warranty Information</h3>
                  <p>All products come with a standard 6-month warranty against manufacturing defects unless otherwise specified.</p>
                  
                  <h3>Return Policy</h3>
                  <p>
                    We accept returns within 7 days of delivery if the item is unused and in its original packaging. 
                    Please contact our customer support team to initiate a return.
                  </p>
                  
                  <h3>Refund Policy</h3>
                  <p>
                    Refunds will be processed within 7-10 business days after we receive the returned item. 
                    Shipping costs are non-refundable unless the return is due to our error.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Reviews Content */}
          {activeTab === 'reviews' && (
            <div id="reviews" className="py-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Customer Reviews
              </h2>
              
              {/* Rating summary */}
              <div className="mb-8">
                <RatingSummary 
                  averageRating={product.rating || 0}
                  totalReviews={reviews.length}
                  ratingCounts={calculateRatingCounts()}
                  onFilterByRating={setSelectedRating}
                  selectedRating={selectedRating}
                />
              </div>
              
              {/* Review form */}
              {user && !showReviewForm && !editingReview && (
                <div className="mb-8">
                  {userReview ? (
                    <button 
                      onClick={() => {
                        setEditingReview(userReview);
                        setShowReviewForm(true);
                      }}
                      className="btn-primary"
                    >
                      Edit Your Review
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowReviewForm(true)} 
                      className="btn-primary"
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              )}
              
              {showReviewForm && (
                <div className="mb-8">
                  <ReviewForm 
                    productId={product.id} 
                    existingReview={editingReview || undefined}
                    onSubmitSuccess={handleSubmitReview}
                    onCancel={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                    }}
                  />
                </div>
              )}
              
              {/* Filter notice */}
              {selectedRating !== null && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Showing only {selectedRating}-star reviews
                  </p>
                  <button 
                    onClick={() => setSelectedRating(null)}
                    className="text-xs text-blue-700 dark:text-blue-300 underline"
                  >
                    Clear filter
                  </button>
                </div>
              )}
              
              {/* Reviews list */}
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <LoaderSpinner size="lg" color="blue" />
                </div>
              ) : (
                <ReviewList 
                  reviews={filteredReviews} 
                  onRefresh={() => {
                    if (product?.id) {
                      setReviewsLoading(true);
                      getProductReviews(product.id).then(data => {
                        setReviews(data);
                        setReviewsLoading(false);
                      }).catch(error => {
                        console.error('Error refreshing reviews:', error);
                        setReviewsLoading(false);
                      });
                    }
                  }}
                  onEditReview={handleEditReview}
                />
              )}
              
              {/* Login prompt */}
              {!user && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-navy border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <p className="text-gray-700 dark:text-soft-gray mb-3">
                    You need to be logged in to write a review
                  </p>
                  <Link to="/login" state={{ from: location }} className="btn-primary">
                    Sign In to Write a Review
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;