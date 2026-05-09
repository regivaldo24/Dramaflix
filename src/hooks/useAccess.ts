import { useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

export function useAccess() {
  const { user, isOwner } = useAuth();

  const podeAssistir = useCallback(() => {
    // SEM LIMITE PARA ADMIN/DONO
    if (isOwner) {
      return true;
    }

    if (user) {
      const u = user as any;
      // VIP Gold has unlimited access
      if (u.tipo === 'ouro' || u.tipo === 'vibrante') {
        return true;
      }
      
      // Check coins
      const coins = u.moedas || 0;
      if (coins > 0) {
        return true;
      }

      // Daily limit logic simulation (optional: could be server-side)
      // If user watched more than 10 episodes and has no coins
      let watchedToday = 0;
      try {
        const val = localStorage.getItem(`watched_today_${user.id}`);
        watchedToday = parseInt(val || '0', 10);
      } catch (e) {}

      if (watchedToday >= 10 && coins <= 0) {
        return false;
      }
      
      // If user has some episodes left today even with 0 coins (free tier)
      if (watchedToday < 10) {
        return true;
      }
    }

    return false;
  }, [user, isOwner]);

  return { podeAssistir, isOwner };
}
