import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Navbar } from '../components/Navbar';
import { Star, Download, Share2, ShieldCheck, ChevronLeft, Send, AlertCircle, Check, Copy, X, User, Pin, Play, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InstallModal } from '../components/InstallModal';
import { AppSandbox } from '../components/AppSandbox';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AppItem } from '../types';

export function AppDetails() {
  const { id } = useParams<{ id: string }>();
  const { 
    getAppById, 
    getReviewsForApp, 
    currentUser, 
    addReview,
    installedAppIds = [],
    pinnedAppIds = [],
    uninstallApp,
    pinApp,
    unpinApp,
    incrementDownloads
  } = useStore();
  const navigate = useNavigate();
  
  const [app, setApp] = useState<AppItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const findApp = async () => {
      setLoading(true);
      const localApp = getAppById(id);
      
      if (localApp) {
        setApp(localApp);
        setLoading(false);
      } else if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('apps')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && data) {
            setApp({
              id: data.id,
              name: data.name,
              developerId: data.developer_id || data.developerId,
              developerName: data.developer_name || data.developerName,
              description: data.description,
              category: data.category,
              iconDataUrl: data.icon_data_url || data.iconDataUrl,
              fileObjectUrl: data.file_object_url || data.fileObjectUrl,
              fileName: data.file_name || data.fileName,
              rating: Number(data.rating) || 0,
              reviews: [],
              downloads: Number(data.downloads) || 0,
              size: data.size || '34 MB',
              version: data.version || '1.0.0',
              createdAt: data.created_at || data.createdAt || Date.now()
            });
          }
        } catch (e) {
          console.warn('Erro ao buscar app diretamente no Supabase:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    findApp();
  }, [id, getAppById]);

  const reviews = id ? getReviewsForApp(id) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-transparent">
        <Loader2 className="w-10 h-10 text-mk-blue-400 animate-spin mb-4" />
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Sincronizando Banco de Dados...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-transparent p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2 font-display">Aplicativo não encontrado</h1>
        <p className="text-zinc-500 mb-6 max-w-xs">O link pode estar expirado ou o aplicativo foi removido dos servidores.</p>
        <button onClick={() => navigate('/')} className="text-mk-blue-400 hover:underline font-bold">Voltar para a loja</button>
      </div>
    );
  }

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: `Baixe ${app.name} na MK Design Studio`,
        text: app.description,
        url: window.location.href,
      }).catch(() => {
        setIsShareModalOpen(true);
      });
    } else {
      setIsShareModalOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Increment download globally
    if (app) {
      try {
        await incrementDownloads(app.id);
      } catch (e) {
        console.warn('Erro ao atualizar downloads', e);
      }
    }
      
    setTimeout(() => {
      setIsDownloading(false);
      setIsInstallOpen(true); // Open premium simulated device installer!
    }, 600);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const finalUserId = currentUser ? currentUser.id : `guest-${crypto.randomUUID().slice(0, 8)}`;
      const finalUserName = currentUser 
        ? currentUser.name 
        : (guestName.trim() || `Jogador_${Math.floor(1000 + Math.random() * 9000)}`);

      await addReview(app.id, {
        userId: finalUserId,
        userName: finalUserName,
        rating,
        text: reviewText.trim()
      });
      setReviewText('');
      setGuestName('');
      setRating(5);
    } catch (err) {
      console.error(err);
      alert('Houve um erro ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ChevronLeft size={20} />
          <span>Voltar</span>
        </button>

        {/* Header section */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <img 
            src={app.iconDataUrl} 
            alt={app.name} 
            className="w-32 h-32 md:w-48 md:h-48 rounded-3xl object-cover bg-zinc-900 border border-zinc-800 shadow-[0_0_30px_rgba(0,210,255,0.1)]"
          />
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight mb-2">{app.name}</h1>
            <button 
              onClick={() => navigate(`/developer/${app.developerId}`)}
              className="text-mk-blue-400 hover:text-mk-blue-300 transition-colors font-medium mb-6 font-mono text-sm tracking-widest uppercase focus:outline-none"
            >
              {app.developerName}
            </button>
            
            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-lg flex items-center gap-1 font-mono">
                  {app.rating > 0 ? app.rating.toFixed(1) : 'Novo'} <Star size={16} className="fill-mk-blue-400 text-mk-blue-400" />
                </span>
                <span className="text-zinc-500">{reviews.length} avaliações</span>
              </div>
              <div className="w-px h-8 bg-zinc-800"></div>
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-lg font-mono">{(app.downloads || 0).toLocaleString()}+</span>
                <span className="text-zinc-500">Downloads</span>
              </div>
              <div className="w-px h-8 bg-zinc-800"></div>
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-lg font-mono">{app.size || '34 MB'}</span>
                <span className="text-zinc-500">Tamanho</span>
              </div>
            </div>

            {(() => {
              const isInstalled = (installedAppIds || []).includes(app.id);
              const isPinned = (pinnedAppIds || []).includes(app.id);

              return (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {!isInstalled ? (
                      <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="h-12 flex-1 md:flex-none flex items-center justify-center gap-2 bg-mk-blue-500 hover:bg-mk-blue-400 text-black font-extrabold px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(0,210,255,0.2)] disabled:opacity-70 disabled:cursor-wait uppercase text-xs tracking-wider"
                      >
                        {isDownloading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <Download size={18} />
                          </motion.div>
                        ) : (
                          <Download size={18} />
                        )}
                        <span>{isDownloading ? 'Processando...' : 'Instalar'}</span>
                      </button>
                    ) : (
                      <>
                        {/* Run/Launch Button */}
                        <button 
                          onClick={() => setIsSandboxOpen(true)}
                          className="h-12 flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-mk-blue-500 to-cyan-500 hover:from-mk-blue-400 hover:to-cyan-400 text-black font-extrabold px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(0,210,255,0.25)] text-xs uppercase tracking-wider animate-in fade-in duration-200"
                        >
                          <Play size={16} fill="black" />
                          <span>Lançar Aplicativo</span>
                        </button>
 
                        {/* PINS BUTTON (option to pin to Home Screen) */}
                        <button 
                          onClick={() => isPinned ? unpinApp(app.id) : pinApp(app.id)}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${isPinned ? 'bg-mk-blue-400/10 border-mk-blue-500/30 text-mk-blue-400 shadow-[0_0_15px_rgba(0,210,255,0.15)]' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white'}`}
                          title={isPinned ? 'Desfixar da Tela Inicial' : 'Fixar na Tela Inicial'}
                        >
                          <Pin size={18} className={isPinned ? 'fill-mk-blue-400 text-mk-blue-400' : ''} />
                        </button>
 
                        {/* UNINSTALL BUTTON */}
                        <button 
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja desinstalar este aplicativo?')) {
                              uninstallApp(app.id);
                            }
                          }}
                          className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-red-950/20 hover:border-red-900/30 hover:text-red-400 rounded-xl text-zinc-400 transition-colors"
                          title="Desinstalar aplicativo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                    
                    <button 
                      onClick={handleShareClick}
                      className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-300 transition-colors"
                      title="Compartilhar"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>

                  {/* Status hints */}
                  {isInstalled && (
                    <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-900/30 border border-zinc-850 rounded-2xl max-w-sm">
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-sans leading-tight">
                        <Check size={14} className="text-mk-blue-400 shrink-0" />
                        <span>Este aplicativo está instalado no host sandbox virtual.</span>
                      </p>
                      {isPinned ? (
                        <p className="text-[10px] text-mk-blue-400 font-mono flex items-center gap-1">
                          📌 Fixado na sua Tela Inicial como atalho principal.
                        </p>
                      ) : (
                        <button 
                          onClick={() => pinApp(app.id)}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono text-left underline w-fit"
                        >
                          Deseja fixar na sua Tela Inicial?
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            
            <div className="mt-4 flex items-center gap-2 text-xs text-mk-blue-500 font-medium bg-mk-blue-500/10 w-fit px-3 py-1.5 rounded-full border border-mk-blue-500/20">
              <ShieldCheck size={14} />
              <span>Verificado por MK Security</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 md:p-8 mb-12">
          <h2 className="text-xl font-bold font-display text-white mb-4">Sobre este aplicativo</h2>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{app.description}</p>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50">
            <div>
              <p className="text-zinc-500 mb-1">Versão</p>
              <p className="text-white font-mono">{app.version}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Atualizado em</p>
              <p className="text-white font-mono">{new Date(app.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Categoria</p>
              <p className="text-white">{app.category}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="text-2xl font-bold font-display text-white mb-6">Avaliações e Opiniões</h2>
          
          <form onSubmit={submitReview} className="bg-zinc-900 border border-zinc-900 rounded-3xl p-6 mb-8 flex flex-col gap-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-950 pb-3">
              <h3 className="text-white font-bold text-sm tracking-tight">Deixe sua opinião</h3>
              {!currentUser && (
                <div className="px-3 py-1 bg-mk-blue-950/20 text-mk-blue-400 border border-mk-blue-500/20 text-[10px] font-mono font-bold uppercase rounded-lg">
                  ⚡ Visitante Anônimo (Sem Necessidade de Login)
                </div>
              )}
            </div>

            <div className="flex gap-2.5 my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-115">
                  <Star size={24} className={star <= rating ? 'fill-mk-blue-400 text-mk-blue-400' : 'text-zinc-700'} />
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {!currentUser && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono mb-1.5 pl-1">Seu Nome / Apelido Gamer (Opcional):</label>
                  <input 
                    type="text" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ex: Player_Master_2026 (Deixe em branco para apelido randômico)"
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-mk-blue-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono mb-1.5 pl-1">Comentário público:</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Conte para os outros o que você achou deste aplicativo..."
                    className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-mk-blue-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!reviewText.trim() || isSubmitting}
                    className="bg-mk-blue-500 hover:bg-mk-blue-400 text-black px-6 py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-colors disabled:opacity-40 flex items-center justify-center gap-2 sm:w-auto w-full shrink-0"
                  >
                    <Send size={14} />
                    {isSubmitting ? 'Enviando...' : 'Avaliar'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500">Nenhum comentário ainda. Seja o primeiro!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 transition-colors hover:bg-zinc-900/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-mk-blue-500/10 border border-mk-blue-500/20 flex items-center justify-center text-mk-blue-400 font-bold font-display">
                        {review.userName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{review.userName}</p>
                        <p className="text-xs text-zinc-500 font-mono">{new Date(review.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'fill-mk-blue-400 text-mk-blue-400' : 'text-zinc-700'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isShareModalOpen && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-6"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <button 
                  onClick={() => setIsShareModalOpen(false)} 
                  className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                
                <h3 className="text-2xl font-bold font-display text-white mb-6">Compartilhar App</h3>
                
                <div className="flex items-center gap-4 mb-6 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50 shadow-inner">
                  <img src={app.iconDataUrl} alt={app.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <p className="text-white font-bold">{app.name}</p>
                    <p className="text-mk-blue-400 text-xs font-mono">{app.developerName}</p>
                  </div>
                </div>
                
                <p className="text-zinc-400 text-sm mb-3">Qualquer pessoa com este link pode acessar a página do aplicativo.</p>

                <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-mk-blue-500 transition-colors">
                  <input 
                    type="text" 
                    readOnly 
                    value={window.location.href} 
                    className="flex-1 bg-transparent text-zinc-400 text-sm px-4 py-3 outline-none" 
                  />
                  <button 
                    onClick={copyToClipboard} 
                    className="bg-mk-blue-500 hover:bg-mk-blue-400 text-black px-4 sm:px-6 font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
      <InstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} app={app} />
      <AppSandbox isOpen={isSandboxOpen} onClose={() => setIsSandboxOpen(false)} app={app} />
    </div>
  );
}
