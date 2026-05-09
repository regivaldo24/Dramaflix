import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

export default function AdminConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName,
  confirmText = 'Confirmar',
  variant = 'danger',
  isProcessing = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isProcessing?: boolean;
}) {
  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    info: 'bg-blue-600 hover:bg-blue-700 text-white'
  };

  const iconColors = {
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#18181A] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto border ${iconColors[variant]}`}>
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-white text-center mb-2">
                {title}
              </h3>
              
              <p className="text-neutral-400 text-center text-sm leading-relaxed mb-6">
                {message} 
                {itemName && (
                  <span className="block mt-2 font-bold text-white bg-neutral-900 py-1 px-3 rounded-lg border border-neutral-800 inline-block">
                    {itemName}
                  </span>
                )}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className={`w-full font-black py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${variantColors[variant]}`}
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-4 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
