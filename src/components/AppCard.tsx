import React from 'react';
import { motion } from 'motion/react';
import { AppItem } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Download } from 'lucide-react';

export function AppCard({ app, ...props }: { app: AppItem } & React.HTMLAttributes<HTMLAnchorElement>) {
  const navigate = useNavigate();

  const handleDeveloperClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/developer/${app.developerId}`);
  };

  return (
    <Link to={`/app/${app.id}`} className="block h-full" {...props}>
      <motion.div 
        whileHover={{ y: -4 }}
        className="group bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 hover:border-mk-green-500/50 rounded-2xl p-4 transition-colors flex flex-col h-full cursor-pointer relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-mk-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-start gap-4 mb-4">
          <img 
            src={app.iconDataUrl} 
            alt={app.name} 
            className="w-16 h-16 rounded-2xl object-cover bg-zinc-800 border border-zinc-800 shadow-lg group-hover:shadow-[0_0_15px_rgba(57,255,20,0.2)]"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate pr-4 text-lg">{app.name}</h3>
            <button 
              onClick={handleDeveloperClick}
              className="text-zinc-400 hover:text-mk-green-400 transition-colors text-xs truncate mb-2 block focus:outline-none"
            >
              {app.developerName}
            </button>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-white">{app.rating > 0 ? app.rating.toFixed(1) : 'Novo'}</span>
              {app.rating > 0 && <Star className="w-3.5 h-3.5 text-mk-green-400 fill-mk-green-400" />}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between z-10">
          <span className="text-xs text-zinc-500 font-medium">{app.category}</span>
          <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-mk-green-500 text-zinc-400 group-hover:text-black flex items-center justify-center transition-colors">
            <Download size={14} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
