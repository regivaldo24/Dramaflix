import { 
  ChevronRight, 
  Settings, 
  Clock, 
  Download, 
  MessageSquare,
  Gift,
  Copy,
  Crown,
  Video,
  MonitorPlay,
  LucideIcon,
  LogIn,
  UserPlus,
  Wallet,
  History,
  HelpCircle,
  Heart,
  Lock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import LoginScreen from "../components/LoginScreen";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { MOCK_SHORTS } from "../constants/shorts";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isOwner, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [userName, setUserName] = useState(() => {
    try {
      const localName = localStorage.getItem(`name_${user?.id}`);
      return localName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t("guest");
    } catch (e) {
      return user?.user_metadata?.full_name || user?.email?.split('@')[0] || t("guest");
    }
  });
  const [userPlan, setUserPlan] = useState(() => {
    try {
      return localStorage.getItem(`plan_${user?.id}`) || 'bronze';
    } catch (e) {
      return 'bronze';
    }
  });
  const [userExpiration, setUserExpiration] = useState(() => {
    try {
      return localStorage.getItem(`expiracao_${user?.id}`) || null;
    } catch (e) {
      return null;
    }
  });
  const [coins, setCoins] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [savedShorts, setSavedShorts] = useState<any[]>([]);

  const [profileImage, setProfileImage] = useState(() => {
    try {
      const localImage = localStorage.getItem(`avatar_${user?.id}`);
      return localImage || user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";
    } catch (e) {
      return user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRegistered = !!user;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/sync-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: { id: user.id, email: user.email } })
          });
          const serverUser = await res.json();
          
          if (serverUser.foto) {
            setProfileImage(serverUser.foto);
          } else {
            const localImage = localStorage.getItem(`avatar_${user.id}`);
            setProfileImage(localImage || user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200");
          }
          
          const localName = localStorage.getItem(`name_${user.id}`);
          setUserName(localName || serverUser.nome || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t("guest"));
          
          const localPlan = localStorage.getItem(`plan_${user.id}`) || serverUser.tipo || 'bronze';
          setUserPlan(localPlan);
          
          const localExp = localStorage.getItem(`expiracao_${user.id}`) || serverUser.data_expiracao;
          setUserExpiration(localExp);
          
          setCoins(serverUser.moedas || 0);
          setBonus(serverUser.bonus || 0);

          // Fetch saved shorts
          const favRes = await fetch(`/api/shorts/favorites/${user.id}`);
          const favData = await favRes.json();
          const favIds = favData.map((f: any) => f.short_id);
          const saved = MOCK_SHORTS.filter(s => favIds.includes(s.id));
          setSavedShorts(saved);
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      } else {
        setUserName(t("guest"));
        setProfileImage("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200");
        setCoins(0);
        setBonus(0);
        setSavedShorts([]);
      }
    };
    fetchUserData();
  }, [language, user, t]);
  
  const getNumericId = (uuid?: string) => {
    if (!uuid) return "228369864";
    let hash = 5381;
    for (let i = 0; i < uuid.length; i++) {
      hash = (hash * 33) ^ uuid.charCodeAt(i);
    }
    return (Math.abs(hash) % 900000000 + 100000000).toString();
  };
  const userId = getNumericId(user?.id);

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    alert("ID copiado!");
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = () => {
    setShowLogin(false);
  };
  
  const handleCancelSubscription = async () => {
    if (!user) return;
    let subId = null;
    try {
      subId = localStorage.getItem(`sub_${user.id}`);
    } catch (e) {}

    if (!subId) {
      alert("ID da assinatura não encontrado.");
      return;
    }

    if (!confirm("Tem certeza que deseja cancelar sua assinatura VIP? Você perderá acesso aos benefícios ao final do período atual.")) return;

    try {
       const response = await fetch('/api/cancel-subscription', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ subscriptionId: subId })
       });
       const data = await response.json();
       if (data.success) {
         alert("Sua assinatura foi cancelada com sucesso.");
         // In a real app, we would wait for the webhook to update the status
         // For the demo, let's just clear the local state
         try {
           localStorage.removeItem(`plan_${user.id}`);
           localStorage.removeItem(`sub_${user.id}`);
           localStorage.removeItem(`expiracao_${user.id}`);
         } catch (e) {}
         setUserPlan('bronze');
         setUserExpiration(null);
       } else {
         throw new Error(data.error || "Erro ao cancelar");
       }
    } catch (e) {
      console.error("Erro ao cancelar assinatura:", e);
      alert("Erro ao cancelar assinatura. Tente novamente.");
    }
  };

  const getPlanStyles = () => {
    switch(userPlan) {
      case 'prata': return {
        color: '#c0c0c0',
        name: 'Prata (VIP)',
        gradient: 'linear-gradient(to bottom, #c0c0c0, #707070)'
      };
      case 'ouro': return {
        color: '#ffd700',
        name: 'Ouro (VIP)',
        gradient: 'linear-gradient(to bottom, #ffd700, #b8860b)'
      };
      case 'bronze':
      default: return {
        color: '#cd7f32',
        name: 'Bronze (VIP)',
        gradient: 'linear-gradient(to bottom, #cd7f32, #8b5a2b)'
      };
    }
  };
  
  const planStyles = getPlanStyles();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar pb-20 relative w-full">
      <div className="absolute top-0 left-0 right-0 h-[200px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black -z-10" />

      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
        {/* Header Profile Section */}
        <div className="px-5 pt-12 pb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative cursor-pointer group shrink-0" onClick={handleImageClick}>
            {/* VIP Ring setup */}
            <div className="absolute -inset-1 rounded-full opacity-70 blur-[2px]" style={{ background: planStyles.gradient }}></div>
            <div className="w-[72px] h-[72px] rounded-full bg-neutral-800 flex items-center justify-center border-2 overflow-hidden relative z-10 p-0.5 shadow-lg" style={{ borderColor: planStyles.color }}>
              <div className="w-full h-full rounded-full overflow-hidden">
                <img 
                  src={profileImage} 
                  alt="User profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Crown decoration */}
            <div className="absolute -top-3 -left-3 z-20 transform -rotate-12">
              <Crown className="w-7 h-7 drop-shadow-md" style={{ color: planStyles.color, fill: planStyles.color }} />
            </div>
            {/* Diamond decoration */}
            <div className="absolute -bottom-2 lg:-bottom-2.5 left-1/2 -translate-x-1/2 z-20 bg-[#0a0a0a] rounded-full p-[1px]">
               <div className="w-[18px] h-[18px] text-[10px] bg-gradient-to-r from-cyan-200 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                 💎 
               </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div className="flex-1 min-w-0">
            {isRegistered ? (
              <div onClick={() => navigate('/edit-profile')} className="cursor-pointer group flex items-center justify-between w-full">
                <h2 className="text-[22px] font-bold text-white mb-0.5 tracking-wide truncate pr-2">{userName}</h2>
                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition shrink-0" />
              </div>
            ) : (
              <div onClick={() => setShowLogin(true)} className="cursor-pointer group flex items-center justify-between w-full">
                <h2 className="text-[22px] font-bold text-white mb-0.5 tracking-wide truncate pr-2">Fazer Login</h2>
                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition shrink-0" />
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="font-medium tracking-wide">ID <span className="text-neutral-300 ml-1">{userId}</span></span>
                <button onClick={handleCopyId} className="hover:text-white transition active:scale-95">
                  <Copy className="w-4 h-4 ml-0.5" />
                </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-[2px] rounded-sm tracking-wider uppercase" style={{ backgroundColor: planStyles.color + '33', color: planStyles.color }}>
                {planStyles.name}
              </span>
              {userExpiration && userPlan !== 'bronze' && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-500 font-medium tracking-wide">
                    Expira em {new Date(userExpiration).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={handleCancelSubscription}
                    className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-tighter mt-0.5 self-start"
                  >
                    Cancelar Assinatura
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {!isRegistered && (
          <button 
            onClick={() => setShowLogin(true)}
            className="border border-[#e7305b] text-[#e7305b] px-4 py-1.5 rounded-full text-[13px] font-medium bg-transparent hover:bg-[#e7305b]/10 transition shadow-[0_0_10px_rgba(231,48,91,0.2)] flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            {t("login")}
          </button>
        )}
      </div>

      {/* VIP Banner */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-br from-[#FFE9BD] via-[#fbd18b] to-[#CD9D49] rounded-2xl p-4 text-black shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span className="text-amber-800 text-lg">💎</span>
              <h3 className="font-black tracking-tight text-[#5B3B04] text-[17px]">{t("vipDiscount")}</h3>
            </div>
            <button 
              onClick={() => navigate('/vip-central')}
              className="bg-[#5B3B04] text-[#FFE9BD] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-0.5 hover:bg-[#4a2e02] shadow-sm"
            >
              {t("details")} <ChevronRight className="w-3.5 h-3.5 -mr-0.5" />
            </button>
          </div>
          <p className="text-[13px] font-medium text-[#8b6118] mb-5">{t("weeklyVip")}</p>
          
          <div className="grid grid-cols-4 gap-2 border-t border-[#daaa52] border-opacity-50 pt-4">
             <VipFeature icon={Video} label={t("allDramas")} />
             <VipFeature icon={Download} label={t("download")} />
             <VipFeature icon={MonitorPlay} label={t("quality1080")} />
             <VipFeature icon={Gift} label={t("dailyReward")} />
          </div>
        </div>
      </div>

      {/* Minha conta Section */}
      <div className="px-4 mb-5">
        <div className="bg-[#18181A] rounded-2xl px-5 py-4 border border-neutral-900/50 shadow-md">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-bold text-lg text-white">{t("account")}</h4>
            <Link to="/account" className="text-[13px] text-neutral-400 font-medium flex items-center gap-0.5 cursor-pointer hover:text-white transition">
              Detalhes <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-8">
              <div>
                <p className="text-[13px] text-neutral-400 font-medium mb-1 relative">
                  {t("coins")}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center font-bold text-[10px] text-yellow-900 shadow-sm border border-yellow-200">G</div>
                  <span className="font-bold text-lg text-white leading-none">{coins}</span>
                </div>
              </div>
              <div>
                <p className="text-[13px] text-neutral-400 font-medium mb-1 relative">
                  {t("bonus")}
                </p>
                <div className="flex items-center gap-1.5">
                   <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center font-bold text-[11px] text-yellow-900 shadow-sm border border-orange-200">
                     ★
                   </div>
                  <span className="font-bold text-lg text-white leading-none">{bonus}</span>
                </div>
              </div>
            </div>
            
            <Link to="/store" className="bg-gradient-to-r from-[#FF4E72] to-[#F12B55] text-white font-bold px-6 py-2.5 rounded-full text-[15px] shadow-[0_4px_14px_rgba(241,43,85,0.3)] hover:brightness-110 transition mt-1 text-center">
              {t("recharge")}
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Videos Section */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg text-white">Vídeos Salvos</h4>
          <span className="text-xs text-neutral-500 font-medium">{savedShorts.length} vídeos</span>
        </div>
        
        {savedShorts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {savedShorts.map((short) => (
              <div 
                key={short.id} 
                onClick={() => navigate('/shorts')}
                className="aspect-[9/16] rounded-xl overflow-hidden relative cursor-pointer group active:scale-95 transition-transform"
              >
                <video 
                  src={short.videoUrl} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                   <div className="flex items-center gap-1 text-[10px] text-white font-bold uppercase">
                      <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500" />
                      {short.likes}
                   </div>
                </div>
                {short.isLocked && (
                  <div className="absolute top-2 right-2 bg-yellow-500/20 backdrop-blur-md rounded-full p-1 border border-yellow-500/30">
                    <Lock className="w-3 h-3 text-yellow-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#18181A] rounded-2xl p-8 border border-neutral-900/50 flex flex-col items-center justify-center text-center">
            <MonitorPlay className="w-8 h-8 text-neutral-700 mb-2" />
            <p className="text-neutral-500 text-sm font-medium">Você ainda não salvou nenhum vídeo.</p>
            <button 
              onClick={() => navigate('/shorts')}
              className="mt-4 text-[#e7305b] text-sm font-bold hover:underline"
            >
              Explorar Shorts
            </button>
          </div>
        )}
      </div>

      {/* Menu List */}
      <div className="px-5 space-y-1">
        <div className="mb-3">
           <Link to="/recompensa" className="block w-full text-left">
             <MenuRow 
                icon={<Gift className="text-neutral-400 w-5 h-5 ml-1" />} 
                label={t("earnRewards")} 
                rightElement={<span className="text-[#F12B55] text-[13px] font-medium mr-1 tracking-wide">{t("earnFreeBonus")}</span>}
             />
           </Link>
        </div>
        
        {isAdmin && (
          <div className="mb-3 border border-red-900/30 rounded-xl bg-red-900/10 overflow-hidden">
            <Link to="/admin" className="block w-full text-left">
              <MenuRow 
                icon={<Crown className="text-red-500 w-[22px] h-[22px]" />} 
                label="Painel Admin" 
                rightElement={<span className="text-red-500 text-[11px] font-bold mr-1 uppercase">Acesso Liberado</span>}
              />
            </Link>
          </div>
        )}
        
        <Link to="/recharge-history" className="block w-full text-left">
          <MenuRow icon={<Wallet className="text-neutral-400 w-[22px] h-[22px]" />} label={t("recharge")} />
        </Link>
        <Link to="/bonus-history" className="block w-full text-left">
           <MenuRow icon={<Crown className="text-neutral-400 w-[22px] h-[22px]" />} label={t("bonusHistory")} />
        </Link>
        <Link to="/unlock-history" className="block w-full text-left">
          <MenuRow icon={<Video className="text-neutral-400 w-[22px] h-[22px]" />} label={t("unlockHistory")} />
        </Link>
        
        <div className="h-4"></div>
        <Link to="/qa" className="block w-full text-left">
          <MenuRow icon={<HelpCircle className="text-neutral-400 w-[22px] h-[22px]" />} label={t("helpCenter")} />
        </Link>
        <MenuRow icon={<MonitorPlay className="text-neutral-400 w-[22px] h-[22px]" />} label={t("customerService")} />
        <MenuRow icon={<MessageSquare className="text-neutral-400 w-[22px] h-[22px]" />} label={t("comments")} />
        
        <div className="h-4"></div>
        <Link to="/settings" className="block">
          <MenuRow icon={<Settings className="text-neutral-400 w-[22px] h-[22px]" />} label={t("settings")} />
        </Link>
      </div>

      {showLogin && (
        <LoginScreen 
          onLogin={handleLogin} 
          onClose={() => setShowLogin(false)} 
        />
      )}
      </div>
    </div>
  );
}

function VipFeature({ icon: Icon, label }: { icon: LucideIcon, label: string }) {
  return (
     <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition">
        <div className="w-[42px] h-[42px] rounded-full bg-[#8b6118]/15 flex items-center justify-center shadow-inner">
           <Icon className="w-5 h-5 text-[#6b4707] fill-[#6b4707]" />
        </div>
        <span className="text-[10px] font-bold text-center text-[#6b4707] leading-[1.1] max-w-[80px]">
           {label}
        </span>
     </div>
  )
}

function MenuRow({ icon, label, rightElement }: { icon: React.ReactNode; label: string; rightElement?: React.ReactNode }) {
  return (
    <button className="w-full flex items-center justify-between py-3.5 hover:bg-neutral-800/40 rounded-xl px-1 transition active:scale-[0.98]">
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-[15px] font-medium text-gray-200">{label}</span>
      </div>
      <div className="flex items-center gap-1">
         {rightElement}
         <ChevronRight className="w-4 h-4 text-neutral-500" />
      </div>
    </button>
  );
}
