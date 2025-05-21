import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  Save, 
  X, 
  AlertTriangle,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getWorkshopCategories, 
  createWorkshopCategory, 
  updateWorkshopCategory, 
  deleteWorkshopCategory,
  getAllWorkshops
} from '../../services/workshopService';
import { WorkshopCategory, Workshop } from '../../types';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';

const WorkshopCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<WorkshopCategory[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Partial<WorkshopCategory>>({
    name: '',
    description: '',
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, workshopsData] = await Promise.all([
        getWorkshopCategories(),
        getAllWorkshops()
      ]);
      
      // Calculate workshop count for each category
      const categoriesWithCount = categoriesData.map(category => {
        const count = workshopsData.filter(workshop => 
          workshop.category_id === category.id || 
          workshop.category === category.name
        ).length;
        
        return {
          ...category,
          workshop_count: count
        };
      });
      
      setCategories(categoriesWithCount);
      setWorkshops(workshopsData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCategory.name || !currentCategory.description || !currentCategory.image) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (formMode === 'add') {
        await createWorkshopCategory({
          name: currentCategory.name!,
          description: currentCategory.description!,
          image: currentCategory.image!
        });
        toast.success('Category created successfully');
      } else if (formMode === 'edit' && currentCategory.id) {
        await updateWorkshopCategory(currentCategory.id, {
          name: currentCategory.name,
          description: currentCategory.description,
          image: currentCategory.image
        });
        toast.success('Category updated successfully');
      }
      
      // Reset form and refresh data
      setFormMode(null);
      setCurrentCategory({ name: '', description: '', image: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: WorkshopCategory) => {
    setCurrentCategory(category);
    setFormMode('edit');
  };

  const handleDelete = async (id: string) => {
    // Check if category has associated workshops
    const workshopsInCategory = workshops.filter(w => 
      w.category_id === id || 
      w.category === categories.find(c => c.id === id)?.name
    );
    
    if (workshopsInCategory.length > 0) {
      toast.error(`Cannot delete category with ${workshopsInCategory.length} associated workshops`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setLoading(true);
        await deleteWorkshopCategory(id);
        toast.success('Category deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <Layers className="w-6 h-6 mr-2 text-neon-blue" />
        Workshop Categories
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Category Form */}
      {formMode && (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formMode === 'add' ? 'Add New Category' : 'Edit Category'}
            </h2>
            <button
              onClick={() => {
                setFormMode(null);
                setCurrentCategory({ name: '', description: '', image: '' });
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={currentCategory.name || ''}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="e.g. Robotics & AI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={currentCategory.description || ''}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="Brief description of this category..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Image URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="image"
                    value={currentCategory.image || ''}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              {currentCategory.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preview:</p>
                  <div className="w-32 h-32 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={currentCategory.image}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                      }}
                    />
                  </div>
                </div>
              )}
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
                    {formMode === 'add' ? 'Create Category' : 'Update Category'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white dark:bg-light-navy rounded-lg shadow-md overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Categories
          </h2>
          {!formMode && (
            <button
              onClick={() => {
                setCurrentCategory({ name: '', description: '', image: '' });
                setFormMode('add');
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 dark:text-soft-gray mb-4">
              Get started by adding your first workshop category.
            </p>
            {!formMode && (
              <button
                onClick={() => {
                  setCurrentCategory({ name: '', description: '', image: '' });
                  setFormMode('add');
                }}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-50 dark:bg-dark-navy rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x150?text=Image+Error';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                        {category.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <Layers className="w-4 h-4 mr-1" />
                        <span>{category.workshop_count || 0} workshops</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`p-1 ${
                          category.workshop_count && category.workshop_count > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                        }`}
                        disabled={category.workshop_count && category.workshop_count > 0}
                        title={
                          category.workshop_count && category.workshop_count > 0
                            ? 'Cannot delete category with workshops'
                            : 'Delete category'
                        }
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-soft-gray text-sm line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopCategoryManagement;