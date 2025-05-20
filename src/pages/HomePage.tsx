import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Cpu, Wifi, ShipIcon as ChipIcon, Shield } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { getAllProducts, getAllCategories } from '../services/productService';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { Product, Category } from '../types';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await getAllProducts();
        // Get the first 4 products as featured products
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);
  
  return (
    <>
      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-white to-gray-100 dark:from-dark-navy dark:to-light-navy overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2 mb-10 md:mb-0"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
                <span className="block">Build The Future</span>
                <span className="text-neon-blue dark:text-neon-blue neon-text">With Phytronix</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-soft-gray mb-8">
                India's premier destination for electronics and IoT components. 
                From Arduino to Raspberry Pi, sensors to actuators.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/products" className="btn-primary text-center">
                  Explore Products
                </Link>
                <Link to="/login" className="btn-secondary text-center">
                  Join Phytronix
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2"
            >
              <div className="relative">
                <div className="w-full h-80 md:h-96 lg:h-[500px] relative">
                  <img 
                    src="https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg" 
                    alt="Electronics and circuit boards" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/30 to-neon-violet/30 rounded-lg mix-blend-overlay"></div>
                </div>
                
                {/* Animated glowing elements */}
                <motion.div 
                  animate={{ 
                    boxShadow: ['0 0 10px #3b82f6', '0 0 20px #3b82f6', '0 0 10px #3b82f6'] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -top-5 -left-5 w-20 h-20 bg-neon-blue rounded-full opacity-20"
                ></motion.div>
                
                <motion.div 
                  animate={{ 
                    boxShadow: ['0 0 10px #8b5cf6', '0 0 20px #8b5cf6', '0 0 10px #8b5cf6'] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute -bottom-5 -right-5 w-16 h-16 bg-neon-violet rounded-full opacity-20"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-12 bg-gray-50 dark:bg-light-navy">
        <div className="container-custom">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => navigate(`/products?category=${category.id}`)}
                className="group flex flex-col items-center bg-white dark:bg-dark-navy rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-neon-blue"
              >
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-16 h-16 object-cover rounded mb-2 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-16 h-16 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                    <Cpu className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white text-center group-hover:text-neon-blue">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-dark-navy">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose <span className="text-neon-blue dark:text-neon-blue">Phytronix</span>
            </h2>
            <p className="text-gray-600 dark:text-soft-gray max-w-2xl mx-auto">
              We're not just another electronics store. We're a community of engineers, hobbyists, and makers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-light-navy p-6 rounded-lg transition-transform hover:translate-y-[-8px]">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-soft-gray">
                48-hour express shipping available across all major cities in India.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-light-navy p-6 rounded-lg transition-transform hover:translate-y-[-8px]">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Quality Products</h3>
              <p className="text-gray-600 dark:text-soft-gray">
                All components sourced from original manufacturers, tested and verified.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-light-navy p-6 rounded-lg transition-transform hover:translate-y-[-8px]">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6 text-neon-violet" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Tech Support</h3>
              <p className="text-gray-600 dark:text-soft-gray">
                Get expert advice from our team of engineers on your electronics projects.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-50 dark:bg-light-navy p-6 rounded-lg transition-transform hover:translate-y-[-8px]">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Warranty</h3>
              <p className="text-gray-600 dark:text-soft-gray">
                All products come with minimum 6-month warranty with hassle-free replacements.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-light-navy">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <Link to="/products" className="flex items-center text-neon-blue hover:text-blue-700 transition">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoaderSpinner size="lg" color="blue" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-light-navy rounded-lg shadow">
              <p className="text-gray-600 dark:text-soft-gray">No products available at the moment.</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Check back soon for our latest products!</p>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-neon-blue to-neon-violet dark:from-blue-900 dark:to-purple-900">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of makers and engineers who trust Phytronix for their electronic components.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/products" className="btn bg-white text-neon-blue hover:bg-gray-100">
              Shop Now
            </Link>
            <Link to="/contact" className="btn border border-white text-white hover:bg-white/20">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-white dark:bg-dark-navy">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 dark:text-soft-gray max-w-2xl mx-auto">
              Discover why engineers and hobbyists across India choose Phytronix for their electronics needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 dark:bg-light-navy p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Rahul Sharma</h4>
                  <p className="text-gray-600 dark:text-soft-gray text-sm">Electronics Engineer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-soft-gray">
                "Phytronix has become my go-to store for all electronic components. Their fast delivery and quality products have helped me complete numerous projects on time."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gray-50 dark:bg-light-navy p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Priya Patel</h4>
                  <p className="text-gray-600 dark:text-soft-gray text-sm">IoT Developer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-soft-gray">
                "The technical support team at Phytronix is exceptional. They've helped me troubleshoot complex IoT setups and recommended the right components for my projects."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gray-50 dark:bg-light-navy p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg" 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Vikram Singh</h4>
                  <p className="text-gray-600 dark:text-soft-gray text-sm">Robotics Enthusiast</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-soft-gray">
                "I appreciate the wide range of robotics components available at Phytronix. As a robotics hobbyist, I've found everything I need to build my dream projects."
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;