import React, { useState, useEffect } from "react";
import { ChevronLeft, Gift, CheckCircle2, Clock, Calendar, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../components/LoginScreen";

export default function RewardsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [isClaimedToday, setIsClaimedToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) {
      // Sync coins from the user object (which now has server data)
      const serverMoedas = (user as any).moedas || 0;
      setCoins(serverMoedas);
      
      const storedCheckIn = (() => {
        try {
          return localStorage.getItem(`last_checkin_${user.id}`);
        } catch (e) {
          return null;
        }
      })();
      setLastCheckIn(storedCheckIn);

      if (storedCheckIn) {
        const today = new Date().toDateString();
        const lastDate = new Date(storedCheckIn).toDateString();
        if (today === lastDate) {
          setIsClaimedToday(true);
        }
      }
    } else {
      try {
        const stored = localStorage.getItem('guest_bonus') || "0";
        setCoins(parseInt(stored));
      } catch (e) {
        setCoins(0);
      }
    }
  }, [user]);

  const handleClaim = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    if (isClaimedToday) {
      alert("Você já resgatou sua recompensa de hoje!");
      return;
    }

    const newCoins = coins + 30;
    const now = new Date().toISOString();

    setCoins(newCoins);
    setLastCheckIn(now);
    setIsClaimedToday(true);

    try {
      localStorage.setItem(`bonus_${user.id}`, newCoins.toString());
      localStorage.setItem(`last_checkin_${user.id}`, now);
    } catch (e) {}

    // Also add to bonus history simulation if needed
    let history = [];
    try {
      const val = localStorage.getItem(`bonus_history_${user.id}`);
      history = JSON.parse(val || "[]");
      if (!Array.isArray(history)) history = [];
    } catch (e) {
      history = [];
    }
    history.unshift({
      id: Date.now(),
      type: 'Login Diário',
      amount: 30,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    try {
      localStorage.setItem(`bonus_history_${user.id}`, JSON.stringify(history));
    } catch (e) {}

    alert("Parabéns! Você ganhou 30 moedas de bônus!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800 sticky top-0 bg-[#0a0a0a] z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-white/10 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2 tracking-wide text-white">
          Missões e Recompensas
        </h1>
        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center font-bold text-[8px] text-yellow-900">G</div>
          <span className="text-xs font-bold text-yellow-500">{coins}</span>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto flex-1 p-4 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#FF4E72] to-[#F12B55] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-1">Ganhe Moedas Grátis!</h2>
            <p className="text-white/80 text-sm mb-4">Complete missões diárias para assistir seus dramas favoritos sem custo.</p>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <span className="text-lg font-bold">30 Moedas Disponíveis</span>
            </div>
          </div>
          <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        {/* Daily Section */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#F12B55]" />
            Missões Diárias
          </h3>

          <div className="space-y-3">
            {/* Check-in Mission */}
            <div className="bg-[#18181A] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px]">Check-in Diário</h4>
                  <p className="text-xs text-neutral-400">Entre no app todos os dias</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[#F12B55] font-bold text-sm">+30</span>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center font-bold text-[6px] text-yellow-900 border border-yellow-200">G</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleClaim}
                disabled={isClaimedToday}
                className={`px-6 py-2 rounded-full font-bold text-sm transition shadow-lg ${
                  isClaimedToday 
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700" 
                  : "bg-white text-black hover:bg-neutral-200 active:scale-95"
                }`}
              >
                {isClaimedToday ? "Coletado" : "Ganhar"}
              </button>
            </div>

            {/* Watch Ad Mission */}
            <div className="bg-[#18181A] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px]">Assistir Anúncio</h4>
                  <p className="text-xs text-neutral-400">Ganhe moedas assistindo vídeos</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[#F12B55] font-bold text-sm">+30</span>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center font-bold text-[6px] text-yellow-900 border border-yellow-200">G</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    // Simulação de anúncio profissional
                    const assistiu = confirm("Deseja assistir ao anúncio para ganhar 30 moedas?");
                    if (!assistiu) {
                      setLoading(false);
                      return;
                    }

                    if (user) {
                      const res = await fetch("/api/watch-ad", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user.id })
                      });
                      const data = await res.json();
                      
                      if (data.success) {
                        setCoins(data.total_coins);
                        try {
                          localStorage.setItem(`bonus_${user.id}`, data.total_coins.toString());
                        } catch (e) {}
                        
                        let history = [];
                        try {
                          const val = localStorage.getItem(`bonus_history_${user.id}`);
                          history = JSON.parse(val || "[]");
                          if (!Array.isArray(history)) history = [];
                        } catch (e) {
                           history = [];
                        }
                        history.unshift({
                          id: Date.now(),
                          type: 'Vídeo Recompensado',
                          amount: 30,
                          date: new Date().toLocaleDateString('pt-BR'),
                          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        });
                        try {
                          localStorage.setItem(`bonus_history_${user.id}`, JSON.stringify(history));
                        } catch (e) {}
                        
                        alert(`+${data.coins_added} moedas recebidas! Limite de hoje: ${data.ads_watched_today}/10`);
                      } else {
                        alert(data.error);
                      }
                    } else {
                      // Guest reward simulation
                      const newCoins = coins + 30;
                      setCoins(newCoins);
                      try {
                        localStorage.setItem('guest_bonus', newCoins.toString());
                      } catch (e) {}
                      alert("+30 moedas recebidas! Faça login para salvar permanentemente e usar em episódios.");
                    }
                  } catch (e) {
                    alert("Erro ao processar recompensa.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-6 py-2 rounded-full font-bold text-sm bg-[#F12B55] text-white hover:brightness-110 active:scale-95 transition shadow-lg disabled:opacity-50"
              >
                {loading ? "..." : "Assistir"}
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
           <div className="flex items-center gap-2 mb-2">
             <CheckCircle2 className="w-4 h-4 text-green-500" />
             <span className="text-sm font-bold text-neutral-200">Como funciona?</span>
           </div>
           <ul className="text-xs text-neutral-400 space-y-2 list-disc pl-4">
             <li>Você pode coletar bônus uma vez a cada 24 horas.</li>
             <li>Os bônus expiram em 30 dias se não forem utilizados.</li>
             <li>Assista episódios premium usando seus bônus acumulados.</li>
           </ul>
        </div>
      </div>

      {showLogin && (
        <LoginScreen 
          onLogin={() => setShowLogin(false)} 
          onClose={() => setShowLogin(false)} 
        />
      )}
    </div>
  );
}
