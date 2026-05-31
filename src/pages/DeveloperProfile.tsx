import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Navbar } from '../components/Navbar';
import { AppCard } from '../components/AppCard';
import { ChevronLeft, Verified, User as UserIcon } from 'lucide-react';

export function DeveloperProfile() {
  const { id } = useParams<{ id: string }>();
  const { apps } = useStore();
  const navigate = useNavigate();

  const developerApps = useMemo(() => {
    return apps.filter(app => app.developerId === id);
  }, [apps, id]);

  const developerName = developerApps.length > 0 ? developerApps[0].developerName : 'Desenvolvedor Desconhecido';

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-12 w-full">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-10 transition-colors">
          <ChevronLeft size={20} />
          <span>Voltar</span>
        </button>

        {/* Developer Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mk-green-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="w-32 h-32 rounded-3xl bg-zinc-950 border border-mk-green-500/20 flex flex-col items-center justify-center text-mk-green-400 shadow-[0_0_30px_rgba(57,255,20,0.1)] z-10 relative">
            <UserIcon size={48} className="mb-2" />
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-4xl font-bold font-display text-white tracking-tight">{developerName}</h1>
              <Verified className="text-mk-green-500" size={24} />
            </div>
            <p className="text-zinc-400 mb-6 font-medium">Desenvolvedor Verificado MK Store</p>
            
            <div className="flex items-center justify-center md:justify-start gap-8 text-sm">
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl font-mono">{developerApps.length}</span>
                <span className="text-zinc-500">Apps Publicados</span>
              </div>
              <div className="w-px h-8 bg-zinc-800"></div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl font-mono">
                  {developerApps.reduce((sum, app) => sum + (app.downloads || 0), 0).toLocaleString()}+
                </span>
                <span className="text-zinc-500">Downloads Totais</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Apps Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-display text-white tracking-tight mb-8">Todos os aplicativos de {developerName}</h2>
          
          {developerApps.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/50">
              <p className="text-zinc-500 font-medium">Nenhum aplicativo publicado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {developerApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-center mt-auto">
        <p className="text-zinc-500 text-sm font-medium">© 2026 MK Design Studio. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
