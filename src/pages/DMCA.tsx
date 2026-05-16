import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DMCA() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] min-h-screen text-gray-200">
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-4 border-b border-neutral-900/50 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-6">DMCA</h1>
      </div>

      <div className="px-6 py-8 space-y-6 max-w-3xl mx-auto overflow-y-auto no-scrollbar">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white border-l-4 border-yellow-500 pl-4">Digital Millennium Copyright Act ("DMCA")</h2>
          <p className="text-sm leading-relaxed text-neutral-400">
            Nossa plataforma respeita os direitos de propriedade intelectual de terceiros e espera que seus usuários façam o mesmo. Em conformidade com a Lei de Direitos Autorais do Milênio Digital (Digital Millennium Copyright Act - "DMCA"), responderemos prontamente a notificações de supostas infrações de direitos autorais.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Notificação de Infração</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            Se você acredita que seu trabalho foi copiado de uma forma que constitui infração de direitos autorais, forneça ao nosso Agente de Direitos Autorais as seguintes informações por escrito:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-400">
            <li>Uma assinatura física ou eletrônica da pessoa autorizada a agir em nome do proprietário do direito autoral;</li>
            <li>Uma descrição do trabalho protegido por direitos autorais que você alega ter sido infringido;</li>
            <li>Uma descrição de onde o material que você alega estar infringindo está localizado na plataforma (URL específica);</li>
            <li>Seu endereço, número de telefone e endereço de e-mail;</li>
            <li>Uma declaração sua de que você tem uma crença de boa-fé de que o uso em questão não é autorizado pelo proprietário dos direitos autorais, seu agente ou pela lei;</li>
            <li>Uma declaração sua, feita sob pena de perjúrio, de que as informações acima em sua notificação são precisas e que você é o proprietário dos direitos autorais ou está autorizado a agir em nome do proprietário.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Contra-Notificação</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            Se você acredita que o material que foi removido (ou ao qual o acesso foi desativado) não está infringindo, ou que você tem autorização do proprietário dos direitos autorais, do agente do proprietário ou de acordo com a lei, para postar e usar o material, você pode enviar uma contra-notificação contendo as informações exigidas pela DMCA.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Agente de Direitos Autorais</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            As notificações de supostas infrações de direitos autorais devem ser enviadas para:
          </p>
          <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
            <p className="text-sm font-medium text-white">E-mail: support@fluxocine.com</p>
            <p className="text-xs text-neutral-500 mt-1">Assunto: DMCA Notice</p>
          </div>
        </section>

        <section className="bg-yellow-500/10 p-6 rounded-2xl border border-yellow-500/20 mt-8">
          <p className="text-xs leading-relaxed text-yellow-500/80 italic">
            Atenção: Sob a Seção 512(f) da DMCA, qualquer pessoa que conscientemente deturpar que o material ou atividade está infringindo pode estar sujeita a responsabilidade por danos.
          </p>
        </section>
        
        <div className="h-20" /> {/* Spacer for scrolling */}
      </div>
    </div>
  );
}
