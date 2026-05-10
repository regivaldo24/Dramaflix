import React, { useState, useRef, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical, 
  Bookmark, 
  Play, 
  Pause,
  ChevronLeft,
  Music2,
  Lock,
  Send,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MOCK_SHORTS } from "../constants/shorts";

export default function ShortsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && containerRef.current) {
      const index = MOCK_SHORTS.findIndex(s => s.id.toString() === id);
      if (index !== -1) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: index * containerRef.current.clientHeight,
              behavior: 'instant' as any
            });
            setActiveIndex(index);
          }
        }, 100);
      }
    }
  }, [id]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const index = Math.round(target.scrollTop / target.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToCategory = (category: string) => {
    const index = MOCK_SHORTS.findIndex(s => s.category === category);
    if (index !== -1 && containerRef.current) {
      containerRef.current.scrollTo({
        top: index * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const currentCategory = MOCK_SHORTS[activeIndex]?.category || 'foryou';

  return (
    <div className="h-screen w-full bg-black flex flex-col relative overflow-hidden">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-8 bg-gradient-to-b from-black/90 to-transparent">
        <button onClick={() => navigate(-1)} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-7 h-7" />
        </button>
        
        <div className="flex gap-8 relative pb-2">
          <button 
            onClick={() => scrollToCategory('following')}
            className={`text-base font-black transition-all tracking-wider ${currentCategory === 'following' ? "text-white scale-110" : "text-white/40 hover:text-white/60"}`}
          >
            SEGUINDO
          </button>
          <button 
            onClick={() => scrollToCategory('foryou')}
            className={`text-base font-black transition-all tracking-wider ${currentCategory === 'foryou' ? "text-white scale-110" : "text-white/40 hover:text-white/60"}`}
          >
            PARA VOCÊ
          </button>
          
          {/* Active Indicator Underline */}
          <motion.div 
            className="absolute bottom-0 h-1 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"
            initial={false}
            animate={{ 
              left: currentCategory === 'following' ? "0%" : "55%", 
              width: currentCategory === 'following' ? "35%" : "45%" 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        
        <div className="w-11"></div> {/* Spacer */}
      </div>

      {/* Main Content (Scrollable Container) */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {MOCK_SHORTS.map((short, idx) => (
          <ShortItem 
            key={idx} 
            short={short} 
            isActive={idx === activeIndex} 
            isLast={idx === MOCK_SHORTS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function ShortItem({ short, isActive, isLast }: { short: any; isActive: boolean; isLast: boolean; key?: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [doubleTapHearts, setDoubleTapHearts] = useState<any[]>([]);
  const lastTapRef = useRef<number>(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isActive) {
      fetchShortData();
    }
  }, [isActive, short.id, user]);

  const fetchShortData = async () => {
    try {
      const userId = user?.id || "";
      const res = await fetch(`/api/shorts/data/${short.id}?userId=${userId}`);
      const data = await res.json();
      setLikesCount(data.likesCount);
      setCommentsCount(data.commentsCount);
      setComments(data.comments);
      setIsLiked(data.isLiked);
      setIsFavorited(data.isFavorited);
    } catch (e) {
      console.error("Error fetching short data:", e);
    }
  };

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Faça login para interagir!");
      return;
    }
    
    // Optimistic UI
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      await fetch('/api/shorts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, shortId: short.id })
      });
    } catch (e) {
      // Revert if error
      setIsLiked(!newLiked);
      setLikesCount(prev => !newLiked ? prev + 1 : prev - 1);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Faça login para salvar!");
      return;
    }

    const newFav = !isFavorited;
    setIsFavorited(newFav);

    try {
      await fetch('/api/shorts/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, shortId: short.id })
      });
    } catch (e) {
      setIsFavorited(!newFav);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Faça login para comentar!");
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await fetch('/api/shorts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          userName: (user as any).username || user.email.split('@')[0],
          shortId: short.id,
          comment: commentText
        })
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setCommentsCount(prev => prev + 1);
        setCommentText("");
      }
    } catch (e) {
      console.error("Error adding comment:", e);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: short.title,
      text: `Assista @${short.title.replace(/\s/g, '').toLowerCase()} no DramasFlicks: ${short.description}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        console.log("Error sharing:", e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      handleDoubleTap(e);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Single tap - toggle play/pause after a delay to ensure it wasn't a double tap
      setTimeout(() => {
        if (lastTapRef.current !== 0) {
          togglePlay();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    // Visual heart effect
    const heart = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setDoubleTapHearts(prev => [...prev, heart]);
    setTimeout(() => {
      setDoubleTapHearts(prev => prev.filter(h => h.id !== heart.id));
    }, 1000);

    // Like logic
    if (!isLiked) {
      handleLike(e);
    }
  };

  return (
    <div className="h-screen w-full snap-start relative bg-black flex items-center justify-center">
      {/* Video Content Wrap */}
      <div 
        className="relative z-10 w-full h-full md:max-w-[450px] bg-black flex items-center justify-center overflow-hidden"
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          src={short.videoUrl}
          loop
          className="h-full w-full object-cover"
          playsInline
        />

        {/* Double Tap Hearts */}
        <AnimatePresence>
          {doubleTapHearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 0, scale: 0.5, y: -50 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 1.5], y: -200 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', left: heart.x - 40, top: heart.y - 40, zIndex: 100 }}
              className="pointer-events-none"
            >
              <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-2xl" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Play Overlay Icon */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            >
              <div className="bg-black/30 rounded-full p-6 backdrop-blur-sm">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locked Overlay */}
        {short.isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-yellow-500/20 border border-yellow-500/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <Lock className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Conteúdo VIP</h3>
            <p className="text-neutral-300 text-sm mb-8">
              Assine um de nossos planos para desbloquear todos os episódios exclusivos.
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/store');
              }}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-10 rounded-2xl shadow-xl transition-transform active:scale-95"
            >
              DESBLOQUEAR AGORA
            </button>
          </div>
        )}

        {/* Bottom Info Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />

        {/* Sidebar Actions */}
        <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-6 items-center">
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={handleLike}
              className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center group transition-transform active:scale-90"
            >
              <Heart className={`w-6 h-6 transition-all ${isLiked ? "fill-red-500 text-red-500 scale-125" : "text-white group-hover:scale-110"}`} />
            </button>
            <span className="text-xs font-bold text-white text-shadow">{formatNumber(likesCount > 0 ? likesCount : (parseInt(short.likes) * 1000 || 0))}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
            <span className="text-xs font-bold text-white text-shadow">{formatNumber(commentsCount > 0 ? commentsCount : (parseInt(short.comments) * 1000 || 0))}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={handleFavorite}
              className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center group active:scale-90 transition-transform"
            >
              <Bookmark className={`w-6 h-6 transition-all ${isFavorited ? "fill-white text-white scale-125" : "text-white group-hover:scale-110"}`} />
            </button>
            <span className="text-xs font-bold text-white text-shadow">Salvar</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={handleShare}
              className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center group active:scale-90 transition-transform"
            >
              <Share2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <span className="text-xs font-bold text-white text-shadow">{short.shares}</span>
          </div>
          
          <div className="mt-4 animate-spin-slow">
            <div className="w-10 h-10 bg-neutral-800 rounded-full border-4 border-yellow-500/30 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1543906965-f9520aa2ed8a?auto=format&fit=crop&q=80&w=40" alt="Music" />
            </div>
          </div>
        </div>

        {/* Bottom Details */}
        <div className="absolute bottom-10 left-4 right-16 z-20 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-white text-shadow">@{short.title.replace(/\s/g, '').toLowerCase()}</h3>
            <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Oficial</span>
          </div>
          <p className="text-white text-sm font-bold text-shadow line-clamp-2">
            {short.episode} - {short.description}
          </p>
          <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
            <Music2 className="w-3 h-3" />
            <span className="truncate">Áudio Original - MiniDrama TV</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
          <motion.div 
            className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"
            animate={{ width: isActive ? "100%" : "0%" }}
            transition={{ duration: 15, ease: "linear", repeat: isActive ? Infinity : 0 }}
          />
        </div>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 h-[70%] bg-neutral-900 rounded-t-3xl z-[101] flex flex-col overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">{commentsCount} Comentários</span>
                </div>
                <button 
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {comments.length > 0 ? (
                  comments.map((c, i) => (
                    <div key={c.id || i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-white uppercase">{c.user_name?.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-black text-white">@{c.user_name?.toLowerCase().replace(/\s/g, '')}</span>
                          <span className="text-[10px] text-neutral-500">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed">
                          {c.comment}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                     <MessageCircle className="w-12 h-12 text-neutral-700 mb-4" />
                     <p className="text-neutral-500 font-bold">Nenhum comentário ainda.</p>
                     <p className="text-neutral-600 text-sm mt-1">Seja o primeiro a comentar!</p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 bg-neutral-950 border-t border-neutral-800 pb-8">
                {user ? (
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <input 
                        type="text" 
                        value={commentText}
                        onChange={e => setCommentText(e.target.value.substring(0, 500))}
                        placeholder="Adicione um comentário..."
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-full px-5 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
                      />
                      <div className="flex justify-end px-2">
                        <span className={`text-[10px] ${commentText.length >= 450 ? "text-red-500" : "text-neutral-500"}`}>
                          {commentText.length}/500
                        </span>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={!commentText.trim()}
                      className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black disabled:opacity-50 active:scale-90 transition-transform"
                    >
                      <Send className="w-5 h-5 fill-black" />
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-neutral-500 text-sm italic">Faça login para comentar.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
