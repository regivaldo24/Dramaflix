import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, Check, ChevronRight, QrCode, X, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [userName, setUserName] = useState(() => {
    try {
      const localName = localStorage.getItem(`name_${user?.id}`);
      return localName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t("guest") || "Visitante";
    } catch (e) {
      return user?.user_metadata?.full_name || user?.email?.split('@')[0] || t("guest") || "Visitante";
    }
  });
  const [userPlan, setUserPlan] = useState(() => {
    try {
      return localStorage.getItem(`plan_${user?.id}`) || 'bronze';
    } catch (e) {
      return 'bronze';
    }
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    try {
      const localImage = localStorage.getItem(`avatar_${user?.id}`);
      return localImage || user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";
    } catch (e) {
      return user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            let localImage = null;
            try {
              localImage = localStorage.getItem(`avatar_${user.id}`);
            } catch (e) {}
            setProfileImage(localImage || user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200");
          }
          
          let localName = null;
          try {
            localName = localStorage.getItem(`name_${user.id}`);
          } catch (e) {}
          setUserName(localName || serverUser.nome || user.user_metadata?.full_name || user.email?.split('@')[0] || t("guest") || "Visitante");
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      }
    };
    fetchUserData();
  }, [user, t]);

  const getNumericId = (uuid?: string) => {
    if (!uuid) return "228369864";
    let hash = 5381;
    for (let i = 0; i < uuid.length; i++) {
      hash = (hash * 33) ^ uuid.charCodeAt(i);
    }
    return (Math.abs(hash) % 900000000 + 100000000).toString();
  };
  const userId = getNumericId(user?.id);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    const defaultUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200";
    setProfileImage(defaultUrl);
    if (user?.id) {
      try {
        localStorage.removeItem(`avatar_${user.id}`);
      } catch (e) {}
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem válida (JPG, PNG).");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Imagem muito grande (máx 2MB).");
        return;
      }

      setIsUpdating(true);
      try {
        const formData = new FormData();
        formData.append('foto', file);
        formData.append('userId', user.id);

        const response = await fetch('/api/upload-profile-photo', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        if (data.success) {
          setProfileImage(data.foto);
          try {
            localStorage.setItem(`avatar_${user.id}`, data.foto);
          } catch (e) {}
        } else {
          alert("Erro ao enviar foto: " + (data.error || "Erro desconhecido"));
        }
      } catch (err) {
        console.error("Erro ao processar imagem:", err);
        alert("Erro ao processar imagem. Tente novamente.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlan = e.target.value;
    if (newPlan === 'ouro') {
      alert("Plano ouro só para assinantes!");
      return;
    }
    setUserPlan(newPlan);
  };

  const [showPixModal, setShowPixModal] = useState(false);
  const [pixStatus, setPixStatus] = useState<"generating" | "waiting" | "paid" | "error">("generating");
  const [pixCode, setPixCode] = useState("");

  const handleSimulateGold = () => {
    setShowPixModal(true);
    setPixStatus("generating");
    
    // Simulate MercadoPago API JSON generation
    setTimeout(() => {
      const mockPayload = {
        transaction_amount: 19.90,
        description: "Plano Ouro",
        payment_method_id: "pix",
        payer: {
          email: user?.email || "cliente@email.com"
        },
        qr_code: "00020101021243650016COM.BANCENTRALBRASIL.PIX0114+5511999999999520400005303986540519.905802BR5915DramasFlix Ltda6009SAO PAULO62140510PlanoOuro16304ED9C",
        qr_code_base64: "mock_base64"
      };
      
      console.log("Mock MercadoPago Payload:", mockPayload);
      setPixCode(mockPayload.qr_code);
      setPixStatus("waiting");
    }, 1500);
  };

  const handleSimulatePaymentMock = () => {
    setPixStatus("paid");
    setTimeout(() => {
      setUserPlan('ouro');
      if (user?.id) {
        try {
          localStorage.setItem(`plan_${user.id}`, 'ouro');
        } catch (e) {}
      }
      
      // Simulate backend configuration response
      console.log(JSON.stringify({
        user: userName,
        plano: "ouro"
      }));
      
      setShowPixModal(false);
      alert("Agora você é usuário OURO!");
    }, 1500);
  };

  const handleSaveProfile = () => {
    setIsEditingName(false);
    if (user?.id) {
      try {
        if (userName.trim()) localStorage.setItem(`name_${user.id}`, userName.trim());
        localStorage.setItem(`plan_${user.id}`, userPlan);
      } catch (e) {}
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-900 bg-black sticky top-0 z-10 w-full">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-neutral-900 rounded-full transition">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <span className="font-bold text-[17px] tracking-wide">Editar perfil</span>
        <button onClick={handleSaveProfile} className="p-1 -mr-1 hover:bg-neutral-900 rounded-full transition">
          <Check className="w-6 h-6 text-green-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 mt-2 bg-black">
        {/* Profile Image Row */}
        <div className="flex flex-col items-center justify-center py-6 mb-2 border-b border-transparent gap-4 relative">
          <div className="relative">
            <div className={`w-[80px] h-[80px] rounded-full overflow-hidden relative cursor-pointer ${isUpdating ? "opacity-50" : "hover:opacity-80"} transition`} onClick={handleImageClick}>
               <img 
                 src={profileImage} 
                 alt="Profile" 
                 className="w-full h-full object-cover"
               />
               {isUpdating && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>}
            </div>
          </div>
          
          <div className="flex flex-row items-center gap-6">
            <button 
              onClick={handleImageClick}
              disabled={isUpdating}
              className="text-neutral-200 text-[14px] flex items-center gap-1 active:opacity-70 transition font-medium"
            >
              Alterar
            </button>
            <button 
              onClick={handleRemovePhoto}
              disabled={isUpdating}
              className="text-red-500 text-[14px] flex items-center gap-1 active:opacity-70 transition font-medium"
            >
              Remover
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Info Rows */}
        {isEditingName ? (
          <div className="flex justify-between items-center py-6 border-b border-transparent">
            <span className="text-[15px] text-white tracking-wide">Nome do usuário</span>
            <input 
              type="text"
              autoFocus
              className="bg-transparent text-right text-[15px] text-white outline-none w-[150px] font-medium"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveProfile();
              }}
            />
          </div>
        ) : (
          <div className="flex justify-between items-center py-6 border-b border-transparent cursor-pointer group" onClick={() => setIsEditingName(true)}>
            <span className="text-[15px] text-white tracking-wide group-hover:opacity-80 transition">Nome do usuário</span>
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-neutral-200 tracking-wide font-medium">{userName.toUpperCase()}</span>
              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center py-6 border-b border-transparent">
          <span className="text-[15px] text-white tracking-wide">E-mail</span>
          <span className="text-[15px] text-neutral-200 tracking-wide">{user?.email || "irformaticajr@gmail.com"}</span>
        </div>

        <div className="flex justify-between items-center py-6 border-b border-neutral-900">
          <span className="text-[15px] text-white tracking-wide">ID</span>
          <span className="text-[15px] text-neutral-400 tracking-wide">{userId}</span>
        </div>

        <div className="flex justify-between items-center py-6 border-b border-transparent">
          <span className="text-[15px] text-white tracking-wide">Plano</span>
          <select 
            value={userPlan} 
            onChange={handlePlanChange}
            className="bg-neutral-900 text-white text-[14px] outline-none rounded p-1 cursor-pointer"
          >
            <option value="bronze">BRONZE</option>
            <option value="prata">PRATA</option>
            <option value="ouro">OURO</option>
          </select>
        </div>

        <div className="mt-8 flex justify-center">
           <button 
             onClick={handleSimulateGold}
             className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl transition"
           >
             Simular Assinatura Ouro
           </button>
        </div>

      </div>

      {showSuccess && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm drop-shadow-md transition-opacity animate-in fade-in slide-in-from-top-4 flex items-center gap-2 z-50">
          <Check className="w-4 h-4" />
          Alteração concluída com sucesso
        </div>
      )}

      {/* Pix Modal */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c1c1e] w-full max-w-sm rounded-[24px] overflow-hidden flex flex-col p-6 items-center shadow-2xl relative animate-in zoom-in-95">
            <button 
              onClick={() => setShowPixModal(false)}
              className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition"
              disabled={pixStatus === "paid"}
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2">Assinatura Ouro</h3>
            <p className="text-sm text-neutral-400 text-center mb-6">Pague via PIX para liberar todos os benefícios.</p>
            
            {pixStatus === "generating" && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-yellow-500 font-medium">Gerando PIX com MercadoPago...</p>
              </div>
            )}
            
            {pixStatus === "waiting" && (
              <div className="flex flex-col items-center w-full">
                <div className="bg-white p-4 rounded-2xl mb-6 shadow-md border-4 border-yellow-500/20">
                  <QrCode className="w-48 h-48 text-black" />
                </div>
                
                <div className="w-full bg-black/40 rounded-xl p-3 flex items-center justify-between border border-neutral-800 mb-6 group cursor-pointer" onClick={() => navigator.clipboard.writeText(pixCode)}>
                  <div className="truncate flex-1 text-sm text-neutral-300 font-mono pr-4">
                    {pixCode}
                  </div>
                  <Copy className="w-5 h-5 text-neutral-500 group-hover:text-white transition" />
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                   <div className="flex justify-between items-center bg-neutral-800/50 p-3 rounded-lg text-sm">
                      <span className="text-neutral-400">Total a pagar:</span>
                      <span className="font-bold text-green-400 text-lg">R$ 19,90</span>
                   </div>
                   
                   <button 
                     className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition shadow-lg shadow-yellow-500/20 active:scale-[0.98]"
                     onClick={handleSimulatePaymentMock}
                   >
                     Simular Pagamento Confirmado
                   </button>
                </div>
              </div>
            )}
            
            {pixStatus === "paid" && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-white font-bold text-lg">Pagamento Aprovado!</p>
                <p className="text-green-400 text-sm">Conta atualizada para Ouro</p>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
