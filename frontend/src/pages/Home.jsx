import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, asApiUrl } from '../api.js';

export default function Home(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');

  useEffect(()=>{ load(); }, []);

  async function load(params){
    const usp = new URLSearchParams();
    const current = params || { q, category, country };
    if (current.q) usp.set('q', current.q);
    if (current.category) usp.set('category', current.category);
    if (current.country) usp.set('country', current.country);
    const res = await fetch(`${API_BASE}/products/?${usp.toString()}`);
    const data = await res.json();
    setItems(data);
  }

  return (
    <div>
      <div className="hero">
        <h1>GleamVerse</h1>
        <p>Jewellery for the modern women</p>
      </div>
      <div className="gv-container">
        <div className="toolbar">
          <div className="filters">
            <input className="input" placeholder="Search jewelry" value={q} onChange={e=>setQ(e.target.value)} />
            <select className="select" value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">All categories</option>
              <option>Necklace</option>
              <option>Ring</option>
              <option>Bracelet</option>
              <option>Nose Pin</option>
            </select>
            <input className="input" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} />
            <button className="btn btn-outline" onClick={()=>load({ q, category, country })}>Apply</button>
          </div>
          {/* Try-On button removed on collections page as requested */}
        </div>
        <div className="grid">
          {items.map(p => (
            <div key={p.id} className="col-3">
              <div className="card">
                <img
                  className="product-img"
                  src={asApiUrl(p.thumbnail_url || p.image_url)}
                  alt={p.name}
                  loading="lazy"
                  onError={(e)=>{
                    const img = e.currentTarget;
                    if (!img.dataset.swap) {
                      img.dataset.swap = '1';
                      const s = img.src;
                      // toggle between jpg and png if one is missing
                      if (/\.jpg(\?|$)/i.test(s)) img.src = s.replace(/\.jpg(\?|$)/i, '.png$1');
                      else if (/\.png(\?|$)/i.test(s)) img.src = s.replace(/\.png(\?|$)/i, '.jpg$1');
                      else img.src = asApiUrl('/static/jewellery/logo.png');
                    } else {
                      img.src = asApiUrl('/static/jewellery/logo.png');
                    }
                  }}
                />
                <div className="card-body">
                  <div className="product-name">{p.name}</div>
                  <div className="product-by">{p.jeweler_name}</div>
                  <div className="price">{p.currency === 'INR' ? '₹' : p.currency} {p.price.toFixed(2)}</div>
                  <Link className="btn" to={`/product/${p.id}`}>View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="footer">© {new Date().getFullYear()} Jewel & Co.</div>
    </div>
  );
}

