import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  CheckCircle, 
  Cpu, 
  BookOpen, 
  Award, 
  Share2,
  ChevronRight,
  Play,
  X,
  Download,
  Layers
} from 'lucide-react';
import { getWorkshopById, getWorkshopCategories } from '../services/workshopService';
import { Workshop, WorkshopCategory } from '../types';
import LoaderSpinner from '../components/ui/LoaderSpinner';

const WorkshopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [categories, setCategories] = useState<WorkshopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError('Workshop ID not provided');
          return;
        }
        
        const [workshopData, categoriesData] = await Promise.all([
          getWorkshopById(id),
          getWorkshopCategories()
        ]);
        
        if (workshopData) {
          setWorkshop(workshopData);
          if (workshopData.gallery && workshopData.gallery.length > 0) {
            setActiveImage(workshopData.gallery[0]);
          }
        } else {
          setError('Workshop not found');
        }
        
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching workshop:', err);
        setError('Failed to load workshop details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleImageClick = (image: string) => {
    setActiveImage(image);
    setShowLightbox(true);
  };

  // Find the category object that matches the workshop's category_id
  const workshopCategory = workshop?.category_id 
    ? categories.find(cat => cat.id === workshop.category_id)
    : categories.find(cat => cat.name === workshop?.category);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{error || "Workshop not found"}</h1>
        <p className="text-gray-600 dark:text-soft-gray mb-6">
          The workshop you are looking for does not exist or could not be loaded.
        </p>
        <Link to="/workshops" className="btn-primary flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-soft-gray mb-6">
          <Link to="/" className="hover:text-neon-blue dark:hover:text-neon-blue transition">Home</Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <Link to="/workshops" className="hover:text-neon-blue dark:hover:text-neon-blue transition">Workshops</Link>
          {workshopCategory && (
            <>
              <ChevronRight className="mx-2 w-4 h-4" />
              <Link 
                to={`/workshops/category/${workshopCategory.id}`} 
                className="hover:text-neon-blue dark:hover:text-neon-blue transition flex items-center"
              >
                <Layers className="w-3 h-3 mr-1" />
                {workshopCategory.name}
              </Link>
            </>
          )}
          <ChevronRight className="mx-2 w-4 h-4" />
          <span className="truncate max-w-[200px]">{workshop.title}</span>
        </nav>

        {/* Workshop Header */}
        <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="h-64 md:h-96 relative">
            <img 
              src={workshop.image} 
              alt={workshop.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:p-10">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-neon-blue/90 text-white text-sm font-medium rounded-full">
                  {workshop.category}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> {workshop.duration}
                </span>
                <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full flex items-center">
                  <Users className="w-3 h-3 mr-1" /> {workshop.capacity} participants
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-orbitron">
                {workshop.title}
              </h1>
              <p className="text-white/90 text-lg max-w-3xl">
                {workshop.short_description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-orbitron">
                About This Workshop
              </h2>
              <div className="prose prose-blue max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: workshop.description }} />
              </div>
            </div>

            {/* Gallery */}
            {workshop.gallery && workshop.gallery.length > 0 && (
              <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-orbitron">
                  Workshop Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {workshop.gallery.map((image, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                      onClick={() => handleImageClick(image)}
                    >
                      <img 
                        src={image} 
                        alt={`Workshop image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Showcase */}
            {workshop.video_url && (
              <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-orbitron">
                  Video Showcase
                </h2>
                <div 
                  className="aspect-video rounded-lg overflow-hidden relative cursor-pointer group"
                  onClick={() => setShowVideoModal(true)}
                >
                  <img 
                    src={workshop.video_thumbnail || workshop.image} 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-neon-blue/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Learning Outcomes */}
            {workshop.learning_outcomes && workshop.learning_outcomes.length > 0 && (
              <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-orbitron">
                  Learning Outcomes
                </h2>
                <ul className="space-y-4">
                  {workshop.learning_outcomes.map((outcome, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start"
                    >
                      <CheckCircle className="w-5 h-5 text-neon-green mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-soft-gray">{outcome}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Equipment Provided */}
            {workshop.equipment_provided && workshop.equipment_provided.length > 0 && (
              <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-orbitron">
                  Equipment & Facilities Provided
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workshop.equipment_provided.map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-center bg-gray-50 dark:bg-dark-navy p-4 rounded-lg"
                    >
                      <Cpu className="w-5 h-5 text-neon-blue mr-3" />
                      <span className="text-gray-700 dark:text-soft-gray">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Workshop CTA */}
            <div className="bg-gradient-to-br from-neon-blue to-neon-violet rounded-xl shadow-lg p-6 text-white sticky top-24">
              <h3 className="text-xl font-bold mb-4">Interested in this Workshop?</h3>
              <p className="mb-6 text-white/90">
                Request this workshop for your institution or organization. Our team will get back to you with availability and customization options.
              </p>
              <Link 
                to={`/workshop-request?workshop=${workshop.id}`} 
                className="btn bg-white text-blue-600 hover:bg-gray-100 w-full flex items-center justify-center"
              >
                Request Workshop
              </Link>
            </div>

            {/* Workshop Details */}
            <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Workshop Details
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Clock className="w-5 h-5 text-neon-blue mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Duration</span>
                    <span className="text-gray-900 dark:text-white">{workshop.duration}</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Users className="w-5 h-5 text-neon-blue mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Capacity</span>
                    <span className="text-gray-900 dark:text-white">{workshop.capacity} participants</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Target className="w-5 h-5 text-neon-blue mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Target Audience</span>
                    <span className="text-gray-900 dark:text-white">{workshop.target_audience}</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <BookOpen className="w-5 h-5 text-neon-blue mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty Level</span>
                    <span className="text-gray-900 dark:text-white">{workshop.difficulty_level}</span>
                  </div>
                </li>
                {workshop.prerequisites && (
                  <li className="flex items-start">
                    <Award className="w-5 h-5 text-neon-blue mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Prerequisites</span>
                      <span className="text-gray-900 dark:text-white">{workshop.prerequisites}</span>
                    </div>
                  </li>
                )}
                {workshopCategory && (
                  <li className="flex items-start">
                    <Layers className="w-5 h-5 text-neon-blue mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                      <Link 
                        to={`/workshops/category/${workshopCategory.id}`}
                        className="text-neon-blue hover:underline"
                      >
                        {workshopCategory.name}
                      </Link>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Share Workshop */}
            <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Share This Workshop
              </h3>
              <div className="flex space-x-4">
                <button className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Download our workshop brochure for more details and share it with your colleagues.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {showLightbox && activeImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button 
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={activeImage} 
            alt="Workshop gallery" 
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && workshop.video_url && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button 
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/20 hover:bg-black/40 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-4xl aspect-video">
            <iframe
              src={workshop.video_url}
              title={workshop.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopDetailPage;