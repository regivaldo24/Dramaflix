import React, { useState, useEffect } from 'react';
import { Edit, Trash2, X, Check, Search, Filter, Ban, Crown, Clock, Mail, ShieldCheck, User as UserIcon, RotateCcw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminConfirmationModal from '../../components/AdminComponents/AdminConfirmationModal';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, vip, basic, admin
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelData, setCancelData] = useState<{userId: string, subId: string, email: string} | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundUser, setRefundUser] = useState<any>(null);
  const [userPayments, setUserPayments] = useState<any[]>([]);
  const [refundLoading, setRefundLoading] = useState(false);

  const [plansList] = useState<string[]>(['Gratuito', 'Bronze (VIP)', 'Prata (VIP)', 'Ouro (VIP)']);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      // Basic initial sorting: Admins first
      data.sort((a: any, b: any) => {
        if (a.role === 'admin' || a.role === 'owner') return -1;
        if (b.role === 'admin' || b.role === 'owner') return 1;
        return 0;
      });

      setUsers(data);
    } catch (e) {
      console.error("Error loading users from server:", e);
      // Fallback to localStorage if server fails
      const usersStr = localStorage.getItem('users') || '[]';
      try {
        const users = JSON.parse(usersStr);
        setUsers(Array.isArray(users) ? users : []);
      } catch (e) {
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (id: string, currentlyBanned: boolean) => {
    try {
      const response = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, ban: !currentlyBanned })
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u.id === id ? { ...u, banido: !currentlyBanned ? 1 : 0 } : u));
      }
    } catch (error) {
       console.error("Erro ao banir:", error);
    }
  };

  const handleSavePlan = async (id: string | number) => {
    // In a real app we'd have an endpoint for this too
    const updatedUsers = users.map(u => u.id === id ? { 
      ...u, 
      plano: selectedPlan,
      tipo: selectedPlan === 'Ouro (VIP)' ? 'ouro' : selectedPlan === 'Prata (VIP)' ? 'prata' : selectedPlan === 'Bronze (VIP)' ? 'bronze' : 'free'
    } : u);
    setUsers(updatedUsers);
    try {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (e) {}
    // Also sync to server if possible, for now we manually call save
    setEditingUserId(null);
  };

  const handleStartEdit = (user: any) => {
    setEditingUserId(user.id);
    setSelectedPlan(user.plano || 'Gratuito');
  };

  const handleToggleAdmin = (id: string | number) => {
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        const isAdmin = u.is_admin === 1 || u.role === 'admin';
        return { 
          ...u, 
          role: isAdmin ? 'user' : 'admin',
          is_admin: isAdmin ? 0 : 1
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    try {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (e) {}
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    
    const updatedUsers = users.filter(u => u.id !== userToDelete.id);
    setUsers(updatedUsers);
    try {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (e) {}
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleCancelSubscription = async (userId: string, subId: string, email: string) => {
    if (!subId) return;
    setCancelData({ userId, subId, email });
    setIsCancelModalOpen(true);
  };

  const confirmCancelSubscription = async () => {
    if (!cancelData) return;
    const { userId, subId } = cancelData;

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subId })
      });
      const data = await response.json();
      if (data.success) {
        alert("Assinatura cancelada no Mercado Pago.");
        // Update local state
        const updatedUsers = users.map(u => u.id === userId ? { ...u, plano: 'Bronze (VIP)', tipo: 'bronze', data_expiracao: null, mp_subscription_id: null } : u);
        setUsers(updatedUsers);
        try {
          localStorage.setItem('users', JSON.stringify(updatedUsers));
        } catch (e) {}
      }
    } catch (error) {
       console.error("Erro ao cancelar:", error);
       alert("Erro ao processar cancelamento.");
    } finally {
      setIsCancelModalOpen(false);
      setCancelData(null);
    }
  };

  const handleRefund = async (user: any) => {
    setRefundUser(user);
    setIsRefundModalOpen(true);
    setUserPayments([]);
    try {
      const res = await fetch(`/api/admin/user-payments/${user.id}`);
      const data = await res.json();
      setUserPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao carregar pagamentos:", e);
    }
  };

  const processRefund = async (paymentId: string) => {
    if (!confirm("Confirmar reembolso deste pagamento?")) return;
    setRefundLoading(true);
    try {
      const response = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });
      const data = await response.json();
      if (data.success) {
        alert("Reembolso processado com sucesso!");
        setUserPayments(userPayments.map(p => p.id === paymentId ? { ...p, status: 'refunded' } : p));
      } else {
        alert(data.error || "Erro ao processar reembolso.");
      }
    } catch (error) {
      console.error("Erro no reembolso:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setRefundLoading(false);
    }
  };

  const isExpired = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (u.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'vip') return matchesSearch && (u.plano === 'Ouro (VIP)' || u.plano === 'Prata (VIP)' || u.plano === 'Ouro' || u.plano === 'Prata');
    if (filterType === 'admin') return matchesSearch && (u.role === 'admin' || u.role === 'owner' || u.is_admin === 1);
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-neutral-500 text-sm mt-1">Gerencie permissões, planos e assinaturas.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800 flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-400">Total:</span>
            <span className="text-sm font-bold text-white">{users.length}</span>
          </div>
          <div className="bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20 flex items-center gap-3">
            <span className="text-sm font-medium text-yellow-500">VIPs:</span>
            <span className="text-sm font-bold text-yellow-500">
              {users.filter(u => u.plano?.includes('Ouro') || u.plano?.includes('Prata')).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-red-500 outline-none transition-all placeholder:text-neutral-600"
          />
        </div>
        <div className="md:col-span-6 flex gap-2 overflow-x-auto pb-2 md:pb-0 font-mono no-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'vip', label: 'Assinantes VIP' },
            { id: 'admin', label: 'Equipe' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                filterType === btn.id 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                : 'bg-neutral-900 text-neutral-500 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-[10px] uppercase tracking-[0.2em] font-black text-neutral-500">
                <th className="p-5 font-medium">Usuário</th>
                <th className="p-5 font-medium">Plano / Status</th>
                <th className="p-5 font-medium">Assinatura</th>
                <th className="p-5 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              <AnimatePresence>
                {filteredUsers.map((u, i) => {
                  const expired = isExpired(u.data_expiracao);
                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={u.id || u.email} 
                      className="hover:bg-neutral-800/30 transition-colors group"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 overflow-hidden ${
                            (u.role === 'admin' || u.is_admin === 1) ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                          }`}>
                            {u.foto ? (
                              <img src={u.foto} alt="" className="w-full h-full object-cover" />
                            ) : u.name ? (
                              u.name.charAt(0)
                            ) : (
                              <UserIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                              {u.name || (u.email && u.email.split('@')[0]) || 'Usuário'}
                              {(u.role === 'admin' || u.role === 'owner' || u.is_admin === 1) && (
                                <span className="bg-red-500 text-[8px] px-1.5 py-0.5 rounded-full text-white uppercase font-black tracking-widest shadow-sm">ADMIN</span>
                              )}
                              {u.banido === 1 && (
                                <span className="bg-black text-[8px] px-1.5 py-0.5 rounded-full text-red-500 border border-red-500 uppercase font-black tracking-widest">BANIDO</span>
                              )}
                            </span>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-5">
                        <div className="flex flex-col gap-1.5">
                          {editingUserId === u.id ? (
                            <div className="flex items-center gap-2">
                              <select 
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                className="bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs outline-none focus:border-red-500"
                              >
                                {plansList.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <button onClick={() => handleSavePlan(u.id)} className="p-1 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20">
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                u.plano?.includes('Ouro') ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                                u.plano?.includes('Prata') ? 'bg-neutral-300/20 text-neutral-300 border border-neutral-300/30' :
                                u.plano?.includes('Bronze') ? 'bg-orange-600/20 text-orange-500 border border-orange-500/30' :
                                'bg-neutral-800 text-neutral-500 border border-neutral-700'
                              }`}>
                                {u.plano || 'Gratuito'}
                              </span>
                              {u.plano !== 'Gratuito' && !expired && (
                                <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 animate-pulse">
                                  <Check className="w-2.5 h-2.5" /> ATIVO
                                </span>
                              )}
                              {expired && (
                                <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                  <Ban className="w-2.5 h-2.5" /> EXPIRADO
                                </span>
                              )}
                            </div>
                          )}
                          
                          {u.data_expiracao && (
                            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Expira em: {new Date(u.data_expiracao).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-5">
                         {u.mp_subscription_id ? (
                           <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                               {u.mp_subscription_id}
                             </span>
                             <button 
                               onClick={() => handleCancelSubscription(u.id, u.mp_subscription_id, u.email)}
                               className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               Cancelar Assinatura
                             </button>
                           </div>
                         ) : (
                           <span className="text-xs text-neutral-600 italic">Individual / Grátis</span>
                         )}
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleBan(u.id, u.banido === 1)}
                            className={`p-2 rounded-lg transition-colors border ${
                              u.banido === 1 
                              ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30' 
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-red-500 hover:border-red-500/50'
                            }`}
                            title={u.banido === 1 ? 'Desbanir Usuário' : 'Banir Usuário'}
                          >
                             <Ban className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleAdmin(u.id)}
                            className={`p-2 rounded-lg transition-colors border ${
                              (u.role === 'admin' || u.is_admin === 1) 
                              ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-neutral-800' 
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-white'
                            }`}
                            title={(u.role === 'admin' || u.is_admin === 1) ? 'Remover Admin' : 'Tornar Admin'}
                          >
                             <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRefund(u)}
                            className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                            title="Reembolsos"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStartEdit(u)}
                            className="p-2 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                            title="Editar Plano"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Search className="w-8 h-8" />
                      <p className="text-sm font-medium">Nenhum resultado para "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Confirmation Modals */}
      <AdminConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Excluir Usuário?"
        message="Esta ação é irreversível. Todas as moedas, histórico e dados deste usuário serão apagados permanentemente."
        itemName={userToDelete?.email || userToDelete?.name}
        confirmText="Confirmar Exclusão"
      />

      <AdminConfirmationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancelSubscription}
        title="Cancelar Assinatura?"
        message="Deseja realmente cancelar a assinatura recorrente deste usuário no Mercado Pago?"
        itemName={cancelData?.email}
        confirmText="Confirmar Cancelamento"
        variant="warning"
      />

      {/* Refund Modal */}
      <AnimatePresence>
        {isRefundModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRefundModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-yellow-500" /> Histórico de Pagamentos
                  </h2>
                  <p className="text-neutral-500 text-sm mt-1">{refundUser?.email}</p>
                </div>
                <button onClick={() => setIsRefundModalOpen(false)} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[400px] overflow-y-auto">
                {userPayments.length > 0 ? (
                  <div className="space-y-3">
                    {userPayments.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()).map((p) => (
                      <div key={p.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between group">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white">R$ {p.valor}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest ${
                              p.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                              p.status === 'refunded' ? 'bg-orange-500/20 text-orange-500' :
                              'bg-neutral-800 text-neutral-500'
                            }`}>
                              {p.status === 'approved' ? 'Aprovado' : p.status === 'refunded' ? 'Reembolsado' : p.status}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">{p.detalhes}</p>
                          <p className="text-[10px] text-neutral-600 mt-1">{new Date(p.criado_em).toLocaleString()}</p>
                        </div>
                        
                        {p.status === 'approved' && (
                          <button 
                            disabled={refundLoading}
                            onClick={() => processRefund(p.id)}
                            className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 text-xs font-bold py-2 px-4 rounded-lg border border-yellow-500/30 hover:text-black transition-all disabled:opacity-50"
                          >
                            {refundLoading ? 'Processando...' : 'Reembolsar'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 opacity-50">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
                    <p className="text-sm">Nenhum pagamento encontrado para este usuário.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-neutral-950 border-t border-neutral-800 flex justify-end">
                <button 
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm transition"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
