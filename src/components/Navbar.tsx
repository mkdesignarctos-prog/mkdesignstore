import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MonitorDown, Code2, LogOut, User } from 'lucide-react';
import { AuthModal } from './AuthModal';

export function Navbar() {
  const { currentUser, logout, becomeDeveloper } = useStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black border border-mk-green-500/50 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(57,255,20,0.1)] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">
              <span className="text-mk-green-400 font-bold text-lg">MK</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-white text-lg leading-tight tracking-tight">Design Studio</h1>
              <p className="text-[10px] text-mk-green-400 uppercase tracking-widest font-semibold font-mono">App Store</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input 
              type="text" 
              placeholder="Pesquisar jogos, apps e ferramentas..." 
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-mk-green-500/50 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:ring-4 focus:ring-mk-green-500/10"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {!currentUser ? (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="text-sm font-semibold hover:text-white px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800"
              >
                Fazer Login
              </button>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-full border border-zinc-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-mk-green-500/20 text-mk-green-400 flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{currentUser.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 w-64 md:w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-zinc-800">
                      <p className="text-white font-medium">{currentUser.name}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {currentUser.isDeveloper ? 'Conta de Desenvolvedor' : 'Usuário Padrão'}
                      </p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      {currentUser.isDeveloper ? (
                        <button 
                          onClick={() => { navigate('/publish'); setIsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                          <MonitorDown size={16} className="text-mk-green-400" />
                          Publicar Aplicativo
                        </button>
                      ) : (
                        <button 
                          onClick={() => { becomeDeveloper(); setIsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                          <Code2 size={16} className="text-mk-green-400" />
                          Tornar-se Desenvolvedor
                        </button>
                      )}
                      
                      <button 
                        onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <LogOut size={16} />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
