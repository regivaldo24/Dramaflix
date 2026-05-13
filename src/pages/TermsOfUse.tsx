import { ChevronLeft, Share2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function TermsOfUsePage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.origin + "/terms-of-use";
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
        <h1 className="text-lg font-bold text-white">Termos de Uso</h1>
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
          <h2 className="text-white font-bold text-lg mb-3">1. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo disponibilizado nesta plataforma, incluindo, mas não se limitando a vídeos, dramas, curtas-metragens, roteiros, gráficos, logotipos, ícones e software, é de propriedade exclusiva da plataforma ou de seus licenciadores de conteúdo. Estes são protegidos por leis internacionais de direitos autorais e tratados de propriedade intelectual.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">2. Licença de Uso Limitada</h2>
          <p>
            Concedemos a você uma licença limitada, não exclusiva e não transferível para acessar e visualizar o conteúdo apenas para fins pessoais e não comerciais. Qualquer tentativa de download não autorizado, redistribuição, retransmissão ou criação de obras derivadas é expressamente proibida.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">3. Disponibilidade de Conteúdo</h2>
          <p>
            A biblioteca de conteúdos pode variar periodicamente dependendo da região geográfica e de acordos de licenciamento. Reservamo-nos o direito de remover ou modificar qualquer conteúdo da plataforma a qualquer momento, sem aviso prévio.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">4. Isenção de Garantias</h2>
          <p>
            O serviço é fornecido "como está" (as is). Não garantimos que a plataforma estará livre de erros, interrupções ou que todos os dispositivos serão compatíveis. A experiência de streaming depende da qualidade da sua conexão de internet e da capacidade técnica do seu equipamento.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-3">5. Uso de Terceiros</h2>
          <p>
            Nossa plataforma pode conter links para sites ou serviços de terceiros (como anunciantes) que não são de nossa propriedade ou controlados por nós. Não assumimos responsabilidade pelo conteúdo ou práticas de privacidade de sites de terceiros.
          </p>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
          <h2 className="text-white font-bold text-lg mb-3">Jurisdição Legais</h2>
          <p className="mb-4">
            Estes Termos de Uso são regidos pelas leis vigentes. Qualquer disputa será resolvida nos tribunais competentes conforme legislação aplicável.
          </p>
          <p className="text-[12px] text-neutral-500">
            Dúvidas legais: <a href="mailto:irformaticajr@gmail.com" className="text-yellow-500 hover:underline">irformaticajr@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
