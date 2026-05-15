import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ChevronLeft, Headset, CheckCircle2 } from 'lucide-react';
import { getSocket } from '../../services/socket';

export default function AdminChat() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    // Load active sessions from API
    fetch('/api/admin/chat-sessions')
      .then(res => res.json())
      .then(data => setSessions(data));

    socket.on("admin_notification", (data) => {
      if (data.type === "new_chat") {
        setSessions(prev => {
          if (prev.some(s => s.id === data.sessionId)) return prev;
          return [...prev, { id: data.sessionId, user_name: data.userName, user_id: data.userId, status: 'active' }];
        });
        // Play notification sound or show alert
      }
    });

    socket.on("receive_message", (msg) => {
      if (selectedSession && msg.session_id === selectedSession.id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on("support_ended", (data) => {
      setSessions(prev => prev.filter(s => s.id !== data.sessionId));
      if (selectedSession?.id === data.sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    });

    return () => {
      socket.off("admin_notification");
      socket.off("receive_message");
      socket.off("support_ended");
    };
  }, [selectedSession]);

  useEffect(() => {
    if (selectedSession) {
      socket.emit("join_room", selectedSession.id);
      fetch(`/api/chat-messages/${selectedSession.id}`)
        .then(res => res.json())
        .then(data => setMessages(data));
    }
  }, [selectedSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedSession) return;

    socket.emit("send_message", {
      sessionId: selectedSession.id,
      userId: 'admin',
      userName: 'Suporte DramasFlix',
      message: inputValue,
      isAdmin: true
    });

    setInputValue('');
  };

  const closeSession = (sessionId: string) => {
    socket.emit("end_support", { sessionId });
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-[#1a1a1a] rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
      {/* Sidebar - Active Sessions */}
      <div className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-900/30">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Headset className="w-5 h-5 text-[#ff2e55]" /> Central de Chats
          </h2>
          <p className="text-neutral-500 text-xs mt-1">{sessions.length} chats ativos no momento</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSession(s)}
                className={`w-full p-4 flex items-center gap-3 border-b border-neutral-800/50 transition hover:bg-white/5 ${selectedSession?.id === s.id ? 'bg-[#ff2e55]/10 border-l-4 border-l-[#ff2e55]' : ''}`}
              >
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-400">
                  {s.user_name?.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{s.user_name}</p>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Ativo
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-500">Sem chamados pendentes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/20">
        {selectedSession ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-400">
                  {selectedSession.user_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedSession.user_name}</h3>
                  <p className="text-xs text-neutral-500">ID: {selectedSession.user_id}</p>
                </div>
              </div>
              <button 
                onClick={() => closeSession(selectedSession.id)}
                className="px-4 py-2 bg-neutral-800 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-xs font-bold text-neutral-400 transition"
              >
                ENCERRAR ATENDIMENTO
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${
                    msg.is_admin 
                      ? 'bg-neutral-800 text-white rounded-tr-none' 
                      : 'bg-[#ff2e55]/10 border border-[#ff2e55]/20 text-white rounded-tl-none'
                  }`}>
                    {msg.message}
                    <div className="text-[10px] text-neutral-500 mt-2">
                       {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-neutral-800">
              <form onSubmit={sendMessage} className="flex gap-4">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff2e55] transition"
                />
                <button 
                  type="submit"
                  className="px-6 bg-[#ff2e55] rounded-xl text-white font-bold hover:brightness-110 transition active:scale-95 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Enviar
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-neutral-700" />
            </div>
            <h3 className="text-xl font-bold text-neutral-400">Selecione um chat para começar</h3>
            <p className="text-neutral-600 max-w-sm mt-2">Os chamados ativos dos usuários aparecerão na lista lateral.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
