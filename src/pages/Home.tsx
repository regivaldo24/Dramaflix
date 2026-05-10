import { Search, Gift, ChevronRight, Heart, Play } from "lucide-react";
import { mockDramas } from "../data/mockData";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAccess } from "../hooks/useAccess";
import { useAuth } from "../contexts/AuthContext";
import { MovieCard } from "../components/MovieCard";

export default function HomePage() {
  const navigate = useNavigate();
  const categories = ["Descobrir", "Novas", "Categorias", "Rankings", "Minisséries"];
  const [searchQuery, setSearchQuery] = useState("");
  const { podeAssistir, isOwner } = useAccess();
  const { user } = useAuth();

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const handlePlayDrama = (id: string | number, title: string) => {
    navigate(`/play/${id}`);
  };

  const filteredDramas = useMemo(() => {
    if (!searchQuery.trim()) return mockDramas;
    const query = searchQuery.toLowerCase();
    return mockDramas.filter(drama => drama.title.toLowerCase().includes(query));
  }, [searchQuery]);

  const watchedDramas = useMemo(() => {
    if (!user) return [];
    let viewsStr = null;
    try {
      viewsStr = localStorage.getItem(`views_${user.id}`);
    } catch (e) {}
    
    let views = [];
    try {
      views = viewsStr ? JSON.parse(viewsStr) : [];
      if (!Array.isArray(views)) views = [];
    } catch (e) {
      views = [];
    }
    return views.map((id: any) => mockDramas.find(d => d.id.toString() === id.toString())).filter(Boolean);
  }, [user]);

  const recommendedDramas = useMemo(() => {
    // Lógica estável de recomendação baseada no usuário
    if (!user) return [...mockDramas].slice(0, 10);
    
    // Usar uma semente determinística baseada no ID do usuário
    const seed = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let baseList = [...mockDramas];
    
    if (seed % 2 === 0) {
      baseList.reverse();
    } else {
      // Rotacionar lista
      const shift = seed % baseList.length;
      baseList = [...baseList.slice(shift), ...baseList.slice(0, shift)];
    }
    
    return baseList.slice(0, 10);
  }, [user]);

  const heroDramas = useMemo(() => {
    // Escolher os 5 primeiros dramas recomendados para o banner rotativo
    return recommendedDramas.slice(0, 5);
  }, [recommendedDramas]);

  useEffect(() => {
    if (heroDramas.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroDramas.length);
    }, 7000); // Rotaciona a cada 7 segundos
    
    return () => clearInterval(interval);
  }, [heroDramas.length]);

  const currentHeroDrama = heroDramas[currentHeroIndex] || filteredDramas[0];

  return (
    <div className="flex flex-col h-full bg-black overflow-y-auto overflow-x-hidden no-scrollbar pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2 gap-2 sm:gap-4 sticky top-0 bg-gradient-to-b from-black/90 to-transparent z-40">
        <div className="flex-1 bg-[#1A1A1A] rounded-full flex items-center px-3 sm:px-4 py-2 min-w-0">
          <Search className="text-neutral-400 w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Buscar dramas..."
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-neutral-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Gift className="text-orange-500 w-7 h-7" />
          <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            +30
          </div>
        </div>
        <button 
          onClick={() => navigate('/vip-central')}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-sm px-3 py-1.5 rounded-md shadow-[0_0_10px_rgba(234,179,8,0.5)]"
        >
          VIP
        </button>
      </div>

      {/* Tabs */}
      {!searchQuery.trim() && (
        <div className="flex overflow-x-auto no-scrollbar gap-6 px-4 pt-2 pb-4 text-white text-sm font-semibold border-b border-neutral-900 snap-x">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              className={`whitespace-nowrap pb-1 relative snap-start shrink-0 ${
                idx === 0 ? "text-white" : "text-neutral-400"
              }`}
            >
              {cat}
              {idx === 0 && (
                <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {searchQuery.trim() ? (
        <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          <h2 className="col-span-full text-xl font-bold mb-2 text-white">Resultados da Busca</h2>
          {filteredDramas.map((drama) => (
            <MovieCard key={drama.id} drama={drama} handlePlayDrama={handlePlayDrama} user={user} />
          ))}
          {filteredDramas.length === 0 && (
            <div className="col-span-full py-10 text-center text-neutral-500">
              Nenhum drama encontrado.
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Netflix Style Banner */}
          {heroDramas.length > 0 && (
            <div className="banner relative h-[50vh] sm:h-[60vh] md:h-[75vh] w-full mt-2 shrink-0 overflow-hidden group">
              {/* Background Image Layer with Blur and Transition */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 blur-[4px]"
                key={`bg-${currentHeroDrama?.id}`}
                style={{ backgroundImage: `url(${currentHeroDrama?.image})` }}
              />
              
              {/* Stronger Gradient Overlay for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-40% to-transparent" />
              
              {/* Content Container */}
              <div className="relative z-10 w-full h-full flex flex-col justify-end pb-12 px-4 md:px-12">
                <div className="max-w-3xl flex flex-col gap-2">
                  <div className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded w-max tracking-wider uppercase mb-1 shadow-lg">
                    Recomendado para você
                  </div>
                  
                  <Link to={`/play/${currentHeroDrama?.id}`} className="block w-max">
                    <h1 
                      className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white text-shadow-lg leading-tight line-clamp-2 md:line-clamp-3 hover:text-yellow-400 transition-colors"
                    >
                      {currentHeroDrama?.title}
                    </h1>
                  </Link>
                  
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 mt-2 mb-4 line-clamp-2 md:line-clamp-3 max-w-lg text-shadow font-medium">
                     {currentHeroDrama?.description || "Assista agora ao drama mais popular da plataforma com uma história apaixonante e cheia de reviravoltas inesquecíveis."}
                  </p>
                  
                  <div className="flex gap-2 sm:gap-3 mt-2">
                    <button 
                      onClick={() => handlePlayDrama(currentHeroDrama?.id, currentHeroDrama?.title)}
                      className="bg-white hover:bg-neutral-200 text-black font-bold py-2 sm:py-2.5 px-4 sm:px-8 rounded-md transition flex items-center justify-center gap-2 shadow-xl active:scale-95 active:bg-red-600 active:text-white group/play"
                    >
                      <Play className="w-4 h-4 text-black fill-black group-active/play:fill-white" />
                      Assistir
                    </button>
                    
                    <button 
                      onClick={() => handlePlayDrama(currentHeroDrama?.id, currentHeroDrama?.title)}
                      className="bg-neutral-500/40 hover:bg-neutral-500/60 text-white font-bold py-2 sm:py-2.5 px-4 sm:px-8 rounded-md transition backdrop-blur-md border border-white/10 active:scale-95"
                    >
                      Informações
                    </button>
                  </div>
                </div>

                {/* Banner Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroDramas.map((_, idx) => (
                    <button
                      key={`indicator-${idx}`}
                      onClick={() => setCurrentHeroIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentHeroIndex ? "w-6 bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Continuar Assistindo */}
          {watchedDramas.length > 0 && (
            <div className="px-4 py-8 relative z-20 mt-4">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white text-shadow">Continuar Assistindo</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {watchedDramas.slice(0, 12).map((drama) => (
                  <MovieCard key={drama.id} drama={drama} handlePlayDrama={handlePlayDrama} user={user} />
                ))}
              </div>
            </div>
          )}

          {/* Grid List - Netflix Style */}
          <div className="px-4 py-8 relative z-20 -mt-2">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-white text-shadow">Populares</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredDramas.slice(1, 13).map((drama) => (
                <MovieCard key={drama.id} drama={drama} handlePlayDrama={handlePlayDrama} user={user} />
              ))}
            </div>
          </div>

          {/* Recomendados */}
          {recommendedDramas.length > 0 && (
            <div className="px-4 py-8 relative z-20">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white text-shadow">Recomendados para você</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {recommendedDramas.slice(0, 12).map((drama) => (
                  <MovieCard key={drama.id} drama={drama} handlePlayDrama={handlePlayDrama} user={user} />
                ))}
              </div>
            </div>
          )}

          {/* New Shorts Section */}
          <div className="px-4 py-8 relative z-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white text-shadow">Episódios Curtos</h2>
              <Link to="/shorts" className="text-yellow-500 text-sm font-bold flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mb-6">
              <Link 
                to="/shorts" 
                className="w-full bg-[#1A1A1A] hover:bg-neutral-800 border border-white/5 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center shadow-lg transition-all active:scale-[0.98] group"
              >
                <div className="bg-yellow-500 p-2 rounded-full mr-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                   <Play className="w-3 h-3 text-black fill-black" />
                </div>
                <span className="text-base">Assistir Shorts</span>
                <ChevronRight className="w-5 h-5 text-neutral-500 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {mockDramas.slice(0, 6).map((drama, idx) => (
                <div 
                  key={`short-${drama.id}`}
                  onClick={() => navigate(`/shorts/${drama.id}`)}
                  className="relative aspect-[9/16] rounded-xl overflow-hidden border border-white/10 group cursor-pointer"
                >
                  <img src={drama.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent " />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-tight mb-0.5">Capítulo {idx + 1}</p>
                    <p className="text-xs text-white font-bold line-clamp-1">{drama.title}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
