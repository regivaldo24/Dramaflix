import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AccountPage() {
  const navigate = useNavigate();
  // Initialize state from localStorage, default to false if not set
  const [autoPlay, setAutoPlay] = useState<boolean>(() => {
    const saved = localStorage.getItem("autoPlayNextVideo");
    try {
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  // Update localStorage when autoPlay changes
  useEffect(() => {
    localStorage.setItem("autoPlayNextVideo", JSON.stringify(autoPlay));
  }, [autoPlay]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Banner gradient effect */}
      <div className="absolute top-0 left-0 right-0 h-[200px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 mb-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-white/10 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2">
          Minha conta
        </h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      <div className="px-5">
        <div className="flex items-center justify-around py-6 border-b border-neutral-900/50 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[13px] text-neutral-400 mb-2 font-medium">Moedas</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center font-bold text-[11px] text-yellow-900 shadow-sm border border-yellow-200">
                G
              </div>
              <span className="text-xl font-bold">0</span>
            </div>
          </div>
          
          <div className="w-px h-8 bg-neutral-800"></div>

          <div className="flex flex-col items-center">
            <span className="text-[13px] text-neutral-400 mb-2 font-medium">Bônus</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center font-bold text-[12px] text-yellow-900 shadow-sm border border-orange-200">
                ★
              </div>
              <span className="text-xl font-bold">0</span>
            </div>
          </div>
        </div>

        <Link to="/store" className="block w-full text-center bg-gradient-to-r from-[#FF4E72] to-[#F12B55] text-white font-bold py-3.5 rounded-full text-[16px] shadow-[0_4px_14px_rgba(241,43,85,0.3)] hover:brightness-110 transition active:scale-[0.98] mb-8">
          Recarga
        </Link>

        <div className="space-y-1">
          <AccountRow label="Histórico de recargas" hasArrow to="/recharge-history" />
          <AccountRow label="Histórico de desbloqueios" hasArrow to="/unlock-history" />
          <AccountRow label="Histórico de bônus" hasArrow to="/bonus-history" />
          
          <div className="w-full flex items-center justify-between py-4 hover:bg-neutral-800/40 rounded-xl px-2 -mx-2 transition mt-2">
            <span className="text-[15px] font-medium text-gray-200">Reprodução automática do próximo vídeo</span>
            <button 
              onClick={() => setAutoPlay(!autoPlay)}
              className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative ${autoPlay ? 'bg-[#F12B55]' : 'bg-neutral-600'}`}
            >
              <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${autoPlay ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountRow({ label, hasArrow, to }: { label: string; hasArrow?: boolean; to?: string }) {
  const content = (
    <div className="w-full flex items-center justify-between py-4 hover:bg-neutral-800/40 rounded-xl px-2 -mx-2 transition active:scale-[0.98]">
      <span className="text-[15px] font-medium text-gray-200">{label}</span>
      {hasArrow && <ChevronRight className="w-5 h-5 text-neutral-500" />}
    </div>
  );
  
  if (to) {
     return <Link to={to} className="block">{content}</Link>;
  }
  return <button className="block w-full">{content}</button>;
}
