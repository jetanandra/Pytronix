import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { getWorkshopById, getAllWorkshops, submitWorkshopRequest } from '../services/workshopService';
import { Workshop, WorkshopRequest } from '../types';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const WorkshopRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get('workshop');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<WorkshopRequest>({
    institution_name: '',
    institution_type: 'school',
    contact_name: '',
    contact_email: user?.email || '',
    contact_phone: '',
    workshop_id: workshopId || '',
    preferred_dates: [],
    participants: 20,
    additional_requirements: '',
    status: 'pending',
    user_id: user?.id || '',
  });
  
  // Date picker state
  const [dateInput, setDateInput] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const workshopsData = await getAllWorkshops();
        setWorkshops(workshopsData);
        
        // If user is logged in, pre-fill contact info and user_id
        if (user) {
          setFormData(prev => ({
            ...prev,
            contact_email: user.email || prev.contact_email,
            contact_name: user.user_metadata?.full_name || prev.contact_name,
            contact_phone: user.user_metadata?.phone || prev.contact_phone,
            user_id: user.id,
          }));
        }
      } catch (error) {
        console.error('Error fetching workshops:', error);
        toast.error('Failed to load workshop data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [workshopId, user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddDate = () => {
    if (!dateInput) return;
    
    const newDate = new Date(dateInput);
    if (isNaN(newDate.getTime())) {
      toast.error('Please enter a valid date');
      return;
    }
    
    // Format date as YYYY-MM-DD
    const formattedDate = newDate.toISOString().split('T')[0];
    
    // Check if date already exists
    if (formData.preferred_dates.includes(formattedDate)) {
      toast.error('This date is already added');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      preferred_dates: [...prev.preferred_dates, formattedDate]
    }));
    
    setDateInput('');
  };
  
  const handleRemoveDate = (dateToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_dates: prev.preferred_dates.filter(date => date !== dateToRemove)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.institution_name || !formData.contact_name || !formData.contact_email || 
        !formData.contact_phone || !formData.workshop_id || formData.preferred_dates.length === 0) {
      toast.error('Please fill in all required fields and add at least one preferred date');
      return;
    }
    if (!formData.user_id) {
      toast.error('You must be logged in to submit a workshop request.');
      return;
    }
    try {
      setSubmitting(true);
      await submitWorkshopRequest(formData);
      setSuccess(true);
      toast.success('Workshop request submitted successfully!');
      
      // Reset form
      setFormData({
        institution_name: '',
        institution_type: 'school',
        contact_name: '',
        contact_email: user?.email || '',
        contact_phone: '',
        workshop_id: '',
        preferred_dates: [],
        participants: 20,
        additional_requirements: '',
        status: 'pending',
        user_id: user?.id || '',
      });
    } catch (error) {
      console.error('Error submitting workshop request:', error);
      toast.error('Failed to submit workshop request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-12">
        <div className="container-custom max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-light-navy rounded-xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Workshop Request Submitted!
            </h2>
            <p className="text-gray-600 dark:text-soft-gray mb-8">
              Thank you for your interest in our workshops. Our team will review your request and get back to you within 2 business days to discuss details and availability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/workshops')}
                className="btn-secondary"
              >
                Explore More Workshops
              </button>
              <button
                onClick={() => setSuccess(false)}
                className="btn-primary"
              >
                Submit Another Request
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-orbitron">
              Workshop Request Form
            </h1>
            <p className="text-gray-600 dark:text-soft-gray max-w-2xl mx-auto">
              Fill out the form below to request a workshop for your institution or organization. Our team will contact you to discuss details and availability.
            </p>
          </div>
          
          <div className="bg-white dark:bg-light-navy rounded-xl shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {/* Institution Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-neon-blue" />
                  Institution Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="institution_name" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Institution Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="institution_name"
                      name="institution_name"
                      value={formData.institution_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      placeholder="e.g. Delhi Public School"
                    />
                  </div>
                  <div>
                    <label htmlFor="institution_type" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Institution Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="institution_type"
                      name="institution_type"
                      value={formData.institution_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    >
                      <option value="school">School</option>
                      <option value="college">College/University</option>
                      <option value="corporate">Corporate</option>
                      <option value="ngo">NGO/Non-profit</option>
                      <option value="government">Government Organization</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Contact Person Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-neon-blue" />
                  Contact Person Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_name"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="contact_email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                        placeholder="e.g. john.doe@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        id="contact_phone"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                        placeholder="e.g. +91 9876543210"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Workshop Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-neon-blue" />
                  Workshop Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="workshop_id" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Select Workshop <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="workshop_id"
                      name="workshop_id"
                      value={formData.workshop_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    >
                      <option value="">Select a workshop</option>
                      {workshops.map(workshop => (
                        <option key={workshop.id} value={workshop.id}>
                          {workshop.title} ({workshop.duration})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="preferred_dates" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Preferred Dates <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        id="preferred_dates"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAddDate}
                        className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Add Date
                      </button>
                    </div>
                    {formData.preferred_dates.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.preferred_dates.map((date, index) => (
                          <div 
                            key={index} 
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center"
                          >
                            {new Date(date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            <button
                              type="button"
                              onClick={() => handleRemoveDate(date)}
                              className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Please add at least one preferred date for the workshop
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="participants" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Number of Participants <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        id="participants"
                        name="participants"
                        value={formData.participants}
                        onChange={handleInputChange}
                        min="5"
                        max="100"
                        required
                        className="w-full pl-10 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Minimum 5, maximum 100 participants
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="additional_requirements" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Additional Requirements or Comments
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        id="additional_requirements"
                        name="additional_requirements"
                        value={formData.additional_requirements}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full pl-10 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                        placeholder="Any specific requirements, questions, or comments about the workshop..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Professional Contact Information */}
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Need Immediate Assistance?</p>
                  <p className="mb-1">If you have any questions or require urgent support regarding workshop requests, feel free to reach out to us directly. Our team is always happy to assist you.</p>
                  <ul className="list-none pl-0 mt-2">
                    <li><span className="font-semibold">Phone:</span> <a href="tel:+919876543210" className="text-neon-blue hover:underline">+91 98765 43210</a></li>
                    <li><span className="font-semibold">Email:</span> <a href="mailto:contact@phytronix.com" className="text-neon-blue hover:underline">contact@phytronix.com</a></li>
                  </ul>
                  <p className="mt-2">You can call us during business hours for a prompt response. We look forward to supporting your institution's learning journey!</p>
                </div>
              </div>
              
              {/* Information Notice */}
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Important Information</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Workshop dates are subject to instructor availability</li>
                    <li>Minimum 5 participants required for booking</li>
                    <li>Our team will contact you within 2 business days</li>
                    <li>Customization options are available upon request</li>
                  </ul>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  {submitting ? (
                    <LoaderSpinner size="sm" color="blue" />
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopRequestPage;