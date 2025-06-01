import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash, 
  Save, 
  Upload, 
  X, 
  Image as ImageIcon,
  Link as LinkIcon,
  CheckSquare,
  Square,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { Workshop, WorkshopCategory } from '../../types';
import { 
  createWorkshop, 
  getWorkshopById, 
  updateWorkshop, 
  getWorkshopCategories 
} from '../../services/workshopService';

interface WorkshopFormProps {
  isEdit?: boolean;
}

const WorkshopForm: React.FC<WorkshopFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [workshop, setWorkshop] = useState<Partial<Workshop>>({
    title: '',
    category: '',
    category_id: '',
    short_description: '',
    description: '',
    image: '',
    gallery: [],
    video_url: '',
    video_thumbnail: '',
    duration: '',
    capacity: 20,
    target_audience: '',
    difficulty_level: 'beginner',
    prerequisites: '',
    learning_outcomes: [],
    equipment_provided: [],
    is_featured: false
  });
  
  const [learningOutcomeInput, setLearningOutcomeInput] = useState<string>('');
  const [equipmentInput, setEquipmentInput] = useState<string>('');
  const [galleryInput, setGalleryInput] = useState<string>('');
  const [categories, setCategories] = useState<WorkshopCategory[]>([]);
  
  const editorRef = useRef<any>(null);

  // Fetch workshop data if in edit mode
  useEffect(() => {
    const fetchWorkshop = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const workshopData = await getWorkshopById(id);
          if (workshopData) {
            setWorkshop(workshopData);
          } else {
            toast.error('Workshop not found');
            navigate('/admin/workshops');
          }
        } catch (error) {
          console.error('Error fetching workshop:', error);
          toast.error('Failed to load workshop data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWorkshop();
  }, [id, isEdit, navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getWorkshopCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setWorkshop({ ...workshop, [name]: Number(value) });
    } else {
      setWorkshop({ ...workshop, [name]: value });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setWorkshop({ ...workshop, [name]: checked });
  };

  const handleAddLearningOutcome = () => {
    if (learningOutcomeInput.trim() !== '') {
      const currentOutcomes = workshop.learning_outcomes || [];
      setWorkshop({
        ...workshop,
        learning_outcomes: [...currentOutcomes, learningOutcomeInput.trim()]
      });
      setLearningOutcomeInput('');
    }
  };

  const handleRemoveLearningOutcome = (index: number) => {
    const currentOutcomes = workshop.learning_outcomes || [];
    setWorkshop({
      ...workshop,
      learning_outcomes: currentOutcomes.filter((_, i) => i !== index)
    });
  };

  const handleAddEquipment = () => {
    if (equipmentInput.trim() !== '') {
      const currentEquipment = workshop.equipment_provided || [];
      setWorkshop({
        ...workshop,
        equipment_provided: [...currentEquipment, equipmentInput.trim()]
      });
      setEquipmentInput('');
    }
  };

  const handleRemoveEquipment = (index: number) => {
    const currentEquipment = workshop.equipment_provided || [];
    setWorkshop({
      ...workshop,
      equipment_provided: currentEquipment.filter((_, i) => i !== index)
    });
  };

  const handleAddGalleryImage = () => {
    if (galleryInput.trim() !== '') {
      const currentGallery = workshop.gallery || [];
      setWorkshop({
        ...workshop,
        gallery: [...currentGallery, galleryInput.trim()]
      });
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const currentGallery = workshop.gallery || [];
    setWorkshop({
      ...workshop,
      gallery: currentGallery.filter((_, i) => i !== index)
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    
    setWorkshop({
      ...workshop,
      category_id: categoryId,
      category: selectedCategory ? selectedCategory.name : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!workshop.title || !workshop.category_id || !workshop.short_description || !workshop.image) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEdit && id) {
        await updateWorkshop(id, workshop);
        toast.success('Workshop updated successfully');
      } else {
        await createWorkshop(workshop as Omit<Workshop, 'id' | 'created_at'>);
        toast.success('Workshop added successfully');
      }
      
      navigate('/admin/workshops');
    } catch (error) {
      console.error('Error saving workshop:', error);
      toast.error('Failed to save workshop');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/workshops')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-navy transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-soft-gray" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Workshop' : 'Add New Workshop'}
          </h1>
        </div>
        
        <button
          type="submit"
          form="workshop-form"
          disabled={loading}
          className="btn-primary flex items-center"
        >
          {loading ? (
            <LoaderSpinner size="sm" color="blue" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Workshop
            </>
          )}
        </button>
      </div>
      
      <form id="workshop-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workshop Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Workshop Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={workshop.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="e.g. Drone Building Workshop"
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  name="category_id"
                  value={workshop.category_id || ''}
                  onChange={handleCategoryChange}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {categories.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                  No categories available. Please create a category first.
                </p>
              )}
            </div>
            
            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="short_description"
                value={workshop.short_description}
                onChange={handleInputChange}
                required
                rows={2}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="Brief workshop description (1-2 sentences)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This will be displayed in workshop cards and previews (max 150 characters)
              </p>
            </div>
            
            {/* Full Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Full Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={workshop.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="Detailed workshop description with HTML formatting supported"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                HTML formatting is supported for rich text content
              </p>
            </div>
            
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                value={workshop.duration}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="e.g. 3 hours, 2 days"
              />
            </div>
            
            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={workshop.capacity}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Maximum number of participants
              </p>
            </div>
            
            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="target_audience"
                value={workshop.target_audience}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="e.g. High School Students, College Students, Professionals"
              />
            </div>
            
            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                name="difficulty_level"
                value={workshop.difficulty_level}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            {/* Prerequisites */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Prerequisites
              </label>
              <input
                type="text"
                name="prerequisites"
                value={workshop.prerequisites}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="e.g. Basic programming knowledge, No prior experience needed"
              />
            </div>
            
            {/* Featured Workshop */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={workshop.is_featured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700 dark:text-soft-gray">
                  Feature this workshop on the homepage
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Workshop Images */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Workshop Images
          </h2>
          
          {/* Main Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
              Main Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="image"
              value={workshop.image}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
            
            {workshop.image && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">Preview:</p>
                <div className="w-full h-40 bg-gray-100 dark:bg-dark-navy rounded-lg overflow-hidden">
                  <img
                    src={workshop.image}
                    alt="Workshop main"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray">
                Gallery Images (Max 10)
              </label>
              <button
                type="button"
                onClick={handleAddGalleryImage}
                disabled={(workshop.gallery?.length || 0) >= 10}
                className={`text-sm flex items-center ${
                  (workshop.gallery?.length || 0) >= 10
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                }`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Image
              </button>
            </div>
            
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-l-lg"
                placeholder="Enter image URL"
                disabled={(workshop.gallery?.length || 0) >= 10}
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                disabled={(workshop.gallery?.length || 0) >= 10 || !galleryInput.trim()}
                className={`px-4 py-2 rounded-r-lg ${
                  (workshop.gallery?.length || 0) >= 10 || !galleryInput.trim()
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-neon-blue text-white hover:bg-blue-700'
                }`}
              >
                Add
              </button>
            </div>
            
            {workshop.gallery && workshop.gallery.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {workshop.gallery.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 dark:bg-dark-navy rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Video Information */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Video Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Video URL (YouTube or Vimeo)
              </label>
              <div className="flex items-center">
                <LinkIcon className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="video_url"
                  value={workshop.video_url || ''}
                  onChange={handleInputChange}
                  className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  placeholder="e.g. https://www.youtube.com/embed/..."
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Use embed URL format for best results
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Video Thumbnail URL
              </label>
              <div className="flex items-center">
                <ImageIcon className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="video_thumbnail"
                  value={workshop.video_thumbnail || ''}
                  onChange={handleInputChange}
                  className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                If left empty, main workshop image will be used
              </p>
            </div>
          </div>
          
          {workshop.video_url && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">Video Preview:</p>
              <div className="aspect-video bg-gray-100 dark:bg-dark-navy rounded-lg overflow-hidden">
                <iframe
                  src={workshop.video_url}
                  title="Video preview"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
        
        {/* Learning Outcomes */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Learning Outcomes
            </h2>
            <button
              type="button"
              onClick={handleAddLearningOutcome}
              className="text-sm flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Outcome
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={learningOutcomeInput}
              onChange={(e) => setLearningOutcomeInput(e.target.value)}
              className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-l-lg"
              placeholder="e.g. Build a functional drone from scratch"
            />
            <button
              type="button"
              onClick={handleAddLearningOutcome}
              disabled={!learningOutcomeInput.trim()}
              className={`px-4 py-2 rounded-r-lg ${
                !learningOutcomeInput.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-neon-blue text-white hover:bg-blue-700'
              }`}
            >
              Add
            </button>
          </div>
          
          {workshop.learning_outcomes && workshop.learning_outcomes.length > 0 ? (
            <ul className="space-y-2 mt-4">
              {workshop.learning_outcomes.map((outcome, index) => (
                <li key={index} className="flex items-center bg-gray-50 dark:bg-dark-navy p-3 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-neon-green mr-3 flex-shrink-0" />
                  <span className="flex-grow text-gray-700 dark:text-soft-gray">{outcome}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLearningOutcome(index)}
                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
              No learning outcomes added yet. Add some to help participants understand what they'll learn.
            </p>
          )}
        </div>
        
        {/* Equipment Provided */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Equipment & Facilities Provided
            </h2>
            <button
              type="button"
              onClick={handleAddEquipment}
              className="text-sm flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Equipment
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-l-lg"
              placeholder="e.g. Arduino kits, Soldering stations"
            />
            <button
              type="button"
              onClick={handleAddEquipment}
              disabled={!equipmentInput.trim()}
              className={`px-4 py-2 rounded-r-lg ${
                !equipmentInput.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-neon-blue text-white hover:bg-blue-700'
              }`}
            >
              Add
            </button>
          </div>
          
          {workshop.equipment_provided && workshop.equipment_provided.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {workshop.equipment_provided.map((equipment, index) => (
                <div key={index} className="flex items-center bg-gray-50 dark:bg-dark-navy p-3 rounded-lg">
                  <span className="flex-grow text-gray-700 dark:text-soft-gray">{equipment}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(index)}
                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
              No equipment items added yet. Add the equipment and facilities that will be provided during the workshop.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkshopForm;