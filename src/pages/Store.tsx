import { ChevronLeft, Zap, Coins } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function StorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>("pkg-500");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [userCoins, setUserCoins] = useState(() => {
    if (!user) return 0;
    try {
      const usersStr = localStorage.getItem('users') || '[]';
      const usersList = JSON.parse(usersStr);
      if (!Array.isArray(usersList)) return 0;
      const u = usersList.find((u: any) => u.id === user.id || u.email === user.email);
      return u?.moedas || 0;
    } catch (e) {
      return 0;
    }
  });
  
  useEffect(() => {
    if (user) {
      try {
        const usersStr = localStorage.getItem('users') || '[]';
        const usersList = JSON.parse(usersStr);
        if (Array.isArray(usersList)) {
          const u = usersList.find((u: any) => u.id === user.id || u.email === user.email);
          setCurrentUserData(u);
          if (u) setUserCoins(u.moedas || 0);
        }
      } catch (e) {
        console.error("Error loading user data in store", e);
      }
    }
  }, [user]);

  const handleCreateSubscription = async (planKey: string) => {
    if (!user) return;
    setIsProcessing(true);
    
    const titles = {
      bronze: 'Plano Bronze',
      prata: 'Plano Prata',
      ouro: 'Plano Ouro VIP'
    };

    try {
      try {
        localStorage.setItem('pending_transaction', JSON.stringify({
          userId: user.id,
          plan: titles[planKey as keyof typeof titles],
          type: 'subscription'
        }));
      } catch (innerE) {}
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: { 
            id: planKey, 
            title: titles[planKey as keyof typeof titles],
            price: planKey === 'ouro' ? '19,90' : (planKey === 'prata' ? '14,90' : '9,90')
          },
          userId: user.id,
          email: user.email
        }),
      });
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (e) {
      console.error("Erro ao processar assinatura:", e);
      alert("Erro ao processar assinatura.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUserData?.mp_subscription_id) return;
    if (!confirm("Deseja realmente cancelar sua assinatura?")) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentUserData.mp_subscription_id
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Sua assinatura foi cancelada com sucesso.");
        // Locally update
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
        const index = usersList.findIndex((u: any) => u.id === user?.id);
        if (index !== -1) {
          usersList[index].tipo = 'gratuito';
          usersList[index].mp_subscription_id = null;
          usersList[index].data_expiracao = null;
          try {
            localStorage.setItem('users', JSON.stringify(usersList));
          } catch (e) {}
          setCurrentUserData({...usersList[index]});
        }
      }
    } catch (e) {
      console.error("Erro ao cancelar:", e);
      alert("Erro ao processar cancelamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = async (price: string, title: string) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      try {
        localStorage.setItem('pending_transaction', JSON.stringify({
          userId: user.id,
          plan: title,
          type: 'subscription'
        }));
      } catch (innerE) {}
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          title,
          price
        }),
      });
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (e) {
      console.error("Erro ao processar plano:", e);
      alert("Erro ao processar assinatura.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !selectedPackage) return;
    
    const pkg = coinPackages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    setIsProcessing(true);
    
    try {
      try {
        localStorage.setItem('pending_transaction', JSON.stringify({
          userId: user.id,
          amount: pkg.coins + pkg.bonus,
          type: 'coins'
        }));
      } catch (innerE) {}
      const response = await fetch('/api/create-coin-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: pkg.id,
          userId: user.id,
          email: user.email,
          coins: pkg.coins + pkg.bonus,
          price: pkg.price
        }),
      });

      const data = await response.json();

      if (data.init_point) {
        if (data.isMock) {
          console.log("Mock Payment created:", data);
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulation logic
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
          
          const totalCoins = (pkg.coins + pkg.bonus);

          if (userIndex !== -1) {
            usersList[userIndex] = { 
              ...usersList[userIndex], 
              moedas: (usersList[userIndex].moedas || 0) + totalCoins
            };
          } else {
            usersList.push({ id: user.id, email: user.email, moedas: totalCoins, role: 'user' });
          }
          
          try {
            localStorage.setItem('users', JSON.stringify(usersList));
          } catch (e) {}
          setUserCoins(prev => prev + totalCoins);

          // Set pending for success page
          try {
            localStorage.setItem('pending_transaction', JSON.stringify({
              userId: user.id,
              amount: totalCoins,
              type: 'coins'
            }));
          } catch (e) {}

          setIsProcessing(false);
          alert(`MOCK: Compra de Moedas Simulado!\n\nParabéns! Você recebeu ${totalCoins} moedas.\n(Configure o MERCADO_PAGO_ACCESS_TOKEN para o fluxo real)`);
        } else {
          window.location.href = data.init_point;
        }
      } else {
        throw new Error(data.error || "Erro ao criar preferência");
      }
    } catch (e) {
      console.error("Erro ao processar compra:", e);
      alert("❌ Ocorreu um erro ao processar sua compra. Por favor, tente novamente.");
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
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
    }
    setPlans(loadedPlans);
  }, []);

  // Real countdown timer
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 21,
    minutes: 41,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          return prev;
        }
        
        let newHours = prev.hours;
        let newMinutes = prev.minutes;
        let newSeconds = prev.seconds - 1;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const coinPackages = [
    { id: "pkg-500", coins: 500, bonus: 50, price: "R$29,90", tag: "+10% Bônus" },
    { id: "pkg-100", coins: 100, bonus: 0, price: "R$6,90", tag: null },
    { id: "pkg-1000", coins: 1000, bonus: 100, price: "R$59,90", tag: "+10% Bônus" },
    { id: "pkg-3000", coins: 3000, bonus: 1500, price: "R$199,90", tag: "+50% Bônus" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#0a0a0a] z-10 border-b border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-white/10 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">
          Loja
        </h1>
        <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
           <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
           <span className="text-sm font-bold">{userCoins}</span>
        </div>
      </div>

      <div className="px-4 pb-12 overflow-y-auto">
        {/* Recarga Title */}
        <div className="flex items-center gap-2 mb-4 mt-2">
          <h2 className="text-lg font-bold">Recarga</h2>
          <span className="text-sm text-neutral-500 font-medium">1 Moeda=1 Bônus</span>
        </div>

        {/* Coin Packages Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {coinPackages.map((pkg) => (
            <div 
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative rounded-xl border-2 flex flex-col items-center pt-6 pb-4 cursor-pointer transition ${
                selectedPackage === pkg.id 
                  ? 'border-[#ff2e55] bg-[#331118]' 
                  : 'border-transparent bg-[#1c1c1e] hover:bg-[#252528]'
              }`}
            >
              {pkg.tag && (
                <div className="absolute top-0 right-0 bg-[#ff2e55] text-white text-[10px] font-bold px-2 py-0.5 rounded-tr-lg rounded-bl-lg">
                  {pkg.tag}
                </div>
              )}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold">{pkg.coins}</span>
                <span className="text-xs text-neutral-400">Moedas</span>
              </div>
              {pkg.bonus > 0 ? (
                <span className="text-xs text-neutral-400 mb-4">+{pkg.bonus} Bônus</span>
              ) : (
                <span className="text-xs text-transparent mb-4">Sem Bônus</span>
              )}
              <div className={`w-full text-center py-2 mt-auto rounded-b-xl ${selectedPackage === pkg.id ? 'bg-[#ff2e55]/20' : 'bg-[#252528]'}`}>
                <span className="font-medium text-sm">{pkg.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Help Link */}
        <div className="text-center text-xs text-neutral-400 mb-8 mt-4">
          Precisa de ajuda? Visite nossas <Link to="/qa" className="text-white underline">Perguntas e respostas.</Link>
        </div>

        {/* New Plans UI based on requested snippet */}
        <div className="mt-12 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Escolha seu Plano</h2>
            <p className="text-neutral-400">Desbloqueie acesso total com nossos planos VIP</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {/* Bronze Card */}
            <div 
              onClick={() => currentUserData?.tipo !== 'bronze' && setSelectedPlan('bronze')}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 w-full max-w-[280px] p-8 rounded-2xl border-2 flex flex-col items-center text-center ${
                currentUserData?.tipo === 'bronze' 
                ? 'opacity-40 cursor-not-allowed border-transparent bg-neutral-900/50' 
                : selectedPlan === 'bronze' 
                ? 'border-yellow-500 bg-neutral-900 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                : 'border-transparent bg-neutral-900/50'
              }`}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Bronze</h2>
              <p className="text-neutral-400 text-sm mb-6">Acesso básico</p>
              <div className="text-3xl font-black text-white">R$ 9,90</div>
            </div>

            {/* Prata Card */}
            <div 
              onClick={() => currentUserData?.tipo !== 'prata' && setSelectedPlan('prata')}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 w-full max-w-[280px] p-8 rounded-2xl border-2 flex flex-col items-center text-center ${
                currentUserData?.tipo === 'prata'
                ? 'opacity-40 cursor-not-allowed border-transparent bg-neutral-900/50'
                : selectedPlan === 'prata' 
                ? 'border-yellow-500 bg-neutral-900 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                : 'border-transparent bg-neutral-900/50'
              }`}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Prata</h2>
              <p className="text-neutral-400 text-sm mb-6">Conteúdos extras</p>
              <div className="text-3xl font-black text-white">R$ 14,90</div>
            </div>

            {/* Ouro VIP Card */}
            <div 
              onClick={() => currentUserData?.tipo !== 'ouro' && setSelectedPlan('ouro')}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 w-full max-w-[280px] p-8 rounded-2xl border-2 flex flex-col items-center text-center bg-gradient-to-br from-yellow-500 to-orange-600 ${
                currentUserData?.tipo === 'ouro'
                ? 'opacity-40 cursor-not-allowed border-transparent'
                : selectedPlan === 'ouro' 
                ? 'border-white shadow-[0_0_30px_rgba(247,192,52,0.4)]' 
                : 'border-transparent'
              }`}
            >
              <h2 className="text-2xl font-bold text-black mb-2">Ouro VIP</h2>
              <p className="text-black/70 text-sm font-bold mb-6">Acesso total 🔥</p>
              <div className="text-3xl font-black text-black">R$ 19,90</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => {
                if(!selectedPlan) {
                  alert("Escolha um plano!");
                  return;
                }
                handleCreateSubscription(selectedPlan);
              }}
              disabled={isProcessing}
              className="w-full max-w-[400px] bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-lg transition-all active:scale-95 shadow-lg shadow-yellow-500/20 disabled:opacity-50"
            >
              {isProcessing ? 'Processando...' : 'Assinar'}
            </button>

            {currentUserData?.mp_subscription_id && (
               <button 
                onClick={handleCancelSubscription}
                className="mt-4 text-red-500 hover:text-red-400 font-bold underline text-sm"
               >
                 Cancelar Assinatura
               </button>
            )}
          </div>
        </div>

        {/* Dicas (Tips) from second image */}
        <div className="mb-8">
          <h4 className="text-neutral-300 font-bold mb-4">Dicas:</h4>
          <ol className="text-xs text-neutral-400 space-y-3 list-none">
            <li className="leading-relaxed">
              1. Se você escolher uma assinatura para assistir a vídeos gratuitos, poderá assistir a todos os episódios gratuitamente durante o período da assinatura.
            </li>
            <li className="leading-relaxed">
              2. Renovação: Sua conta Apple será cobrada pela Apple Store até 24 horas antes da data de expiração e sua assinatura será estendida por um ciclo de assinatura após a cobrança bem-sucedida.
            </li>
            <li className="leading-relaxed">
              3. Para cancelar sua assinatura, acesse "App Store - Conta - Assinatura" e cancele sua assinatura pelo menos 24 horas antes do final do ciclo de assinatura atual. Ao clicar em "Assinar", você concorda com nosso Contrato do Usuário e Política de Privacidade.
            </li>
          </ol>
        </div>
        
        {/* Floating Action Button for Subscription (simulate "Assinar" from tips) */}
        <div className="fixed bottom-6 left-0 right-0 px-4">
           <button 
             onClick={handlePurchase}
             disabled={isProcessing || !selectedPackage}
             className="w-full bg-[#f2d49e] text-[#2c2214] font-black py-4 rounded-full text-[17px] shadow-[0_10px_30px_rgba(242,212,158,0.2)] hover:brightness-105 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
           >
              {isProcessing ? (
                <>
                  <Zap className="w-5 h-5 animate-pulse text-[#2c2214]" /> 
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>Recarregar {coinPackages.find(p => p.id === selectedPackage)?.price}</span>
                </>
              )}
           </button>
        </div>
        <div className="h-16"></div> {/* Bottom spacer */}
      </div>
    </div>
  );
}
