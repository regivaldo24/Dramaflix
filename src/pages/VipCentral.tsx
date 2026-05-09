import React, { useState, useEffect } from "react";
import { ChevronLeft, Video, Download, Crown, Gift, Zap, ShieldCheck, PlayCircle, MonitorPlay } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

export default function VipCentralPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profileImage] = useState(() => {
    try {
      const localImage = localStorage.getItem(`avatar_${user?.id}`);
      return localImage || user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";
    } catch (e) {
      return user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";
    }
  });

  // Countdown timer: 04:37:27
  const [timeLeft, setTimeLeft] = useState(4 * 3600 + 37 * 60 + 27);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/profile');
      return;
    }

    let savedPlans = null;
    try {
      savedPlans = localStorage.getItem('site_plans');
    } catch (e) {}
    
    let loadedPlans: any[] = [];
    if (savedPlans) {
      try {
        loadedPlans = JSON.parse(savedPlans);
      } catch (e) {
        loadedPlans = [
          { id: 'ouro', title: 'Ouro (VIP)', price: '499,90', limit: 'ilimitado', features: ['Acesso total', 'Sem anúncios', '4K Quality', 'Downloads offline'] },
          { id: 'prata', title: 'Prata (VIP)', price: '59,90', limit: 'médio', features: ['Acesso intermediário', 'Sem anúncios', 'HD Quality'] },
          { id: 'bronze', title: 'Bronze (VIP)', price: '29,90', limit: 'baixo', features: ['Acesso limitado', 'Anúncios', 'SD Quality'] },
        ];
      }
    } else {
      loadedPlans = [
        { id: 'ouro', title: 'Ouro (VIP)', price: '499,90', limit: 'ilimitado', features: ['Acesso total', 'Sem anúncios', '4K Quality', 'Downloads offline'] },
        { id: 'prata', title: 'Prata (VIP)', price: '59,90', limit: 'médio', features: ['Acesso intermediário', 'Sem anúncios', 'HD Quality'] },
        { id: 'bronze', title: 'Bronze (VIP)', price: '29,90', limit: 'baixo', features: ['Acesso limitado', 'Anúncios', 'SD Quality'] },
      ];
      try {
        localStorage.setItem('site_plans', JSON.stringify(loadedPlans));
      } catch (e) {}
    }
    setPlans(loadedPlans);
    
    // Pre-select user's current plan or default to first one
    let currentPlanId = null;
    try {
      if (user) currentPlanId = localStorage.getItem(`plan_${user.id}`);
    } catch (e) {}
    
    if (currentPlanId && loadedPlans.some(p => p.id === currentPlanId)) {
      setSelectedPlanId(currentPlanId);
    } else if (loadedPlans.length > 0) {
      setSelectedPlanId(loadedPlans[0].id);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [user, navigate]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handlePayment = async () => {
    if (!selectedPlanId) {
      alert("Selecione um plano primeiro!");
      return;
    }
    
    if (!user) {
      navigate('/login'); // Assuming there's a login route or logic
      return;
    }

    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.id,
          email: user.email
        }),
      });

      const data = await response.json();

      if (data.init_point) {
        // If it's a mock, we'll just simulate the success instead of redirecting to a broken URL
        if (data.isMock) {
          console.log("Mock Subscription created:", data);
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulate the state update that would happen via webhook/return
          let usersStr = null;
          try {
            usersStr = localStorage.getItem('users');
          } catch (e) {}
          
          let usersList = [];
          try {
            usersList = JSON.parse(usersStr || '[]');
            if (!Array.isArray(usersList)) usersList = [];
          } catch (e) {
            usersList = [];
          }

          const userIndex = usersList.findIndex((u: any) => u.id === user.id || u.email === user.email);
          
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 30);

          if (userIndex !== -1) {
            usersList[userIndex] = { 
              ...usersList[userIndex], 
              plano: selectedPlan.title,
              tipo: 'ouro',
              data_expiracao: expirationDate.toISOString()
            };
          } else {
            usersList.push({ 
              id: user.id, 
              email: user.email, 
              plano: selectedPlan.title, 
              role: 'user',
              tipo: 'ouro',
              data_expiracao: expirationDate.toISOString()
            });
          }
          try {
            localStorage.setItem('users', JSON.stringify(usersList));
            localStorage.setItem(`plan_${user.id}`, selectedPlan.id);
            localStorage.setItem(`sub_${user.id}`, data.id); // Store subscription ID
            localStorage.setItem(`expiracao_${user.id}`, expirationDate.toISOString());

            // Set pending for success page to show correct message if needed
            localStorage.setItem('pending_transaction', JSON.stringify({
              userId: user.id,
              plan: selectedPlan.title,
              type: 'subscription',
              expiry: expirationDate.toISOString()
            }));
          } catch (e) {}

          setIsProcessing(false);
          alert(`MOCK: Assinatura Recorrente Ativada!\n\nParabéns! Você agora é assinante VIP do Plano ${selectedPlan.title}.\nSua assinatura renovará automaticamente a cada 30 dias.\n(Expira em: ${expirationDate.toLocaleDateString()})`);
          navigate('/profile');
        } else {
          // Redirect to real Mercado Pago Subscription checkout
          window.location.href = data.init_point;
        }
      } else {
        throw new Error(data.error || "Erro ao criar assinatura");
      }
    } catch (e) {
      console.error("Erro ao processar assinatura:", e);
      setIsProcessing(false);
      alert("❌ Ocorreu um erro ao processar sua assinatura. Por favor, tente novamente.");
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans relative overflow-x-hidden no-scrollbar">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-yellow-600/10 via-transparent to-transparent -z-10" />
      
      {/* Header */}
      <div className="flex items-center justify-center h-14 relative px-4 z-50">
        <button onClick={() => navigate(-1)} className="absolute left-4 p-2 hover:bg-white/10 rounded-full transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold tracking-tight">Central VIP</h1>
      </div>

      <div className="flex-1 px-5 pt-6 flex flex-col items-center">
        {/* Profile with ring */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full scale-125" />
          <div className="w-[105px] h-[105px] rounded-full border-[3px] border-[#3e3e3e] p-[3px] relative z-20 overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.5)]">
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          {/* Subtle glow border */}
          <div className="absolute inset-0 rounded-full border border-yellow-500/30 -m-1 z-10" />
        </div>

        {/* VIP Discount */}
        <div className="text-center mb-6">
          <h2 className="text-[20px] font-black text-[#f2d49e] mb-1 tracking-tight">
            Descontos VIP R$ 254,36
          </h2>
          <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-[0.1em]">expirado</p>
        </div>

        {/* Benefits Section */}
        <div className="w-full mb-8">
          <h4 className="text-[18px] font-bold text-white mb-5 tracking-tight">
            Benefícios VIP
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <BenefitItem 
              icon={Video} 
              label="Todos os dramas gratuitos" 
            />
            <BenefitItem 
              icon={Download} 
              label="Baixar" 
            />
            <BenefitItem 
              icon={MonitorPlay} 
              label="Qualidade 1080p" 
            />
            <BenefitItem 
               icon={Gift} 
               label="Recompensa diária de pontos" 
            />
            <BenefitItem 
              icon={ShieldCheck} 
              label="Sem anúncios" 
              isAdIcon
            />
            <BenefitItem 
               icon={PlayCircle} 
               label="Aproveite os novos dramas..." 
            />
          </div>
        </div>

        {/* Action Button - Now between Benefits and Plans */}
        <div className="w-full mb-10">
          <motion.button 
            key={selectedPlanId || 'none'}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handlePayment}
            disabled={!selectedPlan || isProcessing}
            className="w-full bg-gradient-to-br from-[#FFE9BD] to-[#CD9D49] text-[#5B3B04] font-black py-4 rounded-full text-[17px] shadow-[0_10px_25px_rgba(253,224,71,0.3)] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 animate-pulse" /> Processando...
              </span>
            ) : selectedPlan ? (
              <span className="flex items-center justify-center gap-2">
                Assinar Agora - R$ {selectedPlan.price}
              </span>
            ) : (
              'Selecione um plano para continuar'
            )}
          </motion.button>
        </div>

        {/* Plans Container - Now below the button */}
        <div className="w-full space-y-4 mb-10">
          <h4 className="text-[18px] font-bold text-white mb-4 tracking-tight px-1 font-mono uppercase text-xs opacity-50">
            Escolha seu Plano VIP
          </h4>
          {plans.map((plan, idx) => (
            <motion.div 
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
              className={`w-full rounded-2xl p-5 text-black relative shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                selectedPlanId === plan.id 
                ? 'ring-[3px] ring-yellow-400/50 scale-[1.02] shadow-[0_0_30px_rgba(253,224,71,0.3)] z-10' 
                : 'opacity-60 grayscale-[40%] hover:opacity-100 hover:grayscale-0'
              } ${
                plan.id === 'ouro' 
                ? 'bg-gradient-to-br from-[#FFE9BD] via-[#fbd18b] to-[#CD9D49]' 
                : plan.id === 'prata'
                ? 'bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-400'
                : 'bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300'
              }`}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-[#E7305B] text-white text-[11px] font-bold px-3 py-1.5 rounded-bl-2xl shadow-lg z-10">
                  Tempo limitado {formatTime(timeLeft)}
                </div>
              )}

              <h3 className={`text-[19px] font-black mb-2 ${plan.id === 'ouro' ? 'text-[#5B3B04]' : plan.id === 'prata' ? 'text-neutral-900' : 'text-orange-900'}`}>
                {plan.title}
              </h3>
              
              <div className="flex items-baseline gap-2 mb-3">
                 <span className={`text-[28px] font-black leading-none tracking-tight ${plan.id === 'ouro' ? 'text-[#5B3B04]' : 'text-neutral-900'}`}>
                   R$ {plan.price}
                 </span>
                 {plan.id === 'ouro' && <span className="text-[15px] text-[#5B3B04]/50 line-through font-bold">R$ 999,90</span>}
              </div>

              <div className={`border rounded-lg py-1 px-3 mb-4 inline-block ${
                plan.id === 'ouro' 
                ? 'bg-[#5B3B04]/10 border-[#5B3B04]/20' 
                : 'bg-black/5 border-black/10'
              }`}>
                 <p className={`text-[13px] font-bold ${plan.id === 'ouro' ? 'text-[#5B3B04]' : 'text-neutral-800'}`}>
                   {plan.features[0]}
                 </p>
              </div>

              <div className="space-y-1 mb-1">
                {plan.features.slice(1, 3).map((f: string, i: number) => (
                  <p key={i} className={`text-[11px] font-medium leading-tight flex items-center gap-1 ${
                    plan.id === 'ouro' ? 'text-[#5B3B04]' : 'text-neutral-700'
                  }`}>
                    <span className="w-1 h-1 bg-current rounded-full" /> {f}
                  </p>
                ))}
              </div>

              <div className="mt-3">
                <p className={`text-[10px] font-medium opacity-60 ${
                  plan.id === 'ouro' ? 'text-[#5B3B04]' : 'text-neutral-800'
                }`}>
                  Renovação automática - Cancelar a qualquer momento
                </p>
              </div>

              {/* Background decoration */}
              <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
                 <Crown size={80} strokeWidth={1} color={plan.id === 'ouro' ? '#5B3B04' : '#000'} />
              </div>

              {/* Selection Checkbox */}
              {selectedPlanId === plan.id && (
                <div className="absolute bottom-4 left-5 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-black/90 flex items-center justify-center">
                    <Crown size={12} fill="white" color="white" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-black/60">Selecionado</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>

      {/* Footer text */}
      <div className="px-5 pb-20">
         <p className="text-[11px] text-neutral-600 text-center leading-relaxed">
           Suas informações de pagamento são processadas com segurança. Não armazenamos detalhes de cartão de crédito nem temos acesso às informações do seu cartão.
         </p>
      </div>
    </div>
  );
}

function BenefitItem({ icon: Icon, label, isAdIcon }: { icon: any, label: string, isAdIcon?: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-[#18181A] rounded-xl p-3.5 border border-neutral-900/50 hover:bg-[#202022] transition cursor-pointer group shadow-sm">
      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
        {isAdIcon ? (
          <div className="relative">
            <span className="text-[10px] font-black text-neutral-400">AD</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-[2px] bg-neutral-400 rotate-45 rounded-full" />
            </div>
          </div>
        ) : (
          <Icon className="w-5 h-5 text-neutral-400" />
        )}
      </div>
      <span className="text-[12px] font-bold text-neutral-200 leading-[1.2]">{label}</span>
    </div>
  );
}
