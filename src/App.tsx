import React, { useState } from 'react';
import { Music, Send, Copy, RefreshCw, Trash2, Mic2, Piano, Disc, User, Info, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateComposition } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_PROMPT = "";

interface Composition {
  musicName: string;
  lyrics: string;
  stylePrompt: string;
  stylePromptStudio: string;
  excludeStyles: string;
  weirdness: number;
  styleInfluence: number;
  persona: string;
  productionSummary: {
    vocal: string;
    instrumental: string;
  };
}

export default function App() {
  const [input, setInput] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(false);
  const [composition, setComposition] = useState<Composition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateComposition(input);
      setComposition(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao gerar a composição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="min-h-screen bg-mesh text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-12 h-12 bg-black rounded-2xl flex items-center justify-center border border-white/10">
                <Music className="text-emerald-500 w-7 h-7" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-white">Mestre Compositor</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/80 font-bold">Elite Music Engineering</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16 text-center space-y-6 flex flex-col items-center">
          <h2 className="text-lg md:text-2xl font-display font-medium tracking-wide text-zinc-300 drop-shadow-sm">
            A mente dos melhores compositores do mundo, <br className="hidden md:block" />
            alimentada por <span className="font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">Espiritual Quântico</span>.
          </h2>
          <h3 className="text-xs md:text-sm font-display font-bold uppercase tracking-[0.3em] text-emerald-500/70 drop-shadow-sm">
            Gerador de Letras Únicas, Autorais e de Sucesso
          </h3>
          <div className="mt-2 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Info className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-sm font-display font-bold uppercase tracking-widest text-zinc-300">Entrada Criativa</h2>
              </div>
              
              <div className="relative">
                <div className="glass-card rounded-3xl overflow-hidden">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Descreva sua ideia musical aqui (ex: Uma letra de Rock em Português sobre liberdade)..."
                    className="w-full h-[600px] bg-transparent p-8 text-sm font-mono leading-relaxed focus:outline-none transition-all resize-none placeholder:text-zinc-700 caret-emerald-500 custom-scrollbar"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  />
                </div>
                
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 glass rounded-2xl shadow-2xl">
                  <button
                    onClick={() => setInput(DEFAULT_PROMPT)}
                    className="p-3 text-zinc-500 hover:text-emerald-400 transition-all hover:scale-110 active:scale-95"
                    title="Resetar Template"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setInput('')}
                    className="p-3 text-zinc-500 hover:text-red-400 transition-all hover:scale-110 active:scale-95"
                    title="Limpar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !input.trim()}
                    className={cn(
                      "flex items-center gap-3 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-display font-bold text-sm transition-all shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 active:scale-95",
                      loading && "animate-pulse"
                    )}
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Processando...' : 'Gerar Obra-Prima'}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </motion.div>
              )}
            </section>

            <div className="pt-8">
              <section className="grid grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Mic2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Vocal Engineering</h3>
                  <p className="text-[10px] text-zinc-600 leading-relaxed">Ajustes de textura, alcance e dinâmica emocional.</p>
                </div>
                <div className="glass-card p-6 rounded-3xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Piano className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Sound Design</h3>
                  <p className="text-[10px] text-zinc-600 leading-relaxed">Arranjos instrumentais e evolução sonora.</p>
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {composition ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  {/* Music Identity */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Disc className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">New Composition</span>
                    </div>
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-2">
                        <h2 className="text-5xl font-display font-bold tracking-tight text-white leading-tight">{composition.musicName}</h2>
                        <div className="flex items-center gap-3 text-zinc-500 text-xs font-medium">
                          <User className="w-4 h-4 text-emerald-500" />
                          <span className="tracking-wide">Persona: <span className="text-zinc-300">{composition.persona}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { label: 'Weirdness', value: composition.weirdness, color: 'emerald' },
                      { label: 'Influence', value: composition.styleInfluence, color: 'emerald' }
                    ].map((stat) => (
                      <div key={stat.label} className="glass-card p-6 rounded-3xl">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                        <div className="text-3xl font-mono font-bold text-emerald-400">{stat.value}</div>
                      </div>
                    ))}
                    <div className="glass-card p-6 rounded-3xl col-span-2">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2">Exclude Styles</div>
                      <div className="text-xs font-medium text-red-400/80 truncate">{composition.excludeStyles}</div>
                    </div>
                  </div>

                  {/* Production Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="glass-card p-8 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500">
                        <Mic2 className="w-5 h-5" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Vocal Production</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">{composition.productionSummary.vocal}</p>
                    </div>
                    <div className="glass-card p-8 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3 text-emerald-500">
                        <Piano className="w-5 h-5" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Instrumental Production</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">{composition.productionSummary.instrumental}</p>
                    </div>
                  </div>

                  {/* Style Prompt */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Disc className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="text-xs font-display font-bold uppercase tracking-widest text-zinc-300">Style Prompt</h3>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(composition.stylePrompt, 'style')}
                        className="px-4 py-2 glass rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-400 transition-all active:scale-95"
                      >
                        {copiedType === 'style' ? 'Copiado!' : 'Copiar Prompt'}
                      </button>
                    </div>
                    <div className="glass-card p-8 rounded-3xl text-sm font-medium text-emerald-200/90 leading-relaxed italic">
                      {composition.stylePrompt}
                    </div>
                  </div>

                  {/* Style Prompt (Estúdio) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                          <Headphones className="w-4 h-4 text-teal-500" />
                        </div>
                        <h3 className="text-xs font-display font-bold uppercase tracking-widest text-zinc-300">Style Prompt (Estúdio)</h3>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(composition.stylePromptStudio, 'styleStudio')}
                        className="px-4 py-2 glass rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-teal-400 transition-all active:scale-95"
                      >
                        {copiedType === 'styleStudio' ? 'Copiado!' : 'Copiar Prompt Estúdio'}
                      </button>
                    </div>
                    <div className="glass-card p-8 rounded-3xl text-sm font-medium text-teal-200/90 leading-relaxed italic border-teal-500/10">
                      {composition.stylePromptStudio}
                    </div>
                  </div>

                  {/* Lyrics */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Music className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h3 className="text-xs font-display font-bold uppercase tracking-widest text-zinc-300">Letra & Estrutura</h3>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(composition.lyrics, 'lyrics')}
                        className="px-4 py-2 glass rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-400 transition-all active:scale-95"
                      >
                        {copiedType === 'lyrics' ? 'Copiado!' : 'Copiar Letra'}
                      </button>
                    </div>
                    <div className="glass-card rounded-3xl p-10 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[800px] overflow-y-auto custom-scrollbar">
                      {composition.lyrics.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        const isSectionTag = trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.includes(':');
                        const isAnnotation = trimmed.startsWith('[') && trimmed.includes(':');
                        
                        return (
                          <div key={i} className={cn(
                            "min-h-[1.5em]",
                            isSectionTag ? "text-emerald-400 font-bold mt-10 mb-4 text-lg tracking-tight" : 
                            isAnnotation ? "text-emerald-500/40 text-[10px] italic mb-2 tracking-wide" : 
                            "text-zinc-400"
                          )}>
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-8 py-32"
                >
                  <div className="relative">
                    <div className="absolute -inset-8 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="relative w-32 h-32 glass rounded-full flex items-center justify-center border border-white/5">
                      <Music className="w-12 h-12 text-zinc-700" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-display font-bold text-zinc-400 tracking-tight">Pronto para a Maestria?</h3>
                    <p className="text-sm text-zinc-600 max-w-xs mx-auto leading-relaxed">
                      Configure os parâmetros à esquerda e deixe a Mestre Compositor arquitetar sua próxima composição de elite.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
}
