import { ChevronLeft, Share2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.origin + "/privacy-policy";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative min-h-screen text-gray-200 pb-20">
      <div className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10 flex items-center px-4 pt-12 pb-4 border-b border-neutral-900/50 justify-between">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Política de Privacidade</h1>
        <button 
          onClick={handleCopyLink}
          className="p-1 -mr-1 hover:bg-neutral-800 rounded-full transition relative"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Share2 className="w-5 h-5 text-white" />
          )}
          {copied && (
            <span className="absolute top-10 right-0 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
              Link copiado!
            </span>
          )}
        </button>
      </div>

      <div className="px-5 py-6 space-y-8 text-[14px] leading-relaxed text-neutral-400">
        <header className="mb-4">
          <p className="text-neutral-500 italic">Última atualização: 13 de Maio de 2026</p>
        </header>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">1. Introdução</h2>
          <p>
            Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações ao utilizar nossa plataforma de streaming. Estamos comprometidos em proteger sua privacidade e garantir que seus dados pessoais sejam tratados com segurança e transparência, em conformidade com as leis de proteção de dados (LGPD).
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">2. Informações que Coletamos</h2>
          <div className="space-y-3">
            <p><strong>Informações da Conta:</strong> Coletamos nome, e-mail e foto de perfil fornecidos através do login social (como Google ou Facebook) para identificar sua conta e personalizar sua experiência.</p>
            <p><strong>Dados de Uso:</strong> Registramos seu histórico de visualização para permitir que você continue de onde parou, além de suas listas de favoritos e preferências de gênero.</p>
            <p><strong>Transações e Pagamentos:</strong> Processamos recargas de Ouro e assinaturas VIP através de gateways de pagamento criptografados. Nós não retemos acesso direto aos dados confidenciais do seu cartão de crédito.</p>
          </div>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">3. Uso de Mensagens e Notificações</h2>
          <p>
            Podemos usar seu e-mail ou tokens de dispositivo para enviar notificações críticas sobre sua conta, avisos de novos episódios dos dramas que você segue ou promoções exclusivas da plataforma. Você tem total controle sobre essas comunicações nas configurações de notificações.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">4. Cookies e Tecnologias de Rastreamento</h2>
          <p>
            Utilizamos cookies essenciais para manter sua sessão ativa e cookies de análise/publicidade (como Google AdSense) para exibir conteúdos patrocinados relevantes. Esses anúncios financiam nosso conteúdo gratuito acessível por meio de recompensas.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">5. Segurança dos Dados</h2>
          <p>
            Adotamos protocolos de segurança robustos (SSL/TLS) para proteger o tráfego de dados. Suas informações de login e transações são protegidas por arquitetura de nuvem segura com monitoramento de ameaças 24/7.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">6. Seus Direitos e Exclusão</h2>
          <p>
            Você possui o direito de solicitar a correção de seus dados ou a exclusão permanente de sua conta. Para excluir sua conta e remover todos os dados associados, acesse a "Gestão da Conta" ou envie um e-mail para nossa equipe de suporte.
          </p>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <h2 className="text-white font-bold text-lg mb-3">Suporte de Privacidade</h2>
          <p className="mb-2">
            Se você tiver qualquer dúvida sobre como seus dados são gerenciados:
          </p>
          <a href="mailto:irformaticajr@gmail.com" className="text-yellow-500 font-bold hover:underline">
            irformaticajr@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}
