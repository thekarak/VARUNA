const { useState, useEffect, useRef } = React;

function FullPage3DBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.z = 210;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const particleCount = 2400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color('#38bdf8');
    const mint = new THREE.Color('#34d399');
    const rose = new THREE.Color('#f43f5e');
    const white = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 950;
      positions[i + 1] = 400 - Math.random() * 5800;
      positions[i + 2] = (Math.random() - 0.5) * 750;

      const rnd = Math.random();
      let c = white;
      if (rnd > 0.68) c = cyan;
      else if (rnd > 0.44) c = mint;
      else if (rnd > 0.38) c = rose;

      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 1.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const starPoints = new THREE.Points(particleGeo, particleMat);
    scene.add(starPoints);

    const objectsList = [];

    const createWireframe = (geo, color, opacity = 0.22, pos = [0, 0, 0], rot = [0, 0, 0], scale = 1) => {
      const mat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      mesh.scale.set(scale, scale, scale);
      mesh.userData = {
        baseY: pos[1],
        baseScale: scale,
        baseOpacity: opacity,
        rotSpeedX: (Math.random() - 0.5) * 0.35 + 0.2,
        rotSpeedY: (Math.random() - 0.5) * 0.35 + 0.25,
        rotSpeedZ: (Math.random() - 0.5) * 0.15
      };
      scene.add(mesh);
      objectsList.push(mesh);
      return mesh;
    };

    createWireframe(new THREE.TorusGeometry(26, 3.5, 14, 36), 0x38bdf8, 0.26, [140, -100, -20]);
    createWireframe(new THREE.RingGeometry(38, 40, 42), 0x34d399, 0.2, [140, -100, -20], [Math.PI / 3, 0, 0]);
    createWireframe(new THREE.TorusGeometry(18, 2.2, 12, 36), 0x34d399, 0.28, [-140, -250, 10]);

    const wavePlaneGeo = new THREE.PlaneGeometry(240, 140, 18, 12);
    const wavePlaneMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.18, depthWrite: false });
    const wavePlaneMesh = new THREE.Mesh(wavePlaneGeo, wavePlaneMat);
    wavePlaneMesh.position.set(0, -680, -70);
    wavePlaneMesh.rotation.x = -Math.PI / 2.5;
    wavePlaneMesh.userData = { baseY: -680, baseScale: 1, baseOpacity: 0.18, rotSpeedX: 0, rotSpeedY: 0.05, rotSpeedZ: 0 };
    scene.add(wavePlaneMesh);
    objectsList.push(wavePlaneMesh);

    createWireframe(new THREE.IcosahedronGeometry(26, 1), 0xf43f5e, 0.26, [-145, -960, -10]);
    createWireframe(new THREE.TorusGeometry(32, 2.5, 12, 36), 0x38bdf8, 0.22, [135, -1200, 10]);

    createWireframe(new THREE.TorusGeometry(32, 2.5, 14, 48), 0x38bdf8, 0.24, [-135, -1480, -20]);
    createWireframe(new THREE.RingGeometry(10, 18, 48), 0x34d399, 0.28, [-135, -1480, -20], [Math.PI / 3, 0, 0]);

    createWireframe(new THREE.ConeGeometry(24, 20, 18, 1, true), 0x34d399, 0.24, [140, -1720, -15], [Math.PI / 4, 0, 0]);

    const satGroup = new THREE.Group();
    satGroup.position.set(-145, -2150, 10);
    const satBody = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 24, 6), new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.32 }));
    const solarL = new THREE.Mesh(new THREE.PlaneGeometry(36, 14), new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.26, side: THREE.DoubleSide }));
    solarL.position.x = -26;
    const solarR = new THREE.Mesh(new THREE.PlaneGeometry(36, 14), new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.26, side: THREE.DoubleSide }));
    solarR.position.x = 26;
    satGroup.add(satBody, solarL, solarR);
    satGroup.userData = { baseY: -2150, baseScale: 1, baseOpacity: 0.28, rotSpeedX: 0.2, rotSpeedY: 0.35, rotSpeedZ: 0.15 };
    scene.add(satGroup);
    objectsList.push(satGroup);

    createWireframe(new THREE.TorusGeometry(38, 3.2, 12, 36), 0x38bdf8, 0.25, [145, -2500, -10]);
    createWireframe(new THREE.TorusGeometry(28, 2.4, 12, 40), 0x38bdf8, 0.25, [-140, -2950, 0]);
    createWireframe(new THREE.CylinderGeometry(12, 24, 38, 8, 1, true), 0x34d399, 0.24, [135, -3300, -15]);
    createWireframe(new THREE.IcosahedronGeometry(28, 0), 0x38bdf8, 0.25, [-135, -3650, 10]);
    createWireframe(new THREE.TorusGeometry(34, 2.6, 14, 48), 0x34d399, 0.22, [140, -3950, -20]);
    createWireframe(new THREE.RingGeometry(12, 22, 48), 0x38bdf8, 0.24, [140, -3950, -20], [Math.PI / 4, 0, 0]);

    const horizonGrid = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 220, 22, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.2, depthWrite: false })
    );
    horizonGrid.position.set(0, -4450, -60);
    horizonGrid.rotation.x = -Math.PI / 2.3;
    horizonGrid.userData = { baseY: -4450, baseScale: 1, baseOpacity: 0.2, rotSpeedX: 0, rotSpeedY: 0.04, rotSpeedZ: 0 };
    scene.add(horizonGrid);
    objectsList.push(horizonGrid);

    const haloRing = createWireframe(new THREE.TorusGeometry(72, 2.4, 16, 72), 0x38bdf8, 0.24, [0, -4850, -30], [Math.PI / 4, 0, 0]);
    haloRing.userData.rotSpeedZ = 0.25;

    let scrollY = window.scrollY;
    let targetCamY = 0;
    const onScroll = () => {
      scrollY = window.scrollY;
      targetCamY = -scrollY * 0.95;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let animId;
    const clock = new THREE.Clock();
    const planePositions = wavePlaneGeo.attributes.position;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      camera.position.y += (targetCamY - camera.position.y) * 0.065;
      const targetCamX = mouseX * 14;
      const targetCamZ = 210 + Math.sin(scrollY * 0.0012) * 25;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      starPoints.rotation.y = elapsed * 0.015;

      for (let i = 0; i < planePositions.count; i++) {
        const u = planePositions.getX(i);
        const v = planePositions.getY(i);
        const z = Math.sin(u * 0.05 + elapsed * 1.8) * 4.5 + Math.cos(v * 0.05 + elapsed * 1.4) * 4.5;
        planePositions.setZ(i, z);
      }
      planePositions.needsUpdate = true;

      for (let j = 0; j < objectsList.length; j++) {
        const obj = objectsList[j];
        obj.rotation.x += obj.userData.rotSpeedX * 0.02;
        obj.rotation.y += obj.userData.rotSpeedY * 0.02;
        obj.rotation.z += obj.userData.rotSpeedZ * 0.02;

        const distY = Math.abs(obj.position.y - camera.position.y);
        if (distY < 500) {
          const proximity = 1 - distY / 500;
          const targetScale = obj.userData.baseScale * (0.8 + proximity * 0.45);
          obj.scale.set(targetScale, targetScale, targetScale);
          if (obj.material) {
            obj.material.opacity = obj.userData.baseOpacity * (0.6 + proximity * 1.4);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
}

function TiltCard({ children, className = "", maxTilt = 7 }) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -maxTilt;
    const rotY = ((x - cx) / cx) * maxTilt;

    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(8px)`
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={`card-3d-body ${className}`}
    >
      {children}
    </div>
  );
}

function Slide3D({ children, className = "", direction = "up", delay = 0 }) {
  const [revealed, setRevealed] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dirClass = direction === "left" 
    ? "slide-3d-left" 
    : direction === "right" 
    ? "slide-3d-right" 
    : direction === "scale" 
    ? "slide-3d-scale" 
    : "slide-3d-up";

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`slide-3d-wrap ${dirClass} ${revealed ? "is-revealed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function LagrangianDriftSimulator() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoursAgo, setHoursAgo] = useState(0.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [showCorridor, setShowCorridor] = useState(true);
  const [showVesselTrack, setShowVesselTrack] = useState(true);

  const hoursAgoRef = useRef(0.0);
  hoursAgoRef.current = hoursAgo;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  const particlesRef = useRef([]);
  if (particlesRef.current.length === 0) {
    const list = [];
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      list.push({
        angle,
        r,
        speed: 0.85 + Math.random() * 0.35,
        size: 1.4 + Math.random() * 2.2,
        seed: Math.random() * 100
      });
    }
    particlesRef.current = list;
  }

  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = (time) => {
      animId = requestAnimationFrame(render);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (isPlayingRef.current) {
        let next = hoursAgoRef.current + dt * 2.6;
        if (next >= 18.4) {
          next = 0.0;
        }
        hoursAgoRef.current = next;
        setHoursAgo(next);
      }

      const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : { width: 800, height: 400 };
      const w = Math.max(Math.floor(rect.width), 320);
      const h = Math.min(Math.max(Math.floor(w * 0.46), 310), 420);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050912";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 38;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText("GRID // 24°38'N 54°19'E", 12, 20);
      ctx.fillText("HYCOM 1/12° OCEAN DRIFT RUNGE-KUTTA 4TH", Math.max(12, w - 240), 20);

      const t = Math.min(Math.max(hoursAgoRef.current / 18.4, 0), 1);

      const detX = w * 0.76;
      const detY = h * 0.26;
      const origX = w * 0.24;
      const origY = h * 0.74;

      if (showVectors) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.13)";
        ctx.lineWidth = 1.2;
        const streamlineCount = 6;
        for (let s = 0; s < streamlineCount; s++) {
          const offsetY = (s - streamlineCount / 2) * (h * 0.16);
          const startX = w * 0.96;
          const startY = h * 0.08 + offsetY;
          const cp1X = w * 0.62;
          const cp1Y = h * 0.36 + offsetY;
          const cp2X = w * 0.38;
          const cp2Y = h * 0.64 + offsetY;
          const endX = w * 0.04;
          const endY = h * 0.92 + offsetY;

          ctx.beginPath();
          ctx.setLineDash([4, 6]);
          ctx.lineDashOffset = -(time * 0.025 + s * 9);
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      if (showVesselTrack) {
        const vStartX = w * 0.1;
        const vStartY = h * 0.94;
        const vEndX = w * 0.54;
        const vEndY = h * 0.28;

        ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(vStartX, vStartY);
        ctx.lineTo(vEndX, vEndY);
        ctx.stroke();
        ctx.setLineDash([]);

        const blackoutStartX = vStartX + (vEndX - vStartX) * 0.26;
        const blackoutStartY = vStartY + (vEndY - vStartY) * 0.26;
        const blackoutEndX = vStartX + (vEndX - vStartX) * 0.74;
        const blackoutEndY = vStartY + (vEndY - vStartY) * 0.74;

        ctx.strokeStyle = "rgba(244, 63, 94, 0.85)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(blackoutStartX, blackoutStartY);
        ctx.lineTo(blackoutEndX, blackoutEndY);
        ctx.stroke();

        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.arc(blackoutStartX, blackoutStartY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
        ctx.fillText("✕ AIS BLACKOUT (14.8H)", blackoutStartX + 8, blackoutStartY - 5);

        ctx.strokeStyle = "rgba(244, 63, 94, 0.9)";
        ctx.lineWidth = 1.5;
        const pulseR = 8 + Math.sin(time * 0.006) * 3.5;
        ctx.beginPath();
        ctx.arc(origX, origY, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(origX - 9, origY);
        ctx.lineTo(origX + 9, origY);
        ctx.moveTo(origX, origY - 9);
        ctx.lineTo(origX, origY + 9);
        ctx.stroke();

        ctx.fillStyle = "#34d399";
        ctx.fillText("VESSEL INTERCEPT // MMSI 538009214", Math.max(10, origX - 90), origY + 22);
      }

      const currentX = detX + (origX - detX) * t;
      const currentY = detY + (origY - detY) * t + Math.sin(t * Math.PI) * (h * 0.08);

      if (showCorridor) {
        ctx.save();
        ctx.translate(currentX, currentY);
        ctx.rotate(-Math.PI / 4.2);
        ctx.strokeStyle = t > 0.85 ? "rgba(244, 63, 94, 0.7)" : "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        const rx = 38 * (1 - 0.65 * t);
        const ry = 22 * (1 - 0.65 * t);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const particles = particlesRef.current;
      const currentRadius = 40 * (1 - 0.75 * t);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const rad = p.r * currentRadius;
        const px = currentX + Math.cos(p.angle) * rad + Math.sin(time * 0.002 * p.speed + p.seed) * 2;
        const py = currentY + Math.sin(p.angle) * rad * 0.65 + Math.cos(time * 0.002 * p.speed + p.seed) * 2;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2);
        if (t > 0.85) {
          grad.addColorStop(0, "rgba(244, 63, 94, 0.95)");
          grad.addColorStop(0.5, "rgba(56, 189, 248, 0.5)");
          grad.addColorStop(1, "rgba(56, 189, 248, 0)");
        } else {
          grad.addColorStop(0, "rgba(56, 189, 248, 0.9)");
          grad.addColorStop(0.6, "rgba(52, 211, 153, 0.4)");
          grad.addColorStop(1, "rgba(52, 211, 153, 0)");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      if (t < 0.15) {
        ctx.fillText("SATELLITE DETECTION (T0)", Math.min(w - 180, detX - 60), detY - 24);
      } else if (t > 0.85) {
        ctx.fillText("RECONSTRUCTED ORIGIN (T-18.4H)", Math.max(10, origX - 85), origY - 24);
      } else {
        ctx.fillText(`HINDCAST SLICK CLUSTER (T - ${hoursAgoRef.current.toFixed(1)}H)`, Math.max(10, currentX - 75), currentY - 24);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [showVectors, showCorridor, showVesselTrack]);

  const progressRatio = Math.min(Math.max(hoursAgo / 18.4, 0), 1);
  const currentArea = (4.8 - progressRatio * 4.45).toFixed(2);
  const attributionProb = (62.4 + progressRatio * 32.4).toFixed(1);

  return (
    <Slide3D direction="up" delay={80} className="w-full my-8">
      <div className="bg-[#070c14]/95 backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-4 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] text-white uppercase">
              INTERACTIVE DRIFT VECTOR SIMULATOR
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
              LAGRANGIAN HINDCAST
            </span>
            <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
              10,000 PARTICLES
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-mono">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">REVERSE TIME</span>
            <span className="text-sm sm:text-base font-bold text-cyan-300 mt-0.5 block">
              T - {hoursAgo.toFixed(1)} HRS
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">DRIFT VELOCITY</span>
            <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
              1.84 KTS (225° SW)
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">SLICK SPREAD AREA</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 block">
              {currentArea} KM²
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">INTERCEPT PROBABILITY</span>
            <span className="text-sm sm:text-base font-bold text-rose-400 mt-0.5 block">
              {attributionProb}%
            </span>
          </div>
        </div>

        <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border border-white/[0.06] mb-4">
          <canvas ref={canvasRef} className="w-full block" />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-rose-400 animate-ping" : "bg-cyan-400"}`}></span>
              {isPlaying ? "PAUSE" : "SIMULATE REVERSE DRIFT"}
            </button>
            <button
              onClick={() => { setIsPlaying(false); setHoursAgo(0); hoursAgoRef.current = 0; }}
              className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
            >
              RESET
            </button>
          </div>

          <div className="flex-1 max-w-md flex items-center gap-3">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap">
              T0
            </span>
            <input
              type="range"
              min="0"
              max="18.4"
              step="0.1"
              value={hoursAgo}
              onChange={(e) => {
                setIsPlaying(false);
                const val = parseFloat(e.target.value);
                setHoursAgo(val);
                hoursAgoRef.current = val;
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-mono text-[10px] text-rose-400 font-bold uppercase tracking-wider whitespace-nowrap">
              T-18.4H
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <button
              onClick={() => setShowVectors(!showVectors)}
              className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                showVectors ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300" : "bg-white/[0.02] border-white/[0.06] text-slate-500"
              }`}
            >
              VECTORS
            </button>
            <button
              onClick={() => setShowCorridor(!showCorridor)}
              className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                showCorridor ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300" : "bg-white/[0.02] border-white/[0.06] text-slate-500"
              }`}
            >
              CORRIDOR
            </button>
            <button
              onClick={() => setShowVesselTrack(!showVesselTrack)}
              className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                showVesselTrack ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300" : "bg-white/[0.02] border-white/[0.06] text-slate-500"
              }`}
            >
              AIS TRACK
            </button>
          </div>
        </div>
      </div>
    </Slide3D>
  );
}

function ForensicInspectorTerminal() {
  const [activeTab, setActiveTab] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const tabs = [
    { id: 0, label: "01 // SAR POLARIMETRY", name: "SAR Spectrogram" },
    { id: 1, label: "02 // AIS KINEMATICS", name: "Dead-Reckoning Radar" },
    { id: 2, label: "03 // MULTI-FACTOR MATRIX", name: "Attribution Gauge" },
    { id: 3, label: "04 // EVIDENCE SEAL", name: "Cryptographic Docket" }
  ];

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
    }, 900);
  };

  return (
    <Slide3D direction="up" delay={100} className="w-full my-12">
      <TiltCard className="bg-[#070c14]/95 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.08] pb-4 mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-white uppercase">
                FORENSIC DOCKET INSPECTOR & TELEMETRY TERMINAL
              </span>
            </div>
            <p className="font-sans text-xs text-slate-400">
              Interactive multi-channel investigation docket for maritime legal attribution.
            </p>
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] text-emerald-400 uppercase tracking-widest px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 self-start md:self-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            DOSSIER #VARUNA-MED-08492
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6 font-mono text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0c1626] border-cyan-400 text-white shadow-cyan-glow"
                  : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-[10px] font-bold text-cyan-400 block tracking-wider mb-0.5">
                {tab.label}
              </span>
              <span className="text-xs font-semibold text-slate-200 truncate block">
                {tab.name}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 bg-[#050810] border border-white/[0.06] rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-4 font-mono text-[10px]">
                <span className="text-slate-400">DUAL-POLARIZATION BACKSCATTER PROFILE (VV / VH)</span>
                <span className="text-cyan-400">10M RESOLUTION</span>
              </div>
              <div className="relative h-44 w-full flex items-center justify-center">
                <div className="absolute inset-x-0 h-0.5 bg-cyan-400/70 shadow-[0_0_8px_#38bdf8] laser-scanner-line pointer-events-none" />
                <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                  <path
                    d="M 10,80 Q 60,75 100,80 T 170,80 Q 200,125 230,125 T 290,80 T 390,80"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <path
                    d="M 10,95 Q 60,92 100,95 T 170,95 Q 200,135 230,135 T 290,95 T 390,95"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <rect x="185" y="65" width="60" height="75" fill="rgba(244, 63, 94, 0.12)" stroke="rgba(244, 63, 94, 0.4)" strokeWidth="1" strokeDasharray="2 2" rx="4" />
                  <text x="215" y="55" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    SLICK ATTENUATION
                  </text>
                  <text x="215" y="152" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                    -11.4 dB RETURN
                  </text>
                </svg>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] font-mono text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  VV CO-POLARIZED
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  VH CROSS-POLARIZED
                </span>
                <span className="text-rose-400">OIL FILM DETECTED</span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3 font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                  POLARIZATION RATIO
                </span>
                <span className="text-xl font-bold text-white tracking-tight">
                  {"4.82 dB // RATIO PEAK"}
                </span>
                <p className="font-sans text-xs text-slate-400 mt-1 leading-normal">
                  Dual-polarization ratio rejects biogenic ocean films and isolates mineral hydrocarbon emulsions.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                  ESTIMATED SLICK THICKNESS
                </span>
                <span className="text-xl font-bold text-cyan-300 tracking-tight">
                  {"2.4 μm // HEAVY SLOP RESIDUE"}
                </span>
                <p className="font-sans text-xs text-slate-400 mt-1 leading-normal">
                  Consistent with high-viscosity bilge sludge or heavy crude washings under MARPOL Annex I criteria.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 bg-[#050810] border border-white/[0.06] rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2 font-mono text-[10px]">
                <span className="text-slate-400">TACTICAL AIS DEAD-RECKONING SCOPE</span>
                <span className="text-rose-400 font-bold">14.8H BLACKOUT</span>
              </div>
              <div className="relative w-56 h-56 my-2 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-6 rounded-full border border-cyan-500/15" />
                <div className="absolute inset-14 rounded-full border border-cyan-500/10" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-cyan-500/20" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-full w-px bg-cyan-500/20" />
                </div>
                <div className="absolute inset-0 radar-scope-sweep pointer-events-none">
                  <div className="w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-cyan-400/30 to-transparent" />
                </div>
                <div className="absolute top-12 left-16 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                <div className="absolute top-12 left-16 w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_#f43f5e]" />
                <div className="absolute bottom-14 right-14 w-2 h-2 rounded-full bg-sky-400" />
              </div>
              <div className="w-full flex items-center justify-between pt-2 border-t border-white/[0.06] font-mono text-[10px] text-slate-400">
                <span>TARGET: MMSI 538009214</span>
                <span className="text-emerald-400">OFFSET: 0.82 NM</span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3 font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                  SUSPECT IDENTITY
                </span>
                <span className="text-base font-bold text-white tracking-wide block">
                  {"MMSI 538009214 // VLCC TANKER"}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">FLAG: MARSHALL ISLANDS · DWT 318,000</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                  SPEED ANOMALY DELTA
                </span>
                <span className="text-base font-bold text-rose-400 tracking-wide block">
                  14.2 KTS → 8.1 KTS (-4.2 KTS)
                </span>
                <p className="font-sans text-xs text-slate-400 mt-1 leading-normal">
                  Vessel throttled engines significantly during the AIS blackout window, matching discharge protocols.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 bg-[#050810] border border-white/[0.06] rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">
                MULTI-FACTOR ATTRIBUTION SCORE
              </span>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="url(#bayesGrad)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="326.7"
                    strokeDashoffset="17.0"
                    strokeLinecap="round"
                    className="gauge-circle-fill"
                  />
                  <defs>
                    <linearGradient id="bayesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="70%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl font-black text-white">
                    94.8%
                  </span>
                  <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest">
                    ATTRIBUTED
                  </span>
                </div>
              </div>
              <span className="mt-4 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                CONFIDENCE: HIGH CERTAINTY
              </span>
            </div>

            <div className="lg:col-span-7 space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>SPATIAL INTERCEPT PROXIMITY (0.82 NM)</span>
                  <span className="text-cyan-400 font-bold">98.2%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '98.2%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>LAGRANGIAN DRIFT CONCORDANCE</span>
                  <span className="text-emerald-400 font-bold">96.5%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '96.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>KINEMATIC SPEED ANOMALY</span>
                  <span className="text-amber-400 font-bold">91.0%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '91.0%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>HISTORICAL VOYAGE PATTERN SCORE</span>
                  <span className="text-rose-400 font-bold">89.4%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: '89.4%' }}></div>
                </div>
              </div>

              <div className="pt-2">
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block">
                  LEGAL VERDICT: MEETS MARPOL ANNEX I BURDEN OF PROOF
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-4 font-mono">
            <div className="p-4 rounded-xl bg-[#050810] border border-white/[0.06] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 border-b border-white/[0.06] pb-2 gap-1">
                <span>{"CHAIN OF CUSTODY // SHA-256 IMMUTABLE DOCKET"}</span>
                <span className="text-cyan-400">TIMESTAMP: 2026-09-04T12:08:44.829Z</span>
              </div>
              <div className="p-2.5 rounded bg-black/50 font-mono text-[10px] sm:text-xs text-slate-300 break-all border border-white/[0.04]">
                9e8a7c1b4d0e2f5a8c3b1e9d7f5a2c4e6b8a0d2f4a6c8e0b2d4f6a8c0e2b4d6
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] text-slate-400">
                <div>SAR: SENTINEL-1 C-BAND</div>
                <div>HYCOM: 1/12° GRID</div>
                <div>AIS: S-AIS + T-AIS</div>
                <div>STATUS: SEALED</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-5 py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <span className={`w-2 h-2 rounded-full ${isVerifying ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}></span>
                {isVerifying ? "COMPUTING SHA-256 CHECKSUM..." : verified ? "TAMPER-PROOF INTEGRITY VALIDATED" : "VERIFY ON-CHAIN INTEGRITY"}
              </button>

              <span className="text-[10px] text-slate-400 text-center sm:text-right">
                NON-REPUDIATION HASH ADMISSIBLE IN ADMIRALTY TRIBUNALS
              </span>
            </div>
          </div>
        )}
      </TiltCard>
    </Slide3D>
  );
}

function App() {

  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [activeProblemTab, setActiveProblemTab] = useState(0);
  const [activeSolutionLayer, setActiveSolutionLayer] = useState(0);
  const [solutionActive, setSolutionActive] = useState(false);
  const [finalActive, setFinalActive] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const solutionRef = useRef(null);
  const finalRef = useRef(null);

  const handleGetStarted = () => {
    window.location.href = "dashboard.html";
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSolutionActive(true);
        }
      },
      { threshold: 0.15 }
    );

    if (solutionRef.current) {
      observer.observe(solutionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFinalActive(true);
        }
      },
      { threshold: 0.15 }
    );

    if (finalRef.current) {
      observer.observe(finalRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    { num: "01", name: "INGEST", desc: "Define the area and retrieve satellite data.", telemetry: "SENTINEL-1 SAR PASS · 10M RES · COVERAGE 100%" },
    { num: "02", name: "DETECT", desc: "Identify suspected oil slicks.", telemetry: "CNN FEATURE MASK · VV/VH POLARIZATION · 99.4% CONF" },
    { num: "03", name: "TRACE", desc: "Reconstruct drift and determine the origin window.", telemetry: "LAGRANGIAN HINDCAST · HYCOM 1.84KTS · 225° SW" },
    { num: "04", name: "CORRELATE", desc: "Match vessel trajectories with the event.", telemetry: "AIS DEAD-RECKONING · MMSI 538009214 · OFFSET 0.8NM" },
    { num: "05", name: "ATTRIBUTE", desc: "Score anomalies and identify probable suspects.", telemetry: "PRIORITY SCORE: 94.8% · SPEED DELTA -4.2KTS" },
    { num: "06", name: "DOCUMENT", desc: "Generate a forensic evidence record.", telemetry: "DOSSIER SEALED · SHA-256 HASH VERIFIED" }
  ];

  const constellationNodes = [
    { id: 1, code: "01", tag: "DETECTION", title: "SATELLITE IMAGERY", desc: "Identifies suspected oil slicks from Earth observation data." },
    { id: 2, code: "02", tag: "HINDCASTING", title: "OCEAN DYNAMICS", desc: "Reconstructs drift to estimate the possible origin window." },
    { id: 3, code: "03", tag: "AIS CORRELATION", title: "VESSEL INTELLIGENCE", desc: "Correlates historical vessel movement with the reconstructed event." },
    { id: 4, code: "04", tag: "ANOMALY DETECTION", title: "BEHAVIOURAL ANALYSIS", desc: "Evaluates movement anomalies and AIS signal gaps." }
  ];

  const problemPillars = [
    {
      id: "drift",
      code: "01 // HYDRODYNAMIC DRIFT",
      title: "The Drift Displacement Dilemma",
      headline: "The spill you see is never where the crime occurred.",
      body: "By the time Earth Observation satellites pass over an open ocean coordinate, ocean surface currents, Ekman drift, and Coriolis forces have displaced the hydrocarbon slick between 15 to 50 nautical miles away from the initial discharge coordinate.",
      metric: "15-50 NM",
      metricLabel: "AVERAGE SLICK DISPLACEMENT BEFORE SATELLITE PASS"
    },
    {
      id: "ais",
      code: "02 // AIS BLACKOUTS",
      title: "Intentional Transponder Extinction",
      headline: "Dark fleets operate in the shadows of maritime blindness.",
      body: "Vessels routinely extinguish their Automatic Identification System (AIS) transponders or broadcast spoofed positioning beacons before commencing clandestine bilge flushing or tank washing in international waters, creating forensic void intervals.",
      metric: "14.8 HRS",
      metricLabel: "MEDIAN AIS VOID WINDOW IN DETECTED DISCHARGES"
    },
    {
      id: "judicial",
      code: "03 // JUDICIAL REJECTION",
      title: "The Judicial Proof Deficit",
      headline: "Satellite snapshots are legally inadmissible without causality.",
      body: "Under MARPOL Annex I and international admiralty law, showing an oil slick and showing a ship hours apart does not meet the burden of legal proof. Without physically unbroken trajectory reconstruction, polluters evade liability 99% of the time.",
      metric: "99.2%",
      metricLabel: "HISTORIC PROSECUTION FAILURE RATE WITHOUT FORENSICS"
    }
  ];

  const solutionLayers = [
    {
      id: "sar",
      tag: "LAYER 01 // ORBITAL INGESTION",
      title: "Spaceborne SAR & Multi-Spectral Polarimetry",
      desc: "Synthetic Aperture Radar transmits electromagnetic pulses and measures backscatter damping caused by surface oil films smoothing out capillary waves. Dual-polarization VV/VH ratio mapping isolates petroleum hydrocarbons from organic biogenic slicks.",
      specs: ["SENTINEL-1A/B C-BAND", "VV / VH POLARIZATION", "10-METER SPATIAL RESOLUTION", "CLOUDFREE NIGHT ACQUISITION"]
    },
    {
      id: "lagrangian",
      tag: "LAYER 02 // HYDRODYNAMICS",
      title: "Lagrangian Reverse Hydrodynamic Engine",
      desc: "Simulates 10,000 virtual particles backwards through time using 4th-order Runge-Kutta numerical integration. Ingests HYCOM ocean currents, Copernicus marine data, and ERA5 atmospheric 10m wind drag vectors to reconstruct the exact discharge polygon and timestamp window.",
      specs: ["RUNGE-KUTTA 4TH ORDER", "HYCOM 1/12° OCEAN CURRENTS", "ERA5 WIND DRAG (3.1% LEIWAY)", "MONTE CARLO ERROR BOUNDS"]
    },
    {
      id: "deadreckon",
      tag: "LAYER 03 // TRAJECTORY RECONSTRUCTION",
      title: "Dark Vessel Dead-Reckoning & AIS Kinematics",
      desc: "Interprets vessel historical voyages through terrestrial and satellite AIS data. When a vessel enters a blackout void, Kalman filter trajectory extrapolation determines probable passage vectors, cross-referencing speed anomalies, course alterations, and draft variations.",
      specs: ["KALMAN FILTER SMOOTHING", "TERRESTRIAL + SATELLITE AIS", "SPEED DELTA ANOMALY RADAR", "DRAFT DISPLACEMENT AUDIT"]
    },
    {
      id: "evidence",
      tag: "LAYER 04 // DEFENCIBLE EVIDENCE",
      title: "Cryptographic Evidence Sealing & MARPOL Dossier",
      desc: "Transforms raw satellite telemetry, hydrodynamic velocity fields, and kinematic correlation matrices into an immutable courtroom-ready dossier. Every data granule is timestamped and sealed with SHA-256 cryptographic hashes for admissibility in maritime tribunals.",
      specs: ["SHA-256 IMMUTABLE AUDIT", "MARPOL ANNEX I COMPLIANT", "COURTROOM ADMISSIBLE PDF", "JURISDICTIONAL ADMIRALTY DOSSIER"]
    }
  ];

  const outputStages = [
    { name: "FORENSIC RECONSTRUCTION", status: "PHASE 01", detail: "Multi-sensor synchronization complete" },
    { name: "ORIGIN WINDOW ESTABLISHED", status: "PHASE 02", detail: "Lagrangian boundary: T-18.4H" },
    { name: "VESSEL ATTRIBUTION", status: "PHASE 03", detail: "MMSI 538009214 intercepted" },
    { name: "DEFENSIBLE EVIDENCE", status: "COMPLETED", detail: "Chain of custody sealed" }
  ];

  const globeScale = Math.max(0.75, 1 - scrollY * 0.0006);
  const globeOpacity = Math.max(0.35, 1 - scrollY * 0.0012);

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#04070D] text-white selection:bg-white selection:text-black relative font-sans flex flex-col">
      {loading && (
        <Loader onComplete={() => setLoading(false)} />
      )}

      <div
        style={{
          visibility: loading ? "hidden" : "visible",
          opacity: loading ? 0 : 1,
          transition: "opacity 0.6s ease"
        }}
        className="w-full flex-1 flex flex-col"
      >
        <FullPage3DBackground />

        <div className="fixed inset-0 bg-grid-subtle pointer-events-none opacity-25 z-0" />

      <div 
        className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-0 pointer-events-none hidden xl:flex flex-col items-center gap-6 font-mono text-[9px] text-cyan-500/40 tracking-[0.25em]"
        style={{
          transform: `translateY(${-scrollY * 0.08}px)`
        }}
      >
        <span className="rotate-90 origin-center whitespace-nowrap">{"GRID // LAT 24°38'N"}</span>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
        <span className="text-[8px] text-slate-500">Z-{Math.round(scrollY * 0.4)}M</span>
      </div>

      <div 
        className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-0 pointer-events-none hidden xl:flex flex-col items-center gap-6 font-mono text-[9px] text-cyan-500/40 tracking-[0.25em]"
        style={{
          transform: `translateY(${scrollY * 0.08}px)`
        }}
      >
        <span className="-rotate-90 origin-center whitespace-nowrap">{"LON 54°19'E // ORBIT"}</span>
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
        <span className="text-[8px] text-emerald-500/50">{"SYS // SYNC"}</span>
      </div>

      <Navbar />

      <section className="relative w-full h-screen min-h-[700px] flex flex-col justify-between overflow-hidden z-10">
        
        <div 
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto z-10 pt-20 transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${globeScale}) translateY(${scrollY * 0.15}px)`,
            opacity: globeOpacity
          }}
        >
          <Globe />
        </div>

        <div className="relative w-full h-full pt-20 px-6 sm:px-10 lg:px-12 xl:px-16 flex flex-col justify-between pointer-events-none z-20">
          <div className="w-full flex items-start justify-between pt-6 sm:pt-10 lg:pt-12">
            
            <div className="w-full lg:w-[44%] xl:w-[40%] flex flex-col justify-start items-start pointer-events-auto select-text">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                AUTONOMOUS MARITIME FORENSICS
              </div>

              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.8rem] tracking-tight text-white leading-[1.08] mb-5 uppercase">
                From satellite signals<br />
                <span className="text-slate-400 font-normal normal-case">
                  to maritime accountability.
                </span>
              </h1>

              <p className="font-sans text-slate-300 text-sm sm:text-base lg:text-[1.05rem] leading-relaxed font-normal max-w-md">
                V.A.R.U.N.A detects oil spills, traces their origin, correlates vessel activity, and transforms geospatial intelligence into defensible evidence.
              </p>
            </div>

            <Slide3D direction="right" delay={150} className="hidden lg:block w-[320px] lg:w-[360px] xl:w-[380px] pointer-events-auto select-none">
              <TiltCard className="bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 shadow-sm">
                
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-3">
                  <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                    FORENSIC PIPELINE
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                    6 PHASES
                  </span>
                </div>

                <div className="space-y-1">
                  {steps.map((step, idx) => (
                    <React.Fragment key={step.num}>
                      <div 
                        onMouseEnter={() => setActivePhaseIndex(idx)}
                        className={`flex flex-col px-2.5 py-1.5 rounded transition-all duration-200 cursor-pointer ${
                          activePhaseIndex === idx 
                            ? "bg-white/[0.06] border-l-2 border-sky-400 pl-3" 
                            : "hover:bg-white/[0.03] border-l-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-400">{step.num}</span>
                            <span className="font-mono text-xs font-semibold text-white tracking-wider">{step.name}</span>
                          </div>
                          {activePhaseIndex === idx && (
                            <span className="font-mono text-[8px] text-sky-400 uppercase tracking-widest px-1 py-0.2 rounded bg-sky-950/60 border border-sky-500/30">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-slate-400 leading-snug pl-6 mt-0.5">
                          {step.desc}
                        </p>
                      </div>

                      {idx < steps.length - 1 && (
                        <div className="flex items-center pl-6 py-0.5">
                          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.08] font-mono text-[10px] flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5 text-sky-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                    {steps[activePhaseIndex].name}
                  </span>
                  <span className="text-[9px] text-slate-500 truncate max-w-[190px]">
                    {steps[activePhaseIndex].telemetry}
                  </span>
                </div>

              </TiltCard>
            </Slide3D>

          </div>

          <div className="w-full flex items-end justify-between pb-6 sm:pb-8 lg:pb-10">
            
            <Slide3D direction="left" delay={250} className="w-full lg:w-auto flex flex-col justify-end items-start pointer-events-auto select-none">
              <TiltCard className="bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col space-y-2.5 min-w-[260px] sm:min-w-[280px]">
                
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                    SYSTEM STATUS
                  </span>
                  <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                    LIVE
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] sm:text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      SATELLITE INGESTION
                    </span>
                    <span className="text-emerald-400 font-medium">ONLINE</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      ML DETECTION
                    </span>
                    <span className="text-slate-300 font-medium">ACTIVE</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      OCEAN DRIFT ENGINE
                    </span>
                    <span className="text-slate-300 font-medium">READY</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      AIS CORRELATION
                    </span>
                    <span className="text-slate-300 font-medium">ACTIVE</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      EVIDENCE CHAIN
                    </span>
                    <span className="text-slate-300 font-medium">SECURED</span>
                  </div>
                </div>

              </TiltCard>
            </Slide3D>

          </div>

        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none opacity-40">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-400 mb-1">SCROLL</span>
          <svg className="w-3.5 h-3.5 text-slate-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-10 lg:bottom-10 lg:right-12 z-40">
        <button
          onClick={handleGetStarted}
          className="group relative inline-flex items-center justify-center gap-3.5 px-10 py-4 sm:px-12 sm:py-4.5 lg:px-14 lg:py-5 rounded-full font-semibold text-sm sm:text-base lg:text-lg tracking-wider uppercase font-mono text-black bg-white border border-white overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
        >
          <span className="absolute inset-0 bg-[#04070D] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out pointer-events-none" />
          
          <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-300 font-bold">
            Get Started
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-white text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>
      </div>

      <section id="problem" className="relative w-full min-h-screen py-24 sm:py-32 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto flex flex-col justify-between z-20">
        
        <Slide3D direction="up">
          <div className="w-full flex items-center justify-between border-b border-white/[0.08] pb-4 mb-10">
            <span className="font-mono text-xs font-semibold tracking-[0.25em] text-slate-300 uppercase">
              {"MARITIME POLLUTION FORENSICS // THE ATTRIBUTION CRISIS"}
            </span>
            <span className="font-mono text-xs text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
              HIGH SEAS IMPUNITY
            </span>
          </div>
        </Slide3D>

        <Slide3D direction="up" delay={80}>
          <div className="max-w-5xl mb-12 lg:mb-16">
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] uppercase mb-4">
              WE CAN SEE THE SPILL.<br />
              <span className="text-slate-400 font-normal">
                BUT CAN WE PROVE WHO CAUSED IT?
              </span>
            </h2>
            <p className="font-sans text-slate-300 text-sm sm:text-base lg:text-lg max-w-3xl leading-relaxed">
              Every year, commercial vessels illegally dump millions of metric tons of oily bilge residue and slops into international waters. Despite thousands of satellite detections, fewer than 1% ever result in prosecution.
            </p>
          </div>
        </Slide3D>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {problemPillars.map((pillar, idx) => (
            <Slide3D 
              key={pillar.id}
              direction={idx === 0 ? "left" : idx === 1 ? "up" : "right"}
              delay={idx * 120}
              className="h-full"
            >
              <TiltCard 
                className={`h-full bg-[#070c14]/90 backdrop-blur-md border rounded-xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  activeProblemTab === idx ? "border-cyan-400/50 shadow-cyan-glow" : "border-white/[0.08]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4 font-mono text-xs">
                    <span className="text-cyan-400 font-semibold">{pillar.code}</span>
                    <span className="text-slate-500">CRITICAL FAILURE</span>
                  </div>

                  <h3 className="font-display font-bold text-lg sm:text-xl text-white uppercase tracking-tight mb-2">
                    {pillar.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
                    {pillar.body}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.08] font-mono">
                  <span className="text-2xl sm:text-3xl font-black text-rose-400 block tracking-tight">
                    {pillar.metric}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block mt-1">
                    {pillar.metricLabel}
                  </span>
                </div>
              </TiltCard>
            </Slide3D>
          ))}
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-12">
          
          <Slide3D direction="left" delay={50} className="lg:col-span-4 h-full">
            <TiltCard className="h-full bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-6">
                  <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-200 uppercase">
                    WHAT WE KNOW
                  </span>
                  <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                    OBSERVABLE
                  </span>
                </div>

                <ul className="space-y-4 font-mono">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Slick</span>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">SAR radar anomaly & surface reflection detected by satellites.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Location</span>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">Slick polygon geometry & bounding coordinates recorded at pass.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                    <div>
                      <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Detection Time</span>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">Exact observation timestamp logged with orbital coordinates (UTC).</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.08] font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>SATELLITE TRUTH</span>
                <span>100% VERIFIED</span>
              </div>
            </TiltCard>
          </Slide3D>

          <Slide3D direction="up" delay={150} className="lg:col-span-4 h-full">
            <TiltCard className="h-full bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              
              <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                  OCEAN MAP
                </span>
                <span className="font-mono text-[9px] text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded bg-sky-950/40 border border-sky-500/30 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping"></span>
                  LIVE RADAR
                </span>
              </div>

              <div className="relative z-10 my-auto py-3 flex flex-col items-center">
                <svg viewBox="0 0 340 220" className="w-full h-auto overflow-visible">
                  
                  <g className="radar-sweep-cone opacity-25">
                    <path d="M 170,110 L 290,30 A 150 150 0 0 1 310,110 Z" fill="url(#radarSweepGrad)" />
                  </g>

                  <defs>
                    <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <path d="M 20,40 Q 50,32 80,40 T 140,40 T 200,40 T 260,40 T 320,40" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />
                  <path d="M 10,75 Q 40,67 70,75 T 130,75 T 190,75 T 250,75 T 310,75" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />
                  <path d="M 30,150 Q 60,142 90,150 T 150,150 T 210,150 T 270,150 T 330,150" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />
                  <path d="M 15,185 Q 45,177 75,185 T 135,185 T 195,185 T 255,185 T 315,185" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />

                  <g className="pulse-wave">
                    <path
                      d="M 195,55 C 235,48 285,62 275,85 C 265,108 215,115 180,105 C 145,95 155,62 195,55 Z"
                      fill="#1e293b"
                      stroke="#64748b"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    <text x="220" y="84" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
                      ~ OIL SLICK ~
                    </text>
                    <text x="220" y="96" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">
                      AREA: 4.8 SQ KM
                    </text>
                  </g>

                  <g stroke="#94a3b8" strokeWidth="1.2" fill="none">
                    <path d="M 95,120 Q 135,105 170,90" strokeDasharray="3 3" />
                    <polygon points="172,89 164,88 168,95" fill="#94a3b8" />
                    
                    <text x="135" y="132" fill="#94a3b8" fontSize="7" fontFamily="monospace">
                      DRIFT VECTOR
                    </text>
                  </g>

                  <g>
                    <path id="vesselTrack" d="M 30,195 Q 55,160 85,130" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                    <text x="45" y="175" fill="#94a3b8" fontSize="7.5" fontFamily="monospace" transform="rotate(-40 45,175)">
                      · · · AIS SIGNAL · · ·
                    </text>

                    <circle r="4" fill="#38bdf8">
                      <animateMotion dur="4.5s" repeatCount="indefinite" path="M 30,195 Q 55,160 85,130" />
                    </circle>

                    <circle cx="85" cy="130" r="4" fill="#f43f5e" />
                    
                    <line x1="80" y1="125" x2="90" y2="135" stroke="#ffffff" strokeWidth="1.8" />
                    <line x1="90" y1="125" x2="80" y2="135" stroke="#ffffff" strokeWidth="1.8" />

                    <rect x="75" y="148" width="105" height="24" rx="4" fill="#070c14" stroke="#f43f5e" strokeWidth="1" opacity="0.9" />
                    <text x="127" y="163" textAnchor="middle" fill="#f43f5e" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                      ✕ AIS SIGNAL LOST
                    </text>
                  </g>
                </svg>
              </div>

              <div className="relative z-10 pt-3 border-t border-white/[0.08] font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>DRIFT: 1.8 KTS (240° SW)</span>
                <span>GAP: 14.8 NM</span>
              </div>
            </TiltCard>
          </Slide3D>

          <Slide3D direction="right" delay={250} className="lg:col-span-4 h-full">
            <TiltCard className="h-full bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-6">
                  <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-200 uppercase">
                    {"WHAT'S MISSING"}
                  </span>
                  <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                    THE GAP
                  </span>
                </div>

                <ul className="space-y-4 font-mono">
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold text-xs sm:text-sm flex-shrink-0">?</span>
                    <div>
                      <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Origin</span>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">True discharge coordinates before hours of ocean drift.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold text-xs sm:text-sm flex-shrink-0">?</span>
                    <div>
                      <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Vessel</span>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">Identity of dark ship that disabled AIS transponder.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold text-xs sm:text-sm flex-shrink-0">?</span>
                    <div>
                      <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Timeline</span>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">Exact discharge window hours or days prior.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-400 font-bold text-xs sm:text-sm flex-shrink-0">?</span>
                    <div>
                      <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Proof</span>
                      <p className="font-sans text-xs text-slate-400 mt-0.5">Legally defensible reconstruction connecting ship to spill.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.08] font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>LEGAL STATUS</span>
                <span>INSUFFICIENT PROOF</span>
              </div>
            </TiltCard>
          </Slide3D>

        </div>

        <Slide3D direction="up" delay={100} className="w-full pt-2">
          <TiltCard className="bg-[#070c14]/90 border border-white/[0.08] rounded-xl p-6 sm:p-7 shadow-sm flex flex-col items-center">
            
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2 relative py-3">
              <div className="flex items-center gap-3 z-10 bg-[#070c14] pr-0 sm:pr-4 w-full sm:w-auto justify-center sm:justify-start">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
                <div className="flex flex-col">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-white tracking-wider uppercase">DETECTION</span>
                  <span className="font-mono text-[10px] text-slate-400">Satellite SAR Imagery</span>
                </div>
              </div>

              <div className="hidden sm:flex absolute inset-0 items-center pointer-events-none px-8 sm:px-16">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/40 via-white/20 to-slate-600"></div>
              </div>

              <div className="flex flex-col items-center z-10 bg-[#070c14] px-4 py-1">
                <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-slate-300 font-mono font-bold text-xs shadow-sm">
                  ✕
                </div>
                <span className="font-mono text-[10px] text-slate-400 tracking-wider uppercase mt-1">
                  ATTRIBUTION GAP
                </span>
              </div>

              <div className="flex items-center gap-3 z-10 bg-[#070c14] pl-0 sm:pl-4 w-full sm:w-auto justify-center sm:justify-end">
                <div className="flex flex-col text-center sm:text-right">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-white tracking-wider uppercase">ATTRIBUTION</span>
                  <span className="font-mono text-[10px] text-slate-400">Forensic Liability</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              </div>
            </div>

            <p className="font-sans text-xs sm:text-sm text-slate-400 text-center max-w-2xl mt-4 leading-relaxed">
              Satellite imagery alone cannot prove liability. <span className="text-white font-medium">V.A.R.U.N.A</span> reconstructs the missing physical links using Lagrangian ocean-current hindcasting, dark vessel dead-reckoning, and multi-variable behavioral correlation.
            </p>

          </TiltCard>
        </Slide3D>

        <LagrangianDriftSimulator />

      </section>

      <section
        id="solution"
        ref={solutionRef}
        className="relative w-full min-h-screen py-24 sm:py-32 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto flex flex-col justify-between z-20"
      >
        <Slide3D direction="up">
          <div className="w-full flex items-center justify-between border-b border-white/[0.08] pb-4 mb-10">
            <span className="font-mono text-xs font-semibold tracking-[0.25em] text-slate-300 uppercase">
              {"UNIFIED MARITIME INTELLIGENCE // FORENSIC ATTRIBUTION ENGINE"}
            </span>
            <span className="font-mono text-xs text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              ACTIVE CONSTELLATION
            </span>
          </div>
        </Slide3D>

        <Slide3D direction="up" delay={80}>
          <div className="max-w-4xl mb-12 lg:mb-16">
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white tracking-tight leading-[1.08] uppercase mb-6">
              CONNECTING THE SIGNALS.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-300">
                REVEALING THE SOURCE.
              </span>
            </h2>
            <p className="font-sans text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl font-normal">
              V.A.R.U.N.A unifies satellite imagery, ocean dynamics, vessel intelligence, and forensic analysis into a single system for evidence-based maritime attribution.
            </p>
          </div>
        </Slide3D>

        <div className="relative w-full my-6 sm:my-10 flex flex-col items-center">
          
          <div className="relative w-full max-w-[1100px] lg:min-h-[660px] flex flex-col items-center justify-center">
            
            <svg
              viewBox="0 0 1000 600"
              className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            >
              <defs>
                <linearGradient id="orbitLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              <circle cx="500" cy="280" r="140" fill="none" stroke="rgba(56,189,248,0.06)" strokeWidth="1" strokeDasharray="3 6" />
              <circle cx="500" cy="280" r="220" fill="none" stroke="rgba(56,189,248,0.04)" strokeWidth="1" />
              <circle cx="500" cy="280" r="300" fill="none" stroke="rgba(56,189,248,0.03)" strokeWidth="1" strokeDasharray="4 8" />

              <path
                id="curve1"
                d="M 180,110 C 290,110 390,200 450,250"
                fill="none"
                stroke={hoveredNode === 1 ? "#38bdf8" : "rgba(56, 189, 248, 0.25)"}
                strokeWidth={hoveredNode === 1 ? "2.4" : "1.2"}
                strokeDasharray={hoveredNode === 1 ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle r="4" fill="#38bdf8" opacity={solutionActive ? "1" : "0"}>
                <animateMotion path="M 180,110 C 290,110 390,200 450,250" dur="3.4s" repeatCount="indefinite" />
              </circle>

              <path
                id="curve2"
                d="M 820,110 C 710,110 610,200 550,250"
                fill="none"
                stroke={hoveredNode === 2 ? "#38bdf8" : "rgba(56, 189, 248, 0.25)"}
                strokeWidth={hoveredNode === 2 ? "2.4" : "1.2"}
                strokeDasharray={hoveredNode === 2 ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle r="4" fill="#38bdf8" opacity={solutionActive ? "1" : "0"}>
                <animateMotion path="M 820,110 C 710,110 610,200 550,250" dur="3.6s" begin="0.8s" repeatCount="indefinite" />
              </circle>

              <path
                id="curve3"
                d="M 180,450 C 290,450 390,360 450,310"
                fill="none"
                stroke={hoveredNode === 3 ? "#38bdf8" : "rgba(56, 189, 248, 0.25)"}
                strokeWidth={hoveredNode === 3 ? "2.4" : "1.2"}
                strokeDasharray={hoveredNode === 3 ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle r="4" fill="#38bdf8" opacity={solutionActive ? "1" : "0"}>
                <animateMotion path="M 180,450 C 290,450 390,360 450,310" dur="4s" begin="1.4s" repeatCount="indefinite" />
              </circle>

              <path
                id="curve4"
                d="M 820,450 C 710,450 610,360 550,310"
                fill="none"
                stroke={hoveredNode === 4 ? "#38bdf8" : "rgba(56, 189, 248, 0.25)"}
                strokeWidth={hoveredNode === 4 ? "2.4" : "1.2"}
                strokeDasharray={hoveredNode === 4 ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle r="4" fill="#38bdf8" opacity={solutionActive ? "1" : "0"}>
                <animateMotion path="M 820,450 C 710,450 610,360 550,310" dur="3.8s" begin="2s" repeatCount="indefinite" />
              </circle>
            </svg>

            <Slide3D
              direction="left"
              delay={100}
              className="hidden lg:block absolute top-2 left-2 sm:top-6 sm:left-6 lg:top-8 lg:left-8 z-30 w-[240px] sm:w-[270px]"
            >
              <div
                onMouseEnter={() => setHoveredNode(1)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <TiltCard
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    hoveredNode === 1
                      ? "bg-[#0b1322] border-cyan-400 shadow-cyan-glow scale-[1.03]"
                      : "bg-[#070c14]/90 border-white/[0.08] hover:border-white/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">01</span>
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      DETECTION
                    </span>
                  </div>
                  <h4 className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
                    SATELLITE IMAGERY
                  </h4>
                  <p className="font-sans text-xs text-slate-400 mt-1 leading-snug">
                    Identifies suspected oil slicks from Earth observation data.
                  </p>
                </TiltCard>
              </div>
            </Slide3D>

            <Slide3D
              direction="right"
              delay={150}
              className="hidden lg:block absolute top-2 right-2 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-30 w-[240px] sm:w-[270px]"
            >
              <div
                onMouseEnter={() => setHoveredNode(2)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <TiltCard
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    hoveredNode === 2
                      ? "bg-[#0b1322] border-cyan-400 shadow-cyan-glow scale-[1.03]"
                      : "bg-[#070c14]/90 border-white/[0.08] hover:border-white/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">02</span>
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      HINDCASTING
                    </span>
                  </div>
                  <h4 className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
                    OCEAN DYNAMICS
                  </h4>
                  <p className="font-sans text-xs text-slate-400 mt-1 leading-snug">
                    Reconstructs drift to estimate the possible origin window.
                  </p>
                </TiltCard>
              </div>
            </Slide3D>

            <Slide3D
              direction="left"
              delay={200}
              className="hidden lg:block absolute bottom-2 left-2 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 z-30 w-[240px] sm:w-[270px]"
            >
              <div
                onMouseEnter={() => setHoveredNode(3)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <TiltCard
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    hoveredNode === 3
                      ? "bg-[#0b1322] border-cyan-400 shadow-cyan-glow scale-[1.03]"
                      : "bg-[#070c14]/90 border-white/[0.08] hover:border-white/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">03</span>
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      AIS CORRELATION
                    </span>
                  </div>
                  <h4 className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
                    VESSEL INTELLIGENCE
                  </h4>
                  <p className="font-sans text-xs text-slate-400 mt-1 leading-snug">
                    Correlates historical vessel movement with the reconstructed event.
                  </p>
                </TiltCard>
              </div>
            </Slide3D>

            <Slide3D
              direction="right"
              delay={250}
              className="hidden lg:block absolute bottom-2 right-2 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-30 w-[240px] sm:w-[270px]"
            >
              <div
                onMouseEnter={() => setHoveredNode(4)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <TiltCard
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    hoveredNode === 4
                      ? "bg-[#0b1322] border-cyan-400 shadow-cyan-glow scale-[1.03]"
                      : "bg-[#070c14]/90 border-white/[0.08] hover:border-white/20 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">04</span>
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      ANOMALY DETECTION
                    </span>
                  </div>
                  <h4 className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
                    BEHAVIOURAL ANALYSIS
                  </h4>
                  <p className="font-sans text-xs text-slate-400 mt-1 leading-snug">
                    Evaluates movement anomalies and AIS signal gaps.
                  </p>
                </TiltCard>
              </div>
            </Slide3D>

            <div className="relative z-20 flex flex-col items-center justify-center p-6 card-3d-wrap">
              
              <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-dashed border-cyan-500/30 gyro-3d-ring-1 pointer-events-none" />
              
              <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-white/[0.08] gyro-3d-ring-2 pointer-events-none" />

              <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-[#050b14]/95 border border-cyan-500/40 p-4 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(6,182,212,0.18)] select-none depth-layer-front">
                
                <div className="absolute inset-2 rounded-full border border-white/[0.06] pointer-events-none" />
                
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] mb-2 animate-pulse"></span>

                {hoveredNode === null && (
                  <div className="flex flex-col items-center">
                    <h3 className="font-mono font-bold text-sm sm:text-base tracking-[0.22em] text-white uppercase">
                      V.A.R.U.N.A
                    </h3>
                    <span className="font-mono text-[9px] sm:text-[9.5px] text-cyan-300/90 tracking-wider uppercase mt-1 leading-tight font-medium">
                      FORENSIC INTELLIGENCE ENGINE
                    </span>
                    <span className="mt-2 text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                      CORRELATING
                    </span>
                  </div>
                )}

                {hoveredNode === 1 && (
                  <div className="flex flex-col items-center animate-fadeIn">
                    <span className="font-mono text-[8.5px] text-cyan-300 uppercase tracking-wider font-bold">
                      SAR WAVE MATRIX
                    </span>
                    <div className="flex items-center gap-1 my-1.5 h-6">
                      <span className="w-1 bg-cyan-400 h-3 animate-pulse"></span>
                      <span className="w-1 bg-cyan-400 h-5 animate-pulse" style={{ animationDelay: '100ms' }}></span>
                      <span className="w-1 bg-cyan-400 h-2 animate-pulse" style={{ animationDelay: '200ms' }}></span>
                      <span className="w-1 bg-cyan-400 h-6 animate-pulse" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 bg-cyan-400 h-4 animate-pulse" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-300">CONFIDENCE: 99.4%</span>
                    <span className="text-[7.5px] font-mono text-emerald-400 mt-0.5">RESOLUTION: 10M/PX</span>
                  </div>
                )}

                {hoveredNode === 2 && (
                  <div className="flex flex-col items-center animate-fadeIn">
                    <span className="font-mono text-[8.5px] text-cyan-300 uppercase tracking-wider font-bold">
                      OCEAN VECTOR STREAM
                    </span>
                    <div className="flex items-center gap-1 my-1 text-mint-accent text-xs font-mono">
                      <span>1.84 KTS</span>
                      <span>·</span>
                      <span>225° SW</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-300">RUNGE-KUTTA 4TH</span>
                    <span className="text-[7.5px] font-mono text-emerald-400 mt-0.5">ORIGIN: T - 18.4H</span>
                  </div>
                )}

                {hoveredNode === 3 && (
                  <div className="flex flex-col items-center animate-fadeIn">
                    <span className="font-mono text-[8.5px] text-cyan-300 uppercase tracking-wider font-bold">
                      AIS TRAJECTORY MESH
                    </span>
                    <span className="font-mono text-[9px] text-white font-bold my-1">
                      MMSI 538009214
                    </span>
                    <span className="text-[8px] font-mono text-slate-300">INTERCEPT: 0.82 NM</span>
                    <span className="text-[7.5px] font-mono text-amber-400 mt-0.5">GAP: 14.8 HRS</span>
                  </div>
                )}

                {hoveredNode === 4 && (
                  <div className="flex flex-col items-center animate-fadeIn">
                    <span className="font-mono text-[8.5px] text-cyan-300 uppercase tracking-wider font-bold">
                      NEURAL ANOMALY SCORE
                    </span>
                    <span className="font-mono text-sm text-alert-accent font-bold my-1">
                      94.8%
                    </span>
                    <span className="text-[8px] font-mono text-slate-300">SPEED DELTA: -4.2 KTS</span>
                    <span className="text-[7.5px] font-mono text-rose-400 mt-0.5">STATUS: HIGH PROBABILITY</span>
                  </div>
                )}

              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl mx-auto mt-8 lg:hidden z-30">
              {constellationNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setHoveredNode(node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  className="cursor-pointer"
                >
                  <TiltCard
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      hoveredNode === node.id
                        ? "bg-[#0b1322] border-cyan-400 shadow-cyan-glow scale-[1.02]"
                        : "bg-[#070c14]/90 border-white/[0.08] hover:border-white/20 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 mb-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{node.code}</span>
                      <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                        {node.tag}
                      </span>
                    </div>
                    <h4 className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
                      {node.title}
                    </h4>
                    <p className="font-sans text-xs text-slate-400 mt-1 leading-snug">
                      {node.desc}
                    </p>
                  </TiltCard>
                </div>
              ))}
            </div>

          </div>

          <Slide3D direction="up" delay={140} className="w-full max-w-md mt-6 flex flex-col items-center z-20">
            <div className="w-px h-8 bg-gradient-to-b from-cyan-500/40 to-white/10" />

            <TiltCard className="w-full bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-3">
                <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                  SYSTEM OUTPUT PIPELINE
                </span>
                <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                  DEFENSIBLE EVIDENCE
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {outputStages.map((stage, idx) => (
                  <React.Fragment key={stage.name}>
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                      <span className="flex items-center gap-2 text-slate-300 font-semibold tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        {stage.name}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stage.status}</span>
                    </div>
                    {idx < outputStages.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </TiltCard>
          </Slide3D>

        </div>

        <div className="w-full my-16 sm:my-24">
          <Slide3D direction="up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 mb-8 gap-2">
              <span className="font-mono text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] text-cyan-400 uppercase">
                {"TECHNICAL ARCHITECTURE // THE 4 SOLUTION LAYERS"}
              </span>
              <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                END-TO-END METHODOLOGY
              </span>
            </div>
          </Slide3D>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {solutionLayers.map((layer, idx) => (
              <Slide3D 
                key={layer.id} 
                direction={idx % 2 === 0 ? "left" : "right"} 
                delay={(idx % 2) * 120 + Math.floor(idx / 2) * 80}
                className="h-full"
              >
                <TiltCard 
                  className={`h-full bg-[#070c14]/90 backdrop-blur-md border rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-glow ${
                    activeSolutionLayer === idx ? "border-cyan-400/40" : "border-white/[0.08]"
                  }`}
                  onMouseEnter={() => setActiveSolutionLayer(idx)}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-5 font-mono text-xs">
                      <span className="text-cyan-400 font-bold tracking-widest">{layer.tag}</span>
                      <span className="text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[9px] font-bold">
                        VERIFIED
                      </span>
                    </div>

                    <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight mb-3">
                      {layer.title}
                    </h3>

                    <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
                      {layer.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.08]">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-semibold">
                      TECHNICAL SPECIFICATIONS
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
                      {layer.specs.map(spec => (
                        <div key={spec} className="p-2 rounded bg-white/[0.02] border border-white/[0.04] text-slate-300 flex items-start gap-1.5 min-w-0">
                          <span className="w-1 h-1 rounded-full bg-cyan-400 mt-1 flex-shrink-0"></span>
                          <span className="text-[9px] sm:text-[10px] break-words leading-tight">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </Slide3D>
            ))}
          </div>

          <ForensicInspectorTerminal />
        </div>

        <Slide3D direction="up" delay={80} className="w-full mt-14 sm:mt-18 pt-10 sm:pt-14 border-t border-white/[0.08] flex flex-col items-center text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400 mb-5">
            THE ATTRIBUTION PARADIGM
          </span>
          
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto w-full px-4 overflow-hidden">
            <h3 className="font-display font-bold text-lg sm:text-2xl md:text-3xl lg:text-4xl text-slate-400 uppercase tracking-tight leading-tight">
              NOT ANOTHER DETECTION TOOL.
            </h3>
            
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-400 uppercase tracking-tight leading-[1.08] break-words">
              AN ENGINE FOR<br className="hidden sm:inline" /> ATTRIBUTION.
            </h2>
          </div>

          <p className="font-sans text-xs sm:text-sm text-slate-400 mt-6 max-w-xl leading-relaxed px-4">
            From raw satellite signals to evidence-based maritime accountability.
          </p>
        </Slide3D>

      </section>

      <section
        ref={finalRef}
        className="relative w-full pt-10 sm:pt-16 pb-0 min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] flex flex-col justify-end items-center overflow-hidden bg-[#04070D] select-none z-20"
      >
        <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-20" />

        <div className="relative w-full flex justify-center items-end overflow-hidden px-4 mb-4 sm:mb-6">
          <h1
            className={`font-display font-black text-[7.5vw] sm:text-[8.5vw] md:text-[9.2vw] lg:text-[9.8vw] tracking-normal sm:tracking-wider leading-none text-[#e2e8f0]/90 uppercase select-none transition-all duration-[1000ms] ease-out pointer-events-none whitespace-nowrap text-center max-w-full overflow-hidden ${
              finalActive
                ? "translate-y-0 opacity-100"
                : "translate-y-[45%] opacity-30"
            }`}
            style={{
              fontFeatureSettings: '"salt" on, "ss01" on',
              textRendering: "optimizeLegibility"
            }}
          >
            V.A.R.U.N.A
          </h1>
        </div>

        <footer className="w-full border-t border-white/[0.08] bg-[#04070D]/90 backdrop-blur-sm py-6 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-500 z-10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-widest uppercase">V.A.R.U.N.A</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">MARITIME FORENSIC ATTRIBUTION ENGINE</span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <a href="dashboard.html" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              FORENSIC DASHBOARD
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">MARPOL ANNEX I COMPLIANT</span>
          </div>
        </footer>
      </section>

      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
