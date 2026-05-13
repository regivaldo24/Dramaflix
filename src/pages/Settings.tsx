import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage, Language } from "../contexts/LanguageContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageSetup, setShowLanguageSetup] = useState(false);
  const [cacheSize, setCacheSize] = useState("128 MB");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleClearCacheClick = () => {
    setShowConfirmClear(true);
  };

  const handleConfirmClear = () => {
    setShowConfirmClear(false);
    // Simulate clearing cache
    alert(t("cleared"));
    setCacheSize("0 MB");
  };

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang as Language);
  };

  if (showLanguageSetup) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative min-h-screen">
        <div className="flex items-center px-4 pt-12 pb-4">
          <button onClick={() => setShowLanguageSetup(false)} className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1 text-center pr-6">{t("language")}</h1>
        </div>

        <div className="flex flex-col px-4 mt-2">
          {["English", "Spanish", "Português", "French"].map((lang) => {
            const isSelected = language === lang;
            return (
              <button 
                key={lang}
                onClick={() => handleSelectLanguage(lang)}
                className={`flex items-center justify-between py-4 border-b border-neutral-800/80 transition-colors ${isSelected ? "text-[#F12B55] font-semibold" : "text-gray-200"}`}
              >
                <span className="text-[15px]">{lang}</span>
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-[#F12B55]" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-600" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative min-h-screen">
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-4 border-b border-neutral-900/50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-6">{t("settings")}</h1>
      </div>

      <div className="px-4 py-2 space-y-6">
        {/* Preferências */}
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider px-2 mb-2">Preferências</h2>
          <button 
            onClick={() => setShowLanguageSetup(true)}
            className="w-full flex items-center justify-between py-5 px-2 hover:bg-neutral-800/20 transition group border-b border-neutral-900/40"
          >
            <span className="text-[15px] font-medium text-gray-200">{t("language")}</span>
            <div className="flex items-center gap-2 text-[#F12B55]">
              <span className="text-[15px] font-medium">{language}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <div className="w-full flex items-center justify-between py-5 px-2 border-b border-neutral-900/40">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-200">{t("notifications")}</span>
              <span className="text-[12px] text-neutral-500">Avisos sobre novos episódios e bônus</span>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none relative ${notificationsEnabled ? 'bg-yellow-500' : 'bg-neutral-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Legal e Suporte */}
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider px-2 mb-2">Legal e Suporte</h2>
          <button onClick={() => navigate("/privacy-policy")} className="w-full flex items-center justify-between py-5 px-2 hover:bg-neutral-800/20 transition group border-b border-neutral-900/40">
            <span className="text-[15px] font-medium text-gray-200">{t("privacyPolicy")}</span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>

          <button onClick={() => navigate("/terms-of-use")} className="w-full flex items-center justify-between py-5 px-2 hover:bg-neutral-800/20 transition group border-b border-neutral-900/40">
            <span className="text-[15px] font-medium text-gray-200">Termos de Uso</span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>

          <button onClick={() => navigate("/user-contract")} className="w-full flex items-center justify-between py-5 px-2 hover:bg-neutral-800/20 transition group border-b border-neutral-900/40">
            <span className="text-[15px] font-medium text-gray-200">{t("userContract")}</span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>

          <button onClick={() => navigate("/sobre")} className="w-full flex items-center justify-between py-5 px-2 hover:bg-neutral-800/20 transition group border-b border-neutral-900/40">
            <span className="text-[15px] font-medium text-gray-200">Sobre</span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>

          <button onClick={() => navigate("/contato")} className="w-full flex items-center justify-between py-5 px-2 hover:bg-neutral-800/20 transition group border-b border-neutral-900/40">
            <span className="text-[15px] font-medium text-gray-200">Contato</span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Conta */}
        <div className="space-y-1">
          <h2 className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider px-2 mb-2">Conta</h2>
          <button onClick={() => navigate("/account-management")} className="w-full flex items-center justify-between py-5 px-2 hover:bg-neutral-800/20 transition group border-b border-neutral-900/40">
            <span className="text-[15px] font-medium text-gray-200">{t("accountManagement")}</span>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>

          <div className="w-full flex items-center justify-between py-5 px-2">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[15px] font-medium text-gray-200">{t("clearCache")}</span>
              {cacheSize !== "0 MB" && <span className="text-[12px] text-neutral-500">{cacheSize}</span>}
            </div>
            <button 
              onClick={handleClearCacheClick}
              disabled={cacheSize === "0 MB"}
              className={`font-medium px-6 py-2 rounded-xl text-[14px] transition ${cacheSize !== "0 MB" ? "bg-red-600/10 text-red-500 hover:bg-red-600/20" : "bg-[#1c1c1e] text-neutral-500 disabled:opacity-50"}`}
            >
              {t("clear")}
            </button>
          </div>
        </div>
      </div>

      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-[#1c1c1e] w-full max-w-sm rounded-2xl p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-white text-lg font-bold mb-4 text-center">{t("clearCacheConfirm")}</h3>
            <div className="flex items-center gap-3 w-full mt-2">
              <button 
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition"
              >
                {t("no")}
              </button>
              <button 
                onClick={handleConfirmClear}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                {t("yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
