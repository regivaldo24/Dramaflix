import { Bookmark, LayoutGrid, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { mockDramas } from "../data/mockData";
import { MovieCard } from "../components/MovieCard";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "motion/react";

export default function MyListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [favoriteDramas, setFavoriteDramas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = () => {
    if (user) {
      const favsStr = localStorage.getItem(`favs_${user.id}`);
      let favs = [];
      try {
        favs = favsStr ? JSON.parse(favsStr) : [];
        if (!Array.isArray(favs)) favs = [];
      } catch (e) {
        favs = [];
      }
      const loaded = favs.map((id: any) => 
        mockDramas.find(d => d.id.toString() === id.toString())
      ).filter(Boolean);
      setFavoriteDramas(loaded);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handlePlayDrama = (id: string, title: string) => {
    navigate(`/play/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-black text-white items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg px-5 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 p-2 rounded-lg">
            <Bookmark className="w-5 h-5 text-yellow-500" />
          </div>
          <h1 className="text-xl font-black tracking-tight">{t("mylist")}</h1>
        </div>
        <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
          <LayoutGrid size={14} />
          {favoriteDramas.length} Itens
        </div>
      </div>

      <div className="flex-1 px-4 pt-6">
        <AnimatePresence mode="popLayout">
          {favoriteDramas.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center mt-32 text-center"
            >
              <div className="relative mb-6">
                <Bookmark className="w-20 h-20 text-neutral-800" />
                <div className="absolute -top-1 -right-1 bg-neutral-900 rounded-full p-2 border border-white/5">
                  <Heart className="w-4 h-4 text-neutral-600" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-neutral-400 mb-2">Sua lista está vazia</h2>
              <p className="text-sm text-neutral-600 max-w-[240px] leading-relaxed mx-auto">
                Explore nossos dramas e toque no ícone de coração para salvá-los aqui.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="mt-8 bg-white/5 hover:bg-white/10 text-white text-sm font-bold px-8 py-3 rounded-full border border-white/10 transition active:scale-95"
              >
                Descobrir agora
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {favoriteDramas.map((drama, idx) => (
                <motion.div 
                  key={drama.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex justify-center"
                >
                  <MovieCard 
                    drama={drama} 
                    handlePlayDrama={handlePlayDrama} 
                    user={user} 
                    onFavoriteChange={loadFavorites}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Aesthetic Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent -z-10 pointer-events-none" />
      <div className="fixed bottom-20 right-0 w-[300px] h-[300px] bg-yellow-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
}
