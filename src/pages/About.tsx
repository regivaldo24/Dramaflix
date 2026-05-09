import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative min-h-screen text-gray-200">
      <div className="sticky top-0 bg-[#0a0a0a] z-10 flex items-center px-4 pt-12 pb-4 border-b border-neutral-900/50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-6">Sobre</h1>
      </div>

      <div className="px-5 py-6 space-y-6 text-[15px] leading-relaxed">
        <section>
          <p className="text-neutral-400">
            Nosso site foi criado para oferecer entretenimento digital através de séries e conteúdos exclusivos.
          </p>
          <p className="text-neutral-400 mt-4">
            Nosso objetivo é proporcionar uma experiência acessível, segura e de qualidade para todos os usuários.
          </p>
        </section>
      </div>
    </div>
  );
}
