import React, { useEffect, useRef, useState } from 'react';

export default function TryOn(){
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(()=>{
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const overlayImg = new Image();
    let stillImg = null;
    const qs = new URLSearchParams(location.hash.split('?')[1] || location.search.split('?')[1] || '');
    const imageQ = qs.get('image');
    const category = (qs.get('category') || '').toLowerCase();
    const trySwapExt = (url) => {
      if (!url) return url;
      if (/\.jpg(\?|$)/i.test(url)) return url.replace(/\.jpg(\?|$)/i, '.png$1');
      if (/\.png(\?|$)/i.test(url)) return url.replace(/\.png(\?|$)/i, '.jpg$1');
      return url;
    };
    overlayImg.crossOrigin = 'anonymous';
    overlayImg.onload = ()=>{ overlayReady=true; };
    overlayImg.onerror = ()=>{
      const swapped = trySwapExt(overlayImg.src);
      if (swapped !== overlayImg.src) { overlayReady=false; overlayImg.src = swapped; }
    };
    if (imageQ) overlayImg.src = imageQ;
    let overlayReady = false;

    const smoothBox = { current: { x:0, y:0, w:0, h:0, inited:false } };
    const lerp = (a,b,t)=> a + (b-a)*t;

    function onFace(results){
      const wv = video.videoWidth || canvas.width;
      const hv = video.videoHeight || canvas.height;
      canvas.width = wv; canvas.height = hv; ctx.clearRect(0,0,canvas.width,canvas.height);
      if (!cameraOn && stillImg) { try { ctx.drawImage(stillImg, 0,0,canvas.width,canvas.height); } catch{} }
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;
      const lm = results.multiFaceLandmarks[0]; const L = lm[234]; const R = lm[454]; const CHIN = lm[152]; if (!L||!R||!CHIN) return;
      const pxL = { x:L.x*canvas.width, y:L.y*canvas.height }; const pxR = { x:R.x*canvas.width, y:R.y*canvas.height }; const chinPx = { x: CHIN.x*canvas.width, y: CHIN.y*canvas.height };
      let minX=1,maxX=0; for(let i=0;i<lm.length;i++){ minX=Math.min(minX,lm[i].x); maxX=Math.max(maxX,lm[i].x);} const bboxW=(maxX-minX)*canvas.width;
      let w,h,x,y; let faceW=Math.hypot(pxR.x-pxL.x, pxR.y-pxL.y); if(!isFinite(faceW)||faceW<30) faceW=bboxW;
      if (category.includes('neck')||category.includes('choker')){
        const midX=(pxL.x+pxR.x)/2;
        w = faceW * 1.35;
        h = w * 0.45;
        x = midX - w / 2;
        y = chinPx.y + Math.max(8, faceW * 0.22);
        y = Math.min(y, canvas.height - h * 0.85);
      } else if (category.includes('nose')){
        const NOSE=lm[1]||lm[4]||CHIN; const nosePx={ x:NOSE.x*canvas.width, y:NOSE.y*canvas.height }; let fw=Math.hypot(pxR.x-pxL.x, pxR.y-pxL.y); if(!isFinite(fw)||fw<30) fw=bboxW;
        w=Math.max(12, fw*0.06); h=w; x=nosePx.x-w*0.2; y=nosePx.y-h*0.1;
      } else {
        let fw=Math.hypot(pxR.x-pxL.x, pxR.y-pxL.y); if(!isFinite(fw)||fw<30) fw=bboxW; w=fw*0.35; h=w; x=pxL.x-w*0.5; y=pxL.y-h*0.2;
      }
      const alpha=0.15; if(!smoothBox.current.inited){ smoothBox.current={x,y,w,h,inited:true}; } else { smoothBox.current={ x: lerp(smoothBox.current.x,x,alpha), y: lerp(smoothBox.current.y,y,alpha), w: lerp(smoothBox.current.w,w,alpha), h: lerp(smoothBox.current.h,h,alpha), inited:true } }
      if (overlayReady){ ctx.drawImage(overlayImg, smoothBox.current.x, smoothBox.current.y, smoothBox.current.w, smoothBox.current.h); }
    }

    function onHands(results){
      const wv = video.videoWidth || canvas.width; const hv = video.videoHeight || canvas.height; canvas.width=wv; canvas.height=hv; ctx.clearRect(0,0,canvas.width,canvas.height);
      if (!cameraOn && stillImg) { try { ctx.drawImage(stillImg, 0,0,canvas.width,canvas.height); } catch{} }
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length===0) return;
      const toPx=(p)=>({ x:p.x*canvas.width, y:p.y*canvas.height });
      for (const lm of results.multiHandLandmarks) {
        const wrist=toPx(lm[0]); const indexBase=toPx(lm[5]); const pinkyBase=toPx(lm[17]); const palmWidth=Math.hypot(indexBase.x-pinkyBase.x,indexBase.y-pinkyBase.y);
        let w=palmWidth,h=palmWidth;
        if (category.includes('bracelet')){
          w=palmWidth*0.95; h=w*0.42; const x=wrist.x-w/2; const y=wrist.y-h/2; ctx.drawImage(overlayImg,x,y,w,h);
        } else if (category.includes('ring')){
          const ringPip = toPx(lm[14]); // ring finger PIP landmark
          w=Math.max(14, palmWidth*0.2); h=w; const x=ringPip.x-w/2; const y=ringPip.y-h/2; ctx.drawImage(overlayImg,x,y,w,h);
        }
      }
    }

    const faceMesh = new FaceMesh({ locateFile: (f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
    faceMesh.setOptions({ maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:0.7, minTrackingConfidence:0.7 });
    faceMesh.onResults(onFace);
    const hands = new Hands({ locateFile: (f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
    hands.setOptions({ selfieMode:true, maxNumHands:2, modelComplexity:1, minDetectionConfidence:0.7, minTrackingConfidence:0.7 });
    hands.onResults(onHands);

    let camera;
    const startCamera = () => {
      camera = new Camera(video, { onFrame: async ()=>{ 
        // Run both to ensure availability; draw is still gated by category
        await faceMesh.send({ image: video }); 
        await hands.send({ image: video }); 
      }, width: 960, height: 720 });
      navigator.mediaDevices.getUserMedia({ video: { facingMode:'user', width:{ideal:960}, height:{ideal:720} } }).then(()=>{ camera.start(); cameraRef.current = camera; setReady(true); setCameraOn(true); });
    };

    const inputEl = document.getElementById('photoUpload');
    inputEl?.addEventListener('change', async (e)=>{
      const file = e.target.files && e.target.files[0]; if (!file) return; const img=new Image(); img.onload=async()=>{ stillImg=img; canvas.width=img.width; canvas.height=img.height; try{ ctx.drawImage(img,0,0);}catch{} if(category.includes('ring')||category.includes('bracelet')) await hands.send({ image: img }); else await faceMesh.send({ image: img }); }; img.src=URL.createObjectURL(file);
    });

    if (cameraOn && !cameraRef.current) startCamera();
    return ()=>{ try{ camera?.stop(); }catch{} };
  }, [cameraOn]);

  return (
    <div className="gv-container">
      <h2 style={{marginBottom:12}}>Virtual Try-On</h2>
      <div className="tryon-stage">
        <video className="tryon-video" ref={videoRef} autoPlay playsInline muted></video>
        <canvas className="overlay" ref={canvasRef}></canvas>
      </div>
      <div style={{marginTop:12, display:'flex', gap:12, alignItems:'center'}}>
        <a className="btn btn-outline" href="#/" onClick={(e)=>{ e.preventDefault(); history.back(); }}>Back</a>
        <button className="btn" onClick={()=>{ if (cameraOn) { try { cameraRef.current?.stop(); } catch {}; cameraRef.current = null; setCameraOn(false); setReady(false); } else { setCameraOn(true); } }}>Camera</button>
        {!ready && <span style={{color:'var(--muted)'}}>Click Camera and allow access</span>}
        <input id="photoUpload" type="file" accept="image/*" className="input" />
      </div>
    </div>
  );
}

