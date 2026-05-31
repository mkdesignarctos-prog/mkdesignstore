import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { X, Gamepad2, ShieldCheck, LogIn } from 'lucide-react';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { login } = useStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-6"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mk-green-600 via-mk-green-400 to-mk-green-600"></div>
              
              <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-10 mt-4">
                <div className="w-20 h-20 bg-zinc-950 border border-mk-green-500/30 rounded-2xl flex items-center justify-center mb-6 text-mk-green-400 shadow-[0_0_20px_rgba(57,255,20,0.15)] relative">
                  <div className="absolute inset-0 bg-mk-green-400/5 rounded-2xl blur-xl"></div>
                  <Gamepad2 size={40} className="relative z-10" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight mb-2">Acesso Segurou</h2>
                <p className="text-zinc-400 text-center text-sm leading-relaxed max-w-[280px]">Faça login com sua conta Google para baixar apps, avaliar e publicar seus próprios projetos.</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl px-1 py-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg relative group"
                >
                  <div className="bg-white rounded-lg p-2.5 flex items-center justify-center border border-zinc-200 mr-2 ml-1">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      <path fill="none" d="M1 1h22v22H1z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-center pr-10">{isLoggingIn ? 'Conectando...' : 'Continuar com Google'}</span>
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500 bg-zinc-950/50 py-3 rounded-xl border border-zinc-900">
                <ShieldCheck size={16} className="text-mk-green-500" />
                <span>Autenticação 100% Segura e Verificada</span>
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}

