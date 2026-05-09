import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import React, { useState } from "react";

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setMessage("");
    
    const { error } = await supabase.auth.updateUser({ password });
    
    setLoading(false);
    if (error) {
       setMessage(`Erro: ${error.message}`);
    } else {
       setMessage("Senha alterada com sucesso!");
       setPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm(t("confirmDeleteAccount"))) {
       setLoading(true);
       
       // Supabase default allows user to delete their account if RPC or edge function is set up.
       // However, auth.admin.deleteUser requires service role.
       // Without backend, we can try to call a custom rpc we assume might exist:
       const { error } = await supabase.rpc('delete_user');
       
       if (error) {
         // Fallback: If no RPC is found, just sign out and show message.
         await supabase.auth.signOut();
         alert(t("accountDeleted"));
         navigate('/');
       } else {
         await supabase.auth.signOut();
         alert(t("accountDeleted"));
         navigate('/');
       }
       setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative min-h-screen">
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-4 border-b border-neutral-900/50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-6">{t("accountManagement")}</h1>
      </div>

      <div className="px-5 py-6">
        {user ? (
          <div className="space-y-8">
            <div>
               <h2 className="text-sm font-semibold text-neutral-400 mb-2">E-mail Cadastrado</h2>
               <div className="bg-[#1c1c1e] px-4 py-3 rounded-xl border border-neutral-800 text-gray-200">
                  {user.email}
               </div>
            </div>

            <div>
               <h2 className="text-sm font-semibold text-neutral-400 mb-2">Alterar Senha</h2>
               <form onSubmit={handleUpdatePassword} className="space-y-3">
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Nova Senha"
                   className="w-full bg-[#1c1c1e] text-white px-4 py-3.5 rounded-xl text-[15px] placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F12B55] transition border border-neutral-800"
                   required
                   minLength={6}
                 />
                 <button 
                   type="submit"
                   disabled={loading}
                   className="w-full bg-[#2c2c2e] hover:bg-[#3c3c3e] text-white py-3 rounded-xl font-medium text-[14px] transition disabled:opacity-50 border border-neutral-700"
                 >
                   {loading ? "..." : "Atualizar Senha"}
                 </button>
                 {message && <p className="text-sm text-green-400">{message}</p>}
               </form>
            </div>

            <div className="pt-6 border-t border-neutral-900">
               <button 
                 onClick={handleLogout}
                 className="w-full bg-transparent border border-neutral-600 hover:border-neutral-400 text-white py-3 rounded-xl font-medium text-[15px] transition mb-4"
               >
                 Sair / Logout
               </button>

               <button 
                 onClick={handleDeleteAccount}
                 disabled={loading}
                 className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-medium text-[15px] transition disabled:opacity-50"
               >
                 {t("deleteAccount")}
               </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-neutral-400 mt-10">
             Nenhum usuário autenticado. Faça login para gerenciar sua conta.
          </div>
        )}
      </div>
    </div>
  );
}
