import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Home from './pages/Home.jsx';
import Landing from './pages/Landing.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import TryOn from './pages/TryOn.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Cart from './pages/Cart.jsx';
import { SignIn, SignUp } from './pages/Auth.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';

function Gate({ children }){
  const auth = useAuth();
  if (!auth.token) return <Navigate to="/login" replace />;
  return children;
}

function AutoRedirectAuth(){
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(()=>{
    if (auth.token && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/', { replace: true });
    }
  }, [auth.token, location.pathname]);
  return null;
}

export default function App(){
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AutoRedirectAuth />
          <NavBar />
          <Routes>
            <Route path="/" element={<Gate><Landing /></Gate>} />
            <Route path="/collections" element={<Gate><Home /></Gate>} />
            <Route path="/product/:id" element={<Gate><ProductDetail /></Gate>} />
            <Route path="/try-on" element={<Gate><TryOn /></Gate>} />
            <Route path="/profile" element={<Gate><Profile /></Gate>} />
            <Route path="/settings" element={<Gate><Settings /></Gate>} />
            <Route path="/cart" element={<Gate><Cart /></Gate>} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

