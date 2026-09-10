const { useState, useEffect, useRef } = React;

function MaritimeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Oceanic telemetry particles representing maritime radar & satellite passes
    const numParticles = 38;
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35, // Slow, calm drift
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.6 + 0.8,
        alpha: Math.random() * 0.35 + 0.15
      });
    }

    // Expanding calm sonar wavefronts from center
    const sonarRings = [
      { r: 40, maxR: 520, speed: 0.65, opacity: 0.22 },
      { r: 200, maxR: 520, speed: 0.65, opacity: 0.16 },
      { r: 360, maxR: 520, speed: 0.65, opacity: 0.10 }
    ];

    // Nautical coordinate labels drifting subtly in background
    const navMarkers = [
      { text: "IN-NAV // MUMBAI HIGH OFFSHORE [19.4°N 71.3°E]", x: 0.12, y: 0.22 },
      { text: "SAR-SENTINEL-1 PASS // ARABIAN SEA", x: 0.72, y: 0.18 },
      { text: "BAY OF BENGAL EEZ // SECTOR-04", x: 0.15, y: 0.82 },
      { text: "AIS CARRIER ATTRIBUTION MESH: ACTIVE", x: 0.68, y: 0.85 }
    ];

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Naval Gradient Atmosphere
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        80,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      bgGrad.addColorStop(0, "rgba(7, 21, 38, 0.45)");
      bgGrad.addColorStop(0.5, "rgba(4, 12, 22, 0.25)");
      bgGrad.addColorStop(1, "rgba(2, 5, 10, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 2. Slow Expanding Sonar Rings (Oceanic Surveillance Sweep)
      sonarRings.forEach((ring) => {
        ring.r += ring.speed;
        if (ring.r > ring.maxR) {
          ring.r = 30;
        }
        const currentOpacity = Math.max(0, ring.opacity * (1 - ring.r / ring.maxR));

        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(78, 231, 255, ${currentOpacity * 0.45})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle concentric dash rings
        if (ring.r > 120 && ring.r < 380) {
          ctx.beginPath();
          ctx.setLineDash([4, 12]);
          ctx.arc(centerX, centerY, ring.r * 0.82, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${currentOpacity * 0.2})`;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 3. Calm Crosshair Reticle in Center
      ctx.strokeStyle = "rgba(78, 231, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 18, centerY);
      ctx.lineTo(centerX + 18, centerY);
      ctx.moveTo(centerX, centerY - 18);
      ctx.lineTo(centerX, centerY + 18);
      ctx.stroke();

      // 4. Drift Particles & Subtle Proximity Vectors
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(78, 231, 255, ${p.alpha * 0.7})`;
        ctx.fill();

        // Draw faint vector lines between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 110) * 0.12})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 5. Ambient Nautical Telemetry Indicators
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(100, 140, 180, 0.25)";
      navMarkers.forEach((m, idx) => {
        const posX = width * m.x + Math.sin(time * 0.5 + idx) * 12;
        const posY = height * m.y + Math.cos(time * 0.5 + idx) * 8;
        ctx.fillText(m.text, posX, posY);

        // Small cross marker
        ctx.strokeStyle = "rgba(78, 231, 255, 0.18)";
        ctx.beginPath();
        ctx.moveTo(posX - 4, posY - 10);
        ctx.lineTo(posX + 4, posY - 10);
        ctx.moveTo(posX, posY - 14);
        ctx.lineTo(posX, posY - 6);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
}

function LoginApp() {
  const [aadhaarInput, setAadhaarInput] = useState("1234 5678 9012");
  const [password, setPassword] = useState("demo1234");
  const [authMode, setAuthMode] = useState("password");
  const [otpSent, setOtpSent] = useState(false);
  const [maskAadhaar, setMaskAadhaar] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const aadhaarRaw = aadhaarInput.replace(/\D/g, "").slice(0, 12);

  const formatAadhaar = (val) => {
    const raw = val.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const getMaskedDisplay = () => {
    if (!maskAadhaar || aadhaarRaw.length <= 4) {
      return formatAadhaar(aadhaarRaw);
    }
    const visibleStart = aadhaarRaw.slice(0, 4);
    const visibleEnd = aadhaarRaw.length > 8 ? aadhaarRaw.slice(8) : "";
    let masked = visibleStart + " ";
    if (aadhaarRaw.length > 4) {
      const middleCount = Math.min(4, aadhaarRaw.length - 4);
      masked += "•".repeat(middleCount) + " ";
    }
    if (visibleEnd) {
      masked += visibleEnd;
    }
    return masked.trim();
  };

  const handleAadhaarChange = (e) => {
    const formatted = formatAadhaar(e.target.value);
    setAadhaarInput(formatted);
    if (status === "denied") setStatus("idle");
  };

  const handleLoadDemo = () => {
    setAadhaarInput("1234 5678 9012");
    setPassword("demo1234");
    setMaskAadhaar(false);
    setStatus("idle");
    setErrorMessage("");
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    setPassword("789012");
    if (!aadhaarInput.trim()) {
      setAadhaarInput("1234 5678 9012");
    }
  };

  const getDestinationUrl = () => {
    const pathname = window.location.pathname || "";
    if (pathname.endsWith("/login") || pathname === "/login") {
      return "/dashboard";
    }
    return "dashboard.html";
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (status === "verifying" || status === "granted") return;

    // Default to demo if empty
    const finalRaw = aadhaarRaw.length > 0 ? aadhaarRaw : "123456789012";
    const finalPassword = password.trim().length > 0 ? password : "demo1234";

    if (!aadhaarInput) {
      setAadhaarInput("1234 5678 9012");
    }
    if (!password) {
      setPassword("demo1234");
    }

    setStatus("verifying");
    setErrorMessage("");

    setTimeout(() => {
      setStatus("granted");

      const last4 = finalRaw.length >= 4 ? finalRaw.slice(-4) : "9012";
      const sessionData = {
        user: "Officer A. Sharma",
        role: "NTRO Maritime Surveillance Commander",
        aadhaarMasked: `•••• •••• ${last4}`,
        badgeId: "NTRO-MS-4890",
        clearance: "LEVEL 4",
        timestamp: new Date().toISOString()
      };
      try {
        sessionStorage.setItem("varuna_auth", JSON.stringify(sessionData));
      } catch (err) {}

      const dest = getDestinationUrl();
      setTimeout(() => {
        window.location.assign(dest);
      }, 350);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#04070d] text-slate-100 flex flex-col justify-between relative font-sans">
      
      {/* Dynamic Maritime Radar & Ocean Drift Background Animation */}
      <MaritimeBackground />

      {/* Subtle Static Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-15 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px"
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 w-full border-b border-white/10 bg-[#070c14]/85 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="index.html" className="font-mono text-lg font-bold tracking-[0.2em] text-white hover:text-cyan-400 transition-colors">
            V.A.R.U.N.A
          </a>
          <span className="text-slate-600 font-mono text-xs">/</span>
          <span className="font-mono text-xs text-slate-400 tracking-wider hidden sm:inline">
            NTRO RESTRICTED ACCESS PORTAL
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-white/10 text-slate-400 text-[11px] font-mono">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
            <span>SECURE CONNECTION</span>
          </div>

          <a 
            href="index.html" 
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors border border-white/10 px-2.5 py-1 rounded-md"
          >
            Landing Page &rarr;
          </a>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-white/10 mb-3 shadow-[0_0_20px_rgba(78,231,255,0.08)]">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono uppercase">
              VARUNA &mdash; Restricted Access
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider mt-1">
              Authorized NTRO Personnel Only
            </p>
          </div>

          <div className="bg-[#070c14]/92 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            
            {/* Quick Demo Helper */}
            <div className="mb-5 p-2.5 rounded-lg bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Demo: <span className="text-slate-200 font-medium">1234 5678 9012</span> / <span className="text-slate-200 font-medium">demo1234</span>
              </span>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>

            {/* Error Banner */}
            {status === "denied" && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-start gap-2">
                <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div className="font-bold tracking-wide uppercase">ACCESS DENIED</div>
                  <div className="text-rose-300/80 text-[11px] mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Granted Banner */}
            {status === "granted" && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-bold uppercase text-emerald-300">ACCESS GRANTED</div>
                    <div className="text-emerald-300/80 text-[11px]">Redirecting to Forensic Dashboard...</div>
                  </div>
                </div>
                <a
                  href={getDestinationUrl()}
                  className="text-[10px] font-mono font-semibold uppercase px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 whitespace-nowrap"
                >
                  Open &rarr;
                </a>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Aadhaar Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-medium text-slate-300 uppercase">
                    Aadhaar Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setMaskAadhaar(!maskAadhaar)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    {maskAadhaar ? "Show" : "Mask"}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={maskAadhaar ? getMaskedDisplay() : aadhaarInput}
                    onChange={handleAadhaarChange}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={14}
                    disabled={status === "verifying" || status === "granted"}
                    className="w-full bg-[#04070d] border border-white/15 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 tracking-[0.15em] focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    {aadhaarRaw.length}/12
                  </div>
                </div>
              </div>

              {/* Password / OTP Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-medium text-slate-300 uppercase">
                    {authMode === "password" ? "Password" : "OTP"}
                  </label>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <button
                      type="button"
                      onClick={() => { setAuthMode("password"); setPassword(""); }}
                      className={`px-1.5 py-0.5 rounded ${authMode === "password" ? "text-cyan-400 font-bold" : "hover:text-slate-200"}`}
                    >
                      Password
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => { setAuthMode("otp"); setPassword(""); }}
                      className={`px-1.5 py-0.5 rounded ${authMode === "otp" ? "text-cyan-400 font-bold" : "hover:text-slate-200"}`}
                    >
                      OTP
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={authMode === "password" ? "password" : "text"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (status === "denied") setStatus("idle");
                    }}
                    placeholder={authMode === "password" ? "••••••••" : "Enter OTP (demo: 789012)"}
                    disabled={status === "verifying" || status === "granted"}
                    className="w-full bg-[#04070d] border border-white/15 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none transition-colors disabled:opacity-50"
                  />

                  {authMode === "otp" && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold uppercase px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    >
                      {otpSent ? "Resend" : "Send OTP"}
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "verifying" || status === "granted"}
                  className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs tracking-wider uppercase py-3 px-4 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(78,231,255,0.25)]"
                >
                  {status === "verifying" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Verifying Identity...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>
      </main>

      {/* Official Disclaimer Footer */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-[#070c14]/85 backdrop-blur-md px-6 py-3 text-center">
        <p className="text-[11px] font-mono text-slate-400">
          Demonstration interface &bull; No real Aadhaar data is processed or stored.
        </p>
      </footer>
    </div>
  );
}

window.LoginApp = LoginApp;
