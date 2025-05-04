import React, { useEffect, useState } from 'react';
import { getAllCategories, createCategory, deleteCategory } from '../../services/productService';
import { Category } from '../../types';
import { toast } from 'react-hot-toast';
import LoaderSpinner from '../../components/ui/LoaderSpinner';

const AdminCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (e) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSubmitting(true);
    try {
      await createCategory({ name: name.trim(), image });
      setName('');
      setImage('');
      toast.success('Category created');
      fetchCategories();
    } catch (e) {
      toast.error('Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    setSubmitting(true);
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (e) {
      toast.error('Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Category Management</h1>
      <form onSubmit={handleCreate} className="bg-white dark:bg-light-navy rounded-lg shadow p-6 mb-8 max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">Category Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            placeholder="e.g. Sensors & Modules"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">Image URL</label>
          <input
            type="text"
            value={image}
            onChange={e => setImage(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            placeholder="https://..."
          />
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Category'}
        </button>
      </form>
      <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Existing Categories</h2>
        {loading ? (
          <LoaderSpinner size="md" />
        ) : categories.length === 0 ? (
          <p className="text-gray-600 dark:text-soft-gray">No categories found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center bg-gray-50 dark:bg-dark-navy rounded-lg p-4">
                {cat.image && (
                  <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded object-cover mr-4 border border-gray-200 dark:border-gray-700" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{cat.name}</div>
                  <div className="text-xs text-gray-500 dark:text-soft-gray">{cat.id}</div>
                </div>
                <button
                  className="ml-4 btn-secondary text-xs px-3 py-1"
                  onClick={() => handleDelete(cat.id)}
                  disabled={submitting}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoryPage; 