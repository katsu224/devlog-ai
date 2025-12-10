import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, CheckCircle, ChevronRight, User, BookOpen, GraduationCap, AlertCircle, Loader2, Maximize2, Minimize2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { geminiService } from '../../services/geminiService';
import { Message, ExamData, ExamResult } from '../../types';
import ReactMarkdown from 'react-markdown';

const NodeChatSheet: React.FC = () => {
  const { activeNodeId, setActiveNodeId, nodes, profile, updateNodeStatus, updateNodeChat } = useUserStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'exam'>('chat');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Chat State
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Exam State
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [examAnswer, setExamAnswer] = useState('');
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const activeNode = nodes.find(n => n.id === activeNodeId);
  const messages = activeNode?.data.chatHistory || [];

  // Reset state when node changes
  useEffect(() => {
    if (activeNodeId) {
        setActiveTab('chat');
        setExamData(null);
        setExamAnswer('');
        setExamResult(null);
    }
  }, [activeNodeId]);

  useEffect(() => {
    if (activeNode && activeNodeId && profile && messages.length === 0) {
      geminiService.startTopicChat([], activeNode.data.label, profile);
      // Change initial message to assessment question
      const initialMsg: Message = {
        role: 'model',
        text: `### 👋 Bienvenido al módulo: **${activeNode.data.label}**\n\nAntes de sumergirnos en la teoría, necesito calibrar cómo explicarte esto.\n\n**¿Qué tanto conoces sobre este tema?**\n\n1. 👶 Soy totalmente nuevo.\n2. 🤔 He oído hablar de ello pero no lo entiendo bien.\n3. 🤓 Ya lo he usado, quiero profundizar.`,
        timestamp: Date.now()
      };
      updateNodeChat(activeNodeId, [initialMsg]);
      updateNodeStatus(activeNodeId, 'active');
    } else if (activeNode && activeNodeId && profile) {
       // Just refresh chat instance logic if needed, but keeping history is fine
       geminiService.startTopicChat(messages, activeNode.data.label, profile);
    }
  }, [activeNodeId]);

  useEffect(() => {
    if (activeTab === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isExpanded]);

  const handleClose = () => setActiveNodeId(null);

  // --- CHAT LOGIC ---
  const handleSendChat = async () => {
    if (!input.trim() || !activeNodeId) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    const newHistory = [...messages, userMsg];
    updateNodeChat(activeNodeId, newHistory);
    setInput('');
    setIsTyping(true);

    try {
      const stream = await geminiService.sendMessageStream(userMsg.text);
      let aiText = '';
      const aiMsg: Message = { role: 'model', text: '', timestamp: Date.now() };
      
      for await (const chunk of stream) {
        aiText += chunk;
        updateNodeChat(activeNodeId, [...newHistory, { ...aiMsg, text: aiText }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  // --- EXAM LOGIC ---
  const handleStartExam = async () => {
    if (!activeNode || !profile) return;
    setIsExamLoading(true);
    setExamResult(null);
    try {
        const data = await geminiService.generateExam(activeNode.data.label, profile);
        setExamData(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsExamLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!activeNode || !examData) return;
    setIsGrading(true);
    try {
        const result = await geminiService.gradeExam(activeNode.data.label, examData.question, examAnswer);
        setExamResult(result);
        if (result.passed && activeNodeId) {
            updateNodeStatus(activeNodeId, 'completed');
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGrading(false);
    }
  };

  return (
    <AnimatePresence>
      {activeNodeId && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0, width: isExpanded ? '100%' : 'var(--sheet-width, 600px)' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ '--sheet-width': '600px' } as any}
            className={`fixed right-0 top-0 bottom-0 bg-[#0f172a] border-l border-slate-800 z-50 flex flex-col shadow-2xl ${isExpanded ? 'w-full md:w-full' : 'w-full md:w-[600px]'}`}
          >
            {/* Header */}
            <div className="flex flex-col border-b border-slate-800 bg-[#020617]">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <button onClick={handleClose} className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                            <ChevronRight size={20} />
                        </button>
                        <div>
                            <h2 className="text-white font-bold text-lg">{activeNode?.data.label}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`flex h-2 w-2 rounded-full ${activeNode?.data.status === 'completed' ? 'bg-cyan-500' : 'bg-emerald-500 animate-pulse'}`} />
                                <span className="text-xs text-slate-400 uppercase tracking-wider">
                                    {activeNode?.data.status === 'completed' ? 'Módulo Completado' : 'En Progreso'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="hidden md:flex p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title={isExpanded ? "Minimizar" : "Pantalla Completa"}
                         >
                            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-4 gap-6">
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'chat' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <BookOpen size={16} />
                        Estudio Chat
                    </button>
                    <button 
                        onClick={() => setActiveTab('exam')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'exam' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <GraduationCap size={16} />
                        Examen Final
                        {activeNode?.data.status === 'completed' && <CheckCircle size={14} className="text-cyan-500" />}
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-slate-950 relative scroll-smooth">
                
                {/* --- CHAT VIEW --- */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                        <div className={`flex-1 p-4 md:p-6 space-y-8 ${isExpanded ? 'max-w-5xl mx-auto w-full' : ''}`}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <Sparkles size={18} className="text-emerald-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 shadow-lg overflow-hidden ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                            : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-sm'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            <div className="text-base leading-relaxed">{msg.text}</div>
                                        ) : (
                                            <div className="markdown-body">
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2 border-b border-slate-700 pb-2" {...props} />,
                                                        h2: ({node, ...props}) => <h2 className="text-lg font-bold text-emerald-400 mt-5 mb-3 flex items-center gap-2" {...props} />,
                                                        h3: ({node, ...props}) => <h3 className="text-base font-bold text-indigo-400 mt-4 mb-2 flex items-center gap-2 uppercase tracking-wide" {...props} />,
                                                        p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-4 last:mb-0" {...props} />,
                                                        ul: ({node, ...props}) => <ul className="space-y-2 mb-4 text-slate-300 ml-1" {...props} />,
                                                        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-300 ml-2" {...props} />,
                                                        li: ({node, ...props}) => (
                                                            <li className="flex items-start gap-2" {...props}>
                                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                                <span>{props.children}</span>
                                                            </li>
                                                        ),
                                                        // Override li for ordered lists to just default
                                                        code: ({node, inline, className, children, ...props}: any) => {
                                                            const match = /language-(\w+)/.exec(className || '')
                                                            return !inline ? (
                                                                <div className="relative group my-4 rounded-lg overflow-hidden border border-slate-700 bg-[#0d1117] shadow-lg">
                                                                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/50 border-b border-slate-700/50 text-xs text-slate-400">
                                                                        <span className="font-mono">{match ? match[1] : 'code'}</span>
                                                                        <div className="flex gap-1.5">
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                                                                        </div>
                                                                    </div>
                                                                    <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-blue-100">
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                            ) : (
                                                                <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700/50 mx-0.5" {...props}>
                                                                    {children}
                                                                </code>
                                                            )
                                                        },
                                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-500/5 text-emerald-100/80 italic rounded-r-lg" {...props} />,
                                                        a: ({node, ...props}) => <a className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                                                        strong: ({node, ...props}) => <strong className="text-emerald-300 font-semibold" {...props} />,
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User size={18} className="text-indigo-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                         <Sparkles size={18} className="text-emerald-400" />
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-5 flex items-center gap-2 h-fit">
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {/* Chat Input */}
                        <div className="p-4 bg-[#020617] border-t border-slate-800">
                            <div className={`relative ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                    placeholder="Escribe tu duda aquí..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-5 pr-14 py-4 text-base text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none placeholder:text-slate-500 shadow-xl"
                                />
                                <button 
                                    onClick={handleSendChat}
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- EXAM VIEW --- */}
                {activeTab === 'exam' && (
                    <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-full">
                        {activeNode?.data.status === 'completed' && !examResult ? (
                             <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
                                    <CheckCircle size={40} className="text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">¡Módulo Completado!</h3>
                                <p className="text-slate-400 max-w-xs mx-auto">Ya has aprobado este examen. Puedes avanzar al siguiente módulo.</p>
                                <button onClick={handleClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                                    Cerrar y Continuar
                                </button>
                             </div>
                        ) : !examData ? (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20 rotate-3">
                                    <GraduationCap size={32} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">¿Listo para el Reto?</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto text-sm">
                                        Completa un ejercicio generado por IA para validar tus conocimientos y desbloquear el siguiente nivel.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleStartExam}
                                    disabled={isExamLoading}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 mx-auto disabled:opacity-70"
                                >
                                    {isExamLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                    Generar Examen
                                </button>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Tu Desafío</h4>
                                    <p className="text-white text-lg font-medium leading-relaxed">{examData.question}</p>
                                </div>

                                {!examResult ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-500 font-medium ml-1 mb-2 block">TU SOLUCIÓN</label>
                                            <textarea 
                                                value={examAnswer}
                                                onChange={(e) => setExamAnswer(e.target.value)}
                                                className="w-full h-48 bg-[#020617] border border-slate-800 rounded-xl p-5 text-sm text-slate-200 font-mono focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                                                placeholder={examData.type === 'code' ? "// Escribe tu código aquí..." : "Explica tu respuesta..."}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleSubmitExam}
                                            disabled={!examAnswer.trim() || isGrading}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-900/20"
                                        >
                                            {isGrading ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Calificando...
                                                </>
                                            ) : (
                                                <>
                                                    Enviar Solución <ChevronRight size={20} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`rounded-xl border p-6 text-center space-y-4 ${
                                        examResult.passed 
                                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                                        : 'bg-red-500/5 border-red-500/20'
                                    }`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                                            examResult.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {examResult.passed ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                        </div>
                                        
                                        <div>
                                            <h3 className={`font-bold text-lg mb-1 ${examResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {examResult.passed ? '¡Excelente Trabajo!' : 'Necesita Mejorar'}
                                            </h3>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {examResult.feedback}
                                            </p>
                                        </div>

                                        {examResult.passed ? (
                                            <button onClick={handleClose} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20">
                                                Continuar Roadmap
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => { setExamResult(null); setIsGrading(false); }}
                                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Intentar de Nuevo
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NodeChatSheet;