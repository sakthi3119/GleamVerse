import React, { useEffect, useRef } from 'react';

export default function Landing(){
  const ringRef = useRef(null);
  const cuffRef = useRef(null);
  const planeTopRef = useRef(null);
  const planeBottomRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      const ring = ringRef.current; const cuff = cuffRef.current;
      const p1 = planeTopRef.current; const p2 = planeBottomRef.current;
      if (ring) ring.style.transform = `translate(${dx*8}px, ${dy*6}px) rotate(${dx*6}deg)`;
      if (cuff) cuff.style.transform = `translate(${dx*-6}px, ${dy*-4}px) rotate(${dx*-4}deg)`;
      if (p1) p1.style.transform = `translateY(${dy*-6}px)`;
      if (p2) p2.style.transform = `translateY(${dy*6}px)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className="landing-hero">
      <div className="planes">
        <div ref={planeTopRef} className="plane plane-top"></div>
        <div ref={planeBottomRef} className="plane plane-bottom"></div>
      </div>
      <div className="landing-center">
        <div className="mark">G</div>
        <h1>GleamVerse</h1>
        <p>Fine jewellery for the modern women</p>
      </div>
      <div className="jewels">
        <img ref={cuffRef} className="jewel cuff" src="http://localhost:8000/static/jewellery/ring2.png" alt="ring" />
        <img ref={ringRef} className="jewel ring" src="http://localhost:8000/static/jewellery/ring1.png" alt="ring" />
      </div>
      {/* Explore Collections CTA removed per request */}
    </section>
  );
}

