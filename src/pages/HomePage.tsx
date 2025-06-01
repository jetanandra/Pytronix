import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Cpu, Wifi, ShipIcon as ChipIcon, Shield, Calendar, Lightbulb, BookOpen, Users, Settings, Clock, ChevronRight } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { getAllProducts, getAllCategories } from '../services/productService';
import { getAllWorkshops } from '../services/workshopService';
import { getHeroSlides } from '../services/settingsService';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { Product, Category, Workshop, HeroSlide } from '../types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredWorkshops, setFeaturedWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [products, categoriesData, workshops, slides] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
          getAllWorkshops(),
          getHeroSlides()
        ]);
        
        // Get the first 4 products as featured products
        setFeaturedProducts(products.slice(0, 4));
        
        // Get featured workshops
        const featuredWorkshops = workshops.filter(w => w.is_featured).slice(0, 3);
        setFeaturedWorkshops(featuredWorkshops);
        
        setCategories(categoriesData);
        
        // Filter enabled slides and sort by order
        const enabledSlides = slides
          .filter(slide => slide.enabled)
          .sort((a, b) => a.order - b.order);
        setHeroSlides(enabledSlides);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <>
      {/* Swiper pagination dots: only show on mobile, always centered at bottom */}
      <style>{`
        @media (min-width: 768px) {
          .hero-pagination { display: none !important; }
          .hero-image-container { width: 800px !important; height: 550px !important; max-width: 90vw !important; }
        }
        @media (max-width: 767px) {
          .hero-pagination {
            display: flex !important;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin: 0 auto 1.5rem auto;
            width: 100%;
            pointer-events: none;
            position: static;
          }
          .hero-pagination .swiper-pagination-bullet {
            pointer-events: auto;
            width: 12px;
            height: 12px;
            background: #3b82f6;
            opacity: 0.5;
            border-radius: 9999px;
            transition: background 0.3s, opacity 0.3s, box-shadow 0.3s;
            box-shadow: 0 0 6px #3b82f6;
            margin: 0 4px;
          }
          .hero-pagination .swiper-pagination-bullet-active {
            background: #60a5fa;
            opacity: 1;
            box-shadow: 0 0 12px #60a5fa, 0 0 0 2px #fff;
          }
          .hero-image-container {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 230px !important;
            min-height: 190px !important;
            aspect-ratio: 16/8 !important;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .hero-image-container img, .hero-image-container picture {
            object-fit: cover !important;
            object-position: center !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 1rem;
          }
          .hero-content-mobile {
            margin-bottom: 2.5rem !important; /* Ensure space for dots */
          }
        }
      `}</style>
      {/* Modern Responsive Hero Section as Swiper Slider */}
      <section className="relative min-h-[70vh] pt-28 md:pt-32 pb-12 md:pb-20 px-0 md:px-0 bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 dark:from-dark-navy/95 dark:via-dark-navy/90 dark:to-light-navy/80 transition-colors duration-500 overflow-hidden">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <LoaderSpinner size="lg" color="blue" />
          </div>
        ) : heroSlides.length > 0 ? (
            <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
              spaceBetween={0}
              slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: '.hero-pagination' }}
            navigation={{ nextEl: '.hero-next', prevEl: '.hero-prev' }}
              loop={true}
            className="w-full h-full"
            >
            {heroSlides.map((slide, idx) => (
                <SwiperSlide key={slide.id}>
                <div className="flex flex-col-reverse md:flex-row items-center justify-between min-h-[60vh] md:min-h-[70vh] px-4 md:px-12 w-full">
                  {/* Content Left */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="hero-content-mobile flex-1 flex flex-col items-center md:items-start justify-center max-w-xl w-full z-10 md:ml-[5%] text-center md:text-left mx-auto"
                  >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-orbitron font-bold mb-4 text-gray-900 dark:text-soft-white leading-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-soft-gray mb-8 max-w-lg">
                      {slide.subtitle}
                    </p>
                    {slide.cta_text && slide.cta_link && (
                      <Link 
                        to={slide.cta_link}
                        className="btn-primary px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition hover:-translate-y-1 mx-auto md:mx-0"
                      >
                        {slide.cta_text} <ChevronRight className="inline-block ml-1 w-5 h-5" />
                      </Link>
                    )}
                  </motion.div>
                  {/* Image Right */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex-1 flex items-center justify-center w-full md:w-1/2 mb-10 md:mb-0"
                  >
                    <div
                      className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200/60 to-blue-200/60 dark:from-blue-900/60 dark:to-purple-900/60 mx-auto hero-image-container"
                      style={{ width: '800px', height: '550px', maxWidth: '90vw' }}
                    >
                      {/* Responsive image for mobile/desktop */}
                      <picture>
                        {/* Mobile: landscape, smaller height */}
                        <source
                          media="(max-width: 767px)"
                          srcSet={slide.image}
                        />
                        {/* Desktop: original image */}
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover object-center transition-all duration-700"
                          loading="lazy"
                          style={{ minHeight: '220px', minWidth: '0' }}
                        />
                      </picture>
                      {/* Optional overlay for blend effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent dark:from-dark-navy/60 pointer-events-none"></div>
                    </div>
                  </motion.div>
                </div>
                </SwiperSlide>
              ))}
            {/* Navigation Arrows */}
            <button className="hero-prev hidden md:flex absolute left-2 top-1/2 z-20 p-2 rounded-full bg-white/80 dark:bg-dark-navy/80 shadow hover:bg-white dark:hover:bg-dark-navy transition -translate-y-1/2" aria-label="Previous Slide">
              <ChevronRight className="w-6 h-6 rotate-180 text-gray-700 dark:text-soft-gray" />
            </button>
            <button className="hero-next hidden md:flex absolute right-2 top-1/2 z-20 p-2 rounded-full bg-white/80 dark:bg-dark-navy/80 shadow hover:bg-white dark:hover:bg-dark-navy transition -translate-y-1/2" aria-label="Next Slide">
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-soft-gray" />
            </button>
            </Swiper>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-400 dark:text-gray-600">
            No hero slides available.
          </div>
        )}
        {/* Dots: always centered, always visible on every slide, only on mobile */}
        <div className="block md:hidden w-full">
          <div className="hero-pagination mx-auto"></div>
        </div>
        {/* Soft shadow/gradient separator below navbar */}
        <div className="pointer-events-none select-none absolute left-0 top-0 w-full h-10 z-0" style={{
          background: 'linear-gradient(to bottom, rgba(226,232,240,0.22) 0%, rgba(226,232,240,0.10) 80%, transparent 100%)',
          filter: 'blur(4px)',
        }}></div>
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
      
      {/* Featured Workshops Section */}
      {featuredWorkshops.length > 0 && (
        <section className="py-16 bg-white dark:bg-dark-navy">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Workshops
              </h2>
              <Link to="/workshops" className="flex items-center text-neon-blue hover:text-blue-700 transition whitespace-nowrap px-2">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredWorkshops.map((workshop) => (
                <motion.div
                  key={workshop.id}
                  whileHover={{ y: -10 }}
                  className="bg-white dark:bg-light-navy rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={workshop.image} 
                      alt={workshop.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                        {workshop.category}
                      </span>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {workshop.duration}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {workshop.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {workshop.short_description}
                    </p>
                    <Link 
                      to={`/workshop/${workshop.id}`} 
                      className="text-neon-blue font-medium hover:text-blue-700 flex items-center"
                    >
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-light-navy">
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
            <div className="bg-white dark:bg-dark-navy p-6 rounded-lg transition-transform hover:translate-y-[-8px]">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-soft-gray">
                48-hour express shipping available across all major cities in India.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-dark-navy p-6 rounded-lg transition-transform hover:translate-y-[-8px]">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-neon-green" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Quality Products</h3>
              <p className="text-gray-600 dark:text-soft-gray">
                All components sourced from original manufacturers, tested and verified.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-dark-navy p-6 rounded-lg transition-transform hover:translate-y-[-8px]">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-neon-violet" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Hands-on Workshops</h3>
              <p className="text-gray-600 dark:text-soft-gray">
                Learn through practical workshops led by industry experts and educators.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white dark:bg-dark-navy p-6 rounded-lg transition-transform hover:translate-y-[-8px]">
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
      <section className="py-16 bg-white dark:bg-dark-navy">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <Link to="/products" className="flex items-center text-neon-blue hover:text-blue-700 transition whitespace-nowrap px-2">
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
      
      {/* Workshop CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-orbitron">
                Hands-on Technology Workshops
              </h2>
              <p className="text-white/90 text-lg mb-6">
                Immersive learning experiences designed for schools, colleges, and organizations. Our expert-led workshops cover drones, robotics, AI, and more.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Practical Learning</h3>
                    <p className="text-white/80 text-sm">Hands-on experience with cutting-edge technology</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Expert Instructors</h3>
                    <p className="text-white/80 text-sm">Learn from industry professionals and educators</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Customizable Programs</h3>
                    <p className="text-white/80 text-sm">Tailored to your institution's specific needs</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/workshops" className="btn bg-white text-blue-600 hover:bg-gray-100">
                  Explore Workshops
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg" 
                alt="Students in a workshop" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-5 -right-5 bg-white dark:bg-light-navy p-4 rounded-lg shadow-lg">
                <div className="text-3xl font-bold text-neon-blue">5,000+</div>
                <div className="text-gray-600 dark:text-soft-gray text-sm">Students Trained</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-light-navy">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-gray-600 dark:text-soft-gray text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of makers and engineers who trust Phytronix for their electronic components.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>
            <Link to="/workshops" className="btn-secondary">
              Explore Workshops
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