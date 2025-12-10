import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, ToggleLeft, ToggleRight, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { geminiService } from '../../services/geminiService';
import { Message } from '../../types';

const ChatPanel: React.FC = () => {
  const { currentSession, updateSession, profile } = useUserStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Initial greeting if chat is empty
  useEffect(() => {
    if (currentSession && currentSession.messages.length === 0 && profile) {
       // Silent initialization with prompt context
       geminiService.startChat(currentSession.messages, profile);
       
       // Fake initial message from AI
       const initialMsg: Message = {
         role: 'model',
         text: `Hola ${profile.name}. Veo que quieres aprender sobre **${profile.goal}**. \n\nSoy tu mentor senior. Como ${profile.level} ${profile.role}, ¿por dónde te gustaría empezar? ¿Tienes alguna duda específica o prefieres que te dé una introducción?`,
         timestamp: Date.now()
       };
       updateSession({ messages: [initialMsg] });
    } else if (currentSession && profile) {
        // Just reconnect logic
        geminiService.startChat(currentSession.messages, profile);
    }
  }, [currentSession?.id]);

  const handleSend = async () => {
    if (!input.trim() || !currentSession || isTyping) return;

    const userMsg: Message = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const newMessages = [...currentSession.messages, userMsg];
    updateSession({ messages: newMessages });
    setInput('');
    setIsTyping(true);

    try {
      const stream = await geminiService.sendMessageStream(userMsg.text);
      let aiText = '';
      
      // Placeholder for streaming
      const aiMsg: Message = { role: 'model', text: '', timestamp: Date.now() };
      
      // We update the state progressively
      for await (const chunk of stream) {
        aiText += chunk;
        updateSession({ 
            messages: [...newMessages, { ...aiMsg, text: aiText }] 
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  if (!currentSession) return null;

  return (
    <div className="flex flex-col h-full bg-[#0B0C10] relative">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center backdrop-blur-md bg-[#0B0C10]/80 z-10 absolute top-0 w-full">
        <div>
           <h3 className="text-sm font-semibold text-slate-200">Mentorship Session</h3>
           <p className="text-xs text-emerald-500 font-mono flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
             Online
           </p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => updateSession({ includeErrors: !currentSession.includeErrors })}
                className="text-xs flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                title="Si está activo, tus errores se documentarán en el post final"
            >
                {currentSession.includeErrors ? <ToggleRight className="text-emerald-400" /> : <ToggleLeft />}
                <span>Log Errors</span>
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 pb-4 space-y-6 scroll-smooth">
        {currentSession.messages.map((msg, idx) => (
            <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 mt-1 flex-shrink-0">
                        <Sparkles size={14} className="text-indigo-400" />
                    </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-slate-800 text-slate-100 rounded-tr-sm' 
                    : 'bg-transparent text-slate-300'
                }`}>
                    {msg.role === 'user' ? (
                        msg.text
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-a:text-indigo-400 prose-code:text-emerald-400 prose-code:bg-slate-900/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#020617] prose-pre:border prose-pre:border-white/10">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 mt-1 flex-shrink-0">
                        <User size={14} className="text-slate-400" />
                    </div>
                )}
            </motion.div>
        ))}
        {isTyping && (
            <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Sparkles size={14} className="text-indigo-400" />
                 </div>
                 <div className="flex items-center gap-1 h-8">
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-150" />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#0B0C10] border-t border-white/5">
        <div className="relative">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu respuesta o duda..."
                className="w-full bg-[#161b22] border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-transparent"
            >
                <Send size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
