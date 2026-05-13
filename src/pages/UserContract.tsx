import { ChevronLeft, Share2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UserContractPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.origin + "/user-contract";
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
        <h1 className="text-lg font-bold text-white">Contrato do Usuário</h1>
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

      <div className="px-5 py-6 space-y-8 text-[14px] leading-relaxed">
        <header className="mb-4">
          <p className="text-neutral-500 italic">Última atualização: 13 de Maio de 2026</p>
        </header>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">1. Aceitação dos Termos</h2>
          <p className="text-neutral-400">
            Ao acessar e utilizar nossa plataforma de streaming de dramas, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte deste contrato, deverá interromper o uso da plataforma imediatamente.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">2. Descrição do Serviço</h2>
          <p className="text-neutral-400">
            A plataforma oferece acesso a conteúdos de vídeo sob demanda, incluindo dramas, minisséries e shorts. O acesso ao conteúdo pode ser gratuito (baseado em anúncios), mediante o uso de moedas virtuais (Bônus/Ouro) ou através de assinaturas VIP.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">3. Conta e Segurança</h2>
          <p className="text-neutral-400 mb-2">
            Para acessar certas funcionalidades, você deve criar uma conta. Você é responsável por:
          </p>
          <ul className="text-neutral-400 list-disc pl-5 space-y-2">
            <li>Manter a confidencialidade de sua senha e dados de acesso.</li>
            <li>Fornecer informações precisas e completas durante o registro.</li>
            <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">4. Moedas Virtuais e Transações</h2>
          <p className="text-neutral-400 mb-3">
            Nossa plataforma utiliza um sistema de moedas virtuais. Ouros podem ser adquiridos com moeda real, enquanto Bônus são ganhos através de atividades na plataforma.
          </p>
          <ul className="text-neutral-400 list-disc pl-5 space-y-2">
            <li><strong>Sem Reembolso:</strong> Compras de moedas virtuais e planos VIP não são reembolsáveis, exceto onde exigido por lei.</li>
            <li><strong>Uso Virtual:</strong> Moedas não possuem valor monetário fora da plataforma e não podem ser trocadas por dinheiro real.</li>
            <li><strong>Validade:</strong> Reservamo-nos o direito de gerir, controlar e modificar moedas virtuais a qualquer momento.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">5. Propriedade Intelectual</h2>
          <p className="text-neutral-400">
            Todo o conteúdo disponível na plataforma (vídeos, imagens, textos, logotipos) é de propriedade exclusiva da empresa ou de seus licenciadores. O uso da plataforma concede a você uma licença pessoal, não comercial, revogável e não transferível para visualizar o conteúdo. É estritamente proibida a reprodução, captura de tela ou distribuição não autorizada do material.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">6. Conduta Proibida</h2>
          <p className="text-neutral-400 mb-2">
            Os usuários concordam em NÃO:
          </p>
          <ul className="text-neutral-400 list-disc pl-5 space-y-2">
            <li>Tentar contornar medidas de segurança ou restrições de região (VPN).</li>
            <li>Usar scripts, bots ou automações para ganhar moedas indevidamente.</li>
            <li>Publicar conteúdo ofensivo, difamatório ou ilegal na seção de comentários.</li>
            <li>Praticar qualquer forma de pirataria ou compartilhamento de contas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">7. Limitação de Responsabilidade</h2>
          <p className="text-neutral-400">
            A plataforma é fornecida "como está", sem garantias de disponibilidade ininterrupta. Não nos responsabilizamos por perdas decorrentes de problemas técnicos, falhas de rede ou encerramento de licenças de conteúdos específicos.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">8. Modificações e Rescisão</h2>
          <p className="text-neutral-400">
            Podemos atualizar estes Termos a qualquer momento. O uso continuado após as alterações indica aceitação. Reservamo-nos o direito de suspender ou encerrar contas que violem estas regras, sem aviso prévio.
          </p>
        </section>

        <section className="bg-neutral-900 ring-1 ring-neutral-800 p-4 rounded-2xl">
          <h2 className="text-white font-bold text-lg mb-3">Dúvidas?</h2>
          <p className="text-neutral-400 mb-2">
            Se você tiver perguntas sobre este Contrato, entre em contato com nossa equipe de suporte.
          </p>
          <a href="mailto:irformaticajr@gmail.com" className="text-yellow-500 font-bold hover:underline">
            irformaticajr@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}
