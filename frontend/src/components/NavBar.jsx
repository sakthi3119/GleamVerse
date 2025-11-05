import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function NavBar(){
  const auth = useAuth();
  const [hidden, setHidden] = useState(false);
  useEffect(()=>{
    let timer = null; let lastY = window.scrollY;
    const onScroll = ()=>{ const y=window.scrollY; setHidden(y>lastY && y>20); lastY=y; resetTimer(); };
    const resetTimer = ()=>{ setHidden(false); if (timer) clearTimeout(timer); timer = setTimeout(()=>setHidden(true), 3500); };
    window.addEventListener('scroll', onScroll); window.addEventListener('mousemove', resetTimer); window.addEventListener('touchstart', resetTimer); resetTimer();
    return ()=>{ window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', resetTimer); window.removeEventListener('touchstart', resetTimer); clearTimeout(timer); };
  }, []);
  return (
    <div className={`nav ${hidden?'nav-hidden':''}`}>
      <div className="nav-inner nav-flex">
        <Link className="brand" to="/">
          <img className="brand-logo-img" src="http://localhost:8000/static/jewellery/logo.png" alt="logo" />
          <div className="brand-name">GleamVerse</div>
        </Link>
        <div className="nav-actions">
          {auth.token ? (
            <>
              <Link className="btn" to="/collections">Collections</Link>
              <Link className="btn" to="/cart">Cart</Link>
              <Link className="btn" to="/profile">My Account</Link>
              <a className="link-nav" onClick={auth.logout} href="#" style={{textDecoration:'none'}}>Sign out</a>
            </>
          ) : (
            <>
              <Link className="link-nav" to="/register">Signup</Link>
              <Link className="link-nav" to="/login">Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

