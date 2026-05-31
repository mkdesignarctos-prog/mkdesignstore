import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Navbar } from '../components/Navbar';
import { UploadCloud, Image as ImageIcon, FileBox, ShieldCheck } from 'lucide-react';

export function Publish() {
  const { currentUser, publishApp } = useStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Jogos');
  const [version, setVersion] = useState('1.0.0');
  
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [appFile, setAppFile] = useState<File | null>(null);
  const [appObjectUrl, setAppObjectUrl] = useState<string | null>(null);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPublishing, setIsPublishing] = useState(false);

  // Redireciona se não for desenvolvedor
  if (!currentUser?.isDeveloper) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-zinc-400 mb-6">Você precisa ser um Desenvolvedor MK para acessar este painel.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-mk-green-500 text-black font-bold rounded-full">
          Voltar para Home
        </button>
      </div>
    );
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 150 * 1024) {
        alert("O ícone deve ter no máximo 150KB.");
        e.target.value = '';
        return;
      }
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("O tamanho do arquivo do app está limitado a 800KB nesta versão inicial.");
        e.target.value = '';
        return;
      }
      setAppFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppObjectUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !iconPreview) {
      alert('Por favor, preencha todos os campos obrigatórios e adicione um ícone.');
      return;
    }

    setIsPublishing(true);

    // Simula upload
    setTimeout(() => {
      publishApp({
        name,
        description,
        category,
        version,
        developerId: currentUser.id,
        developerName: currentUser.name,
        iconDataUrl: iconPreview,
        fileObjectUrl: appObjectUrl || undefined,
        fileName: appFile?.name,
        size: appFile ? formatSize(appFile.size) : 'Variante',
      });
      
      setIsPublishing(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 border-b border-zinc-800 pb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">MK Console | Publicar App</h1>
          <p className="text-zinc-400">Distribua seu aplicativo ou jogo para milhares de usuários instantaneamente.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sessão: Informações Básicas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Detalhes do Aplicativo</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Nome do App / Jogo *</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Cyber Racing 2026"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-mk-green-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição Completa *</label>
                <textarea 
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte para os usuários o que seu app faz, seus recursos..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-mk-green-500 rounded-xl px-4 py-3 text-white outline-none transition-colors resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Categoria</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-mk-green-500 rounded-xl px-4 py-3 text-white outline-none transition-colors appearance-none"
                  >
                    <option>Jogos</option>
                    <option>Produtividade</option>
                    <option>Ferramentas</option>
                    <option>Social</option>
                    <option>Educação</option>
                    <option>Entretenimento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Versão de Lançamento</label>
                  <input 
                    type="text" 
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-mk-green-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sessão: Ativos Gráficos e Arquivos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Arquivos e Gráficos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Ícone */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Ícone do App * (512x512px)</label>
                <div 
                  onClick={() => iconInputRef.current?.click()}
                  className="bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-mk-green-500/50 rounded-2xl w-full aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group"
                >
                  {iconPreview ? (
                    <img src={iconPreview} alt="Ícone" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-600 group-hover:text-mk-green-500 transition-colors">
                      <ImageIcon size={48} className="mb-4" />
                      <span className="text-sm font-medium">Upload Imagem</span>
                    </div>
                  )}
                  {iconPreview && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold text-white">
                      Trocar Ícone
                    </div>
                  )}
                  <input type="file" ref={iconInputRef} onChange={handleIconChange} accept="image/*" className="hidden" />
                </div>
              </div>

              {/* Arquivo do App */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Arquivo Executável (.apk, .zip, etc)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-mk-green-500/50 rounded-2xl w-full h-full min-h-[200px] flex flex-col items-center justify-center cursor-pointer transition-colors"
                >
                  <div className={`flex flex-col items-center transition-colors text-center px-4 ${appFile ? 'text-mk-green-400' : 'text-zinc-600 hover:text-mk-green-500'}`}>
                    {appFile ? (
                      <>
                        <ShieldCheck size={48} className="mb-4 text-mk-green-500" />
                        <span className="font-bold text-white block mb-1 truncate max-w-full">{appFile.name}</span>
                        <span className="text-xs text-zinc-400">{formatSize(appFile.size)} - Pronto para envio</span>
                      </>
                    ) : (
                      <>
                        <FileBox size={48} className="mb-4" />
                        <span className="text-sm font-medium">Fazer upload do arquivo</span>
                        <span className="text-xs mt-2 text-zinc-500">Max 800KB</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isPublishing}
              className="bg-mk-green-500 hover:bg-mk-green-400 text-black px-10 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(57,255,20,0.15)] hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 min-w-[200px]"
            >
              {isPublishing ? (
                <>
                  <UploadCloud size={20} className="animate-bounce" />
                  Publicando e Verificando...
                </>
              ) : (
                <>
                  <UploadCloud size={20} />
                  Publicar na MK Store
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
