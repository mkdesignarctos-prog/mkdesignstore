import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { X, Gamepad2, ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { loginWithPassword, signUpWithPassword } = useStore();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUpWithPassword(username, password);
        setSuccessMessage('Conta criada com sucesso! Se você já puder logar, faça login abaixo.');
        setIsSignUp(false); // Toggle back to login mode so they can sign in
        setPassword(''); // Reset password for login
      } else {
        await loginWithPassword(username, password);
        onClose();
        resetForm();
      }
    } catch (err: any) {
      console.error(err);
      
      // Parse more friendly error messages
      let msg = err.message || 'Erro ao realizar a operação. Verifique seus dados.';
      if (msg.includes('Invalid login credentials') || msg.includes('does not match')) {
        msg = 'Usuário ou senha incorretos.';
      } else if (msg.includes('already registered') || msg.includes('user_already_exists')) {
        msg = 'Este nome de usuário já está sendo utilizado.';
      } else if (msg.includes('Signup is disabled')) {
        msg = 'O cadastro de novas contas está desativado nesta instância do banco de dados.';
      }
      
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-6"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mk-green-600 via-mk-green-400 to-mk-green-600"></div>
              
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-6 mt-2">
                <div className="w-16 h-16 bg-zinc-950 border border-mk-green-500/30 rounded-2xl flex items-center justify-center mb-4 text-mk-green-400 shadow-[0_0_20px_rgba(57,255,20,0.15)] relative">
                  <div className="absolute inset-0 bg-mk-green-400/5 rounded-2xl blur-xl"></div>
                  <Gamepad2 size={32} className="relative z-10 animate-pulse" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white tracking-tight mb-1">
                  {isSignUp ? 'Criar Nova Conta' : 'Acesso Seguro'}
                </h2>
                <p className="text-zinc-400 text-center text-xs leading-relaxed max-w-[280px]">
                  {isSignUp 
                    ? 'Escolha seu apelido gamer e uma senha forte para explorar nossa biblioteca.' 
                    : 'Acesse para baixar jogos, deixar avaliações reais e publicar seus próprios projetos.'}
                </p>
              </div>

              {/* Tab Mode Selectors */}
              <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800/80 mb-6">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); resetForm(); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${!isSignUp ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); resetForm(); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${isSignUp ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Criar Conta
                </button>
              </div>

              {/* Inline alerts to replace window.alerts */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-200 rounded-xl text-xs text-center font-medium"
                >
                  {errorMessage}
                </motion.div>
              )}

              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-4 p-3 bg-mk-green-950/20 border border-mk-green-500/35 text-mk-green-400 rounded-xl text-xs text-center font-medium"
                >
                  {successMessage}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1.5 pl-1">Nome de Usuário</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isSignUp ? 'ex: supermario' : 'ex: supermario ou email'}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-mk-green-500/50 hover:border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 text-sm outline-none transition-all focus:ring-1 focus:ring-mk-green-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1.5 pl-1">Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-mk-green-500/50 hover:border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 text-sm outline-none transition-all focus:ring-1 focus:ring-mk-green-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-mk-green-600 to-mk-green-500 hover:from-mk-green-500 hover:to-mk-green-400 text-black font-semibold rounded-xl py-3 px-4 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 group"
                >
                  <span>{isLoading ? 'Modificando...' : (isSignUp ? 'Registrar' : 'Entrar com Senha')}</span>
                  {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </form>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-500 bg-zinc-950/50 py-3 rounded-xl border border-zinc-900">
                <ShieldCheck size={14} className="text-mk-green-500" />
                <span>Autenticação Segura Supabase</span>
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}

