import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Minus, Maximize2, User, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../services/socket';

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    if (!user) return;

    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("session_started", (data) => {
      setSessionId(data.sessionId);
    });

    socket.on("support_ended", () => {
      alert("A sessão de atendimento foi encerrada.");
      setSessionId(null);
      setMessages([]);
      setIsOpen(false);
    });

    return () => {
      socket.off("receive_message");
      socket.off("session_started");
      socket.off("support_ended");
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startConversation = () => {
    if (!user) return;
    const u = user as any;
    socket.emit("start_support", {
      userId: u.id,
      userName: u.username || u.email
    });
  };

  const endConversation = () => {
    if (sessionId) {
      socket.emit("end_support", { sessionId });
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId || !user) return;
    const u = user as any;

    socket.emit("send_message", {
      sessionId,
      userId: u.id,
      userName: u.username || u.email,
      message: inputValue,
      isAdmin: false
    });

    setInputValue('');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px',
              width: '350px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-4 transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-[#ff2e55] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Headset className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Atendimento Online</h3>
                  <p className="text-white/60 text-[10px] uppercase font-black tracking-widest">
                    {sessionId ? "Conversa em andamento" : "Pronto para ajudar"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded transition">
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minus className="w-4 h-4 text-white" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded transition">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900/50">
                  {!sessionId ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 bg-[#ff2e55]/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-[#ff2e55]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Precisa de ajuda?</h4>
                        <p className="text-neutral-500 text-xs mt-2">Clique no botão abaixo para iniciar uma conversa agora mesmo com nossa equipe.</p>
                      </div>
                      <button 
                        onClick={startConversation}
                        className="bg-[#ff2e55] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:brightness-110 transition active:scale-95 shadow-lg shadow-[#ff2e55]/20"
                      >
                        Iniciar Atendimento
                      </button>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                            msg.is_admin 
                              ? 'bg-neutral-800 text-white rounded-tl-none' 
                              : 'bg-[#ff2e55] text-white rounded-tr-none'
                          }`}>
                            {msg.message}
                            <div className={`text-[10px] mt-1 ${msg.is_admin ? 'text-neutral-500' : 'text-white/60'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Footer Input */}
                {sessionId && (
                  <div className="p-3 border-t border-neutral-800 flex flex-col gap-2">
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff2e55] transition"
                      />
                      <button 
                        type="submit"
                        className="p-2 bg-[#ff2e55] rounded-full text-white hover:brightness-110 transition active:scale-95"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                    <button 
                      onClick={endConversation}
                      className="text-[10px] text-neutral-500 hover:text-red-500 uppercase font-black tracking-widest text-center py-1 transition"
                    >
                      Encerrar Atendimento
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="w-14 h-14 bg-[#ff2e55] rounded-full flex items-center justify-center shadow-xl shadow-[#ff2e55]/30 text-white hover:scale-110 transition transform group active:scale-95"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1a1a1a] rounded-full" />
      </button>
    </div>
  );
}
