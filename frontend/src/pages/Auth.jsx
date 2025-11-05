import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export function SignIn(){
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(()=>{ if (auth.token) navigate('/', { replace:true }); }, [auth.token]);
  const CLERK_BASE = 'https://top-ray-29.clerk.accounts.dev';
  return (
    <div className="gv-container">
      <div className="auth">
        <h2>Welcome back</h2>
        <p className="muted">Use Clerk to sign in</p>
        <div style={{display:'flex', gap:12, marginBottom:12}}>
          <button className="btn" onClick={()=>{ if (window.Clerk && Clerk.openSignIn) { Clerk.openSignIn({ afterSignInUrl: '/' }); } else { window.location.href = `${CLERK_BASE}/sign-in?redirect_url=${encodeURIComponent('http://localhost:5500/')}`; } }}>Sign in with Clerk</button>
        </div>
      </div>
    </div>
  );
}

export function SignUp(){
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(()=>{ if (auth.token) navigate('/', { replace:true }); }, [auth.token]);
  const CLERK_BASE = 'https://top-ray-29.clerk.accounts.dev';
  return (
    <div className="gv-container">
      <div className="auth">
        <h2>Create account</h2>
        <p className="muted">Use Clerk to sign up</p>
        <div style={{display:'flex', gap:12, marginBottom:12}}>
          <button className="btn" onClick={()=>{ if (window.Clerk && Clerk.openSignUp) { Clerk.openSignUp({ afterSignUpUrl: '/' }); } else { window.location.href = `${CLERK_BASE}/sign-up?redirect_url=${encodeURIComponent('http://localhost:5500/')}`; } }}>Continue with Clerk</button>
        </div>
      </div>
    </div>
  );
}

