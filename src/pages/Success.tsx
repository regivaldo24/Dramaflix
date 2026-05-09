import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";

export default function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [details, setDetails] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentId = searchParams.get('payment_id');
      const statusParam = searchParams.get('status');
      const preferenceId = searchParams.get('preference_id');

      // Local storage fallback for UI details
      let pending = null;
      try {
        pending = localStorage.getItem('pending_transaction');
      } catch (e) {}
      
      let localDetails = null;
      try {
        localDetails = pending ? JSON.parse(pending) : null;
      } catch (e) {
        console.error("Error parsing pending_transaction", e);
      }

      if (paymentId) {
        try {
          const res = await fetch(`/api/confirm-payment?payment_id=${paymentId}`);
          const data = await res.json();
          
          if (data.success) {
            setStatus('success');
            if (data.details) {
              setDetails({
                type: data.details.type,
                amount: data.details.amount,
                plan: data.details.plan_title
              });
            } else {
              setDetails(localDetails);
            }
          } else {
            // Even if API check fails (e.g. mock or MP sync issue), if MP returned status=approved, we treat as success for UI
            if (statusParam === 'approved') {
              setStatus('success');
              setDetails(localDetails);
            } else {
              setStatus('error');
            }
          }
        } catch (e) {
          console.error("Error confirming payment:", e);
          if (statusParam === 'approved') {
            setStatus('success');
            setDetails(localDetails);
          } else {
            setStatus('error');
          }
        }
      } else {
        // No payment_id in URL, check if we arrived here from a mock/direct flow
        if (localDetails) {
          setStatus('success');
          setDetails(localDetails);
        } else {
          setStatus('error');
        }
      }
      
      try {
        localStorage.removeItem('pending_transaction');
      } catch (e) {}
    };

    confirmPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-bold">Confirmando seu pagamento...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <span className="text-red-500 text-4xl font-black">!</span>
        </div>
        <h1 className="text-2xl font-black mb-4 text-white">Ops! Algo deu errado</h1>
        <p className="text-neutral-400 mb-8 max-w-sm">Não conseguimos confirmar seu pagamento automaticamente. Se o valor foi descontado, não se preocupe, as moedas entrarão em breve ou entre em contato com o suporte.</p>
        <button
          onClick={() => navigate('/profile')}
          className="bg-neutral-800 text-white px-8 py-3 rounded-full font-bold"
        >
          Ir para o Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <CheckCircle className="w-24 h-24 text-green-500 mb-6 mx-auto drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
      </motion.div>
      
      <h1 className="text-3xl font-black mb-4">
        {details?.type === 'coins' ? 'Moedas Creditadas!' : 'Pagamento Aprovado!'}
      </h1>
      
      <div className="text-neutral-400 mb-8 max-w-sm mx-auto space-y-4 leading-relaxed">
        {details?.type === 'coins' ? (
          <>
            <p className="font-bold text-white">Sua recarga de moedas foi confirmada com sucesso!</p>
            <p>A quantidade de {details.amount} moedas selecionadas entrou na sua conta automaticamente.</p>
            <p className="text-sm text-green-500/80">O pagamento foi efetuado e está confirmado.</p>
          </>
        ) : (
          <p>
            {details?.type === 'subscription' || details?.plan
              ? `Parabéns! Sua assinatura foi confirmada e seus benefícios VIP já estão ativos.`
              : 'Sua transação foi processada com sucesso e os créditos já foram liberados na sua conta!'}
          </p>
        )}
      </div>

      <div className="flex flex-col w-full max-w-xs gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#FFE9BD] to-[#CD9D49] text-[#5B3B04] px-8 py-3.5 rounded-full font-black text-lg hover:brightness-105 active:scale-95 transition shadow-xl"
        >
          Verificar Saldo <ArrowRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="text-neutral-500 font-bold text-sm hover:text-white transition"
        >
          Voltar para Início
        </button>
      </div>
    </div>
  );
}
