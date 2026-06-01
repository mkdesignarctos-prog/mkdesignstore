import React from 'react';
import { motion } from 'motion/react';
import { AppItem } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Download, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function AppCard({ app, ...props }: { app: AppItem } & React.HTMLAttributes<HTMLAnchorElement>) {
  const navigate = useNavigate();
  const { installedAppIds = [], isInstallingMap = {} } = useStore();

  const isInstalled = installedAppIds.includes(app.id);
  const isInstalling = isInstallingMap[app.id];

  const handleDeveloperClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/developer/${app.developerId}`);
  };

  return (
    <Link to={`/app/${app.id}`} className="block h-full" {...props}>
      <motion.div 
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="group bg-zinc-900/40 backdrop-blur-md border border-zinc-800/85 hover:border-mk-blue-500/40 rounded-2xl p-5 transition-all flex flex-col h-full cursor-pointer relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_30px_rgba(14,165,233,0.06)]"
      >
        {/* Futuristic top-corner visual accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-mk-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-2xl pointer-events-none" />
        
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img 
              src={app.iconDataUrl} 
              alt={app.name} 
              className="w-16 h-16 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            {/* Ambient indicator badge if rating is high */}
            {app.rating >= 4.5 && (
              <span className="absolute -top-1.5 -left-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mk-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-mk-blue-500"></span>
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-900">
                {app.category}
              </span>
            </div>
            
            <h3 className="text-white font-bold tracking-tight truncate pr-2 text-base group-hover:text-mk-blue-400 transition-colors">
              {app.name}
            </h3>
            
            <button 
              onClick={handleDeveloperClick}
              className="text-zinc-500 hover:text-mk-blue-400 transition-colors text-xs truncate block font-medium mt-0.5 focus:outline-none"
            >
              by {app.developerName}
            </button>
          </div>
        </div>

        {/* Short description preview to add premium value */}
        {app.description && (
          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-5 font-light">
            {app.description}
          </p>
        )}

        {/* Dynamic Metrics Panel */}
        <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between z-10 gap-2">
          <div className="flex items-center gap-3">
            {/* Rating display */}
            <div className="flex items-center gap-1">
              <Star className={`w-3.5 h-3.5 ${app.rating > 0 ? 'text-mk-blue-400 fill-mk-blue-400' : 'text-zinc-600'}`} />
              <span className="text-xs font-bold text-white font-mono">
                {app.rating > 0 ? app.rating.toFixed(1) : '-.-'}
              </span>
            </div>
            
            {/* Downloads Display */}
            <div className="text-[11px] text-zinc-500 font-mono">
              <span>{app.downloads > 0 ? `${app.downloads.toLocaleString()} dl` : 'Novidade'}</span>
            </div>
          </div>

          {isInstalling ? (
            <div className="flex items-center gap-1.5 bg-zinc-950 text-mk-blue-400 py-1.5 px-3 rounded-xl border border-zinc-900">
              <div className="w-2.5 h-2.5 border-2 border-mk-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Loading</span>
            </div>
          ) : isInstalled ? (
            <div className="flex items-center gap-1.5 bg-mk-blue-500/10 text-mk-blue-400 py-1.5 px-3 rounded-xl border border-mk-blue-500/30">
              <Check size={12} strokeWidth={3} />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Abrir</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-zinc-950 group-hover:bg-mk-blue-500 text-zinc-400 group-hover:text-black py-1.5 px-3 rounded-xl transition-all duration-300 border border-zinc-900 group-hover:border-mk-blue-500 pr-2">
              <span className="text-[10px] font-mono font-bold tracking-wider mr-1 group-hover:text-black uppercase">Instalar</span>
              <Download size={12} className="animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
