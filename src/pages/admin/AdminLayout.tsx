import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, Users, CreditCard, LogOut, Home, Menu, X as CloseIcon, ReceiptText, Bell, Headset } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getSocket } from '../../services/socket';

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newPayments, setNewPayments] = useState(0);
  const [activeChats, setActiveChats] = useState(0);
  const socket = getSocket();

  // Notifications Polling & Socket Listeners
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        const data = await res.json();
        setNewPayments(data.unread);
      } catch (e) {}
    };

    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/admin/chat-sessions');
        const data = await res.json();
        setActiveChats(data.length);
      } catch (e) {}
    };

    const interval = setInterval(() => {
      checkNotifications();
    }, 10000);
    
    checkNotifications();
    fetchSessions();

    socket.on("admin_notification", (data) => {
      if (data.type === "new_chat") {
        setActiveChats(prev => prev + 1);
        // Play notification sound
      }
    });

    socket.on("support_ended", () => {
      fetchSessions();
    });

    return () => {
      clearInterval(interval);
      socket.off("admin_notification");
      socket.off("support_ended");
    };
  }, [socket]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      // For demo, we let the user see it, but IRL we navigate away
      // navigate('/'); 
    }
  }, [isAdmin, navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Filmes', path: '/admin/filmes', icon: Film },
    { name: 'Usuários', path: '/admin/usuarios', icon: Users },
    { name: 'Planos', path: '/admin/planos', icon: CreditCard },
    { name: 'Pagamentos', path: '/admin/pagamentos', icon: ReceiptText },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-red-600 tracking-tighter">Painel Admin</h1>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-neutral-900 rounded-full">
          <CloseIcon className="w-5 h-5 text-neutral-400" />
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm relative ${
                isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
              {item.name === 'Pagamentos' && newPayments > 0 && (
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-black text-black">
                   {newPayments}
                 </span>
               )}
              {item.name === 'Atendimento' && activeChats > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff2e55] text-[10px] font-black text-white animate-pulse">
                  {activeChats}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-6 border-t border-neutral-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-neutral-900 hover:text-white transition-all text-sm font-bold"
          >
            <Home className="w-5 h-5" />
            Voltar ao Site
          </Link>

          <Link
            to="/admin/chat"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm relative ${
              location.pathname === '/admin/chat' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <Headset className="w-5 h-5" />
            Atendimento
            {activeChats > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff2e55] text-[10px] font-black text-white animate-pulse">
                {activeChats}
              </span>
            )}
          </Link>
        </div>
      </nav>
      <div className="p-6 border-t border-neutral-800">
        <div className="flex items-center gap-3 mb-6 px-2">
           <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 font-black">
              {user?.email?.charAt(0).toUpperCase()}
           </div>
           <div className="flex flex-col min-w-0">
             <span className="text-xs font-black text-white truncate">{user?.email?.split('@')[0]}</span>
             <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Administrador</span>
           </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-red-500 transition-all w-full font-bold text-sm bg-neutral-900/50 rounded-xl hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          Sair do Painel
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 bg-black border-r border-neutral-800/50 flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 bottom-0 left-0 w-80 bg-black z-[101] transform transition-transform duration-300 ease-out border-r border-neutral-800/50 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-neutral-800/50 shrink-0">
          <h1 className="text-xl font-black text-red-600 tracking-tighter">Painel</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
