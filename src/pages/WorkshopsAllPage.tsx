import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react';
import { getAllWorkshops } from '../services/workshopService';
import { Workshop } from '../types';
import LoaderSpinner from '../components/ui/LoaderSpinner';

const WorkshopsAllPage: React.FC = () => {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllWorkshops();
        setWorkshops(data);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-navy">
      <section className="pt-32 pb-8 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container-custom">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/workshops')}
              className="flex items-center text-neon-blue hover:text-blue-300 transition font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-1" /> Back to Categories
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-orbitron text-center">
            All <span className="text-neon-blue">Workshops</span>
          </h1>
          <p className="text-xl text-gray-200 text-center mb-8 max-w-2xl mx-auto">
            Explore our complete range of hands-on technology workshops designed for all ages and skill levels.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-custom">
          {workshops.length === 0 ? (
            <div className="bg-gray-50 dark:bg-light-navy rounded-lg p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                No Workshops Found
              </h3>
              <p className="text-gray-600 dark:text-soft-gray mb-6">
                There are currently no workshops available.
              </p>
              <Link to="/workshops" className="btn-primary">
                Back to Categories
              </Link>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {workshops.map((workshop) => (
                <motion.div
                  key={workshop.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-light-navy rounded-xl shadow-lg overflow-hidden"
                  whileHover={{ y: -10 }}
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
          )}
        </div>
      </section>
    </div>
  );
};

export default WorkshopsAllPage; 