import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { asApiUrl } from '../api.js';

export default function Cart(){
  const cart = useCart();
  const total = cart.items.reduce((s, it) => s + (it.price||0), 0);
  const [show, setShow] = useState(false);
  return (
    <div className="gv-container">
      <h2>Your cart</h2>
      <div className="grid">
        {cart.items.map((it, idx) => (
          <div className="col-4" key={idx}>
            <div className="card">
              <img className="product-img" src={asApiUrl(it.image_url)} alt={it.name} />
              <div className="card-body">
                <div className="product-name">{it.name}</div>
                <div className="price">{it.currency === 'INR' ? '₹' : it.currency} {it.price?.toFixed?.(2)}</div>
                <button className="btn btn-outline" onClick={()=>cart.remove(idx)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12, display:'flex', gap:12, alignItems:'center'}}>
        <div className="price">Total: ₹ {total.toFixed(2)}</div>
        <button className="btn btn-gold" onClick={()=>{ setShow(true); cart.clear(); }}>Proceed to payment</button>
      </div>
      {show && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{marginTop:0}}>Order placed successfully!</h2>
            <p>Thank you for shopping with GleamVerse.</p>
            <button className="btn" onClick={()=>setShow(false)}>Close</button>
            <div className="confetti">
              {new Array(80).fill(0).map((_,i)=>(<span key={i} className="confetti-bit" style={{'--i': i}}></span>))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

