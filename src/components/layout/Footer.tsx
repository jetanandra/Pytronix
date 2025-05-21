import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-light-navy pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-orbitron font-bold mb-4 text-neon-blue dark:text-neon-blue">
              PHYTRONIX
            </h3>
            <p className="text-gray-600 dark:text-soft-gray mb-4">
              Your one-stop destination for electronics and IoT components across India. Serving engineers, hobbyists, and makers with quality tech solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/1AZxTjRcGB/?mibextid=wwXIfr" aria-label="Facebook" className="text-gray-500 hover:text-neon-blue dark:text-gray-400 dark:hover:text-neon-blue transition">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-neon-blue dark:text-gray-400 dark:hover:text-neon-blue transition">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-neon-blue dark:text-gray-400 dark:hover:text-neon-blue transition">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-500 hover:text-neon-blue dark:text-gray-400 dark:hover:text-neon-blue transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-orbitron font-bold mb-4 text-gray-800 dark:text-soft-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/workshops" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  Workshops
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-orbitron font-bold mb-4 text-gray-800 dark:text-soft-white">
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  Warranty
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-orbitron font-bold mb-4 text-gray-800 dark:text-soft-white">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-neon-blue mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-soft-gray">
                  Nakari-2, Glob House, Phytronix <br />
                  North Lakhimpur 787001, India
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-neon-blue mr-2 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  +91 9876 543 210
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-neon-blue mr-2 flex-shrink-0" />
                <a href="mailto:support@phytronix.com" className="text-gray-600 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  support@phytronix.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Phytronix. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="Visa" className="h-8 w-auto" />
              <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" className="h-8 w-auto" />
              <img src="https://cdn-icons-png.flaticon.com/512/196/196539.png" alt="American Express" className="h-8 w-auto" />
              <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" alt="PayPal" className="h-8 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;