import React, { useState, useEffect } from 'react';
import { Search, Filter, CircleCheck, CircleX, Clock, Calendar } from 'lucide-react';

interface Payment {
  id: string;
  user_id: string;
  email: string;
  valor: number;
  status: string;
  tipo: string;
  detalhes: string;
  criado_em: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      setPayments(data);
      
      // Mark notifications as read
      await fetch('/api/admin/notifications/read', { method: 'POST' });
    } catch (e) {
      console.error("Error fetching payments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Histórico de Pagamentos</h1>
          <p className="text-neutral-500 font-medium">Gerencie todas as transações, assinaturas e recargas de moedas.</p>
        </div>
        
        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por e-mail ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-neutral-900/50 rounded-3xl border border-neutral-800 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-900 border-b border-neutral-800">
                <th className="px-6 py-5 text-xs font-black text-neutral-500 uppercase tracking-widest">ID / Data</th>
                <th className="px-6 py-5 text-xs font-black text-neutral-500 uppercase tracking-widest">Payer / Usuário</th>
                <th className="px-6 py-5 text-xs font-black text-neutral-500 uppercase tracking-widest">Detalhes</th>
                <th className="px-6 py-5 text-xs font-black text-neutral-500 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-5 text-xs font-black text-neutral-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-neutral-500 font-bold uppercase tracking-widest animate-pulse">
                      Carregando pagamentos...
                    </td>
                 </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center text-neutral-500 font-bold uppercase tracking-widest">
                     Nenhum pagamento encontrado.
                   </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-red-600/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm mb-1">#{p.id}</span>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(p.criado_em).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-white font-bold text-sm underline decoration-red-600/30 group-hover:decoration-red-600 transition-all cursor-pointer">
                        {p.email}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">ID: {p.user_id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${p.tipo === 'assinatura' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {p.tipo}
                        </span>
                        <span className="text-neutral-300 font-medium text-sm">{p.detalhes}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-white font-black text-lg">
                        R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {p.status === 'approved' ? (
                        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full w-fit">
                          <CircleCheck className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-wider">Aprovado</span>
                        </div>
                      ) : p.status === 'pending' ? (
                        <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full w-fit">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-wider">Pendente</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full w-fit">
                          <CircleX className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-wider">{p.status}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
