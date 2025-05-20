import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Plus, Trash, Save, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { Product, ProductSpecification, Category } from '../../types';
import { createProduct, getProductById, updateProduct, getAllCategories } from '../../services/productService';
import ReactMarkdown from 'react-markdown';

interface ProductFormProps {
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<'write' | 'preview'>('write');
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discount_price: undefined,
    image: '',
    images: [],
    category_id: '',
    tags: [],
    stock: 0,
    full_description: '',
    specifications: {},
    warranty_info: ''
  });
  const [tagInput, setTagInput] = useState<string>('');
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([
    { key: '', value: '' }
  ]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const productData = await getProductById(id);
          if (productData) {
            setProduct(productData);
            
            // Convert specifications object to array format for editing
            if (productData.specifications) {
              const specsArray = Object.entries(productData.specifications).map(
                ([key, value]) => ({ key, value: value as string })
              );
              setSpecifications(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
            }
          } else {
            toast.error('Product not found');
            navigate('/admin');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error('Failed to load product data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id, isEdit, navigate]);

  // Fetch categories from the new table
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'discount_price' || name === 'stock') {
      setProduct({ ...product, [name]: Number(value) });
    } else if (name === 'category_id') {
      setProduct({ ...product, category_id: value });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      const currentTags = product.tags || [];
      if (!currentTags.includes(tagInput.trim().toLowerCase())) {
        setProduct({
          ...product,
          tags: [...currentTags, tagInput.trim().toLowerCase()]
        });
      }
      setTagInput('');
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProduct({
      ...product,
      tags: (product.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedSpecifications = [...specifications];
    updatedSpecifications[index][field] = value;
    setSpecifications(updatedSpecifications);
  };

  const handleRemoveSpecification = (index: number) => {
    if (specifications.length > 1) {
      const updatedSpecifications = [...specifications];
      updatedSpecifications.splice(index, 1);
      setSpecifications(updatedSpecifications);
    }
  };

  const handleAddImageUrl = () => {
    const currentImages = product.images || [];
    if (currentImages.length < 5) {
      setProduct({
        ...product,
        images: [...currentImages, '']
      });
    } else {
      toast.error('Maximum 5 images allowed');
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const currentImages = [...(product.images || [])];
    currentImages[index] = value;
    setProduct({
      ...product,
      images: currentImages
    });
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = [...(product.images || [])];
    currentImages.splice(index, 1);
    setProduct({
      ...product,
      images: currentImages
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!product.name || !product.description || !product.price || !product.image || !product.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Convert specifications array to object
    const specificationsObject: Record<string, string> = {};
    specifications.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specificationsObject[spec.key.trim()] = spec.value.trim();
      }
    });
    
    try {
      setLoading(true);
      
      const productData = {
        ...product,
        specifications: specificationsObject
      };
      
      if (isEdit && id) {
        await updateProduct(id, productData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData as Omit<Product, 'id' | 'created_at'>);
        toast.success('Product added successfully');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
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
            onClick={() => navigate('/admin/products')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-navy transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-soft-gray" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        
        <button
          type="submit"
          form="product-form"
          disabled={loading}
          className="btn-primary flex items-center"
        >
          {loading ? (
            <LoaderSpinner size="sm" color="blue" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Product
            </>
          )}
        </button>
      </div>
      
      <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="e.g. Arduino Uno R3"
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={product.category_id || ''}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {/* Optionally show image preview for selected category */}
              {product.category_id && categories.find(c => c.id === product.category_id)?.image && (
                <img src={categories.find(c => c.id === product.category_id)?.image} alt="Category" className="mt-2 w-16 h-16 object-cover rounded" />
              )}
            </div>
            
            {/* Short Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                placeholder="Brief product description (1-2 sentences)"
              />
            </div>
            
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              />
            </div>
            
            {/* Discount Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                name="discount_price"
                value={product.discount_price || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty if no discount
              </p>
            </div>
            
            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              />
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Tags
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={handleTagKeyPress}
                  className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-l-lg"
                  placeholder="Enter tags and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-soft-gray rounded-r-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
              
              {/* Display tags */}
              <div className="flex flex-wrap mt-2 gap-2">
                {product.tags && product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Images */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Product Images
          </h2>
          
          {/* Main Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
              Main Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="image"
              value={product.image}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
            
            {product.image && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">Preview:</p>
                <div className="w-full h-40 bg-gray-100 dark:bg-dark-navy rounded-lg overflow-hidden">
                  <img
                    src={product.image}
                    alt="Product main"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Additional Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray">
                Additional Images (Max 5)
              </label>
              <button
                type="button"
                onClick={handleAddImageUrl}
                disabled={(product.images?.length || 0) >= 5}
                className={`text-sm flex items-center ${
                  (product.images?.length || 0) >= 5
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                }`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Image
              </button>
            </div>
            
            <div className="space-y-3">
              {product.images?.map((image, index) => (
                <div key={index} className="flex items-start gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder={`Additional Image URL ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {product.images.map((image, index) => (
                  image && (
                    <div key={index} className="bg-gray-100 dark:bg-dark-navy rounded-lg overflow-hidden h-24">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                        }}
                      />
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Full Description (Markdown) */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Full Description (Markdown)
          </h2>
          
          <div className="mb-4">
            <div className="flex items-center mb-2 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setPreviewTab('write')}
                className={`px-4 py-2 font-medium text-sm ${
                  previewTab === 'write'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-600 dark:text-soft-gray'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-4 py-2 font-medium text-sm ${
                  previewTab === 'preview'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-600 dark:text-soft-gray'
                }`}
              >
                Preview
              </button>
            </div>
            
            {previewTab === 'write' ? (
              <textarea
                name="full_description"
                value={product.full_description || ''}
                onChange={handleInputChange}
                rows={15}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm"
                placeholder={`# Product Features\n\n- Feature 1\n- Feature 2\n\n## Package Includes\n\n- Item 1\n- Item 2\n\n## Return Policy\n\n30-day return policy...`}
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-dark-navy p-4 rounded-lg border border-gray-300 dark:border-gray-700 min-h-[20rem] overflow-auto">
                {product.full_description ? (
                  <ReactMarkdown>{product.full_description}</ReactMarkdown>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No content to preview</p>
                )}
              </div>
            )}
            
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Use Markdown to format the description. You can add headers, lists, bold text, and more.
            </p>
          </div>
        </div>
        
        {/* Specifications Table */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Specifications
            </h2>
            <button
              type="button"
              onClick={handleAddSpecification}
              className="text-sm flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Specification
            </button>
          </div>
          
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-navy">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Specification
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-light-navy divide-y divide-gray-200 dark:divide-gray-700">
                {specifications.map((spec, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                        className="w-full px-3 py-1 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded"
                        placeholder="e.g. Item Type"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                        className="w-full px-3 py-1 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded"
                        placeholder="e.g. Breadboard, Solderless Type"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecification(index)}
                        disabled={specifications.length <= 1}
                        className={`${
                          specifications.length <= 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-500 hover:text-red-700 dark:hover:text-red-400'
                        }`}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="mt-4 text-sm text-gray-600 dark:text-soft-gray">
            These specifications will be displayed in a table format on the product page.
          </p>
        </div>
        
        {/* Warranty and Return Policy */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Warranty & Return Policy
          </h2>
          
          <textarea
            name="warranty_info"
            value={product.warranty_info || ''}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            placeholder="Describe warranty, return and refund policies for this product..."
          />
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Include details about warranty duration, what's covered, return window, and refund conditions.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;