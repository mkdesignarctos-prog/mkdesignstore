import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { AppItem } from '../types';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppItem;
}

export function InstallModal({ isOpen, onClose, app }: InstallModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-zinc-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-10 relative"
          >
            <div className="p-8 text-center">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] mx-auto"
              >
                <Check size={40} className="text-black" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Instalado!</h3>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                O aplicativo <span className="text-white font-bold">{app.name}</span> foi processado e o download concluído com sucesso.
              </p>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50 mb-8 flex items-center gap-3">
                <ShieldCheck size={24} className="text-mk-blue-400" />
                <div className="text-left">
                  <p className="text-[10px] text-white font-bold uppercase tracking-widest">MK Security Scan</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Status: Protegido • Sem Ameaças</p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-white hover:bg-zinc-100 text-black py-4 rounded-2xl font-extrabold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
              >
                Voltar para Loja
              </button>
            </div>
            
            <div className="bg-zinc-950/80 p-4 border-t border-zinc-800/50 flex items-center justify-center gap-2">
              <AlertCircle size={14} className="text-zinc-600" />
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">MK Play Protect | Verificação em tempo real</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
