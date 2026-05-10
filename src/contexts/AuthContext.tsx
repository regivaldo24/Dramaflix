import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  logout: () => void;
}

export const OWNER_EMAIL = 'irformaticajr@gmail.com';

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true, isOwner: false, isAdmin: false, logout: () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = (currentUser: User | null) => {
    if (!currentUser) return false;
    if (currentUser.email === OWNER_EMAIL) return true;
    
    // Check simulated database
    const usersStr = localStorage.getItem('users') || '[]';
    try {
      const users = JSON.parse(usersStr);
      if (!Array.isArray(users)) return false;
      const u = users.find((u: any) => u.email === currentUser.email);
      return u?.role === 'admin' || u?.is_admin === 1;
    } catch (e) {
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('logged_user');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsOwner(false);
    setIsAdmin(false);
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // 1. Initial Quick Check (Local Storage or Immediate Session)
        const { data: { session: immediateSession } } = await supabase.auth.getSession();
        let currentUser = immediateSession?.user ?? null;
        
        const localUserStr = localStorage.getItem('logged_user');
        if (!currentUser && localUserStr) {
          try {
            const localUser = JSON.parse(localUserStr);
            if (localUser && localUser.id) {
              currentUser = {
                id: localUser.id,
                email: localUser.email,
                user_metadata: { full_name: localUser.username },
                created_at: new Date().toISOString(),
                ...localUser
              } as any;
            }
          } catch (e) {}
        }

        // Set state quickly if we have something
        if (currentUser) {
          setUser(currentUser);
          setIsOwner(currentUser.email === OWNER_EMAIL);
          setIsAdmin(checkAdminStatus(currentUser));
          setLoading(false); // Quick release
        }

        // 2. Background Sync
        if (currentUser) {
          fetch('/api/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: { id: currentUser.id, email: currentUser.email } })
          }).then(res => res.json()).then(serverUser => {
            if (serverUser?.banido) {
               logout();
               alert("Sua conta foi banida.");
               return;
            }
            const updatedUser = { ...currentUser, ...serverUser };
            setUser(updatedUser);
            setIsAdmin(checkAdminStatus(updatedUser) || serverUser?.is_admin === 1);
            localStorage.setItem('logged_user', JSON.stringify(updatedUser));
          }).catch(e => console.error("Sync error", e));
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching Supabase session:", error);
        setLoading(false);
      }
    };

    fetchSession();

    let subscription: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsOwner(currentUser?.email === OWNER_EMAIL);
        setIsAdmin(checkAdminStatus(currentUser));
        setLoading(false);

        // Sync to localStorage.users for simulation counting on admin dashboard
        if (currentUser) {
          const usersStr = localStorage.getItem('users') || '[]';
          try {
            let users = JSON.parse(usersStr);
            if (!Array.isArray(users)) users = [];
            const exists = users.some((u: any) => u.id === currentUser.id || u.email === currentUser.email);
            if (!exists) {
              const newUser = {
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || "Usuário",
                createdAt: currentUser?.created_at || new Date().toISOString()
              };
              try {
                localStorage.setItem('users', JSON.stringify([...users, newUser]));
              } catch (e) {}
            }
          } catch (e) {}
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.error("Error setting up auth state change listener:", error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isOwner, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
