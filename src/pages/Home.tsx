import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { AppCard } from '../components/AppCard';
import { ShieldCheck, Zap, Sparkles, Flame, Star, Trophy, Clock, Filter, ArrowRight, LayoutGrid, Smartphone, Pin, Trash2, Play, AppWindow, Calendar, ShieldAlert } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { AppSandbox } from '../components/AppSandbox';

export function Home() {
  const { 
    apps, 
    searchQuery, 
    setSearchQuery,
    installedAppIds = [],
    pinnedAppIds = [],
    pinApp,
    unpinApp,
    uninstallApp
  } = useStore();
  
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'rating' | 'downloads'
  const [activeView, setActiveView] = useState<'store' | 'desktop'>('store');
  const [sandboxApp, setSandboxApp] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    updateTime();
    const t = setInterval(updateTime, 10000);
    return () => clearInterval(t);
  }, []);

  const pinnedApps = useMemo(() => {
    return apps.filter(app => (pinnedAppIds || []).includes(app.id));
  }, [apps, pinnedAppIds]);

  const installedApps = useMemo(() => {
    return apps.filter(app => (installedAppIds || []).includes(app.id));
  }, [apps, installedAppIds]);

  // Extract all unique categories present in actual apps
  const dynamicCategories = useMemo(() => {
    const list = apps.map(app => app.category);
    return ['Todos', ...Array.from(new Set(list))];
  }, [apps]);

  // Select a standout spotlight app (e.g., highest downloads or stars)
  const spotlightApp = useMemo(() => {
    if (apps.length === 0) return null;
    // Sort primarily by downloads, then by rating
    return [...apps].sort((a, b) => {
      if ((b.downloads || 0) !== (a.downloads || 0)) {
        return (b.downloads || 0) - (a.downloads || 0);
      }
      return (b.rating || 0) - (a.rating || 0);
    })[0];
  }, [apps]);

  // Top 4 most recent community published apps highlighted at the top
  const recentCommunityApps = useMemo(() => {
    return [...apps].sort((a, b) => {
      const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
      const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
      return (timeB || 0) - (timeA || 0);
    }).slice(0, 4);
  }, [apps]);

  // Apply search query first, then category filters, and then sort
  const processedApps = useMemo(() => {
    let list = [...apps];

    // 1. Search Query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(app => 
        app.name.toLowerCase().includes(q) ||
        (app.description && app.description.toLowerCase().includes(q)) ||
        app.category.toLowerCase().includes(q) ||
        app.developerName.toLowerCase().includes(q)
      );
    }

    // 2. Category filtering
    if (selectedCategory !== 'Todos') {
      list = list.filter(app => app.category === selectedCategory);
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortBy === 'recent') {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
        return (timeB || 0) - (timeA || 0);
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'downloads') {
        return (b.downloads || 0) - (a.downloads || 0);
      }
      return 0;
    });

    return list;
  }, [apps, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-900 bg-zinc-950/25">
        {/* Decorative backdrop gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mk-green-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[-100px] left-1/3 w-[600px] h-[300px] bg-mk-green-500/5 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-mk-green-500/35 text-mk-green-400 bg-transparent text-[10px] font-bold font-mono tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(57,255,20,0.08)] font-sans"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Curadoria Exclusiva de Aplicativos</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tighter leading-[1.1] max-w-4xl"
          >
            A próxima geração da <span className="text-transparent bg-clip-text bg-gradient-to-r from-mk-green-400 via-mk-green-200 to-white drop-shadow-[0_2px_10px_rgba(57,255,20,0.15)]">distribuição indie.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed font-light"
          >
            Explore o repositório premium de apps e jogos da MK Design Studio. Baixe jogos de alta performance, ferramentas refinadas de utilidade e publique as suas próprias inspirações em um ecossistema com suporte completo e hospedado no Supabase.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4 items-center"
          >
            <div className="flex items-center gap-2.5 text-xs text-zinc-300 bg-zinc-900/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-zinc-800/80 shadow-md">
              <ShieldCheck className="text-mk-green-400" size={16} />
              <span className="font-semibold text-zinc-300">Auditoria de Código Integrada</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-300 bg-zinc-900/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-zinc-800/80 shadow-md">
              <Zap className="text-mk-green-400" size={16} />
              <span className="font-semibold text-zinc-300">Downloads Sem Limite de Velocidade</span>
            </div>
          </motion.div>

          {/* Main Context Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-12 flex bg-zinc-950/90 border border-zinc-900 p-1.5 rounded-2xl w-fit max-w-full shadow-2xl relative z-20"
          >
            <button 
              onClick={() => setActiveView('store')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${activeView === 'store' ? 'bg-zinc-900 text-mk-green-400 border border-zinc-800/60 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <LayoutGrid size={15} />
              <span>Explorar Loja</span>
            </button>
            <button 
              onClick={() => setActiveView('desktop')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider relative ${activeView === 'desktop' ? 'bg-zinc-900 text-mk-green-400 border border-zinc-800/60 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <Smartphone size={15} />
              <span>Minha Tela Inicial</span>
              {installedApps.length > 0 && (
                <span className="bg-mk-green-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full font-mono">
                  {installedApps.length}
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Dynamic Glowing Neon Line */}
      <div className="neon-line-horizontal -mt-px relative z-10" />

      {activeView === 'store' ? (
        <>
          {/* Spotlight Segment - Featured App of the Day */}
          {spotlightApp && !searchQuery && selectedCategory === 'Todos' && (
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-zinc-950 border border-zinc-850 rounded-3xl p-6 md:p-10 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] group"
              >
                {/* Visual high-end lighting behind spotlight */}
                <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-80 h-80 bg-mk-green-500/10 blur-[100px] rounded-full pointing-events-none group-hover:bg-mk-green-500/15 transition-all duration-700" />
                <div className="absolute top-0 right-0 py-1.5 px-4 bg-mk-green-500 text-black text-[9px] tracking-widest font-mono font-extrabold uppercase rounded-bl-2xl shadow-lg flex items-center gap-1.5 z-10">
                  <Trophy size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
                  Destaque Máximo
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                  <img 
                    src={spotlightApp.iconDataUrl} 
                    alt={spotlightApp.name} 
                    className="w-24 h-24 md:w-36 md:h-36 rounded-2xl object-cover bg-zinc-950 border border-zinc-800 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-mk-green-400 bg-mk-green-950/40 border border-mk-green-500/25 px-2.5 py-0.5 rounded-full">
                        {spotlightApp.category}
                      </span>
                      <span className="text-zinc-500 text-xs">• de {spotlightApp.developerName}</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight mb-3">
                      {spotlightApp.name}
                    </h3>
                    
                    <p className="text-zinc-400 text-sm max-w-xl line-clamp-2 md:line-clamp-3 leading-relaxed mb-6 font-light">
                      {spotlightApp.description || 'Nenhuma descrição detalhada disponível.'}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="text-mk-green-400 fill-mk-green-400" />
                        <span className="text-white font-bold">{spotlightApp.rating > 0 ? spotlightApp.rating.toFixed(1) : 'Novo'}</span>
                        <span>Avaliação</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap size={14} className="text-mk-green-400" />
                        <span className="text-white font-bold">{((spotlightApp.downloads || 0) + 1).toLocaleString()}</span>
                        <span>Modulações</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold">{spotlightApp.size || '32 MB'}</span>
                        <span>Tamanho</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-col gap-2.5 self-center">
                    <Link 
                      to={`/app/${spotlightApp.id}`}
                      className="w-full md:w-auto text-center bg-mk-green-500 hover:bg-mk-green-400 text-black font-extrabold text-xs tracking-wider uppercase py-3.5 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(57,255,20,0.15)] flex items-center justify-center gap-2 group"
                    >
                      <span>Ver Detalhes do App</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* COMMUNITY HIGHLIGHTS SHELF */}
          {recentCommunityApps.length > 0 && !searchQuery && (
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <span className="w-2.5 h-6 bg-mk-green-400 rounded-lg shadow-[0_0_10px_rgba(57,255,20,0.4)]"></span>
                  <span>Novidades Recentes da Comunidade</span>
                  <span className="text-[10px] bg-mk-green-950/40 text-mk-green-400 font-mono py-1 px-3.5 rounded-full border border-mk-green-500/25 uppercase font-bold animate-pulse">
                    Hot Releases
                  </span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentCommunityApps.map((app) => (
                  <motion.div
                    key={`community-${app.id}`}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="relative bg-gradient-to-b from-zinc-900/40 to-zinc-950/80 border border-zinc-850/80 hover:border-mk-green-500/40 rounded-2xl p-5 group shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all text-left"
                  >
                    <div className="flex items-start gap-3.5 mb-4">
                      <img 
                        src={app.iconDataUrl} 
                        alt={app.name} 
                        className="w-14 h-14 rounded-xl object-cover bg-black border border-zinc-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-mk-green-400 bg-mk-green-950/40 border border-mk-green-500/20 px-2 py-0.5 rounded">
                          🆕 NOVO JOGO / APP
                        </span>
                        <h3 className="text-white text-sm font-bold truncate tracking-tight group-hover:text-mk-green-400 transition-colors mt-1">
                          {app.name}
                        </h3>
                        <p className="text-zinc-500 text-[11px] truncate">
                          by {app.developerName}
                        </p>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-xs font-light line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                      {app.description || 'Nenhuma descrição detalhada disponível.'}
                    </p>

                    <div className="pt-3 border-t border-zinc-900/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono">{app.size || 'Variável'}</span>
                        <span className="text-zinc-700 text-xs">•</span>
                        <span className="text-[10px] text-zinc-500 font-mono">CF Mirror Link</span>
                      </div>
                      <Link 
                        to={`/app/${app.id}`}
                        className="text-[10px] font-mono tracking-wider font-extrabold text-black bg-mk-green-400 hover:bg-mk-green-300 py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1 uppercase"
                      >
                        <span>Instalar</span>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Main Grid & Filters */}
          <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-12 w-full relative">
            <div className="absolute top-[150px] right-1/4 w-[350px] h-[350px] bg-mk-green-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Navigation Filters Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-zinc-900 mb-10">
              
              {/* Categories Filters List */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 lg:pb-0 scrollbar-none max-w-full">
                <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 border border-zinc-850 rounded-2xl">
                  <div className="p-1 px-2.5 text-zinc-650 text-xs font-mono font-bold flex items-center gap-1 tracking-wider uppercase">
                    <Filter size={12} />
                    <span>Filtro:</span>
                  </div>
                  {dynamicCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                        selectedCategory === category
                          ? 'bg-zinc-800 text-mk-green-400 shadow-md border border-zinc-700/80'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorters Toggle Bar */}
              <div className="flex items-center gap-2.5 self-end lg:self-center">
                <span className="text-[11px] text-zinc-500 font-bold tracking-wider font-mono uppercase font-sans">Ordenar:</span>
                <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-850 flex items-center">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`p-2 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      sortBy === 'recent'
                        ? 'bg-zinc-900 text-white shadow-inner'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Mais Recentes"
                  >
                    <Clock size={12} />
                    <span>Mais Novos</span>
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`p-2 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      sortBy === 'rating'
                        ? 'bg-zinc-900 text-white shadow-inner'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Melhor Avaliados"
                  >
                    <Star size={12} />
                    <span>Melhor Avaliação</span>
                  </button>
                  <button
                    onClick={() => setSortBy('downloads')}
                    className={`p-2 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      sortBy === 'downloads'
                        ? 'bg-zinc-900 text-white shadow-inner'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Populares"
                  >
                    <Flame size={12} />
                    <span>Populares</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Search Results Info block */}
            {searchQuery.trim() && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex items-center justify-between"
              >
                <div className="text-xs text-zinc-400">
                  <span>Encontramos <strong className="text-white font-bold">{processedApps.length}</strong> resultados para a busca por: </span>
                  <span className="text-mk-green-400 font-bold bg-mk-green-950/20 px-2 py-1 rounded border border-mk-green-500/10 inline-block font-mono mt-1 sm:mt-0 ml-1">
                    "{searchQuery}"
                  </span>
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-zinc-500 hover:text-white uppercase font-mono font-bold hover:underline"
                >
                  Limpar busca
                </button>
              </motion.div>
            )}

            {/* Grid Title Summary */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-display font-bold text-white tracking-tight flex items-center gap-2">
                <span>Todos os Aplicativos</span>
                <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-900 text-[10px] text-zinc-500 font-mono">
                  {processedApps.length}
                </span>
              </h2>
            </div>
            
            {/* Apps Render Grid */}
            <AnimatePresence mode="popLayout">
              {processedApps.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-24 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-mk-green-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
                  <p className="text-zinc-500 font-medium relative z-10 text-sm">Nenhum aplicativo corresponde aos filtros ou busca selecionada.</p>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-xs font-bold text-mk-green-400 hover:text-mk-green-300 relative z-10 underline focus:outline-none"
                    >
                      Gostaria de redefinir sua busca?
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                  {processedApps.map((app) => (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <AppCard app={app} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* VIRTUAL HOME SCREEN / DESKTOP VIEW */
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex flex-col gap-8 text-left">
          
          <div className="relative bg-zinc-950/90 border border-zinc-850 rounded-[32px] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden min-h-[550px]">
            {/* Subtle smartphone notch at top center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-6 bg-zinc-900 border-x border-b border-zinc-800/80 rounded-b-2xl z-20 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse mr-3"></div>
              <div className="w-12 h-1 bg-zinc-950 rounded-full"></div>
            </div>

            {/* Immersive backdrop graphics */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-mk-green-950/20 via-zinc-950 to-black z-0 pointer-events-none" />
            <div className="absolute top-1/4 right-[5%] w-[350px] h-[350px] bg-mk-green-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Dynamic Clock and Date Widget row */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-900 pb-8 mb-8 gap-4">
              <div>
                <span className="text-[11px] font-extrabold text-zinc-500 font-mono flex items-center gap-1.5 uppercase tracking-wider mb-1.5">
                  <Calendar size={14} className="text-mk-green-400" /> {currentDate}
                </span>
                <h2 className="text-5xl md:text-6xl font-extrabold font-sans text-white tracking-tighter leading-none font-display">
                  {currentTime || '12:00'}
                </h2>
              </div>
              
              <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-850 px-4 py-3 rounded-2xl max-w-sm shadow-md flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1 font-bold">Status do Sistema Host</p>
                  <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                    Banco Supabase: <strong className="text-mk-green-400 font-bold">CONECTADO</strong> • Carregados: <span className="text-white font-bold">{installedApps.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: PINNED APPS APPS SHORTCUTS */}
            <div className="relative z-10 mb-12">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mb-6">
                <Pin size={16} className="text-mk-green-400 fill-mk-green-400" />
                <span>Aplicativos Fixados na Tela Inicial</span>
                <span className="text-[10px] bg-zinc-900/80 text-zinc-400 font-mono px-2 py-0.5 rounded border border-zinc-800">
                  {pinnedApps.length} fixados
                </span>
              </h3>

              {pinnedApps.length === 0 ? (
                <div className="border border-dashed border-zinc-850 bg-zinc-950/40 rounded-3xl p-10 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
                    <Pin size={18} />
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">Nenhum aplicativo fixado</h4>
                  <p className="text-zinc-500 text-xs max-w-md font-light leading-relaxed">
                    Você pode fixar aplicativos instalados na sua tela inicial para acesso rápido e funcionalidade de simulador! Visite a Loja, instale qualquer app e habilite a opção de fixar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {pinnedApps.map(app => (
                    <motion.div 
                      key={`pinned-${app.id}`}
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center group cursor-pointer"
                      onClick={() => setSandboxApp(app)}
                    >
                      <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg flex items-center justify-center overflow-hidden mb-3 group-hover:border-mk-green-500/40 transition-all">
                        <img src={app.iconDataUrl} alt={app.name} className="w-full h-full object-cover" />
                        
                        {/* Play Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-mk-green-400 text-black flex items-center justify-center shadow-lg">
                            <Play size={18} fill="black" className="ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <span className="text-zinc-200 text-xs font-bold truncate max-w-full text-center group-hover:text-mk-green-400 transition-colors">
                        {app.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {app.category}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Section: MANAGE INSTALLED APPS LIST */}
            <div className="relative z-10">
              <h3 className="text-sm font-extrabold uppercase text-zinc-500 tracking-wider font-mono flex items-center gap-2 mb-6">
                <AppWindow size={15} />
                <span>Gerenciador de Aplicativos Instalados</span>
                <span className="text-xs text-zinc-650">({installedApps.length})</span>
              </h3>

              {installedApps.length === 0 ? (
                <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-8 text-center text-zinc-650 font-light text-xs">
                  Sua lista de aplicativos instalados está vazia. Visite a Loja para instalar!
                </div>
              ) : (
                <div className="bg-zinc-900/30 border border-zinc-850 rounded-2xl overflow-hidden divide-y divide-zinc-900">
                  {installedApps.map(app => {
                    const isPinned = (pinnedAppIds || []).includes(app.id);
                    return (
                      <div key={`manage-home-${app.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 gap-4">
                        <div className="flex items-center gap-3.5">
                          <img src={app.iconDataUrl} alt="Icon" className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <p className="text-white font-bold text-sm leading-tight">{app.name}</p>
                            <p className="text-zinc-500 text-xs mt-0.5 font-light">by {app.developerName} • {app.size}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSandboxApp(app)}
                            className="bg-mk-green-500 hover:bg-mk-green-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Play size={12} fill="black" />
                            <span>Lançar</span>
                          </button>
                          
                          <button 
                            onClick={() => isPinned ? unpinApp(app.id) : pinApp(app.id)}
                            className={`p-2 rounded-lg border text-xs transition-colors ${isPinned ? 'bg-mk-green-950/40 border-mk-green-500/20 text-mk-green-400' : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                          >
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">{isPinned ? '📌 Fixado' : 'Fixar'}</span>
                          </button>

                          <button 
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja desinstalar este aplicativo?')) {
                                uninstallApp(app.id);
                              }
                            }}
                            className="p-2 border border-zinc-800 hover:bg-red-950/20 hover:border-red-900/30 text-zinc-500 hover:text-red-400 rounded-lg transition-colors animate-fade-in"
                            title="Desinstalar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {sandboxApp && (
        <AppSandbox 
          isOpen={!!sandboxApp} 
          onClose={() => setSandboxApp(null)} 
          app={sandboxApp} 
        />
      )}
      
      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-16 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-black border border-mk-green-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            <span className="text-mk-green-400 font-bold text-xl">MK</span>
          </div>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest font-mono mb-2">MK Design Studio Hub</p>
          <p className="text-zinc-600 text-xs font-light">© 2026 MK Design Studio. Conectando ideias e criatividade globalmente.</p>
        </div>
      </footer>
    </div>
  );
}
