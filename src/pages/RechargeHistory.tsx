import { ChevronLeft, Wallet, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function RechargeHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'recharges' | 'subscriptions'>('recharges');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // In a real app, this would be a fetch to /api/user-history
      // For demo, we combine mock with some potential real records if stored
      const mockRecharges = [
        { id: 1, amount: 500, price: "R$ 29,90", date: "10 Maio 2026, 14:30", status: "Concluído" },
        { id: 2, amount: 100, price: "R$ 6,90", date: "02 Abril 2026, 09:15", status: "Concluído" },
      ];
      const mockSubs = [
        { id: 'sub1', plan: 'Ouro', price: 'R$ 499,90', date: '01 Maio 2026', status: 'Ativo' }
      ];

      setHistory(activeTab === 'recharges' ? mockRecharges : mockSubs);
    }
  }, [user, activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex flex-col border-b border-white/5 sticky top-0 bg-[#0a0a0a] z-50">
        <div className="flex items-center justify-between px-4 py-4 relative">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 -ml-1 hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2">
            Meu Histórico
          </h1>
          <div className="w-6"></div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-2">
          <button 
            onClick={() => setActiveTab('recharges')}
            className={`flex-1 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'recharges' ? 'border-[#ff2e55] text-white' : 'border-transparent text-neutral-500'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Wallet className="w-4 h-4" /> Recargas
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 py-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'subscriptions' ? 'border-[#ff2e55] text-white' : 'border-transparent text-neutral-500'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" /> Assinaturas
            </div>
          </button>
        </div>
      </div>

      <div className="px-4 py-6 overflow-y-auto">
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item, idx) => (
              <div key={item.id || idx} className="bg-[#18181A] p-5 rounded-2xl border border-neutral-800 shadow-lg group hover:border-[#ff2e55]/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {activeTab === 'recharges' ? (
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                         <span className="font-black text-xs">G</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                         <Crown className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white">
                        {activeTab === 'recharges' ? `+${item.amount} Moedas` : `Plano VIP ${item.plan}`}
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    item.status === 'Concluído' || item.status === 'Ativo' ? 'bg-green-500/10 text-green-500' : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-600 uppercase font-black tracking-tighter">Valor Pago</span>
                      <span className="font-mono text-sm font-bold text-white">{item.price}</span>
                   </div>
                   {activeTab === 'subscriptions' && (
                     <button 
                       onClick={() => navigate('/vip-central')}
                       className="text-[11px] font-bold text-[#ff2e55] hover:opacity-80 transition"
                     >
                       Planos
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-neutral-500 gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 opacity-20">
              <Wallet className="w-8 h-8" />
            </div>
            <p className="font-medium">Nenhum registro encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
