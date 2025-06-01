import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  Save, 
  X, 
  AlertTriangle,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Type,
  Heading,
  AlignLeft,
  Upload,
  Move
} from 'lucide-react';
import { 
  getHeroSlides, 
  createHeroSlide, 
  updateHeroSlide, 
  deleteHeroSlide,
  reorderHeroSlides
} from '../../services/settingsService';
import { HeroSlide } from '../../types';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../../lib/supabaseClient';

const HeroSlideManagement: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [currentSlide, setCurrentSlide] = useState<Partial<HeroSlide>>({
    image: '',
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    enabled: true,
    order: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await getHeroSlides();
      // Sort by order
      const sortedSlides = [...data].sort((a, b) => a.order - b.order);
      setSlides(sortedSlides);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      setError('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setCurrentSlide(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setCurrentSlide(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `hero-slides/${fileName}`;
      
      // Check if hero-slides bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'hero-slides');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('hero-slides', {
          public: true
        });
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('hero-slides')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('hero-slides')
        .getPublicUrl(filePath);
        
      // Update the form with the image URL
      setCurrentSlide(prev => ({
        ...prev,
        image: data.publicUrl
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSlide.image || !currentSlide.title || !currentSlide.subtitle) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (formMode === 'add') {
        // Set the order to be the last in the list
        const newOrder = slides.length > 0 
          ? Math.max(...slides.map(slide => slide.order)) + 1 
          : 1;
          
        await createHeroSlide({
          image: currentSlide.image!,
          title: currentSlide.title!,
          subtitle: currentSlide.subtitle!,
          cta_text: currentSlide.cta_text || '',
          cta_link: currentSlide.cta_link || '',
          enabled: currentSlide.enabled !== undefined ? currentSlide.enabled : true,
          order: newOrder
        });
        toast.success('Hero slide created successfully');
      } else if (formMode === 'edit' && currentSlide.id) {
        await updateHeroSlide(currentSlide.id, {
          image: currentSlide.image,
          title: currentSlide.title,
          subtitle: currentSlide.subtitle,
          cta_text: currentSlide.cta_text,
          cta_link: currentSlide.cta_link,
          enabled: currentSlide.enabled
        });
        toast.success('Hero slide updated successfully');
      }
      
      // Reset form and refresh data
      setFormMode(null);
      setCurrentSlide({
        image: '',
        title: '',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        enabled: true,
        order: 0
      });
      fetchSlides();
    } catch (error) {
      console.error('Error saving hero slide:', error);
      toast.error('Failed to save hero slide');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setCurrentSlide(slide);
    setFormMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hero slide?')) {
      try {
        setLoading(true);
        await deleteHeroSlide(id);
        toast.success('Hero slide deleted successfully');
        fetchSlides();
      } catch (error) {
        console.error('Error deleting hero slide:', error);
        toast.error('Failed to delete hero slide');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    try {
      await updateHeroSlide(id, { enabled: !currentEnabled });
      toast.success(`Slide ${!currentEnabled ? 'enabled' : 'disabled'} successfully`);
      fetchSlides();
    } catch (error) {
      console.error('Error toggling slide status:', error);
      toast.error('Failed to update slide status');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    
    try {
      const newSlides = [...slides];
      const temp = newSlides[index].order;
      newSlides[index].order = newSlides[index - 1].order;
      newSlides[index - 1].order = temp;
      
      // Swap the slides in the array
      [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
      
      setSlides(newSlides);
      
      // Update the order in the database
      await reorderHeroSlides(newSlides.map(slide => slide.id));
      toast.success('Slide order updated');
    } catch (error) {
      console.error('Error reordering slides:', error);
      toast.error('Failed to update slide order');
      fetchSlides(); // Refresh to get the original order
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= slides.length - 1) return;
    
    try {
      const newSlides = [...slides];
      const temp = newSlides[index].order;
      newSlides[index].order = newSlides[index + 1].order;
      newSlides[index + 1].order = temp;
      
      // Swap the slides in the array
      [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
      
      setSlides(newSlides);
      
      // Update the order in the database
      await reorderHeroSlides(newSlides.map(slide => slide.id));
      toast.success('Slide order updated');
    } catch (error) {
      console.error('Error reordering slides:', error);
      toast.error('Failed to update slide order');
      fetchSlides(); // Refresh to get the original order
    }
  };

  const onDragEnd = async (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // If position didn't change
    if (sourceIndex === destinationIndex) {
      return;
    }
    
    try {
      const newSlides = [...slides];
      const [removed] = newSlides.splice(sourceIndex, 1);
      newSlides.splice(destinationIndex, 0, removed);
      
      // Update order values
      const reorderedSlides = newSlides.map((slide, index) => ({
        ...slide,
        order: index + 1
      }));
      
      setSlides(reorderedSlides);
      
      // Update the order in the database
      await reorderHeroSlides(reorderedSlides.map(slide => slide.id));
      toast.success('Slide order updated');
    } catch (error) {
      console.error('Error reordering slides:', error);
      toast.error('Failed to update slide order');
      fetchSlides(); // Refresh to get the original order
    }
  };

  if (loading && slides.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <ImageIcon className="w-6 h-6 mr-2 text-neon-blue" />
        Hero Slide Management
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Preview Mode */}
      {previewMode && (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hero Slides Preview
            </h2>
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative h-64 md:h-80 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
            {slides.filter(slide => slide.enabled).length > 0 ? (
              <div className="swiper-container h-full">
                <div className="swiper-wrapper">
                  {slides
                    .filter(slide => slide.enabled)
                    .map((slide, index) => (
                      <div key={slide.id} className="swiper-slide h-full relative">
                        <img 
                          src={slide.image} 
                          alt={slide.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center p-8">
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {slide.title}
                          </h3>
                          <p className="text-xl text-white/90 mb-4">
                            {slide.subtitle}
                          </p>
                          {slide.cta_text && (
                            <button type="button" className="btn-primary w-max">
                              {slide.cta_text}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No enabled slides to preview</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide Form */}
      {formMode && (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formMode === 'add' ? 'Add New Slide' : 'Edit Slide'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setFormMode(null);
                setCurrentSlide({
                  image: '',
                  title: '',
                  subtitle: '',
                  cta_text: '',
                  cta_link: '',
                  enabled: true,
                  order: 0
                });
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Image <span className="text-red-500">*</span>
              </label>
              
              {/* Image upload section */}
              <div className="space-y-3">
                {/* File upload option */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn-secondary flex items-center"
                  >
                    {uploading ? (
                      <LoaderSpinner size="sm" color="blue" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
                </div>
                
                {/* URL input option */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="image"
                      value={currentSlide.image || ''}
                      onChange={handleInputChange}
                      required
                      className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Recommended size: 1920x800px. Use high-quality images for best results.
              </p>
              
              {currentSlide.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preview:</p>
                  <div className="w-full h-40 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={currentSlide.image}
                      alt="Slide preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/1920x800?text=Image+Error';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Heading className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={currentSlide.title || ''}
                    onChange={handleInputChange}
                    required
                    maxLength={60}
                    className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder="Main Heading"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {currentSlide.title?.length || 0}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                  Subtitle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlignLeft className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="subtitle"
                    value={currentSlide.subtitle || ''}
                    onChange={handleInputChange}
                    required
                    maxLength={60}
                    className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder="Subtitle Text"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {currentSlide.subtitle?.length || 0}/60 characters
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                  Call-to-Action Text
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="cta_text"
                    value={currentSlide.cta_text || ''}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder="e.g. Shop Now"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                  Call-to-Action Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="cta_link"
                    value={currentSlide.cta_link || ''}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder="e.g. /products"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="enabled"
                name="enabled"
                type="checkbox"
                checked={currentSlide.enabled}
                onChange={(e) => setCurrentSlide(prev => ({ ...prev, enabled: e.target.checked }))}
                className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300 rounded"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700 dark:text-soft-gray">
                Enable this slide
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center"
              >
                {submitting ? (
                  <LoaderSpinner size="sm" color="blue" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {formMode === 'add' ? 'Create Slide' : 'Update Slide'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        {!formMode && (
          <button
            type="button"
            onClick={() => {
              setCurrentSlide({
                image: '',
                title: '',
                subtitle: '',
                cta_text: '',
                cta_link: '',
                enabled: true,
                order: slides.length + 1
              });
              setFormMode('add');
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Slide
          </button>
        )}
        
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="btn-secondary flex items-center"
        >
          {previewMode ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Close Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Preview Slides
            </>
          )}
        </button>
      </div>

      {/* Slides List */}
      <div className="bg-white dark:bg-light-navy rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Hero Slides
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Drag and drop to reorder slides. The order here determines the display order on the homepage.
          </p>
        </div>

        {slides.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Hero Slides Found
            </h3>
            <p className="text-gray-600 dark:text-soft-gray mb-4">
              Get started by adding your first hero slide.
            </p>
            {!formMode && (
              <button
                type="button"
                onClick={() => {
                  setCurrentSlide({
                    image: '',
                    title: '',
                    subtitle: '',
                    cta_text: '',
                    cta_link: '',
                    enabled: true,
                    order: 1
                  });
                  setFormMode('add');
                }}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Hero Slide
              </button>
            )}
          </div>
        ) : (
          <div className="p-6">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="hero-slides">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {slides.map((slide, index) => (
                      <Draggable key={slide.id} draggableId={slide.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-gray-50 dark:bg-dark-navy rounded-lg overflow-hidden border ${
                              slide.enabled 
                                ? 'border-gray-200 dark:border-gray-700' 
                                : 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* Drag handle */}
                              <div 
                                {...provided.dragHandleProps}
                                className="p-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 cursor-move"
                                title="Drag to reorder"
                              >
                                <Move className="w-5 h-5 text-gray-500" />
                              </div>
                              
                              <div className="md:w-1/3 h-40 overflow-hidden">
                                <img
                                  src={slide.image}
                                  alt={slide.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Error';
                                  }}
                                />
                              </div>
                              <div className="p-4 md:w-2/3 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {slide.title}
                                      </h3>
                                      <p className="text-gray-600 dark:text-soft-gray mt-1">
                                        {slide.subtitle}
                                      </p>
                                      {(slide.cta_text || slide.cta_link) && (
                                        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                          <LinkIcon className="w-4 h-4 mr-1" />
                                          {slide.cta_text ? slide.cta_text : 'No CTA text'} 
                                          {slide.cta_link && <span className="ml-1">→ {slide.cta_link}</span>}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center">
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        slide.enabled 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      }`}>
                                        {slide.enabled ? 'Enabled' : 'Disabled'}
                                      </span>
                                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                        Order: {slide.order}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-4">
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveUp(index)}
                                      disabled={index === 0}
                                      className={`p-1 rounded ${
                                        index === 0
                                          ? 'text-gray-400 cursor-not-allowed'
                                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                      }`}
                                      title="Move up"
                                    >
                                      <ArrowUp className="w-5 h-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveDown(index)}
                                      disabled={index === slides.length - 1}
                                      className={`p-1 rounded ${
                                        index === slides.length - 1
                                          ? 'text-gray-400 cursor-not-allowed'
                                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                      }`}
                                      title="Move down"
                                    >
                                      <ArrowDown className="w-5 h-5" />
                                    </button>
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleEnabled(slide.id, slide.enabled)}
                                      className={`p-1 rounded ${
                                        slide.enabled
                                          ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                          : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                                      }`}
                                      title={slide.enabled ? 'Disable slide' : 'Enable slide'}
                                    >
                                      {slide.enabled ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(slide);
                                      }}
                                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                      title="Edit slide"
                                    >
                                      <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(slide.id);
                                      }}
                                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      title="Delete slide"
                                    >
                                      <Trash className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSlideManagement;