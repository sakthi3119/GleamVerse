import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getClerkToken } from '../api.js';

const AuthContext = createContext(null);
export function useAuth(){ return useContext(AuthContext); }

export function AuthProvider({ children }){
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [loaded, setLoaded] = useState(false);

  const syncFromClerk = async () => {
    const tk = await getClerkToken();
    setToken(tk || '');
    try { const user = Clerk.user; setUsername(user?.username || user?.primaryEmailAddress?.emailAddress || user?.id || ''); } catch { setUsername(''); }
    setLoaded(true);
  };

  const login = () => { if (window.Clerk && Clerk.openSignIn) { Clerk.openSignIn({ afterSignInUrl: '/' }); } };
  const logout = async () => { try { await Clerk.signOut(); } catch {} setToken(''); setUsername(''); };

  useEffect(()=>{ syncFromClerk(); }, []);

  const value = useMemo(()=>({ token, username, login, logout, syncFromClerk, loaded }), [token, username, loaded]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

