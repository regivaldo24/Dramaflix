import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BonusHistoryPage() {
  const navigate = useNavigate();

  // Mock data for bonuses
  const bonuses = [
    { id: 1, title: "Bônus diário de check-in", amount: 50, date: "01 Maio 2026", expiresAt: "08 Maio 2026", status: "Ativo" },
    { id: 2, title: "Bônus de novo usuário", amount: 200, date: "15 Abril 2026", expiresAt: "22 Abril 2026", status: "Expirado" },
    { id: 3, title: "Recompensa de evento", amount: 100, date: "10 Abril 2026", expiresAt: "17 Abril 2026", status: "Expirado" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 mb-2 border-b border-neutral-900 sticky top-0 bg-[#0a0a0a] z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-white/10 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2">
          Histórico de bônus
        </h1>
        <div className="w-6"></div>
      </div>

      <div className="px-4 py-2">
        {bonuses.length > 0 ? (
          <div className="space-y-3">
            {bonuses.map((item) => (
              <div key={item.id} className="bg-[#18181A] p-4 rounded-xl border border-neutral-900/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                     <h3 className="font-bold text-sm text-white mb-0.5">{item.title}</h3>
                     <span className="text-[11px] text-neutral-400">Adquirido em: {item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center font-bold text-[10px] text-yellow-900 shadow-sm">
                      ★
                    </div>
                    <span className="font-bold text-sm text-orange-400">+{item.amount}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                     <span className="text-neutral-500">Validade:</span>
                     <span className={item.status === 'Expirado' ? 'text-red-400 line-through' : 'text-neutral-300'}>{item.expiresAt}</span>
                  </div>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                    item.status === 'Ativo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-neutral-500">
            <p>Nenhum bônus encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
