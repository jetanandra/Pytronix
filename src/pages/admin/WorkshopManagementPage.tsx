import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  Calendar, 
  Users, 
  Clock, 
  Eye, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  XSquare
} from 'lucide-react';
import { getAllWorkshops, deleteWorkshop } from '../../services/workshopService';
import { Workshop } from '../../types';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';

interface SortConfig {
  key: keyof Workshop;
  direction: 'ascending' | 'descending';
}

const WorkshopManagementPage: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'descending'
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch workshops
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const data = await getAllWorkshops();
        setWorkshops(data);
        setFilteredWorkshops(data);
      } catch (error) {
        console.error('Error fetching workshops:', error);
        setError('Failed to load workshops. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Filter workshops when filters change
  useEffect(() => {
    let result = [...workshops];
    
    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(workshop => workshop.category === categoryFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(workshop => 
        workshop.title.toLowerCase().includes(query) || 
        workshop.short_description.toLowerCase().includes(query)
      );
    }
    
    // Sort workshops
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredWorkshops(result);
  }, [workshops, searchQuery, categoryFilter, sortConfig]);

  const handleDeleteWorkshop = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workshop? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingId(id);
      await deleteWorkshop(id);
      setWorkshops(prevWorkshops => prevWorkshops.filter(workshop => workshop.id !== id));
      toast.success('Workshop deleted successfully');
    } catch (error) {
      console.error('Error deleting workshop:', error);
      toast.error('Failed to delete workshop');
    } finally {
      setDeletingId(null);
    }
  };

  const requestSort = (key: keyof Workshop) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(workshops.map(workshop => workshop.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Workshop Management
      </h1>

      {/* Filters and Search */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search workshops..."
            className="pl-10 w-full md:w-80 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <Link to="/admin/workshops/new" className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Workshop
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Error Loading Workshops
          </h3>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            No Workshops Found
          </h3>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            {searchQuery || categoryFilter !== 'all'
              ? "No workshops match your search criteria. Try adjusting your filters."
              : "There are no workshops in the system yet."}
          </p>
          {(searchQuery || categoryFilter !== 'all') ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/admin/workshops/new" className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add New Workshop
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-navy">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => requestSort('title')}
                    >
                      Workshop
                      {sortConfig.key === 'title' && (
                        sortConfig.direction === 'ascending'
                          ? <ArrowUp className="w-4 h-4 ml-1" />
                          : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => requestSort('category')}
                    >
                      Category
                      {sortConfig.key === 'category' && (
                        sortConfig.direction === 'ascending'
                          ? <ArrowUp className="w-4 h-4 ml-1" />
                          : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => requestSort('is_featured')}
                    >
                      Featured
                      {sortConfig.key === 'is_featured' && (
                        sortConfig.direction === 'ascending'
                          ? <ArrowUp className="w-4 h-4 ml-1" />
                          : <ArrowDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-light-navy divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWorkshops.map((workshop) => (
                  <tr key={workshop.id} className="hover:bg-gray-50 dark:hover:bg-dark-navy/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={workshop.image} 
                            alt={workshop.title} 
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/40x40?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {workshop.title}
                          </div>
                          <Link 
                            to={`/workshop/${workshop.id}`}
                            className="text-xs text-neon-blue hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View workshop
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {workshop.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-soft-gray">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {workshop.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 dark:text-soft-gray">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        {workshop.capacity} participants
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workshop.is_featured ? (
                        <CheckSquare className="w-5 h-5 text-green-500" />
                      ) : (
                        <XSquare className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/workshops/edit/${workshop.id}`}
                          className="text-neon-blue hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/workshop/${workshop.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteWorkshop(workshop.id)}
                          disabled={deletingId === workshop.id}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          {deletingId === workshop.id ? (
                            <LoaderSpinner size="sm" color="red" />
                          ) : (
                            <Trash className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopManagementPage;