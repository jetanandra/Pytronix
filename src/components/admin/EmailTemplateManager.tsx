import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Eye, 
  EyeOff,
  Mail,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import emailTemplates from '../../services/emailTemplates';
import { sendEmail } from '../../services/emailService';
import LoaderSpinner from '../ui/LoaderSpinner';

interface EmailTemplateManagerProps {
  onClose: () => void;
}

const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({ onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('orderConfirmation');
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [testEmail, setTestEmail] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Load the selected template
  useEffect(() => {
    const template = emailTemplates[selectedTemplate as keyof typeof emailTemplates];
    if (template) {
      setTemplateHtml(template);
    }
  }, [selectedTemplate]);
  
  // Handle template change
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplate(e.target.value);
  };
  
  // Handle template HTML change
  const handleTemplateHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplateHtml(e.target.value);
  };
  
  // Handle save template
  const handleSaveTemplate = () => {
    // In a real implementation, this would save to a database or file
    // For this demo, we'll just show a success message
    setSaving(true);
    
    setTimeout(() => {
      setSaving(false);
      toast.success('Template saved successfully');
    }, 1000);
  };
  
  // Handle send test email
  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }
    
    setSending(true);
    
    try {
      // Prepare test data based on template type
      const testData: Record<string, any> = {
        to_email: testEmail,
        customer_name: 'Test Customer',
        order_id: 'TEST12345',
        order_date: new Date().toLocaleDateString(),
        order_total: '₹1,499.00',
        payment_method: 'Credit Card',
        shipping_address: '123 Test Street, Test City, Test State 123456, India',
        order_items: JSON.stringify([
          { name: 'Test Product 1', quantity: 1, price: 999 },
          { name: 'Test Product 2', quantity: 2, price: 250 }
        ]),
        order_status: 'Processing',
        order_link: `${window.location.origin}/orders/test`,
        estimated_delivery: 'Monday, June 10, 2025',
        tracking_id: 'TRK123456789',
        shipping_carrier: 'Test Carrier',
        tracking_url: `${window.location.origin}/track`,
        payment_id: 'PAY123456789',
        payment_date: new Date().toLocaleDateString(),
        payment_amount: '₹1,499.00',
        cancellation_date: new Date().toLocaleDateString(),
        cancellation_reason: 'Test cancellation reason',
        refund_message: 'Your refund of ₹1,499.00 will be processed within 5-7 business days.',
        delivery_date: new Date().toLocaleDateString(),
        review_link: `${window.location.origin}/review/test`,
        cart_items: JSON.stringify([
          { name: 'Test Product 1', quantity: 1, price: 999, image: 'https://via.placeholder.com/60' },
          { name: 'Test Product 2', quantity: 2, price: 250, image: 'https://via.placeholder.com/60' }
        ]),
        cart_total: '₹1,499.00',
        cart_link: `${window.location.origin}/cart`,
        expiry_time: '48 hours',
        feedback_link: `${window.location.origin}/feedback/test`,
        login_link: `${window.location.origin}/login`,
        products_link: `${window.location.origin}/products`,
        support_email: 'support@phytronix.com',
        support_phone: '+91 9876 543 210',
        reset_link: `${window.location.origin}/reset-password?token=test`,
        expiry_time: '1 hour',
        contact_name: 'Test Contact',
        institution_name: 'Test Institution',
        institution_type: 'School',
        workshop_title: 'Test Workshop',
        preferred_dates: 'June 15, 2025, June 20, 2025',
        participants: '25',
        additional_requirements: 'Test requirements',
        request_date: new Date().toLocaleDateString(),
        estimated_response_time: '2-3 business days',
        request_status: 'approved',
        admin_response: 'Your workshop request has been approved.',
        next_steps: 'Our team will contact you shortly to finalize the details.'
      };
      
      // Send the test email
      const success = await sendEmail(testData, `template_${selectedTemplate}`);
      
      if (success) {
        toast.success(`Test email sent to ${testEmail}`);
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Error sending test email');
    } finally {
      setSending(false);
    }
  };
  
  // Handle copy template
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(templateHtml);
    toast.success('Template copied to clipboard');
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-light-navy rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-neon-blue mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Template Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-grow overflow-auto p-4 flex flex-col md:flex-row gap-4">
          {/* Left side - Controls */}
          <div className="w-full md:w-1/3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
              >
                <option value="orderConfirmation">Order Confirmation</option>
                <option value="paymentConfirmation">Payment Confirmation</option>
                <option value="orderShipped">Order Shipped</option>
                <option value="orderDelivered">Order Delivered</option>
                <option value="orderCancelled">Order Cancelled</option>
                <option value="abandonedCart">Abandoned Cart</option>
                <option value="feedbackRequest">Feedback Request</option>
                <option value="welcome">Welcome Email</option>
                <option value="passwordReset">Password Reset</option>
                <option value="workshopRequest">Workshop Request</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Send Test Email
              </label>
              <div className="flex">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter test email address"
                  className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-l-lg"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={sending || !testEmail}
                  className="px-4 py-2 bg-neon-blue text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {sending ? <LoaderSpinner size="sm" color="blue" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="btn-secondary flex items-center justify-center"
              >
                {previewMode ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Edit Mode
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Mode
                  </>
                )}
              </button>
              
              <button
                onClick={handleCopyTemplate}
                className="btn-secondary flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Template
              </button>
              
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="btn-primary flex items-center justify-center"
              >
                {saving ? (
                  <LoaderSpinner size="sm" color="blue" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Template Variables
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200 mb-2">
                Use these variables in your templates:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-200 space-y-1 list-disc pl-5">
                <li>{'{{customer_name}}'}</li>
                <li>{'{{order_id}}'}</li>
                <li>{'{{order_date}}'}</li>
                <li>{'{{order_total}}'}</li>
                <li>{'{{shipping_address}}'}</li>
                <li>{'{{order_status}}'}</li>
                <li>{'{{tracking_id}}'}</li>
                <li>{'{{company_logo}}'}</li>
                <li>{'{{website_url}}'}</li>
                <li>{'{{current_year}}'}</li>
              </ul>
            </div>
          </div>
          
          {/* Right side - Template Editor/Preview */}
          <div className="w-full md:w-2/3 h-[500px] overflow-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            {previewMode ? (
              <div className="h-full">
                <iframe
                  srcDoc={templateHtml}
                  title="Email Template Preview"
                  className="w-full h-full"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <textarea
                value={templateHtml}
                onChange={handleTemplateHtmlChange}
                className="w-full h-full p-4 bg-white dark:bg-dark-navy text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none"
              />
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              Auto-saving enabled
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60"
            >
              Close
            </button>
            <button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <LoaderSpinner size="sm" color="blue" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;