import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE, asApiUrl } from '../api.js';
import { useCart } from '../contexts/CartContext.jsx';

export default function ProductDetail(){
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [sel, setSel] = useState({});
  const cart = useCart();
  const navigate = useNavigate();

  useEffect(()=>{ (async()=>{ const res = await fetch(`${API_BASE}/products/${id}`); const data = await res.json(); setP(data); })(); }, [id]);
  if (!p) return <div className="gv-container">Loading...</div>;
  const options = p.options || {};
  const setChoice = (k,v)=> setSel(s=>({ ...s, [k]: v }));

  return (
    <div className="gv-container">
      <div className="detail-layout">
        <img
          className="detail-img"
          src={asApiUrl(p.image_url)}
          alt={p.name}
          onError={(e)=>{
            const img = e.currentTarget;
            if (!img.dataset.swap) {
              img.dataset.swap = '1';
              const s = img.src;
              if (/\.jpg(\?|$)/i.test(s)) img.src = s.replace(/\.jpg(\?|$)/i, '.png$1');
              else if (/\.png(\?|$)/i.test(s)) img.src = s.replace(/\.png(\?|$)/i, '.jpg$1');
              else img.src = asApiUrl('/static/jewellery/logo.png');
            } else {
              img.src = asApiUrl('/static/jewellery/logo.png');
            }
          }}
        />
        <div>
          <h2>{p.name}</h2>
          <div className="product-by">by {p.jeweler_name}</div>
          <div className="price" style={{fontSize:22, marginTop:8}}>{p.currency === 'INR' ? '₹' : p.currency} {p.price.toFixed(2)}</div>
          <div style={{height:12}}></div>
          {Object.keys(options).map(key => (
            <div key={key} style={{marginBottom:12}}>
              <div style={{marginBottom:6, color:'var(--muted)'}}>{key.toUpperCase()}</div>
              <div className="option-row">
                {options[key].map(v => (
                  <div key={v} className={`chip ${sel[key]===v?'active':''}`} onClick={()=>setChoice(key,v)}>{v}</div>
                ))}
              </div>
            </div>
          ))}
          <div style={{display:'flex', gap:12}}>
            <Link className="btn btn-outline" to={`/try-on?image=${encodeURIComponent(asApiUrl(p.model_overlay_url||''))}&category=${encodeURIComponent(p.category||'')}`}>Try on</Link>
            <button className="btn" onClick={()=>{ cart.add(p); navigate('/cart'); }}>Add to cart</button>
            <button className="btn btn-gold" onClick={()=>{ cart.add(p); navigate('/cart'); }}>Buy now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

