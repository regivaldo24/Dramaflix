import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { mockDramas } from "../data/mockData";

export default function UnlockHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unlocks, setUnlocks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const viewsStr = localStorage.getItem(`views_${user.id}`);
      let views = [];
      try {
        views = viewsStr ? JSON.parse(viewsStr) : [];
        if (!Array.isArray(views)) views = [];
      } catch (e) {
        views = [];
      }
      
      const history = views.map((id: any) => {
        const drama = mockDramas.find(d => d.id.toString() === id.toString());
        return {
          id: id,
          title: drama?.title || `Vídeo ${id}`,
          episode: "Visualizado",
          date: new Date().toLocaleString(),
          cost: 0,
          image: drama?.image || "https://images.unsplash.com/photo-1627857245814-1e013f9d5067?auto=format&fit=crop&q=80&w=200"
        };
      }).reverse(); // Most recent first
      
      setUnlocks(history);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 mb-2 border-b border-neutral-900 sticky top-0 bg-[#0a0a0a] z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-white/10 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2">
          Histórico de desbloqueios
        </h1>
        <div className="w-6"></div>
      </div>

      <div className="px-4 py-2">
        {unlocks.length > 0 ? (
          <div className="space-y-4">
            {unlocks.map((item) => (
              <div key={item.id} className="flex gap-3 bg-[#18181A] p-3 rounded-xl border border-neutral-900/50">
                <img src={item.image} alt={item.title} className="w-16 h-20 object-cover rounded-md" />
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-sm text-white line-clamp-2 md:line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-xs text-neutral-300 font-medium">{item.episode}</p>
                  <div className="flex justify-between items-end mt-auto pt-2">
                    <span className="text-[10px] text-neutral-500">{item.date}</span>
                    <div className="flex items-center gap-1 text-xs">
                       <span className="text-neutral-400">Gasto:</span>
                       <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center font-bold text-[8px] text-yellow-900">
                        G
                      </div>
                       <span className="text-yellow-500 font-bold">{item.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-neutral-500">
            <p>Nenhum drama desbloqueado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
