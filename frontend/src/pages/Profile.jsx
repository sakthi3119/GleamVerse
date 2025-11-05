import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api.js';
import { getClerkToken } from '../api.js';

export default function Profile(){
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(()=>{ (async()=>{ const tk = await getClerkToken(); const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${tk}` } }); const data = await res.json(); setProfile(data); })(); }, []);
  if (!profile) return <div className="gv-container">Loading...</div>;
  const set = (k,v)=> setProfile(p=>({ ...p, [k]: v }));
  const save = async ()=>{ setMsg(''); const tk = await getClerkToken(); const res = await fetch(`${API_BASE}/auth/profile`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${tk}` }, body: JSON.stringify(profile) }); if (res.ok) setMsg('Saved'); else setMsg('Failed'); };
  return (
    <div className="gv-container">
      <div className="auth">
        <h2>Your profile</h2>
        <div className="row"><label>Full name</label><input className="input" value={profile.full_name||''} onChange={e=>set('full_name', e.target.value)} /></div>
        <div className="row"><label>Country</label><input className="input" value={profile.country||''} onChange={e=>set('country', e.target.value)} /></div>
        <div className="row"><label>Address line 1</label><input className="input" value={profile.address_line1||''} onChange={e=>set('address_line1', e.target.value)} /></div>
        <div className="row"><label>Address line 2</label><input className="input" value={profile.address_line2||''} onChange={e=>set('address_line2', e.target.value)} /></div>
        <div className="row"><label>City</label><input className="input" value={profile.city||''} onChange={e=>set('city', e.target.value)} /></div>
        <div className="row"><label>State</label><input className="input" value={profile.state||''} onChange={e=>set('state', e.target.value)} /></div>
        <div className="row"><label>Postal code</label><input className="input" value={profile.postal_code||''} onChange={e=>set('postal_code', e.target.value)} /></div>
        {msg && <div style={{color:'var(--success)'}}>{msg}</div>}
        <button className="btn" onClick={save}>Save</button>
      </div>
    </div>
  );
}

