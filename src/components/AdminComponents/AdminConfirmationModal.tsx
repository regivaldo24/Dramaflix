import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface AdminConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function AdminConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  variant = 'danger'
}: AdminConfirmationModalProps) {
  if (!isOpen) return null;

  const type = variant; // Alias for internal use if needed, but let's just use variant

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                {message}
              </p>
              
              {itemName && (
                <div className="bg-neutral-950 border border-neutral-800/50 rounded-lg p-3 mb-6">
                  <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Item Selecionado</span>
                  <p className="text-white font-medium truncate">{itemName}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition active:scale-95 order-2 sm:order-1"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition active:scale-95 order-1 sm:order-2 ${
                    type === 'danger' 
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20' 
                    : 'bg-yellow-500 text-black hover:bg-yellow-600'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
