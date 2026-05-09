import React from "react";
import { XCircle, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function FailurePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <XCircle className="w-20 h-20 text-red-500 mb-6 mx-auto" />
      </motion.div>
      
      <h1 className="text-3xl font-black mb-4">Ops! Algo deu errado.</h1>
      <p className="text-neutral-400 mb-8 max-w-xs mx-auto">
        Não conseguimos processar o seu pagamento. Por favor, tente novamente ou escolha outro método.
      </p>

      <button
        onClick={() => navigate('/vip-central')}
        className="flex items-center gap-2 bg-neutral-800 text-white px-8 py-3 rounded-full font-black text-lg hover:bg-neutral-700 active:scale-95 transition"
      >
        Tentar Novamente <RefreshCcw className="w-5 h-5" />
      </button>
    </div>
  );
}
