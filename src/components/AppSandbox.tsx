import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, RotateCcw, Cpu, HardDrive, ShieldAlert, Terminal, MessageSquare, Save, Plus, FileText, Send, Trash2, Check, Star } from 'lucide-react';
import { AppItem } from '../types';

interface AppSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppItem;
}

export function AppSandbox({ isOpen, onClose, app }: AppSandboxProps) {
  const [cpuUsage, setCpuUsage] = useState(2);
  const [ramUsage, setRamUsage] = useState(45);
  const [isOnline, setIsOnline] = useState(true);
  
  // Game State (if category is Jogos)
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [obstacleX, setObstacleX] = useState(0);
  const [obstacleSpeed, setObstacleSpeed] = useState(2);
  const [gameTime, setGameTime] = useState(0);
  const requestRef = useRef<number | null>(null);
  
  // Productivity/Notes State (if category is Produtividade / Ferramentas / Educação)
  const [notes, setNotes] = useState<string[]>(() => {
    const saved = localStorage.getItem(`sandbox_notes_${app.id}`);
    return saved ? JSON.parse(saved) : ['Nota de Exemplo - Sua sandbox está funcionando!', 'O banco de dados local sincroniza automaticamente.'];
  });
  const [newNote, setNewNote] = useState('');
  
  // Social/Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Sistema', text: 'Conectado ao canal seguro Supabase.', time: 'Ago, 15:44' },
    { sender: 'Comunidade', text: 'Este aplicativo é revolucionário!', time: 'Ago, 15:45' }
  ]);
  const [chatText, setChatText] = useState('');

  // Sandbox simulation terminal logs
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 15)]);
  };

  // Diagnostics ticks
  useEffect(() => {
    if (!isOpen) return;

    addLog(`Iniciando ambiente Docker/Sandbox para: ${app.name}`);
    addLog(`Alocando recursos de host compartilhado... OK`);
    addLog(`Estabelecendo rota síncrona com Banco de Dados Supabase (Realtime Database)`);

    const interval = setInterval(() => {
      // Dynamic diagnostic stats flux
      setCpuUsage(prev => {
        const delta = Math.floor(Math.random() * 6) - 3;
        const currentActive = gameState === 'running' ? 38 : 5;
        return Math.max(1, Math.min(99, currentActive + delta));
      });
      setRamUsage(prev => {
        const delta = Math.floor(Math.random() * 4) - 2;
        const base = gameState === 'running' ? 142 : 58;
        return Math.max(30, Math.min(512, base + delta));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, gameState]);

  // Game Loop logic
  useEffect(() => {
    if (gameState !== 'running') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    addLog(`[Sandbox Exec] Motor de jogo ativo @ 60 FPS.`);
    
    let timer = 0;
    let obstaclePosition = 0;
    let localScore = 0;
    
    const updateGame = () => {
      timer += 1;
      setGameTime(Math.floor(timer / 60));
      
      // Move obstacle
      obstaclePosition += obstacleSpeed;
      if (obstaclePosition > 100) {
        obstaclePosition = 0;
        localScore += 10;
        setScore(localScore);
        if (localScore > highScore) setHighScore(localScore);
        // speed up gradually
        setObstacleSpeed(prev => Math.min(prev + 0.15, 6)); 
      }
      setObstacleX(obstaclePosition);
      
      // Hit detection (range overlap around player positions)
      // Player is at playerX, obstacle moves across x=0 to 100.
      const playerPos = playerX;
      if (obstaclePosition > 45 && obstaclePosition < 55) {
        if (Math.abs(playerPos - 50) < 15) {
          // Crash!
          setGameState('gameover');
          addLog(`[Erro Fatal] Colisão detectada na coordenada X: ${obstaclePosition.toFixed(2)}. Game Over.`);
          return;
        }
      }

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, playerX, obstacleSpeed]);

  const startGame = () => {
    setScore(0);
    setObstacleX(0);
    setObstacleSpeed(2);
    setGameState('running');
    addLog(`Partida iniciada. Desvie dos obstáculos vermelhos.`);
  };

  const handleKeyPressLeft = () => {
    setPlayerX(prev => Math.max(10, prev - 15));
  };

  const handleKeyPressRight = () => {
    setPlayerX(prev => Math.min(90, prev + 15));
  };

  const saveNotes = (updatedNotes: string[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(`sandbox_notes_${app.id}`, JSON.stringify(updatedNotes));
    addLog(`Sincronizado de forma segura com o Supabase Database.`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const list = [...notes, newNote.trim()];
    saveNotes(list);
    setNewNote('');
  };

  const handleRemoveNote = (idx: number) => {
    const list = notes.filter((_, i) => i !== idx);
    saveNotes(list);
  };

  const handleSendChatMessage = () => {
    if (!chatText.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { sender: 'Você', text: chatText.trim(), time: 'Agora' }
    ]);
    addLog(`Mensagem transmitida com sucesso para o websocket.`);
    setChatText('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glass */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Emulate Container dialog */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(57,255,20,0.15)] z-10"
        >
          {/* Main sandbox playground */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950">
            {/* Header bar of sandbox simulator */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={app.iconDataUrl} alt="App" className="w-8 h-8 rounded-lg object-cover" />
                <div>
                  <h3 className="text-white font-bold text-sm tracking-tight">{app.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono text-left">Executando em MK OS Sandbox v1.4.1</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mk-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-mk-green-500"></span>
                </span>
                <span className="text-[9px] uppercase font-mono text-mk-green-400 font-extrabold tracking-wider bg-mk-green-950/40 border border-mk-green-500/20 px-2 py-0.5 rounded">
                  SANDBOX ATIVA
                </span>
              </div>
            </div>

            {/* Simulated app interface layer */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center bg-zinc-950 overflow-y-auto min-h-[350px]">
              
              {/* Category: JOGO */}
              {app.category === 'Jogos' && (
                <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex flex-col items-center shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 via-mk-green-400 to-blue-500"></div>
                  
                  <div className="flex justify-between w-full mb-4 text-xs font-mono text-zinc-400">
                    <div>PONTOS: <span className="text-white font-bold">{score}</span></div>
                    <div>RECORD: <span className="text-mk-green-400 font-bold">{highScore}</span></div>
                  </div>

                  {gameState === 'idle' && (
                    <div className="text-center py-12 flex flex-col items-center">
                      <div className="w-16 h-16 bg-mk-green-500/10 border border-mk-green-500/30 text-mk-green-400 rounded-full flex items-center justify-center mb-4">
                        <Play size={28} className="ml-1 animate-pulse" />
                      </div>
                      <h4 className="text-white font-extrabold text-lg tracking-tight mb-2">MK Space Dodge</h4>
                      <p className="text-zinc-500 text-xs max-w-xs mb-5 font-light leading-relaxed">
                        Desvie dos detritos espaciais vermelhos movendo-se lateralmente nas setas.
                      </p>
                      <button 
                        onClick={startGame}
                        className="bg-mk-green-500 hover:bg-mk-green-400 text-black text-xs font-bold font-mono tracking-wider uppercase py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                      >
                        Iniciar Simulação
                      </button>
                    </div>
                  )}

                  {gameState === 'running' && (
                    <div className="w-full flex flex-col items-center">
                      {/* Interactive Canvas Board */}
                      <div className="w-full h-36 bg-black rounded-xl border border-zinc-950 relative overflow-hidden mb-5">
                        
                        {/* Player ship */}
                        <div 
                          className="absolute bottom-2 w-6 h-6 bg-mk-green-500 rounded-lg flex items-center justify-center transition-all duration-75"
                          style={{ left: `calc(${playerX}% - 12px)` }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>

                        {/* Obstacle red block */}
                        <div 
                          className="absolute bottom-2 w-5 h-5 bg-red-500 rounded flex items-center justify-center"
                          style={{ left: `calc(${obstacleX}% - 10px)` }}
                        >
                          <span className="text-[8px] font-bold text-white">X</span>
                        </div>

                        {/* Starlight space dust backdrop */}
                        <div className="absolute top-4 left-6 w-1 h-1 bg-white opacity-25 rounded-full"></div>
                        <div className="absolute top-10 right-12 w-1.5 h-1.5 bg-white opacity-40 rounded-full"></div>
                        <div className="absolute top-24 left-1/3 w-1 h-1 bg-white opacity-10 rounded-full"></div>
                        <div className="absolute top-16 right-1/4 w-1 h-1 bg-white opacity-30 rounded-full"></div>
                      </div>

                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={handleKeyPressLeft}
                          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 text-white font-bold rounded-xl border border-zinc-750 font-mono text-sm"
                        >
                          ◀ MOVER ESQ
                        </button>
                        <button 
                          onClick={handleKeyPressRight}
                          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 text-white font-bold rounded-xl border border-zinc-750 font-mono text-sm"
                        >
                          MOVER DIR ▶
                        </button>
                      </div>

                      <div className="mt-4 text-[10px] text-zinc-500 font-mono font-light uppercase">
                        Tempo de voo: {gameTime} segundos
                      </div>
                    </div>
                  )}

                  {gameState === 'gameover' && (
                    <div className="text-center py-10 flex flex-col items-center">
                      <div className="w-14 h-14 bg-red-500/10 border border-red-500/25 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert size={26} />
                      </div>
                      <h4 className="text-red-400 font-bold text-base mb-1">Sandbox Travou: Game Over</h4>
                      <p className="text-zinc-500 text-xs mb-5 font-mono">Erro: Colisão crítica na memória virtual</p>
                      <button 
                        onClick={startGame}
                        className="bg-zinc-800 hover:bg-zinc-750 text-white font-mono text-xs font-bold py-2 px-5 rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw size={12} />
                        Tentar Novamente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Category: PRODUTIVIDADE / FERRAMENTAS / OUTROS */}
              {app.category !== 'Jogos' && (
                <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-2xl p-5 shadow-xl relative text-left">
                  <div className="flex items-center gap-2 pb-3.5 border-b border-zinc-800 mb-4 justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-mk-green-400" />
                      <span className="text-white text-xs font-bold uppercase tracking-wider font-mono">Gerenciador de Atividades Local</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{notes.length} tarefas</span>
                  </div>

                  {/* Add action */}
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Registrar nova entrada..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-mk-green-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-sans"
                    />
                    <button 
                      onClick={handleAddNote}
                      className="bg-mk-green-400 hover:bg-mk-green-300 text-black px-3.5 py-2 rounded-xl transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Task list container */}
                  <div className="space-y-2 h-44 overflow-y-auto pr-1">
                    {notes.length === 0 ? (
                      <p className="text-zinc-650 text-xs italic py-4 text-center">Nenhuma anotação local armazenada.</p>
                    ) : (
                      notes.map((note, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-850/40 text-xs text-zinc-300">
                          <span className="truncate flex-1 pr-4">{note}</span>
                          <button 
                            onClick={() => handleRemoveNote(index)}
                            className="text-zinc-600 hover:text-red-400 p-1 rounded-md transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="h-px bg-zinc-800 my-4"></div>

                  {/* Simple chat wall to simulate real-time communication details */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Feed de Transmissão Real-time (Supabase):</p>
                    <div className="bg-zinc-950/80 rounded-xl p-3 h-24 overflow-y-auto space-y-2 border border-zinc-850">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className="text-[10px] leading-tight">
                          <span className="font-bold text-mk-green-400">{msg.sender}:</span>{' '}
                          <span className="text-zinc-300">{msg.text}</span>
                          <span className="text-zinc-600 font-mono text-[8px] ml-1">({msg.time})</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <input 
                        type="text" 
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        placeholder="Enviar mensagem para o lobby..."
                        className="flex-1 bg-zinc-950/50 border border-zinc-850 focus:border-mk-green-500 rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                      />
                      <button 
                        onClick={handleSendChatMessage}
                        className="bg-zinc-800 hover:bg-zinc-750 text-white p-1 px-3 rounded-lg text-[10px] font-mono border border-zinc-700"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right sidebar - Terminal Logs & Performance Indicators */}
          <div className="w-full md:w-80 border-t md:border-t-0 border-zinc-900 bg-zinc-950 flex flex-col p-5 justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono">Painel de Métricas</h4>
                <button 
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Hardware stats widgets */}
              <div className="space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono uppercase mb-2">
                    <span className="flex items-center gap-1"><Cpu size={13} /> Processador (CPU)</span>
                    <span className="text-white font-bold">{cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-mk-green-400 h-full transition-all duration-300" style={{ width: `${cpuUsage}%` }}></div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono uppercase mb-2">
                    <span className="flex items-center gap-1"><HardDrive size={13} /> Memória Virt. RAM</span>
                    <span className="text-white font-bold">{ramUsage} MB</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-mk-green-400 h-full transition-all duration-300" style={{ width: `${(ramUsage/512)*100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Console Logs terminal box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                    <Terminal size={12} className="text-mk-green-400" />
                    Telemetria de Sistema
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono px-1.5 py-0.5 bg-zinc-900 rounded">60fps</span>
                </div>
                <div className="w-full h-48 bg-black rounded-xl p-3 font-mono text-[9px] text-zinc-400 overflow-y-auto space-y-1.5 border border-zinc-950 shadow-inner flex flex-col-reverse text-left">
                  {logs.map((log, index) => (
                    <div key={index} className={`leading-tight break-all ${log.includes('[Erro Fatal]') ? 'text-red-500 font-bold' : log.includes('OK') ? 'text-mk-green-400' : 'text-zinc-400'}`}>
                      {log}
                    </div>
                  ))}
                  <div className="text-zinc-600 text-[8px] animate-pulse">● ESCUTANDO PORTA 3000 CONTÊINER DOCKER...</div>
                </div>
              </div>
            </div>

            {/* Stop process button */}
            <div className="pt-4 border-t border-zinc-900 mt-4 md:mt-0">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 font-bold text-xs font-mono uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <X size={14} />
                Parar Execução Sandbox
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
