import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserContractPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative min-h-screen text-gray-200">
      <div className="sticky top-0 bg-[#0a0a0a] z-10 flex items-center px-4 pt-12 pb-4 border-b border-neutral-900/50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-6">Contrato do Usuário</h1>
      </div>

      <div className="px-5 py-6 space-y-6 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-base mb-2">Ao acessar este site, você concorda com os seguintes termos:</h2>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Uso da plataforma</h2>
          <p className="text-neutral-400">
            O usuário concorda em utilizar o site de forma legal e respeitando as leis vigentes.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Conta do usuário</h2>
          <p className="text-neutral-400">
            Cada usuário pode possuir apenas uma conta.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Moedas virtuais</h2>
          <p className="text-neutral-400">
            As moedas são virtuais e não possuem valor monetário real.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Anúncios</h2>
          <p className="text-neutral-400">
            O usuário pode assistir anúncios para ganhar recompensas dentro da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Proibições</h2>
          <ul className="text-neutral-400 list-disc pl-5 space-y-1">
            <li>Fraudar o sistema</li>
            <li>Criar múltiplas contas</li>
            <li>Utilizar bots</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Modificações</h2>
          <p className="text-neutral-400">
            O site pode alterar estes termos a qualquer momento.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-base mb-2">Contato</h2>
          <p className="text-neutral-400">
             <a href="mailto:irformaticajr@gmail.com" className="text-yellow-500 hover:underline">irformaticajr@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
