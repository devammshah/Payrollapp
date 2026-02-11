
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { NotificationType } from '../types';

interface SnackbarProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-teal-600 text-white border-teal-500 shadow-teal-500/20',
    error: 'bg-red-600 text-white border-red-500 shadow-red-500/20',
    info: 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20',
  };

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-xl ${styles[type]}`}>
        <div className="shrink-0">{icons[type]}</div>
        <div className="flex-1 text-sm font-semibold pr-2">{message}</div>
        <button 
          onClick={onClose}
          className="shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
