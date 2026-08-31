const { useEffect, useRef } = React;

function Globe() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2000);
    camera.position.set(0, 0, 360);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    globeGroup.rotation.x = 0.32;
    globeGroup.rotation.y = 3.85;

    const ambientLight = new THREE.AmbientLight(0x0a1628, 2.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.9);
    sunLight.position.set(500, 280, 450);
    scene.add(sunLight);

    const sideLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sideLight.position.set(-500, -200, -300);
    scene.add(sideLight);

    function generateEarthCanvas() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      oceanGrad.addColorStop(0, '#040d1a');
      oceanGrad.addColorStop(0.5, '#071b34');
      oceanGrad.addColorStop(1, '#030a14');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#bfa57d';
      
      const continentPolygons = [
        [[950, 350], [1250, 360], [1320, 520], [1260, 780], [1100, 830], [960, 580], [920, 420]],
        [[980, 160], [1220, 150], [1280, 260], [1100, 330], [960, 270]],
        [[1200, 140], [1750, 120], [1850, 320], [1680, 440], [1520, 500], [1380, 410], [1260, 350]],
        [[1340, 390], [1440, 410], [1400, 550], [1350, 530], [1320, 430]],
        [[1540, 520], [1700, 530], [1720, 680], [1620, 780], [1500, 720]],
        [[1560, 620], [1780, 620], [1800, 760], [1680, 880], [1520, 840]],
        [[180, 120], [480, 120], [540, 240], [740, 260], [800, 350], [750, 440], [460, 440], [300, 340]],
        [[420, 440], [560, 470], [670, 640], [640, 820], [510, 930], [420, 820], [360, 580]],
        [[960, 140], [1060, 110], [1100, 200], [980, 230]]
      ];

      continentPolygons.forEach(poly => {
        ctx.beginPath();
        ctx.moveTo(poly[0][0], poly[0][1]);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i][0], poly[i][1]);
        }
        ctx.closePath();
        ctx.fill();
      });

      ctx.fillStyle = '#6b8061';
      for (let i = 0; i < 700; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 12 + 2, 0, Math.PI * 2);
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    }

    const radius = 96;
    const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
    
    const earthMat = new THREE.MeshStandardMaterial({
      roughness: 0.65,
      metalness: 0.15,
      map: generateEarthCanvas()
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      (tex) => {
        earthMat.map = tex;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    const cloudGeo = new THREE.SphereGeometry(radius * 1.015, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
      (cloudTex) => {
        cloudMat.map = cloudTex;
        cloudMat.opacity = 0.45;
        cloudMat.needsUpdate = true;
      }
    );

    const orbitsGroup = new THREE.Group();
    scene.add(orbitsGroup);

    const orbitConfigs = [
      { r: radius * 1.34, rotX: 1.15, rotY: 0.35, rotZ: 0.25, opacity: 0.55 },
      { r: radius * 1.48, rotX: -0.75, rotY: 0.65, rotZ: -0.45, opacity: 0.45 },
      { r: radius * 1.62, rotX: 0.30, rotY: 1.25, rotZ: 0.85, opacity: 0.35 },
      { r: radius * 1.24, rotX: -1.20, rotY: -0.40, rotZ: 0.60, opacity: 0.50 }
    ];

    const whiteNodes = [];

    orbitConfigs.forEach((cfg) => {
      const curve = new THREE.EllipseCurve(0, 0, cfg.r, cfg.r * 0.95, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(140);
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, p.y, 0)));

      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: cfg.opacity
      });
      const line = new THREE.Line(ringGeo, lineMat);
      line.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);
      orbitsGroup.add(line);

      const nodeGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      orbitsGroup.add(nodeMesh);

      whiteNodes.push({
        mesh: nodeMesh,
        radius: cfg.r,
        rotX: cfg.rotX,
        rotY: cfg.rotY,
        rotZ: cfg.rotZ,
        angle: Math.random() * Math.PI * 2,
        speed: 0.0035 + Math.random() * 0.002
      });
    });

    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotation = { x: 0.32, y: 3.85 };
    let currentRotation = { x: 0.32, y: 3.85 };
    const baseSpeed = 0.0007;
    let scrollBoost = 0;

    const onWheel = (e) => {
      scrollBoost += Math.abs(e.deltaY) * 0.0005;
      targetRotation.y += e.deltaY * 0.001;
    };

    window.addEventListener('wheel', onWheel, { passive: true });

    const onPointerDown = (e) => {
      isDragging = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      prevMousePos = { x: cx, y: cy };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = cx - prevMousePos.x;
      const deltaY = cy - prevMousePos.y;

      targetRotation.y += deltaX * 0.005;
      targetRotation.x += deltaY * 0.005;
      targetRotation.x = Math.max(-1.1, Math.min(1.1, targetRotation.x));

      prevMousePos = { x: cx, y: cy };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width || window.innerWidth;
        const h = entry.contentRect.height || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      scrollBoost *= 0.93;
      const currentSpeed = baseSpeed + scrollBoost;

      if (!isDragging) {
        targetRotation.y += currentSpeed;
      }

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.07;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.07;

      globeGroup.rotation.x = currentRotation.x;
      globeGroup.rotation.y = currentRotation.y;

      cloudMesh.rotation.y += currentSpeed * 0.3;
      orbitsGroup.rotation.z += 0.0003;

      whiteNodes.forEach(item => {
        item.angle += item.speed * (1 + scrollBoost * 8);
        const lx = item.radius * Math.cos(item.angle);
        const ly = item.radius * 0.95 * Math.sin(item.angle);
        const pos = new THREE.Vector3(lx, ly, 0);
        const euler = new THREE.Euler(item.rotX, item.rotY, item.rotZ);
        pos.applyEuler(euler);
        item.mesh.position.copy(pos);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10 flex items-center justify-center"
      />
    </div>
  );
}

window.Globe = Globe;
