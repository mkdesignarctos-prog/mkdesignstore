import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppItem } from '../types';
import { X, ShieldCheck, Cpu, Cloud, Smartphone, Settings, Check, Activity, HardDrive, DownloadCloud, AlertTriangle } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppItem;
}

export function InstallModal({ isOpen, onClose, app }: InstallModalProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [downloadedSize, setDownloadedSize] = useState('0 MB');
  const [targetPhoneOS, setTargetPhoneOS] = useState<'Android' | 'iOS' | 'PC'>('Android');

  // Detect OS lightly
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setProgress(0);
      
      const ua = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(ua)) {
        setTargetPhoneOS('iOS');
      } else if (/Android/.test(ua)) {
        setTargetPhoneOS('Android');
      } else {
        setTargetPhoneOS('Android'); // Default to Android store simulation
      }
    }
  }, [isOpen]);

  // Handle the step sequences
  useEffect(() => {
    if (!isOpen || step === 0) return;

    if (step === 1) {
      // Step 1: Initializing Connection (Cloudflare Routing & Package Analysis)
      const timer = setTimeout(() => {
        setStep(2);
      }, 1800);
      return () => clearTimeout(timer);
    }

    if (step === 2) {
      // Step 2: Downloading package segment (Simulating speed & GB capability)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep(3);
            }, 500);
            return 100;
          }
          
          // Speed fluctuation
          const speed = (Math.random() * 250 + 400).toFixed(1);
          setDownloadSpeed(`${speed} MB/s`);
          
          // Sizes calculation
          const totalSizeNum = parseFloat(app.size) || 45; // Default if size is invalid
          const totalUnit = app.size.replace(/[0-9.\s]/g, '') || 'MB';
          const calculatedDownloaded = ((prev / 100) * totalSizeNum).toFixed(1);
          setDownloadedSize(`${calculatedDownloaded} ${totalUnit}`);
          
          return prev + Math.min(Math.random() * 8 + 4, 100 - prev);
        });
      }, 120);

      return () => clearInterval(interval);
    }

    if (step === 3) {
      // Step 3: Verifying Integity hashes & Security scan
      const timer = setTimeout(() => {
        setStep(4);
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (step === 4) {
      // Step 4: Decompressing & Registering on virtual host OS
      const timer = setTimeout(() => {
        setStep(5);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step, app.size]);

  const handleStartInstaller = () => {
    setStep(1);
    setProgress(0);
  };

  const getStepHeadline = () => {
    switch(step) {
      case 0: return 'Preparar Instalação';
      case 1: return 'Conectando à CDN Cloudflare...';
      case 2: return `Fazendo Download Seguro (${app.size})...`;
      case 3: return 'Análise de Segurança & MD5 Hash Check...';
      case 4: return 'Instalando Arquivos no Celular...';
      case 5: return '🎮 Instalação Concluída!';
      default: return 'Processando...';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 z-50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-zinc-950 border-2 border-zinc-900 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mk-green-600 via-mk-green-400 to-mk-green-600 animate-pulse"></div>
              
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-900"
              >
                <X size={18} />
              </button>

              {/* Title & Metadata Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-zinc-900">
                <img 
                  src={app.iconDataUrl} 
                  alt={app.name} 
                  className="w-14 h-14 rounded-xl object-cover bg-black border border-zinc-800"
                />
                <div>
                  <h3 className="text-white font-extrabold text-lg tracking-tight leading-tight">{app.name}</h3>
                  <p className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-mk-green-400 mt-0.5">
                    Instalador Premium • {app.size === 'Variante' ? 'Sub-Giga' : app.size}
                  </p>
                </div>
              </div>

              {/* Steps Area */}
              <div className="min-h-[220px] flex flex-col justify-between">
                
                {/* STEP 0: Introduction of native options */}
                {step === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850/80">
                      <div className="flex gap-3">
                        <Smartphone className="text-mk-green-400 shrink-0 mt-0.5" size={18} />
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">Instalação Direta no Dispositivo</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed font-light">
                            Nosso protocolo de rede integrado distribui arquivos de até <strong className="text-white font-semibold">10 Gigabytes</strong> a velocidades gigabit operando sobre rede DNS Cloudflare. O instalador copiará os arquivos diretamente para o seu aparelho.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Choose Device Target OS simulated option */}
                    <div className="flex gap-2.5 p-1 bg-zinc-900 rounded-xl border border-zinc-850">
                      {(['Android', 'iOS', 'PC'] as const).map(os => (
                        <button
                          key={os}
                          type="button"
                          onClick={() => setTargetPhoneOS(os)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${targetPhoneOS === os ? 'bg-zinc-800 text-mk-green-400 border border-zinc-700/60' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          Dispositivo {os}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleStartInstaller}
                        className="w-full bg-gradient-to-r from-mk-green-600 to-mk-green-500 hover:from-mk-green-500 hover:to-mk-green-400 text-black font-extrabold text-xs tracking-widest uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.15)] transition-all flex items-center justify-center gap-2"
                      >
                        <DownloadCloud size={16} />
                        <span>Iniciar Instalação Direta ({targetPhoneOS})</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1 & UP: Progress tracking animations */}
                {step > 0 && step < 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 py-2">
                    
                    {/* Visual Status Indicator Card */}
                    <div className="flex items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900/80">
                      <div className="w-10 h-10 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-center text-mk-green-400">
                        {step === 1 && <Cloud className="animate-pulse" size={20} />}
                        {step === 2 && <DownloadCloud className="animate-bounce" size={20} />}
                        {step === 3 && <ShieldCheck className="animate-pulse" size={20} />}
                        {step === 4 && <Cpu className="animate-spin" style={{ animationDuration: '3s' }} size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-zinc-500 block">Status de Atividade:</span>
                        <h4 className="text-sm font-bold text-white truncate mt-0.5">{getStepHeadline()}</h4>
                      </div>
                    </div>

                    {/* Real-time statistics block during download (Step 2) */}
                    {step === 2 && (
                      <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-900/10 p-3.5 rounded-xl border border-zinc-900">
                        <div>
                          <span className="text-zinc-500 block">Velocidade de Banda:</span>
                          <span className="font-mono text-white font-extrabold flex items-center gap-1.5 mt-0.5">
                            <Activity size={12} className="text-mk-green-400" />
                            {downloadSpeed}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Dados Gravados:</span>
                          <span className="font-mono text-white font-extrabold mt-0.5 block">{downloadedSize} / {app.size}</span>
                        </div>
                      </div>
                    )}

                    {/* Progress slider bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs pl-1">
                        <span className="text-zinc-400 font-semibold">Progresso Geral</span>
                        <span className="font-mono text-mk-green-400 font-extrabold">{step === 2 ? `${Math.round(progress)}%` : (step > 2 ? '100%' : 'Aguardando...')}</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-mk-green-600 via-mk-green-400 to-mk-green-600"
                          style={{ width: step === 2 ? `${progress}%` : (step > 2 ? '100%' : '4%') }}
                          transition={{ ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                      <span>Cloudflare CDN Host Edge Nodes ativos e operando sem limites.</span>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Success State */}
                {step === 5 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="space-y-5 text-center flex flex-col items-center py-2"
                  >
                    <div className="w-16 h-16 bg-mk-green-950/30 border-2 border-mk-green-500 rounded-full flex items-center justify-center text-mk-green-400 shadow-[0_0_25px_rgba(57,255,20,0.15)] animate-bounce" style={{ animationDuration: '1.5s' }}>
                      <Check size={32} />
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-extrabold text-white">Instalado com Sucesso no {targetPhoneOS}!</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed font-light mt-1.5 max-w-sm">
                        O aplicativo foi empacotado e copiado para a partição de armazenamento interno do seu aparelho. O atalho de inicialização rápida já está ativo!
                      </p>
                    </div>

                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-900 rounded-2xl w-full text-left">
                      <h5 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono mb-1 ml-1 flex items-center gap-1.5">
                        <HardDrive size={13} className="text-mk-green-400" />
                        Anotação de Sistema do Celular:
                      </h5>
                      <ul className="text-[11px] text-zinc-400 space-y-1 list-disc pl-4 font-light">
                        <li>Certifique-se de habilitar "Fontes Desconhecidas" se solicitado no primeiro lançamento.</li>
                        <li>Totalmente integrado por Cloudflare CDN (Sem perdas, seguro para arquivos até 10GB).</li>
                        <li>Não é necessário possuir login para usar as funcionalidades básicas deste aplicativo.</li>
                      </ul>
                    </div>

                    <div className="pt-2 w-full">
                      <button
                        onClick={onClose}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl border border-zinc-700/50 transition-colors"
                      >
                        Concluído
                      </button>
                    </div>
                  </motion.div>
                )}
                
              </div>

              {/* Help Tips Area (Always descriptive at the footer of the modal for PWA standard instructions) */}
              {step < 5 && (
                <div className="mt-8 pt-5 border-t border-zinc-900 text-xs text-zinc-500 space-y-2">
                  <div className="flex gap-2.5">
                    <Smartphone className="text-zinc-600 shrink-0 mt-0.5" size={14} />
                    <p className="font-light leading-relaxed">
                      💡 <strong className="text-zinc-400 font-semibold">Dica de Atcesso Rápido:</strong> Para rodar nativamente como aplicativo próprio no seu smartphone sem navegador, clique nas opções do seu navegador (três pontinhos no Chrome ou ícone Compartilhar no Safari) e escolha <strong className="text-zinc-400 font-semibold">"Adicionar à Tela de Início"</strong>.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
