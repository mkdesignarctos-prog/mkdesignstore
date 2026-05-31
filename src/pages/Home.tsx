import React from 'react';
import { useStore } from '../context/StoreContext';
import { AppCard } from '../components/AppCard';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export function Home() {
  const { apps } = useStore();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-900/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mk-green-500/15 via-black to-black" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-mk-green-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-24 pb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mk-green-500/10 border border-mk-green-500/20 text-mk-green-400 text-xs font-bold font-mono tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            <Sparkles size={14} />
            <span>A Evolução da Distribuição</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tighter leading-[1.05] max-w-4xl">
            Descubra apps<br />incríveis, publique <span className="text-transparent bg-clip-text bg-gradient-to-r from-mk-green-400 to-mk-green-600">os seus.</span>
          </h1>
          <p className="mt-8 text-xl text-zinc-400 max-w-2xl leading-relaxed font-medium">
            Bem-vindo à MK Design Studio Store. Uma plataforma profissional, segura e dedicada a elevar a experiência de download e publicação de softwares para dispositivos móveis e desktops.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-3 text-sm text-zinc-400 bg-zinc-900/50 px-4 py-2.5 rounded-2xl border border-zinc-800">
              <ShieldCheck className="text-mk-green-500" size={20} />
              <span className="font-medium text-white">100% Protegido</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400 bg-zinc-900/50 px-4 py-2.5 rounded-2xl border border-zinc-800">
              <Zap className="text-mk-green-500" size={20} />
              <span className="font-medium text-white">Downloads Rápidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-20 w-full relative">
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-mk-green-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Em Destaque</h2>
          <span className="text-mk-green-400 font-mono text-sm tracking-widest uppercase font-bold">{apps.length} ite{apps.length === 1 ? 'm' : 'ns'}</span>
        </div>
        
        {apps.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-mk-green-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
            <p className="text-zinc-500 font-medium relative z-10">Nenhum aplicativo publicado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-16 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-black border border-mk-green-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            <span className="text-mk-green-400 font-bold text-xl">MK</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">© 2026 MK Design Studio. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
