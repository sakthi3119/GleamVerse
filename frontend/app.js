(() => {
    const { useState, useEffect, useMemo, useContext, createContext, useRef } = React;
    const { createRoot } = ReactDOM;

	const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:8000' : 'http://localhost:8000';
    const asApiUrl = (u) => {
        if (!u) return u;
        if (/^https?:\/\//i.test(u)) return u;
        return `${API_BASE}${u}`;
    };

    const AuthContext = createContext(null);

    async function getClerkToken() {
        try {
            if (!window.Clerk || !Clerk.load) return '';
            await Clerk.load();
            const s = Clerk.session;
            if (!s) return '';
            return await s.getToken();
        } catch { return ''; }
    }

	function useAuth() {
		return useContext(AuthContext);
	}

	function AuthProvider({ children }) {
        const [token, setToken] = useState('');
        const [username, setUsername] = useState('');
        const [loaded, setLoaded] = useState(false);

        const syncFromClerk = async () => {
            const tk = await getClerkToken();
            setToken(tk || '');
            try {
                const user = Clerk.user;
                setUsername(user?.username || user?.primaryEmailAddress?.emailAddress || user?.id || '');
            } catch { setUsername(''); }
            setLoaded(true);
        };

        const login = () => { if (window.Clerk && Clerk.openSignIn) { Clerk.openSignIn({ afterSignInUrl: '/' }); } else { window.location.href = 'https://top-ray-29.clerk.accounts.dev/sign-in?redirect_url=' + encodeURIComponent('http://localhost:5500/#/'); } };
        const logout = async () => { try { await Clerk.signOut(); } catch {} setToken(''); setUsername(''); location.hash = '#/login'; };

        useEffect(() => { syncFromClerk(); }, []);

        const value = useMemo(() => ({ token, username, login, logout, syncFromClerk, loaded }), [token, username, loaded]);
		return React.createElement(AuthContext.Provider, { value }, children);
	}

    // Tiny hash router
    const RouterContext = createContext({ path: '/', params: {}, query: new URLSearchParams(), navigate: () => {} });

    function useRouter() { return useContext(RouterContext); }

    function Link({ to, className, children }) {
        const href = to.startsWith('#') ? to : `#${to}`;
        return <a className={className} href={href}>{children}</a>;
    }

    function Profile() {
        const auth = useAuth();
        const [profile, setProfile] = useState(null);
        const [msg, setMsg] = useState('');
        useEffect(() => { (async () => {
            const tk = await getClerkToken();
            const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${tk}` } });
            const data = await res.json();
            setProfile(data);
        })(); }, []);
        if (!profile) return <div className="gv-container">Loading...</div>;
        const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));
        const save = async () => {
            setMsg('');
            const tk = await getClerkToken();
            const res = await fetch(`${API_BASE}/auth/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` }, body: JSON.stringify(profile) });
            if (res.ok) setMsg('Saved'); else setMsg('Failed');
        };
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

    function Settings() {
        return (
            <div className="gv-container">
                <div className="auth">
                    <h2>Settings</h2>
                    <div className="row"><label>Theme</label><select className="select"><option>Default</option></select></div>
                    <div className="row"><label>Notifications</label><select className="select"><option>Enabled</option><option>Disabled</option></select></div>
                </div>
            </div>
        );
    }

    // Cart (client-side)
    const CartContext = createContext({ items: [], add: ()=>{}, remove: ()=>{}, clear: ()=>{} });
    function CartProvider({ children }) {
        const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('gv_cart')||'[]'));
        const save = (arr) => { setItems(arr); localStorage.setItem('gv_cart', JSON.stringify(arr)); };
        const add = (p) => save([...items, p]);
        const remove = (idx) => save(items.filter((_,i)=>i!==idx));
        const clear = () => save([]);
        const value = useMemo(()=>({ items, add, remove, clear }), [items]);
        return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
    }
    function useCart(){ return useContext(CartContext); }

    function Cart(){
        const cart = useCart();
        const total = cart.items.reduce((s, it) => s + (it.price||0), 0);
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
                    <button className="btn btn-gold">Proceed to checkout</button>
                </div>
            </div>
        );
    }
    function NavBar() {
		const auth = useAuth();
		return (
			<div className="nav">
                <div className="nav-inner">
                    <div className="nav-actions" style={{justifySelf:'start'}}>
                        {/* left-side minimal links per schema */}
                        <Link className="btn-outline" to="/profile" style={{padding:'8px 12px'}}>My Account</Link>
                        <Link className="btn-outline" to="/settings" style={{padding:'8px 12px'}}>Support</Link>
                    </div>
                    <Link className="brand" to="/">
                        <div className="brand-logo"></div>
                        <div className="brand-name">Jewel & Co.</div>
                    </Link>
                    <div className="nav-actions" style={{justifySelf:'end'}}>
                        {auth.token ? (
                            <>
                                <Link className="btn btn-outline" to="/" style={{textDecoration:'none'}}>Collections</Link>
                                <Link className="btn btn-outline" to="/cart" style={{textDecoration:'none'}}>Cart</Link>
                                <Link className="btn btn-outline" to="/settings" style={{textDecoration:'none'}}>Contact</Link>
                                <button className="btn btn-outline" onClick={auth.logout}>Sign out</button>
                            </>
                        ) : (
							<>
                                <Link className="btn btn-outline" to="/register">Signup</Link>
                                <Link className="btn" to="/login">Login</Link>
							</>
						)}
					</div>
				</div>
			</div>
		);
	}

    function SignIn() {
        const CLERK_BASE = 'https://top-ray-29.clerk.accounts.dev';
        return (
			<div className="gv-container">
				<div className="auth">
					<h2>Welcome back</h2>
                    <p className="muted">Use Clerk to sign in</p>
                <div style={{display:'flex', gap:12, marginBottom:12}}>
                    <button className="btn" onClick={()=>{ if (window.Clerk && Clerk.openSignIn) { Clerk.openSignIn({ afterSignInUrl: '/' }); } else { window.location.href = `${CLERK_BASE}/sign-in?redirect_url=${encodeURIComponent('http://localhost:5500/#/')}`; } }}>Sign in with Clerk</button>
                </div>
				</div>
			</div>
		);
	}

    function SignUp() {
		const CLERK_BASE = 'https://top-ray-29.clerk.accounts.dev';
		return (
			<div className="gv-container">
				<div className="auth">
					<h2>Create account</h2>
                    <p className="muted">Use Clerk to sign up</p>
                <div style={{display:'flex', gap:12, marginBottom:12}}>
                    <button className="btn" onClick={()=>{ if (window.Clerk && Clerk.openSignUp) { Clerk.openSignUp({ afterSignUpUrl: '/' }); } else { window.location.href = `${CLERK_BASE}/sign-up?redirect_url=${encodeURIComponent('http://localhost:5500/#/')}`; } }}>Continue with Clerk</button>
                </div>
				</div>
			</div>
		);
	}

	function Home() {
		const [items, setItems] = useState([]);
		const [q, setQ] = useState('');
		const [category, setCategory] = useState('');
		const [country, setCountry] = useState('');

		useEffect(() => { load(); }, []);

		async function load(params) {
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
                    <h1>Jewel & Co.</h1>
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
                        <Link className="btn btn-gold" to="/try-on">Virtual Try-On</Link>
					</div>
					<div className="grid">
						{items.map(p => (
							<div key={p.id} className="col-3">
								<div className="card">
                                    <img className="product-img" src={asApiUrl(p.thumbnail_url || p.image_url)} alt={p.name} />
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
				<div className="footer">© {new Date().getFullYear()} GleamVerse</div>
			</div>
		);
	}

    function ProductDetail({ params }) {
        const id = params.id;
		const [p, setP] = useState(null);
		const [sel, setSel] = useState({});
        const router = useRouter();

		useEffect(() => { (async () => {
			const res = await fetch(`${API_BASE}/products/${id}`);
			const data = await res.json();
			setP(data);
		})(); }, [id]);

		if (!p) return <div className="gv-container">Loading...</div>;

		const options = p.options || {};
		const setChoice = (k, v) => setSel(s => ({ ...s, [k]: v }));

		return (
			<div className="gv-container">
				<div className="detail-layout">
                    <img className="detail-img" src={asApiUrl(p.image_url)} alt={p.name} />
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
                            <button className="btn" onClick={()=>{ const cart = JSON.parse(localStorage.getItem('gv_cart')||'[]'); cart.push(p); localStorage.setItem('gv_cart', JSON.stringify(cart)); router.navigate('/cart'); }}>Add to cart</button>
                            <button className="btn btn-gold" onClick={()=>{ const cart = JSON.parse(localStorage.getItem('gv_cart')||'[]'); cart.push(p); localStorage.setItem('gv_cart', JSON.stringify(cart)); router.navigate('/cart'); }}>Buy now</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

    function TryOn() {
		const videoRef = useRef(null);
		const canvasRef = useRef(null);
        const [ready, setReady] = useState(false);
        const [useCamera, setUseCamera] = useState(true);
        const [kick, setKick] = useState(false);
        const router = useRouter();

		useEffect(() => {
            const video = videoRef.current;
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
            const overlayImg = new Image();
            let stillImg = null; // holds uploaded image when not using camera
            const qs = new URLSearchParams(location.hash.split('?')[1] || '');
            const imageQ = qs.get('image');
            const category = (qs.get('category') || '').toLowerCase();
            if (imageQ) overlayImg.src = imageQ;
            let overlayReady = false;
            overlayImg.onload = () => { overlayReady = true; };

            const smoothBox = { current: { x:0, y:0, w:0, h:0, inited:false } };

            function lerp(a,b,t){ return a + (b-a)*t; }

            function onResults(results) {
                const wv = video.videoWidth || canvas.width;
                const hv = video.videoHeight || canvas.height;
                canvas.width = wv;
                canvas.height = hv;
                ctx.clearRect(0,0,canvas.width,canvas.height);
                // When using uploaded photo, redraw it as the background each frame
                if (!useCamera && stillImg) {
                    try { ctx.drawImage(stillImg, 0, 0, canvas.width, canvas.height); } catch {}
                }
				if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;
				const lm = results.multiFaceLandmarks[0];
				// Simple ear anchor using landmarks 234 (left) and 454 (right)
				const L = lm[234];
				const R = lm[454];
                const CHIN = lm[152];
                if (!L || !R || !CHIN) return;
                const pxL = { x: L.x * canvas.width, y: L.y * canvas.height };
                const pxR = { x: R.x * canvas.width, y: R.y * canvas.height };
                // Fallback width if ears not stable: use bbox of all landmarks
                let minX = 1, maxX = 0;
                for (let i=0;i<lm.length;i++) { minX = Math.min(minX, lm[i].x); maxX = Math.max(maxX, lm[i].x); }
                const bboxW = (maxX - minX) * canvas.width;
                let w, h, x, y;
                if (category.includes('neck') || category.includes('choker')) {
                    // Necklace: place snugly under chin, centered
                    const chinPx = { x: CHIN.x * canvas.width, y: CHIN.y * canvas.height };
                    let faceW = Math.hypot(pxR.x - pxL.x, pxR.y - pxL.y);
                    if (!isFinite(faceW) || faceW < 30) faceW = bboxW; // ensure reasonable width
                    const midX = (pxL.x + pxR.x) / 2;
                    // Tuned proportions for closer fit
                    w = faceW * 1.30;
                    h = w * 0.38;
                    x = midX - w / 2;
                    // Slightly below the chin
                    y = chinPx.y + Math.max(4, faceW * 0.05);
                    // Clamp so it doesn't drop too low
                    y = Math.min(y, canvas.height - h * 0.9);
                } else if (category.includes('nose')) {
                    // Nose pin: small overlay near nose tip
                    const NOSE = lm[1] || lm[4] || CHIN; // fallback
                    const nosePx = { x: NOSE.x * canvas.width, y: NOSE.y * canvas.height };
                    let faceW2 = Math.hypot(pxR.x - pxL.x, pxR.y - pxL.y); if (!isFinite(faceW2) || faceW2<30) faceW2=bboxW;
                    w = Math.max(12, faceW2 * 0.06);
                    h = w;
                    x = nosePx.x - w * 0.2; // slight offset towards left nostril
                    y = nosePx.y - h * 0.1;
                } else if (category.includes('ring')) {
                    // Ring: place over right cheek as demo
                    let faceW2 = Math.hypot(pxR.x - pxL.x, pxR.y - pxL.y); if (!isFinite(faceW2) || faceW2<30) faceW2=bboxW;
                    w = faceW2 * 0.12;
                    h = w;
                    x = pxR.x - w * 0.5;
                    y = pxR.y - h * 0.5;
                } else {
                    // Earrings default: near left ear landmark
                    let faceW3 = Math.hypot(pxR.x - pxL.x, pxR.y - pxL.y); if (!isFinite(faceW3) || faceW3<30) faceW3=bboxW;
                    w = faceW3 * 0.35;
                    h = w;
                    x = pxL.x - w * 0.5;
                    y = pxL.y - h * 0.2;
                }
                // Smooth placement to avoid jitter
                const alpha = 0.15;
                if (!smoothBox.current.inited) { smoothBox.current = { x, y, w, h, inited:true }; }
                else {
                    smoothBox.current = {
                        x: lerp(smoothBox.current.x, x, alpha),
                        y: lerp(smoothBox.current.y, y, alpha),
                        w: lerp(smoothBox.current.w, w, alpha),
                        h: lerp(smoothBox.current.h, h, alpha),
                        inited:true,
                    };
                }
                if (overlayReady) {
                    if (!category.includes('earring')) {
                        ctx.drawImage(overlayImg, smoothBox.current.x, smoothBox.current.y, smoothBox.current.w, smoothBox.current.h);
                    } else {
                        // draw both ears
                        ctx.drawImage(overlayImg, pxL.x - w*0.5, pxL.y - h*0.2, w, h);
                        ctx.drawImage(overlayImg, pxR.x - w*0.5, pxR.y - h*0.2, w, h);
                    }
                }
			}

            // FaceMesh
            const faceMesh = new FaceMesh({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
            faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
            faceMesh.onResults(onResults);

            // Hands for rings/bracelets
            const hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
            hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
            hands.onResults((results) => {
                const wv = video.videoWidth || canvas.width;
                const hv = video.videoHeight || canvas.height;
                canvas.width = wv; canvas.height = hv;
                ctx.clearRect(0,0,canvas.width,canvas.height);
                if (!useCamera && stillImg) {
                    try { ctx.drawImage(stillImg, 0, 0, canvas.width, canvas.height); } catch {}
                }
                if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;
                const lm = results.multiHandLandmarks[0];
                const toPx = (p) => ({ x: p.x * canvas.width, y: p.y * canvas.height });
                const wrist = toPx(lm[0]);
                const indexBase = toPx(lm[5]);
                const pinkyBase = toPx(lm[17]);
                const palmWidth = Math.hypot(indexBase.x - pinkyBase.x, indexBase.y - pinkyBase.y);
                let w = palmWidth, h = palmWidth;
                if (category.includes('bracelet')) {
                    // Bracelet: center around wrist landmark
                    w = palmWidth * 0.9; h = w * 0.4;
                    const x = wrist.x - w/2; const y = wrist.y - h/2;
                    if (overlayReady) ctx.drawImage(overlayImg, x, y, w, h);
                } else if (category.includes('ring')) {
                    // Ring: place near ring finger PIP (landmark 14)
                    const ringPip = toPx(lm[14]);
                    w = Math.max(10, palmWidth * 0.18); h = w;
                    const x = ringPip.x - w/2; const y = ringPip.y - h/2;
                    if (overlayReady) ctx.drawImage(overlayImg, x, y, w, h);
                }
            });

            let camera;
            const startCamera = () => {
                camera = new Camera(video, {
                    onFrame: async () => {
                        // Route frames to appropriate detector(s)
                        if (category.includes('ring') || category.includes('bracelet')) {
                            await hands.send({ image: video });
                        } else {
                            await faceMesh.send({ image: video });
                        }
                    },
                    width: 960,
                    height: 720,
                });
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } } })
                    .then(() => { camera.start(); setReady(true); })
                    .catch(() => setReady(false));
            };

            const inputEl = document.getElementById('photoUpload');
            inputEl?.addEventListener('change', async (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                setUseCamera(false);
                const img = new Image();
                img.onload = async () => {
                    stillImg = img;
                    canvas.width = img.width; canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    // Route to correct detector based on category
                    if (category.includes('ring') || category.includes('bracelet')) {
                        await hands.send({ image: img });
                    } else {
                        await faceMesh.send({ image: img });
                    }
                };
                img.src = URL.createObjectURL(file);
            });

            if (kick) startCamera();

			return () => { try { camera.stop(); } catch {}
			};
		}, [kick]);

		return (
			<div className="gv-container">
				<h2 style={{marginBottom:12}}>Virtual Try-On</h2>
				<div className="tryon-stage">
					<video className="tryon-video" ref={videoRef} autoPlay playsInline muted></video>
					<canvas className="overlay" ref={canvasRef}></canvas>
				</div>
                <div style={{marginTop:12, display:'flex', gap:12, alignItems:'center'}}>
                    <button className="btn btn-outline" onClick={()=>router.navigate(-1)}>Back</button>
					<button className="btn" onClick={()=>setKick(true)}>Start camera</button>
					{!ready && <span style={{color:'var(--muted)'}}>Click Start camera and allow access</span>}
                    <input id="photoUpload" type="file" accept="image/*" className="input" />
				</div>
			</div>
		);
	}

    function App() {
        const auth = useAuth();
        const initial = () => {
            const r = location.hash.slice(1) || '/';
            if (!auth.token && r !== '/login' && r !== '/register') return '/login';
            return r;
        };
        const [route, setRoute] = useState(initial);

        useEffect(() => {
            const onHash = () => {
                const r = location.hash.slice(1) || '/';
                setRoute((!auth.token && r !== '/login' && r !== '/register') ? '/login' : r);
            };
            window.addEventListener('hashchange', onHash);
            if (!location.hash) location.hash = auth.token ? '#/' : '#/login';
            // Periodically sync Clerk token (covers sign-in modal completion)
            const t = setInterval(async ()=>{ const tk = await getClerkToken(); if ((tk||'') !== (auth.token||'')) { await auth.syncFromClerk(); const r = location.hash.slice(1) || '/'; if (tk && (r==='/login' || r==='/register')) location.hash = '#/'; } }, 1000);
            return () => { window.removeEventListener('hashchange', onHash); clearInterval(t); };
        }, [auth.token]);

        function navigate(to) {
            if (to === -1) { history.back(); return; }
            location.hash = to.startsWith('#') ? to : `#${to}`;
        }

        const [path, queryStr] = route.split('?');
        const query = new URLSearchParams(queryStr || '');
        const params = {};

        let page = null;
        const match = (pattern) => {
            const pSegs = pattern.split('/').filter(Boolean);
            const rSegs = path.split('/').filter(Boolean);
            if (pSegs.length !== rSegs.length) return false;
            for (let i=0;i<pSegs.length;i++) {
                if (pSegs[i].startsWith(':')) params[pSegs[i].slice(1)] = rSegs[i];
                else if (pSegs[i] !== rSegs[i]) return false;
            }
            return true;
        };

        // If user has just signed in, force redirect to Home once token is present
        if (auth.token && (path === '/login' || path === '/register')) {
            setTimeout(() => { if (location.hash !== '#/') location.hash = '#/'; }, 0);
        }
        if (!auth.token && path !== '/login' && path !== '/register') page = <SignIn />;
        else if (path === '/') page = <Home />;
        else if (path === '/login') page = <SignIn />;
        else if (path === '/register') page = <SignUp />;
        else if (match('/product/:id')) page = <ProductDetail params={params} />;
        else if (path === '/try-on') page = <TryOn />;
        else if (path === '/profile') page = <Profile />;
        else if (path === '/settings') page = <Settings />;
        else if (path === '/cart') page = <Cart />;
        else page = <div className="gv-container">Not found.</div>;

        return (
            <RouterContext.Provider value={{ path, params, query, navigate }}>
                <NavBar />
                {page}
            </RouterContext.Provider>
        );
    }

const root = createRoot(document.getElementById('root'));
root.render(
	<AuthProvider>
		<CartProvider>
			<App />
		</CartProvider>
	</AuthProvider>
);
    // boot app
})();