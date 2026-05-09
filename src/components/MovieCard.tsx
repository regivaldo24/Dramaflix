import React, { useState, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface MovieCardProps {
  drama: any;
  handlePlayDrama: (id: string, title: string) => void;
  user: any;
  onFavoriteChange?: () => void;
  key?: any; // Add key to props to resolve TS error in some environments
}

export const MovieCard = ({ drama, handlePlayDrama, user, onFavoriteChange }: MovieCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      let favsStr = null;
      try {
        favsStr = localStorage.getItem(`favs_${user.id}`);
      } catch (e) {}
      
      let favs = [];
      try {
        favs = favsStr ? JSON.parse(favsStr) : [];
        if (!Array.isArray(favs)) favs = [];
      } catch (e) {
        favs = [];
      }
      setIsFavorite(favs.includes(drama.id));
    }
  }, [user, drama.id]);
  
  const playTrailer = () => {
    setIsHovered(true);
    if (videoRef.current) {
        videoRef.current.play().catch(() => {}); // Ignore autoplay errors
    }
  };

  const stopTrailer = () => {
    setIsHovered(false);
    if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
    }
  };

  const handleFavoritar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Faça login para favoritar");
      return;
    }
    let favsStr = null;
    try {
      favsStr = localStorage.getItem(`favs_${user.id}`);
    } catch (e) {}
    
    let favs = [];
    try {
      favs = favsStr ? JSON.parse(favsStr) : [];
      if (!Array.isArray(favs)) favs = [];
    } catch (e) {
      favs = [];
    }
    if (favs.includes(drama.id)) {
        favs = favs.filter((id: any) => id !== drama.id);
        alert("Removido dos favoritos");
    } else {
        favs.push(drama.id);
        alert("Adicionado aos favoritos ❤️");
    }
    try {
      localStorage.setItem(`favs_${user.id}`, JSON.stringify(favs));
    } catch (e) {}
    setIsFavorite(!isFavorite);
    if (onFavoriteChange) onFavoriteChange();
  };

  return (
    <div 
      className="movie min-w-[140px] w-[140px] md:min-w-[200px] md:w-[200px] shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-105 relative" 
      onClick={() => handlePlayDrama(drama.id, drama.title)}
      onMouseEnter={playTrailer}
      onMouseLeave={stopTrailer}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-neutral-800 shadow-md h-full w-full">
        <img
          src={drama.image}
          alt={drama.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <video 
          ref={videoRef}
          className={`trailer absolute top-0 left-0 w-full h-full object-cover rounded-lg transition-opacity duration-300 pointer-events-none ${
            isHovered ? "block opacity-100 z-10" : "hidden opacity-0 -z-10"
          }`}
          style={{ display: isHovered ? 'block' : 'none' }}
          muted 
          loop
          playsInline
        >
          <source src={drama.trailer || "https://www.w3schools.com/html/mov_bbb.mp4"} type="video/mp4" />
        </video>

        <div className="absolute top-0 right-0 bg-yellow-500/90 text-black text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-bl-lg z-10 shadow-sm pointer-events-none">
          {drama.pill}
        </div>
        
        <button 
          onClick={handleFavoritar}
          className="absolute top-2 left-2 z-20 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
          <p className="text-xs md:text-sm text-white font-medium line-clamp-2 text-shadow-sm leading-tight group-hover:text-yellow-400 transition-colors">
            {drama.title}
          </p>
        </div>
      </div>
    </div>
  );
};
