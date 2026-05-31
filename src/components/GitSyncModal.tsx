import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Github, Cloud, Globe, Cpu, Terminal, Copy, Check, ExternalLink, BookmarkCheck, ArrowRight, CornerDownRight } from 'lucide-react';

interface GitSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitSyncModal({ isOpen, onClose }: GitSyncModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "feat: Gamer Hub premium app store system"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-mk-green-600 via-mk-green-400 to-mk-green-600"></div>

              {/* Close Button */}
              <button 
                onClick={onClose} 
                className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-900"
              >
                <X size={18} />
              </button>

              {/* Title Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-mk-green-400 text-[10px] font-mono tracking-widest uppercase font-extrabold mb-1">
                  <Github size={12} strokeWidth={2.5} />
                  <span>Solução de Integração e Deploy</span>
                </div>
                <h3 className="text-white font-display font-extrabold text-2xl tracking-tight leading-tight">
                  Como Sincronizar com GitHub & Cloudflare
                </h3>
                <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed font-light">
                  Se a opção automática de sincronizar com o GitHub estiver inativa, travada ou não funcionar devido a restrições de sandbox no navegador, você pode conectar o seu código de forma <strong className="text-mk-green-400 font-medium">100% manual, direta e segura</strong> seguindo o guia passo a passo abaixo.
                </p>
              </div>

              {/* Step Flow Tabs */}
              <div className="space-y-6">
                
                {/* STEP 1: AI STUDIO SETTINGS EXPORT */}
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/80">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center text-mk-green-400 font-mono font-bold text-xs shrink-0 mt-0.5 animate-pulse">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white mb-1">Baixar o Código Completo (ZIP)</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        No painel esquerdo ou menu superior do <strong className="text-white">Google AI Studio</strong> (ícone de engrenagem / configurações), escolha a opção <strong className="text-white">Download ZIP</strong> ou <strong className="text-white">Export to ZIP</strong>. Isso irá baixar todo o código fonte limpo diretamente para o seu computador.
                      </p>
                    </div>
                  </div>
                </div>

                {/* STEP 2: MANUAL GITHUB SYNC COMMANDS */}
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/80">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center text-mk-green-400 font-mono font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white mb-1.5">Enviar para o seu Github (Manual)</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed mb-3">
                        Se você optou por baixar o Zip, abra o terminal na pasta extraída e execute os comandos abaixo para inicializar e parear o repositório git:
                      </p>

                      {/* Code Block Container */}
                      <div className="bg-black/80 rounded-xl p-3.5 border border-zinc-900 flex flex-col relative font-mono text-[11px] text-zinc-300 leading-relaxed">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(gitCommands, 'gitCommands')}
                          className="absolute top-2 right-2 p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors"
                          title="Copiar Código"
                        >
                          {copiedSection === 'gitCommands' ? <Check className="text-mk-green-400" size={13} /> : <Copy size={13} />}
                        </button>
                        <pre className="overflow-x-auto whitespace-pre pr-8">{gitCommands}</pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 3: CLOUDFLARE PAGES CONFIG */}
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900/80">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-center text-mk-green-400 font-mono font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white mb-1">Hospedar no Cloudflare Pages</h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed mb-3">
                        Assim que o repositório estiver no GitHub, configure um projeto gratuito no <strong className="text-white">Cloudflare Pages</strong> apontando para o repositório para deploy automático robusto:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                        <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-900/80 text-zinc-400">
                          <span className="text-zinc-500 block uppercase text-[8px] font-extrabold tracking-wider mb-0.5">Build Command:</span>
                          <code className="text-white font-semibold">npm run build</code>
                        </div>
                        <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-900/80 text-zinc-400">
                          <span className="text-zinc-500 block uppercase text-[8px] font-extrabold tracking-wider mb-0.5">Output Directory:</span>
                          <code className="text-white font-semibold">dist</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="mt-8 pt-5 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <Globe size={11} className="text-mk-green-500" />
                  Pronto para distribuição sob cache redundante Cloudflare.
                </span>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs tracking-wider uppercase py-2.5 px-6 rounded-xl border border-zinc-800 transition-colors"
                >
                  Entendi
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
