import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative min-h-screen text-gray-200">
      <div className="sticky top-0 bg-[#0a0a0a] z-10 flex items-center px-4 pt-12 pb-4 border-b border-neutral-900/50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-6">Política de Privacidade</h1>
      </div>

      <div className="px-5 py-6 space-y-6 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-base mb-2">Este site respeita a sua privacidade e está comprometido em proteger seus dados pessoais.</h2>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Informações coletadas</h2>
          <p className="text-neutral-400">
            Coletamos informações como nome, e-mail e dados de uso para melhorar a experiência do usuário.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Uso de cookies</h2>
          <p className="text-neutral-400">
            Utilizamos cookies para personalizar conteúdo e anúncios, conforme políticas do Google.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Publicidade</h2>
          <p className="text-neutral-400">
            Utilizamos serviços de terceiros como Google AdSense, que podem usar cookies para exibir anúncios relevantes.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Compartilhamento de dados</h2>
          <p className="text-neutral-400">
            Não vendemos suas informações pessoais.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Segurança</h2>
          <p className="text-neutral-400">
            Adotamos medidas de segurança para proteger seus dados.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Contato</h2>
          <p className="text-neutral-400">
            Para dúvidas, entre em contato pelo e-mail: <a href="mailto:irformaticajr@gmail.com" className="text-yellow-500 hover:underline">irformaticajr@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
