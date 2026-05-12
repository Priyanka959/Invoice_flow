import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-navy-900 border border-navy-800 rounded-lg shadow-2xl animate-in fade-in zoom-in duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800">
          <h3 className="text-sm font-bold uppercase tracking-widest italic text-white leading-none">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-navy-700 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
