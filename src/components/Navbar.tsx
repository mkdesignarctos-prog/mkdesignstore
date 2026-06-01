import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MonitorDown, Code2, LogOut } from 'lucide-react';
import { AuthModal } from './AuthModal';

export function Navbar() {
  const { currentUser, logout, becomeDeveloper, searchQuery, setSearchQuery } = useStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-mk-blue-400 to-transparent z-50" />
      <nav className="sticky top-0 z-30 bg-zinc-950/75 backdrop-blur-xl border-b border-zinc-900/80 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" onClick={() => setSearchQuery('')} className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 bg-black border-2 border-mk-blue-500/35 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.08)] group-hover:shadow-[0_0_25px_rgba(14,165,233,0.3)] group-hover:border-mk-blue-400 transition-all duration-300">
              <span className="text-mk-blue-400 font-display font-extrabold text-xl font-mono tracking-tight group-hover:scale-105 transition-transform">MK</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-white text-[17px] leading-tight tracking-tight group-hover:text-mk-blue-400 transition-colors duration-300">MK Design Studio</h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold font-mono">Premium Store</p>
            </div>
          </Link>

          {/* Search Bar - Interactive & Functional */}
          <div className="hidden md:flex flex-1 max-w-lg mx-12 relative animate-fade-in">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-zinc-500 group-focus-within:text-mk-blue-400 transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar jogos, apps, ferramentas..." 
              className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-mk-blue-500/40 rounded-full pl-11 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:ring-4 focus:ring-mk-blue-500/5 focus:bg-zinc-950/80"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                title="Limpar busca"
              >
                <span className="text-xs bg-zinc-800/80 px-1.5 py-0.5 rounded-md text-[10px] font-mono hover:bg-zinc-700">ESC</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!currentUser ? (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="text-[11px] font-extrabold uppercase tracking-widest text-mk-blue-400 hover:text-black px-6 py-2 bg-mk-blue-950/30 hover:bg-mk-blue-400 border border-mk-blue-500/35 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.05)] active:scale-95"
              >
                Acessar Conta
              </button>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2.5 px-4 py-2 bg-zinc-900/80 hover:bg-zinc-850 rounded-full border border-zinc-800 transition-all active:scale-[0.98]"
                >
                  <div className="w-6 h-6 rounded-full bg-mk-blue-400 text-black font-extrabold flex items-center justify-center text-xs shadow-[0_0_8px_rgba(14,165,233,0.3)]">
                    {currentUser.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 hidden sm:block">{currentUser.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full mt-3 right-0 w-64 bg-zinc-950 border border-zinc-800/95 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="p-4 border-b border-zinc-900 bg-zinc-900/20">
                      <p className="text-white font-bold text-sm tracking-tight">{currentUser.name}</p>
                      <p className="text-[10px] text-mk-blue-400 font-mono uppercase tracking-wider mt-1">
                        {currentUser.isDeveloper ? '👨‍💻 Desenvolvedor Oficial' : '🎮 Gamer Colecionador'}
                      </p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      {currentUser.isDeveloper ? (
                        <button 
                          onClick={() => { navigate('/publish'); setIsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/90 rounded-xl transition-all"
                        >
                          <MonitorDown size={15} className="text-mk-blue-400" />
                          Publicar Aplicativo
                        </button>
                      ) : (
                        <button 
                          onClick={() => { becomeDeveloper(); setIsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/90 rounded-xl transition-all"
                        >
                          <Code2 size={15} className="text-mk-blue-400 animate-pulse" />
                          Tornar-se Desenvolvedor
                        </button>
                      )}
                      
                      <div className="h-px bg-zinc-900 my-1 mx-2"></div>
                      
                      <button 
                        onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-950/20 rounded-xl transition-all"
                      >
                        <LogOut size={15} />
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
