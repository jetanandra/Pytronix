import React from 'react';
import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ModalProps {
  open: boolean;
  type: 'error' | 'info' | 'success' | 'warning';
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ open, type, message, onClose }) => {
  if (!open) return null;

  let icon, title, colorClass;
  switch (type) {
    case 'success':
      icon = <CheckCircle className="w-10 h-10 text-green-500" />;
      title = 'Success!';
      colorClass = 'text-green-600';
      break;
    case 'warning':
      icon = <AlertTriangle className="w-10 h-10 text-yellow-500" />;
      title = 'Warning';
      colorClass = 'text-yellow-600';
      break;
    case 'info':
      icon = <Info className="w-10 h-10 text-blue-500" />;
      title = 'Notice';
      colorClass = 'text-blue-600';
      break;
    case 'error':
    default:
      icon = <XCircle className="w-10 h-10 text-red-500" />;
      title = 'Oops, something’s not right.';
      colorClass = 'text-red-600';
      break;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-navy rounded-xl shadow-2xl p-8 max-w-sm w-full relative animate-fadeInUp border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center">
          {icon}
          <div className={`mt-4 text-lg font-semibold text-gray-900 dark:text-white text-center ${colorClass}`}>
            {title}
          </div>
          <div className="mt-2 text-gray-600 dark:text-gray-300 text-center">
            {message}
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 rounded-lg bg-neon-blue text-white font-semibold shadow hover:bg-blue-600 transition"
            autoFocus
          >
            OK
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
          aria-label="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default Modal; 