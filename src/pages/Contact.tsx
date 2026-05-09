import { ChevronLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative min-h-screen text-gray-200">
      <div className="sticky top-0 bg-[#0a0a0a] z-10 flex items-center px-4 pt-12 pb-4 border-b border-neutral-900/50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-neutral-800 rounded-full transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-6">Contato</h1>
      </div>

      <div className="px-5 py-8 space-y-8 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 mb-2">
          <Mail className="w-10 h-10 text-yellow-500" />
        </div>
        
        <div>
          <h2 className="text-white font-black text-2xl mb-4">Fala com a gente!</h2>
          <p className="text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Se você tiver dúvidas, sugestões ou problemas, entre em contato:
          </p>
        </div>

        <a 
          href="mailto:irformaticajr@gmail.com"
          className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 px-6 py-4 rounded-2xl hover:bg-neutral-800 transition group"
        >
          <Mail className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition" />
          <span className="text-white font-bold">irformaticajr@gmail.com</span>
        </a>

        <p className="text-neutral-500 text-sm">
          Respondemos em até 48 horas.
        </p>
      </div>
    </div>
  );
}
