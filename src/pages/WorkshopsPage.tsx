import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Users, Calendar, Clock, Award } from 'lucide-react';
import { getAllWorkshops, getWorkshopCategories, getWorkshopsByCategory } from '../services/workshopService';
import { Workshop, WorkshopCategory } from '../types';
import LoaderSpinner from '../components/ui/LoaderSpinner';

const SCROLL_OFFSET = 80;

const WorkshopsPage: React.FC = () => {
  const { id: categoryId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<WorkshopCategory[]>([]);
  const [featuredWorkshops, setFeaturedWorkshops] = useState<Workshop[]>([]);
  const [categoryWorkshops, setCategoryWorkshops] = useState<Workshop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WorkshopCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const categoriesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await getWorkshopCategories();
        setCategories(categoriesData);
        if (categoryId) {
          // Category page: fetch workshops for this category
          const workshopsData = await getWorkshopsByCategory(categoryId);
          setCategoryWorkshops(workshopsData);
          const cat = categoriesData.find(c => c.id === categoryId);
          setSelectedCategory(cat || null);
        } else {
          // Main page: fetch all workshops for featured
          const workshopsData = await getAllWorkshops();
          const featured = workshopsData.filter(w => w.is_featured).slice(0, 3);
          setFeaturedWorkshops(featured);
          setSelectedCategory(null);
        }
      } catch (error) {
        console.error('Error fetching workshop data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  // Smooth scroll to #categories if hash is present
  useEffect(() => {
    if (window.location.hash === '#categories' && categoriesRef.current) {
      setTimeout(() => {
        const el = categoriesRef.current;
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 250);
    }
  }, []);

  const stats = [
    { icon: <Users className="w-8 h-8 text-neon-blue" />, value: '5,000+', label: 'Students Trained' },
    { icon: <Calendar className="w-8 h-8 text-neon-green" />, value: '120+', label: 'Workshops Conducted' },
    { icon: <Award className="w-8 h-8 text-neon-violet" />, value: '98%', label: 'Satisfaction Rate' },
    { icon: <Clock className="w-8 h-8 text-yellow-500" />, value: '1,500+', label: 'Training Hours' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  // Category view
  if (categoryId && selectedCategory) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-navy">
        <section className="pt-32 pb-8 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="container-custom">
            <div className="flex items-center mb-6">
              <button
                aria-label="Back to Categories"
                onClick={() => {
                  navigate('/workshops#categories', { replace: true });
                  setTimeout(() => {
                    const el = document.getElementById('categories');
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 250);
                }}
                className="flex items-center gap-2 rounded-full px-5 py-2 bg-white/10 text-neon-blue font-semibold shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-200 border border-blue-200 dark:border-blue-900 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <ArrowLeft className="w-5 h-5 mr-1" /> Back to Categories
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-orbitron text-center">
              {selectedCategory.name} <span className="text-neon-blue">Workshops</span>
            </h1>
            <p className="text-xl text-gray-200 text-center mb-8 max-w-2xl mx-auto">
              {selectedCategory.description}
            </p>
          </div>
        </section>
        <section className="py-16">
          <div className="container-custom">
            {categoryWorkshops.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-50 dark:bg-light-navy rounded-lg p-8 text-center"
              >
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  No Workshops Found
                </h3>
                <p className="text-gray-600 dark:text-soft-gray mb-6">
                  There are currently no workshops in this category.
                </p>
                <button
                  aria-label="Back to Categories"
                  onClick={() => {
                    navigate('/workshops#categories', { replace: true });
                    setTimeout(() => {
                      const el = document.getElementById('categories');
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }, 250);
                  }}
                  className="btn-primary hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Back to Categories
                </button>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <span className="h-0.5 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{selectedCategory.name} Workshops</h2>
                  <span className="flex-1 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" />
                </div>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {categoryWorkshops.map((workshop) => (
                    <motion.div
                      key={workshop.id}
                      variants={itemVariants}
                      className="bg-white dark:bg-light-navy rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                      whileHover={{ y: -10, scale: 1.03 }}
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
                </motion.div>
              </>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Main landing view
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6 font-orbitron"
            >
              Hands-on Technology <span className="text-neon-blue">Workshops</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-200 mb-8"
            >
              Immersive learning experiences designed to inspire the next generation of innovators, engineers, and problem solvers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a href="#categories" className="btn-primary text-lg px-8 py-3">
                Explore Workshops
              </a>
            </motion.div>
          </div>
        </div>
        {/* Circuit Board Pattern Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute inset-0 bg-circuit-pattern"></div>
        </div>
      </section>

      {/* Featured Workshops */}
      {featuredWorkshops.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-light-navy">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Workshops
              </h2>
              <Link to="/workshops/all" className="flex items-center text-neon-blue hover:text-blue-700 transition">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredWorkshops.map((workshop) => (
                <motion.div
                  key={workshop.id}
                  whileHover={{ y: -10 }}
                  className="bg-white dark:bg-dark-navy rounded-xl shadow-lg overflow-hidden"
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

      {/* Workshop Categories */}
      <section id="categories" ref={categoriesRef} className="py-16 bg-white dark:bg-dark-navy">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Workshop Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our specialized workshop programs designed to provide hands-on experience with cutting-edge technologies.
            </p>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-light-navy dark:to-dark-navy rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
                onClick={() => navigate(`/workshops/category/${category.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <h3 className="text-white text-2xl font-bold p-6 font-orbitron">
                      {category.name}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {category.description}
                  </p>
                  <Link 
                    to={`/workshops/category/${category.id}`} 
                    className="btn-primary inline-flex items-center"
                  >
                    Explore Workshops <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 bg-gradient-to-r from-neon-blue to-neon-violet">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-light-navy">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              What Our Clients Say
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Hear from educational institutions and organizations that have experienced our workshops.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-navy rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/5212703/pexels-photo-5212703.jpeg" 
                  alt="Principal" 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Dr. Rajesh Mehta</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Principal, Delhi Public School</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                "The drone workshop conducted by Phytronix was exceptional. Our students gained practical knowledge and were inspired to pursue engineering. The instructors were knowledgeable and patient."
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-navy rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg" 
                  alt="Director" 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Priya Sharma</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Director, TechKids Foundation</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                "We've partnered with Phytronix for our STEM education initiatives for two years now. Their robotics workshops are engaging, age-appropriate, and perfectly aligned with our curriculum goals."
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-navy rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg" 
                  alt="CEO" 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Vikram Singh</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">CEO, InnovateX Startups</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                "The AI workshop for our team was transformative. Phytronix's practical approach helped our developers quickly implement machine learning concepts into our products. Highly recommended!"
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-dark-navy">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to bring hands-on technology education to your institution?
              </h2>
              <Link to="/workshop-request" className="btn-primary text-lg px-8 py-3">
                Request a Workshop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkshopsPage;