import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { 
  ChevronLeft, Play, Pause, SkipForward, 
  RotateCcw, RotateCw, Maximize, Volume2, 
  VolumeX, Settings, Share2, Facebook, Twitter, MessageCircle, Copy, Check, ThumbsUp, Monitor,
  Layers, Zap, Subtitles, Languages, Repeat, Moon, ChevronRight, CheckCircle2
} from "lucide-react";
import { useAccess } from "../hooks/useAccess";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { mockDramas } from "../data/mockData";
import Comments from "../components/Comments";

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const { podeAssistir, isOwner } = useAccess();
  const { user } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const preloadingStartedRef = useRef(false);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'main' | 'quality' | 'quality-adv' | 'speed' | 'subtitles' | 'audio' | 'more' | 'sleep'>('main');
  const [isLooping, setIsLooping] = useState(false);
  const [isStableVolume, setIsStableVolume] = useState(true);
  const [selectedSub, setSelectedSub] = useState('Desativado');
  const [selectedAudio, setSelectedAudio] = useState('Português (Brasil)');
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const skipIntroTime = 90; // Standard intro length
  const sleepTimerRef = useRef<any>(null);
  const [sleepTimeLimit, setSleepTimeLimit] = useState<number | null>(null); // in minutes
  const lastSavedTimeRef = useRef<number>(0);
  const initializingRef = useRef(false);
  
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentDrama = mockDramas.find(d => d.id.toString() === id);
  const currentIndex = mockDramas.findIndex(d => d.id.toString() === id);
  const nextDrama = currentIndex !== -1 && currentIndex < mockDramas.length - 1 
    ? mockDramas[currentIndex + 1] 
    : null;

  const shareUrl = window.location.href;
  const getShareUrlWithTime = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?t=${Math.floor(currentTime)}`;
  };
  
  const shareText = `Estou assistindo ${currentDrama?.title} - Episódio ${id} no nosso portal de dramas!`;

  const shareActions = {
    facebook: (withTime = false) => {
      const url = withTime ? getShareUrlWithTime() : shareUrl;
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    },
    twitter: (withTime = false) => {
      const url = withTime ? getShareUrlWithTime() : shareUrl;
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
    },
    whatsapp: (withTime = false) => {
      const url = withTime ? getShareUrlWithTime() : shareUrl;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + url)}`, '_blank');
    },
    copy: async (withTime = false) => {
      const url = withTime ? getShareUrlWithTime() : shareUrl;
      if (!navigator.clipboard) {
        // Fallback or just log
        console.warn("Clipboard API not available");
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    if (id && user) {
      preloadingStartedRef.current = false;
      setIsPreloading(false);
      setShowNextPrompt(false);
      let savedLikes = null;
      let likedState = null;
      try {
        savedLikes = localStorage.getItem(`likes_v2_${id}`);
        likedState = localStorage.getItem(`has_liked_v2_${user.id}_${id}`);
      } catch (e) {
        console.error("Error reading likes from localStorage", e);
      }
      
      // Initialize with randomish number if first time
      if (!savedLikes) {
        const initialLikes = Math.floor(Math.random() * 500) + 120;
        setLikes(initialLikes);
        try {
          localStorage.setItem(`likes_v2_${id}`, initialLikes.toString());
        } catch (e) {}
      } else {
        setLikes(parseInt(savedLikes) || 0);
      }
      
      setHasLiked(likedState === "true");
    }
  }, [id, user]);

  const handleLike = () => {
    if (!user) return;
    const newLikedState = !hasLiked;
    const newLikes = newLikedState ? likes + 1 : likes - 1;
    
    setHasLiked(newLikedState);
    setLikes(newLikes);
    
    try {
      localStorage.setItem(`likes_v2_${id}`, newLikes.toString());
      localStorage.setItem(`has_liked_v2_${user.id}_${id}`, newLikedState.toString());
    } catch (e) {
      console.error("Error saving likes to localStorage", e);
    }
  };

  const handleQuality = (val: string) => {
    if (val === quality) {
      setShowSettingsMenu(false);
      return;
    }
    setQuality(val);
    if (playerRef.current) {
      // In a real scenario with quality levels plugin:
      // const levels = playerRef.current.qualityLevels();
      // for(let i=0; i<levels.length; i++) levels[i].enabled = (levels[i].height == parseInt(val) || val === 'auto');
      console.log(`Qualidade alterada para: ${val}`);
    }
    setActiveMenu('main');
  };

  const handleSubtitlesChange = (sub: string) => {
    setSelectedSub(sub);
    if (playerRef.current && !playerRef.current.isDisposed()) {
      const tracks = playerRef.current.textTracks();
      for (let i = 0; i < tracks.length; i++) {
        // Find track by label or language
        if (tracks[i].label === sub) {
          tracks[i].mode = 'showing';
        } else {
          tracks[i].mode = 'disabled';
        }
      }
    }
    setActiveMenu('main');
  };

  const setSleepTimer = (minutes: number | null) => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    setSleepTimeLimit(minutes);
    
    if (minutes !== null) {
      const timerId = setTimeout(() => {
        if (playerRef.current && typeof playerRef.current.pause === 'function') {
          try {
            if (!playerRef.current.isDisposed()) {
              playerRef.current.pause();
            }
          } catch (e) {
            console.error("Failed to pause via sleep timer:", e);
          }
        }
        setSleepTimeLimit(null);
      }, minutes * 60000);
      sleepTimerRef.current = timerId;
    }
  };

  const toggleLoop = () => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      const newState = !isLooping;
      playerRef.current.loop(newState);
      setIsLooping(newState);
    }
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerRef.current && !playerRef.current.paused()) {
        setShowControls(false);
      }
    }, 2500);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
        setActiveMenu('main');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleClickOutside);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    if (isPreloading && nextVideoRef.current) {
      const video = nextVideoRef.current;
      
      const handleProgress = () => {
        if (video.buffered.length > 0 && video.duration > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const percent = (bufferedEnd / video.duration) * 100;
          setPreloadProgress(percent);
        }
      };

      video.addEventListener('progress', handleProgress);
      video.load();
      
      return () => {
        video.removeEventListener('progress', handleProgress);
      };
    }
  }, [isPreloading]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!podeAssistir()) {
      setError("Precisa de plano Ouro ou moedas para acessar este conteúdo.");
      return;
    }

    let player: any = null;

  const saveProgress = async (cur: number, dur: number) => {
    if (!user || !id) return;
    try {
      await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          drama_id: id,
          last_time: cur,
          duration: dur,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,drama_id' });
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  const initPlayer = async () => {
    if (videoRef.current && !playerRef.current) {
      // Safe check for existing player instance
      try {
        const videoElement = document.createElement("video");
        videoElement.className = "video-js vjs-big-play-centered";
        videoElement.setAttribute("playsinline", "true");
        videoElement.setAttribute("crossorigin", "anonymous");
        videoElement.setAttribute("preload", "auto");
        
        if (currentDrama?.image) {
          videoElement.setAttribute("poster", currentDrama.image);
        }
        videoRef.current.appendChild(videoElement);

        // Disable logging and debug
        videojs.log.level('off');

        // Source selection
        const hlsSource = currentDrama?.trailer || "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
        const isHls = hlsSource.includes('.m3u8');
        const sourceType = isHls ? 'application/x-mpegURL' : 'video/mp4';

        player = videojs(videoElement, {
          autoplay: true,
          controls: false,
          responsive: true,
          fluid: true,
          preload: 'auto',
          playbackRates: [0.5, 1, 1.5, 2],
          sources: [{ 
            src: hlsSource, 
            type: sourceType 
          }],
          html5: {
            vhs: {
              overrideNative: !videojs.browser.IS_SAFARI,
              debug: false
            }
          }
        }, async () => {
          playerRef.current = player;
          
          // Sync initial state
          player.volume(volume);
          player.muted(isMuted);

          // Sync time from storage or Supabase or URL
          let savedTimeFromSupabase = 0;
          try {
            const { data } = await supabase
              .from('watch_history')
              .select('last_time')
              .eq('user_id', user?.id)
              .eq('drama_id', id)
              .single();
            if (data) savedTimeFromSupabase = data.last_time;
          } catch (e) {}

          let savedTimeStr = null;
          try {
            savedTimeStr = localStorage.getItem(`historico_tempo_${user?.id}_${id}`);
          } catch (e) {}
          
          const urlParams = new URLSearchParams(window.location.search);
          const timeParamStr = urlParams.get('t');

          if (timeParamStr) {
            const t = parseFloat(timeParamStr);
            if (!isNaN(t)) player.currentTime(t);
          } else if (savedTimeFromSupabase > 0) {
            player.currentTime(savedTimeFromSupabase);
          } else if (savedTimeStr) {
            const t = parseFloat(savedTimeStr);
            if (!isNaN(t)) player.currentTime(t);
          }
          
          // Error handling with automatic fallback
          player.on('error', () => {
            const err = player.error();
            console.error("VideoJS Error Detail:", err);
            
            if (err.code === 4 && player.src() === currentDrama?.trailer) {
              console.log("Primary source failed, attempting fallback...");
              const fallbackSource = "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
              player.src({
                src: fallbackSource,
                type: 'application/x-mpegURL'
              });
              player.play().catch(() => {});
            } else {
              setError(`Erro ao carregar mídia (${err.code}): ${err.message}`);
            }
          });

          player.on('timeupdate', () => {
            if (!player || player.isDisposed()) return;
            const cur = player.currentTime();
            const dur = player.duration();
            setCurrentTime(cur);
            setDuration(dur);
            
            // Skip Intro logic: show between 10s and 90s
            if (cur >= 10 && cur < skipIntroTime) {
              setShowSkipIntro(true);
            } else {
              setShowSkipIntro(false);
            }
            
            if (dur > 0) {
              const progress = cur / dur;
              if (progress > 0.8 && nextDrama && !preloadingStartedRef.current) {
                preloadingStartedRef.current = true;
                setIsPreloading(true);
              }
              if (progress > 0.95 && nextDrama) {
                setShowNextPrompt(true);
              }
            }

            // Save to localStorage every 5 seconds
            if (Math.floor(cur) % 5 === 0 && user) {
               try {
                 localStorage.setItem(`historico_tempo_${user.id}_${id}`, cur.toString());
               } catch (e) {}
            }

            // Save to Supabase every 15 seconds to avoid excessive calls
            if (Math.floor(cur) % 15 === 0 && user && Math.abs(cur - lastSavedTimeRef.current) > 10) {
               lastSavedTimeRef.current = cur;
               saveProgress(cur, dur);
            }
          });

            player.on('play', () => setIsPlaying(true));
            player.on('pause', () => setIsPlaying(false));
            
            // Add subtitles tracks
            player.addRemoteTextTrack({
              kind: 'subtitles',
              label: 'Português',
              srclang: 'pt',
              src: 'https://brenopoliss.github.io/vtt-test/portugues.vtt',
              default: false
            }, false);

            player.addRemoteTextTrack({
              kind: 'subtitles',
              label: 'Inglês',
              srclang: 'en',
              src: 'https://brenopoliss.github.io/vtt-test/english.vtt',
              default: false
            }, false);

            player.addRemoteTextTrack({
              kind: 'subtitles',
              label: 'Espanhol',
              srclang: 'es',
              src: 'https://brenopoliss.github.io/vtt-test/espanol.vtt',
              default: false
            }, false);

            player.on('ended', () => {
               if (nextDrama) navigate(`/play/${nextDrama.id}`);
            });
          });
        } catch (e) {
          console.error("Failed to initialize VideoJS:", e);
          setError("Falha crítica ao carregar o player de vídeo.");
        }
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [user, id]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    // Safety check for player readiness
    const player = playerRef.current;
    if (!player || player.isDisposed()) {
      console.warn("Player not ready or disposed");
      return;
    }

    try {
      if (player.paused()) {
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch((error: any) => {
            // Auto-play or interaction issues
            if (error && (error.name !== 'AbortError' && error.name !== 'NotAllowedError')) {
              console.error("Playback failed:", error);
            }
            // Fallback to update UI if play was blocked
            setIsPlaying(false);
          });
        }
      } else {
        player.pause();
        setIsPlaying(false); // Immediate UI update for better responsiveness
      }
    } catch (err) {
      console.error("Critical toggle play error:", err);
    }
    
    setShowControls(true);
  };

  const skip = (seconds: number) => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      try {
        const newTime = playerRef.current.currentTime() + seconds;
        playerRef.current.currentTime(newTime);
      } catch (e) {
        console.error("Skip error:", e);
      }
    }
  };

  const handleSpeed = (rate: number) => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      try {
        playerRef.current.playbackRate(rate);
        setPlaybackRate(rate);
      } catch (e) {
        console.error("Handle speed error:", e);
      }
    }
  };

  const handleVolume = (val: number) => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      try {
        playerRef.current.volume(val);
        setVolume(val);
        setIsMuted(val === 0);
      } catch (e) {
        console.error("Handle volume error:", e);
      }
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      try {
        if (playerRef.current.isFullscreen()) {
          playerRef.current.exitFullscreen();
        } else {
          playerRef.current.requestFullscreen();
        }
      } catch (e) {
        console.error("Toggle fullscreen error:", e);
      }
    }
  };

  const handleNext = () => {
    if (nextDrama) navigate(`/play/${nextDrama.id}`);
  };

  const handleSeek = (e: React.MouseEvent | MouseEvent) => {
    if (!progressBarRef.current || !playerRef.current || playerRef.current.isDisposed()) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = Math.max(0, Math.min(pos * duration, duration));
    playerRef.current.currentTime(seekTime);
    setCurrentTime(seekTime);
  };

  const skipIntro = () => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.currentTime(skipIntroTime);
      setShowSkipIntro(false);
    }
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(pos * duration, duration));
    setHoverTime(time);
    setHoverX(e.clientX - rect.left);
    
    if (isDragging) {
      handleSeek(e);
    }
  };

  const handleProgressBarMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(e);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleSeek(e);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={pageRef}
      className="flex flex-col h-full bg-[#0a0a0a] overflow-y-auto no-scrollbar relative w-full min-h-screen select-none"
    >
      <div className={`fixed top-4 left-4 z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={() => navigate(-1)}
          className="bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 text-white hover:bg-white/20 transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto w-full lg:flex lg:gap-6 p-0 md:p-6 lg:pt-20">
        {/* Main Content: Player + Info */}
        <div className="flex-1">
          {error ? (
            <div className="text-center p-8 bg-neutral-900 rounded-2xl border border-neutral-800 animate-in fade-in zoom-in duration-300">
              <h2 className="text-white text-xl font-black mb-4">Conteúdo Bloqueado</h2>
              <p className="text-neutral-400 mb-6">{error}</p>
              <button 
                onClick={() => navigate('/store')}
                className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:brightness-110"
              >
                Ver Planos & Moedas
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="w-full bg-black rounded-none md:rounded-xl overflow-hidden relative flex flex-col group shadow-2xl border border-neutral-800/50">
                <div className="relative w-full aspect-video group/player">
                  {/* Dedicated container for Video.js that React won't touch children of */}
                  <div ref={videoRef} className="absolute inset-0" />

                  {/* Move mouse overlay to handle control visibility and clicking to pause */}
                  <div 
                    className="absolute inset-0 z-30 cursor-pointer" 
                    onMouseMove={handleMouseMove}
                    onClick={togglePlay}
                  />

                  {/* Large Center Play Button */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-in fade-in zoom-in duration-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        className="w-20 h-20 bg-yellow-500/90 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/40 backdrop-blur-sm group-hover/player:scale-110 transition-transform pointer-events-auto active:scale-95"
                      >
                        <Play className="w-10 h-10 text-black fill-current ml-1" />
                      </button>
                    </div>
                  )}


                  {/* Intelligent Next Prompt */}
                  {showNextPrompt && nextDrama && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-black flex items-center gap-2 shadow-2xl shadow-yellow-500/40 active:scale-95 transition-all text-sm md:text-base"
                      >
                        Próximo: {nextDrama.title}
                        <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                      </button>
                    </div>
                  )}

                  {/* Skip Intro Button */}
                  {showSkipIntro && (
                    <div className="absolute bottom-20 right-6 z-40 animate-in fade-in slide-in-from-right-4 duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); skipIntro(); }}
                        className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2 group"
                      >
                        <SkipForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        Pular Intro
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom Controls UI */}
                <div 
                  id="controls"
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute inset-x-0 bottom-0 bg-[#111] p-4 transition-opacity duration-300 z-50 border-t border-white/5 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                >
                  {/* Progress Bar Container */}
                  <div className="px-2 mb-4 relative">
                    <div 
                      ref={progressBarRef}
                      onMouseMove={handleProgressBarMouseMove}
                      onMouseLeave={() => setHoverTime(null)}
                      onMouseDown={handleProgressBarMouseDown}
                      className="relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer group/progress transition-all hover:h-2"
                    >
                      {/* Hover Preview Tooltip */}
                      {hoverTime !== null && (
                        <div 
                          className="absolute bottom-full mb-4 -translate-x-1/2 flex flex-col items-center animate-in fade-in zoom-in duration-200 pointer-events-none z-[100]"
                          style={{ left: `${hoverX}px` }}
                        >
                          <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl w-32 h-20 mb-2 relative">
                            {currentDrama?.image && (
                              <img 
                                src={currentDrama.image} 
                                loading="lazy"
                                className="w-full h-full object-cover opacity-60 grayscale-[0.3]" 
                                alt="Preview" 
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          </div>
                          <div className="bg-white text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                            {formatTime(hoverTime)}
                          </div>
                        </div>
                      )}

                      {/* Played Progress */}
                      <div 
                        className="absolute inset-y-0 left-0 bg-yellow-500 rounded-full"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                      >
                        {/* Draggable Circle (Thumb) */}
                        <div 
                          className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-500 rounded-full shadow-xl shadow-yellow-500/40 transition-transform scale-0 group-hover/progress:scale-100 ${isDragging ? 'scale-125' : ''}`} 
                        />
                      </div>

                      {/* Buffered Progress */}
                      <div 
                        className="absolute inset-y-0 left-0 bg-white/10 rounded-full pointer-events-none"
                        style={{ width: '85%' }} // Simulated buffer for professional look
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause Button */}
                      <button 
                        id="playPauseBtn"
                        type="button"
                        onClick={(e) => togglePlay(e)} 
                        className="w-[45px] h-[45px] flex items-center justify-center bg-[#222] text-white rounded-full hover:bg-[#333] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                      </button>

                      <div className="flex items-center gap-4 hidden sm:flex">
                        <button 
                          onClick={() => skip(-10)} 
                          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-yellow-500 transition-colors"
                          title="Voltar 10s"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>

                        <button 
                          onClick={() => skip(10)} 
                          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-yellow-500 transition-colors"
                          title="Avançar 10s"
                        >
                          <RotateCw className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="text-white text-xs md:text-sm font-medium tabular-nums px-2 border-l border-white/10 ml-2">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="flex items-center gap-0 group bg-[#222] rounded-full p-0.5 pr-0 hover:pr-3 transition-all duration-300 shadow-lg border border-white/5">
                        <button 
                          id="muteBtn"
                          onClick={() => handleVolume(isMuted ? (volume > 0 ? volume : 0.8) : 0)} 
                          className="w-[40px] h-[40px] flex items-center justify-center text-white rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer z-10"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <div className="w-0 group-hover:w-[100px] overflow-hidden transition-all duration-300 flex items-center h-full">
                          <input 
                            id="volumeSlider"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              handleVolume(val);
                            }}
                            className="w-[90px] h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-500 focus:outline-none ml-2"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <button 
                          onClick={() => {
                            setShowSettingsMenu(!showSettingsMenu);
                            setActiveMenu('main');
                          }}
                          className={`text-white hover:text-yellow-500 transition p-1 rounded-full ${showSettingsMenu ? 'bg-yellow-500/20 text-yellow-500' : ''}`}
                        >
                          <Settings className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        
                        {showSettingsMenu && (
                          <div 
                            ref={settingsMenuRef}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-full right-0 mb-4 w-64 bg-[#1a1a1a]/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl p-2 z-[70] animate-in fade-in slide-in-from-bottom-4 duration-300"
                          >
                            {/* MAIN MENU */}
                            {activeMenu === 'main' && (
                              <div className="flex flex-col gap-1">
                                <div className="px-3 py-2 border-b border-neutral-800 mb-1 flex items-center justify-between">
                                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Configurações</span>
                                  <Settings className="w-3 h-3 text-neutral-500" />
                                </div>
                                
                                <button onClick={() => setActiveMenu('quality')} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition group text-sm text-neutral-300">
                                  <div className="flex items-center gap-3">
                                    <Monitor className="w-4 h-4 text-neutral-500 group-hover:text-yellow-500 transition" />
                                    <span>Qualidade</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-yellow-500/70 font-bold uppercase">{quality === 'auto' ? 'Auto' : `${quality}p`}</span>
                                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                                  </div>
                                </button>

                                <button onClick={() => setActiveMenu('speed')} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition group text-sm text-neutral-300">
                                  <div className="flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-neutral-500 group-hover:text-yellow-500 transition" />
                                    <span>Velocidade</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-yellow-500/70 font-bold uppercase">{playbackRate}x</span>
                                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                                  </div>
                                </button>

                                <button onClick={() => setActiveMenu('subtitles')} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition group text-sm text-neutral-300">
                                  <div className="flex items-center gap-3">
                                    <Subtitles className="w-4 h-4 text-neutral-500 group-hover:text-yellow-500 transition" />
                                    <span>Legendas</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-neutral-500 uppercase">{selectedSub}</span>
                                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                                  </div>
                                </button>

                                <button onClick={() => setActiveMenu('audio')} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition group text-sm text-neutral-300">
                                  <div className="flex items-center gap-3">
                                    <Languages className="w-4 h-4 text-neutral-500 group-hover:text-yellow-500 transition" />
                                    <span>Áudio</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-neutral-500 uppercase truncate max-w-[80px]">{selectedAudio}</span>
                                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                                  </div>
                                </button>

                                <div className="h-px bg-neutral-800 my-1 mx-2" />

                                <button onClick={() => setActiveMenu('more')} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition group text-sm text-neutral-300">
                                  <div className="flex items-center gap-3">
                                    <Layers className="w-4 h-4 text-neutral-500 group-hover:text-yellow-500 transition" />
                                    <span>Mais</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                                </button>
                              </div>
                            )}

                            {/* QUALITY MENU */}
                            {activeMenu === 'quality' && (
                              <div className="flex flex-col gap-1">
                                <button onClick={() => setActiveMenu('main')} className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white transition mb-1">
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Qualidade</span>
                                </button>
                                {[
                                  { id: 'auto', label: 'Automática (recomendado)' },
                                  { id: 'high', label: 'Qualidade mais alta' },
                                  { id: 'data', label: 'Economia de dados' }
                                ].map((item) => (
                                  <button 
                                    key={item.id}
                                    onClick={() => handleQuality(item.id)}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300"
                                  >
                                    <span>{item.label}</span>
                                    {quality === item.id && <CheckCircle2 className="w-4 h-4 text-yellow-500" />}
                                  </button>
                                ))}
                                <button onClick={() => setActiveMenu('quality-adv')} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300">
                                  <span>Avançado</span>
                                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                                </button>
                              </div>
                            )}

                            {/* QUALITY ADVANCED MENU */}
                            {activeMenu === 'quality-adv' && (
                              <div className="flex flex-col gap-1">
                                <button onClick={() => setActiveMenu('quality')} className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white transition mb-1">
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Avançado</span>
                                </button>
                                {['2160', '1440', '1080', '720', '480', '360', '240', '144'].map((res) => (
                                  <button 
                                    key={res}
                                    onClick={() => handleQuality(res)}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300"
                                  >
                                    <span>{res}p {res === '2160' ? '(4K)' : res === '1440' ? '(2K)' : res === '720' ? '(HD)' : ''}</span>
                                    {quality === res && <CheckCircle2 className="w-4 h-4 text-yellow-500" />}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* SPEED MENU */}
                            {activeMenu === 'speed' && (
                              <div className="flex flex-col gap-1">
                                <button onClick={() => setActiveMenu('main')} className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white transition mb-1">
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Velocidade</span>
                                </button>
                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                  <button 
                                    key={rate}
                                    onClick={() => { 
                                      if (playbackRate === rate) {
                                        setShowSettingsMenu(false);
                                      } else {
                                        handleSpeed(rate); 
                                        setActiveMenu('main'); 
                                      }
                                    }}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300"
                                  >
                                    <span>{rate === 1 ? 'Normal (1x)' : `${rate}x`}</span>
                                    {playbackRate === rate && <CheckCircle2 className="w-4 h-4 text-yellow-500" />}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* SUBTITLES MENU */}
                            {activeMenu === 'subtitles' && (
                              <div className="flex flex-col gap-1">
                                <button onClick={() => setActiveMenu('main')} className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white transition mb-1">
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Legendas</span>
                                </button>
                                {['Desativado', 'Português', 'Inglês', 'Espanhol'].map((sub) => (
                                  <button 
                                    key={sub}
                                    onClick={() => { 
                                      if (selectedSub === sub) {
                                        setShowSettingsMenu(false);
                                      } else {
                                        handleSubtitlesChange(sub); 
                                      }
                                    }}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300"
                                  >
                                    <span>{sub}</span>
                                    {selectedSub === sub && <CheckCircle2 className="w-4 h-4 text-yellow-500" />}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* AUDIO MENU */}
                            {activeMenu === 'audio' && (
                              <div className="flex flex-col gap-1">
                                <button onClick={() => setActiveMenu('main')} className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white transition mb-1">
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Áudio</span>
                                </button>
                                {['Português (Brasil)', 'Inglês', 'Original'].map((audio) => (
                                  <button 
                                    key={audio}
                                    onClick={() => { 
                                      if (selectedAudio === audio) {
                                        setShowSettingsMenu(false);
                                      } else {
                                        setSelectedAudio(audio); 
                                        setActiveMenu('main'); 
                                      }
                                    }}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300"
                                  >
                                    <span>{audio}</span>
                                    {selectedAudio === audio && <CheckCircle2 className="w-4 h-4 text-yellow-500" />}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* MORE MENU */}
                            {activeMenu === 'more' && (
                              <div className="flex flex-col gap-1">
                                <button onClick={() => setActiveMenu('main')} className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white transition mb-1">
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Mais</span>
                                </button>
                                
                                <button 
                                  onClick={toggleLoop}
                                  className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300"
                                >
                                  <div className="flex items-center gap-3">
                                    <Repeat className={`w-4 h-4 ${isLooping ? 'text-yellow-500' : 'text-neutral-500'}`} />
                                    <span>Repetir vídeo</span>
                                  </div>
                                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isLooping ? 'bg-yellow-500' : 'bg-neutral-800'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isLooping ? 'left-4.5' : 'left-0.5'}`} />
                                  </div>
                                </button>

                                <button 
                                  onClick={() => setIsStableVolume(!isStableVolume)}
                                  className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300"
                                >
                                  <div className="flex items-center gap-3">
                                    <Volume2 className={`w-4 h-4 ${isStableVolume ? 'text-yellow-500' : 'text-neutral-500'}`} />
                                    <span>Volume estável</span>
                                  </div>
                                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isStableVolume ? 'bg-yellow-500' : 'bg-neutral-800'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isStableVolume ? 'left-4.5' : 'left-0.5'}`} />
                                  </div>
                                </button>

                                <button onClick={() => setActiveMenu('sleep')} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition group text-sm text-neutral-300">
                                  <div className="flex items-center gap-3">
                                    <Moon className={`w-4 h-4 ${sleepTimeLimit ? 'text-yellow-500' : 'text-neutral-500'} group-hover:text-yellow-500 transition`} />
                                    <span>Timer de suspensão</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {sleepTimeLimit && <span className="text-[10px] text-yellow-500 font-bold">{sleepTimeLimit}m</span>}
                                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                                  </div>
                                </button>
                              </div>
                            )}

                            {/* SLEEP MENU */}
                            {activeMenu === 'sleep' && (
                              <div className="flex flex-col gap-1">
                                <button onClick={() => setActiveMenu('more')} className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white transition mb-1">
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Timer de suspensão</span>
                                </button>
                                {[
                                  { val: null, label: 'Desativado' },
                                  { val: 10, label: '10 minutos' },
                                  { val: 15, label: '15 minutos' },
                                  { val: 20, label: '20 minutos' },
                                  { val: 30, label: '30 minutos' },
                                  { val: 45, label: '45 minutos' },
                                  { val: 60, label: '1 hora' },
                                  { val: -1, label: 'Final do vídeo' }
                                ].map((item) => (
                                  <button 
                                    key={item.label}
                                    onClick={() => { 
                                      if (item.val === -1) {
                                        // Specific logic for end of video if needed
                                        const timeLeft = duration > currentTime ? duration - currentTime : 0;
                                        setSleepTimer(Math.ceil(timeLeft / 60));
                                      } else {
                                        setSleepTimer(item.val); 
                                      }
                                      setActiveMenu('main');
                                      setShowSettingsMenu(false);
                                    }}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition text-sm text-neutral-300"
                                  >
                                    <span>{item.label}</span>
                                    {(sleepTimeLimit === item.val) && <CheckCircle2 className="w-4 h-4 text-yellow-500" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button onClick={toggleFullscreen} className="text-white hover:text-yellow-500 transition">
                        <Maximize className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preloader status bar */}
                {isPreloading && nextDrama && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800 z-50">
                    <div 
                      className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-300 ease-out" 
                      style={{ width: `${preloadProgress}%` }} 
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black uppercase text-yellow-500 border border-yellow-500/20 animate-pulse">
                      Pré-carregando próximo episódio: {Math.round(preloadProgress)}%
                    </div>
                    <video ref={nextVideoRef} src={nextDrama.trailer} className="hidden" preload="auto" muted />
                  </div>
                )}
              </div>

              {/* Video Info Section */}
              <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-neutral-800/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
                  <div>
                    <h1 className="text-white text-xl md:text-2xl font-black mb-2">{currentDrama?.title} - Episódio {id}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="relative group/qbadge">
                        <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-full border border-neutral-700 hover:border-yellow-500/50 cursor-pointer transition">
                          <div className={`w-2 h-2 rounded-full ${quality === 'auto' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'} `} />
                          <span className="text-xs font-bold text-neutral-300 uppercase">
                            {quality === 'auto' ? 'HD Auto' : `${quality}p`}
                          </span>
                        </div>
                      </div>
                      <span className="text-neutral-400 text-sm">{currentDrama?.tag} • {currentDrama?.pill}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 relative">
                    <button 
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition group ${hasLiked ? 'bg-yellow-500 text-black' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-current' : 'group-hover:scale-110 transition'}`} /> 
                      Curtir 
                      <span className={`ml-1 text-xs opacity-80 ${hasLiked ? 'font-black' : 'font-medium'}`}>{likes}</span>
                    </button>
                    
                    <div className="relative" ref={shareMenuRef}>
                      <button 
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ${showShareMenu ? 'bg-yellow-500 text-black' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`}
                      >
                        <Share2 className="w-4 h-4" /> 
                        Compartilhar
                      </button>

                      {showShareMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1a1a] border border-neutral-800 rounded-xl shadow-2xl p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-3 py-2 border-b border-neutral-800 mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Compartilhar em:</span>
                          </div>
                          
                          <button 
                            onClick={() => { shareActions.facebook(); setShowShareMenu(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800 rounded-lg text-sm text-gray-300 transition group"
                          >
                            <Facebook className="w-4 h-4 text-blue-500 group-hover:scale-110 transition" /> Facebook
                          </button>
                          <button 
                            onClick={() => { shareActions.twitter(); setShowShareMenu(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800 rounded-lg text-sm text-gray-300 transition group"
                          >
                            <Twitter className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" /> Twitter
                          </button>
                          <button 
                            onClick={() => { shareActions.whatsapp(); setShowShareMenu(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800 rounded-lg text-sm text-gray-300 transition group"
                          >
                            <MessageCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transition" /> WhatsApp
                          </button>
                          
                          <div className="h-px bg-neutral-800 my-1 mx-2" />
                          
                          <button 
                            onClick={() => shareActions.copy(true)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800 rounded-lg text-sm text-yellow-500/80 transition"
                          >
                            <RotateCw className="w-4 h-4" /> Copiar com Tempo
                          </button>

                          <button 
                            onClick={() => shareActions.copy(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800 rounded-lg text-sm text-gray-300 transition"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                            {copied ? 'Copiado!' : 'Copiar Link'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                    {currentDrama?.description || "Acompanhe este emocionante drama exclusivo. Episódio completo em alta definição com legendas em português."}
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="bg-neutral-800/50 text-neutral-500 text-xs px-3 py-1 rounded-md border border-neutral-800">
                      #{currentDrama?.tag}
                    </span>
                    <span className="bg-neutral-800/50 text-neutral-500 text-xs px-3 py-1 rounded-md border border-neutral-800">
                      #{currentDrama?.pill}
                    </span>
                  </div>
                </div>

                {id && <Comments dramaId={id} />}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Recommendations */}
        <div className="w-full lg:w-[400px] mt-8 lg:mt-0 flex flex-col gap-4 px-4 md:px-0">
          <h2 className="text-white font-black text-lg flex items-center gap-2">
            Próximos Filmes
            {isPreloading && <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">Buffer</span>}
          </h2>

          <div className="flex flex-col gap-3">
            {mockDramas.filter(d => d.id.toString() !== id).slice(0, 10).map((drama) => (
              <button 
                key={drama.id}
                onClick={() => navigate(`/play/${drama.id}`)}
                className="flex gap-3 group text-left hover:bg-neutral-900/50 p-2 rounded-xl transition-all"
              >
                <div className="w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img src={drama.image} loading="lazy" alt={drama.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                    01:45
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight group-hover:text-yellow-500 transition-colors">
                    {drama.title}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium">Episódio 01</p>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-tighter">1.2k visualizações</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

