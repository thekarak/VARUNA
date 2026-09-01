const { useState, useEffect, useRef } = React;

function App() {
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [solutionActive, setSolutionActive] = useState(false);
  const [finalActive, setFinalActive] = useState(false);
  
  const solutionRef = useRef(null);
  const finalRef = useRef(null);

  const handleGetStarted = () => {
    alert("V.A.R.U.N.A Maritime Forensic Platform — Initializing Workspace");
  };


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSolutionActive(true);
        }
      },
      { threshold: 0.2 }
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
    { num: "01", name: "INGEST", desc: "Define the area and retrieve satellite data." },
    { num: "02", name: "DETECT", desc: "Identify suspected oil slicks." },
    { num: "03", name: "TRACE", desc: "Reconstruct drift and determine the origin window." },
    { num: "04", name: "CORRELATE", desc: "Match vessel trajectories with the event." },
    { num: "05", name: "ATTRIBUTE", desc: "Score anomalies and identify probable suspects." },
    { num: "06", name: "DOCUMENT", desc: "Generate a forensic evidence record." }
  ];

  const outputStages = [
    { name: "FORENSIC RECONSTRUCTION", status: "PHASE 01" },
    { name: "ORIGIN WINDOW ESTABLISHED", status: "PHASE 02" },
    { name: "VESSEL ATTRIBUTION", status: "PHASE 03" },
    { name: "DEFENSIBLE EVIDENCE", status: "COMPLETED" }
  ];

  return (
    <div className="w-screen min-h-screen bg-[#04070D] text-white selection:bg-white selection:text-black relative font-sans flex flex-col">
      {loading && (
        <Loader onComplete={() => setLoading(false)} />
      )}

      <div className="fixed inset-0 bg-grid-subtle pointer-events-none opacity-25 z-0" />

      <Navbar />

      <section className="relative w-full h-screen min-h-[700px] flex flex-col justify-between overflow-hidden z-10">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto z-10 pt-20">
          <Globe />
        </div>

        <div className="relative w-full h-full pt-20 px-6 sm:px-10 lg:px-12 xl:px-16 flex flex-col justify-between pointer-events-none z-20">
          <div className="w-full flex items-start justify-between pt-6 sm:pt-10 lg:pt-12">
            
            <div className="w-full lg:w-[42%] xl:w-[38%] flex flex-col justify-start items-start pointer-events-auto select-text">
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-[2.85rem] xl:text-[3.35rem] tracking-tight text-white leading-[1.12] mb-5">
                From satellite signals<br />
                <span className="text-slate-400 font-normal">
                  to maritime accountability.
                </span>
              </h1>

              <p className="font-sans text-slate-400 text-sm sm:text-base lg:text-[1.05rem] leading-relaxed font-normal max-w-md">
                V.A.R.U.N.A detects oil spills, traces their origin, correlates vessel activity, and transforms geospatial intelligence into defensible evidence.
              </p>
            </div>

            <div className="hidden lg:block w-[300px] lg:w-[340px] xl:w-[360px] pointer-events-auto select-none">
              <div className="bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 shadow-sm">
                
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
                      <div className="flex flex-col px-2 py-1 rounded hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-400">{step.num}</span>
                          <span className="font-mono text-xs font-semibold text-white tracking-wider">{step.name}</span>
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

              </div>
            </div>

          </div>

          <div className="w-full flex items-end justify-between pb-6 sm:pb-8 lg:pb-10">
            <div className="w-full lg:w-auto flex flex-col justify-end items-start pointer-events-auto select-none">
              <div className="bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col space-y-2.5 min-w-[260px] sm:min-w-[280px]">
                
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                    SYSTEM STATUS
                  </span>
                  <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                    LIVE
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] sm:text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
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

              </div>
            </div>

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
          
          <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors duration-300">
            Get Started
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-white text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>
      </div>

      <section id="problem" className="relative w-full min-h-screen py-24 sm:py-32 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto flex flex-col justify-between z-20">
        <div className="w-full flex items-center justify-between border-b border-white/[0.08] pb-4 mb-10">
          <span className="font-mono text-xs font-semibold tracking-[0.25em] text-slate-300 uppercase">
            MARITIME POLLUTION FORENSICS
          </span>
          <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
            CASE STUDY & METHODOLOGY
          </span>
        </div>

        <div className="max-w-5xl mb-12 lg:mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] uppercase">
            WE CAN SEE THE SPILL.<br />
            <span className="text-slate-400 font-normal">
              BUT CAN WE PROVE WHO CAUSED IT?
            </span>
          </h2>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-12">
          
          <div className="lg:col-span-4 bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between shadow-sm">
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
          </div>

          <div className="lg:col-span-4 bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            
            <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
              <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                OCEAN MAP
              </span>
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                RADAR
              </span>
            </div>

            <div className="relative z-10 my-auto py-3 flex flex-col items-center">
              <svg viewBox="0 0 340 220" className="w-full h-auto overflow-visible">
                <path d="M 20,40 Q 50,32 80,40 T 140,40 T 200,40 T 260,40 T 320,40" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />
                <path d="M 10,75 Q 40,67 70,75 T 130,75 T 190,75 T 250,75 T 310,75" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />
                <path d="M 30,150 Q 60,142 90,150 T 150,150 T 210,150 T 270,150 T 330,150" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />
                <path d="M 15,185 Q 45,177 75,185 T 135,185 T 195,185 T 255,185 T 315,185" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />

                <g>
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
                  <path d="M 30,195 Q 55,160 85,130" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                  <text x="45" y="175" fill="#94a3b8" fontSize="7.5" fontFamily="monospace" transform="rotate(-40 45,175)">
                    · · · AIS SIGNAL · · ·
                  </text>

                  <circle cx="85" cy="130" r="4" fill="#f43f5e" />
                  
                  <line x1="80" y1="125" x2="90" y2="135" stroke="#ffffff" strokeWidth="1.8" />
                  <line x1="90" y1="125" x2="80" y2="135" stroke="#ffffff" strokeWidth="1.8" />

                  <rect x="75" y="148" width="105" height="24" rx="4" fill="#070c14" stroke="#475569" strokeWidth="1" />
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

          </div>

          <div className="lg:col-span-4 bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-6">
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-slate-200 uppercase">
                  WHAT'S MISSING
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
          </div>

        </div>

        <div className="w-full pt-2">
          <div className="bg-[#070c14]/90 border border-white/[0.08] rounded-xl p-6 sm:p-7 shadow-sm flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between relative py-3">
              <div className="flex items-center gap-3 z-10 bg-[#070c14] pr-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <div className="flex flex-col">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-white tracking-wider uppercase">DETECTION</span>
                  <span className="font-mono text-[10px] text-slate-400">Satellite SAR Imagery</span>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center pointer-events-none px-8 sm:px-16">
                <div className="w-full h-px bg-white/[0.12]"></div>
              </div>

              <div className="flex flex-col items-center z-10 bg-[#070c14] px-4">
                <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.15] flex items-center justify-center text-slate-300 font-mono font-bold text-xs">
                  ✕
                </div>
                <span className="font-mono text-[10px] text-slate-400 tracking-wider uppercase mt-1">
                  ATTRIBUTION GAP
                </span>
              </div>

              <div className="flex items-center gap-3 z-10 bg-[#070c14] pl-4">
                <div className="flex flex-col text-right">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-white tracking-wider uppercase">ATTRIBUTION</span>
                  <span className="font-mono text-[10px] text-slate-400">Forensic Liability</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              </div>
            </div>

            <p className="font-sans text-xs sm:text-sm text-slate-400 text-center max-w-2xl mt-4 leading-relaxed">
              Satellite imagery alone cannot prove liability. <span className="text-white font-medium">V.A.R.U.N.A</span> reconstructs the missing physical links using Lagrangian ocean-current hindcasting, dark vessel dead-reckoning, and multi-variable behavioral correlation.
            </p>

          </div>
        </div>

      </section>

      <section
        id="solution"
        ref={solutionRef}
        className="relative w-full min-h-screen py-24 sm:py-32 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto flex flex-col justify-between z-20"
      >
        <div className="w-full flex items-center justify-between border-b border-white/[0.08] pb-4 mb-10">
          <span className="font-mono text-xs font-semibold tracking-[0.25em] text-slate-300 uppercase">
            UNIFIED MARITIME INTELLIGENCE
          </span>
          <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
            FORENSIC ATTRIBUTION ENGINE
          </span>
        </div>

        <div className="max-w-4xl mb-12 lg:mb-16">
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white tracking-tight leading-[1.08] uppercase mb-6">
            CONNECTING THE SIGNALS.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-300">
              REVEALING THE SOURCE.
            </span>
          </h2>
          <p className="font-sans text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
            V.A.R.U.N.A unifies satellite imagery, ocean dynamics, vessel intelligence, and forensic analysis into a single system for evidence-based maritime attribution.
          </p>
        </div>

        <div className="relative w-full my-6 sm:my-10 flex flex-col items-center">
          
          <div className="relative w-full max-w-[1100px] min-h-[560px] sm:min-h-[620px] lg:min-h-[660px] flex items-center justify-center">
            
            <svg
              viewBox="0 0 1000 600"
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
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
                stroke={hoveredNode === 1 ? "#38bdf8" : "rgba(56, 189, 248, 0.22)"}
                strokeWidth={hoveredNode === 1 ? "2.2" : "1.2"}
                strokeDasharray={hoveredNode === 1 ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle r="3.5" fill="#38bdf8" opacity={solutionActive ? "0.9" : "0"}>
                <animateMotion path="M 180,110 C 290,110 390,200 450,250" dur="3.6s" repeatCount="indefinite" />
              </circle>

              <path
                id="curve2"
                d="M 820,110 C 710,110 610,200 550,250"
                fill="none"
                stroke={hoveredNode === 2 ? "#38bdf8" : "rgba(56, 189, 248, 0.22)"}
                strokeWidth={hoveredNode === 2 ? "2.2" : "1.2"}
                strokeDasharray={hoveredNode === 2 ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle r="3.5" fill="#38bdf8" opacity={solutionActive ? "0.9" : "0"}>
                <animateMotion path="M 820,110 C 710,110 610,200 550,250" dur="3.8s" begin="0.8s" repeatCount="indefinite" />
              </circle>

              <path
                id="curve3"
                d="M 180,450 C 290,450 390,360 450,310"
                fill="none"
                stroke={hoveredNode === 3 ? "#38bdf8" : "rgba(56, 189, 248, 0.22)"}
                strokeWidth={hoveredNode === 3 ? "2.2" : "1.2"}
                strokeDasharray={hoveredNode === 3 ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle r="3.5" fill="#38bdf8" opacity={solutionActive ? "0.9" : "0"}>
                <animateMotion path="M 180,450 C 290,450 390,360 450,310" dur="4.2s" begin="1.4s" repeatCount="indefinite" />
              </circle>

              <path
                id="curve4"
                d="M 820,450 C 710,450 610,360 550,310"
                fill="none"
                stroke={hoveredNode === 4 ? "#38bdf8" : "rgba(56, 189, 248, 0.22)"}
                strokeWidth={hoveredNode === 4 ? "2.2" : "1.2"}
                strokeDasharray={hoveredNode === 4 ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle r="3.5" fill="#38bdf8" opacity={solutionActive ? "0.9" : "0"}>
                <animateMotion path="M 820,450 C 710,450 610,360 550,310" dur="3.9s" begin="2.1s" repeatCount="indefinite" />
              </circle>
            </svg>

            <div
              onMouseEnter={() => setHoveredNode(1)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`absolute top-2 left-2 sm:top-6 sm:left-6 lg:top-8 lg:left-8 z-30 w-[240px] sm:w-[270px] p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                hoveredNode === 1
                  ? "bg-[#0b1322] border-cyan-400/60 shadow-lg scale-[1.02]"
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
            </div>

            <div
              onMouseEnter={() => setHoveredNode(2)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`absolute top-2 right-2 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-30 w-[240px] sm:w-[270px] p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                hoveredNode === 2
                  ? "bg-[#0b1322] border-cyan-400/60 shadow-lg scale-[1.02]"
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
            </div>

            <div
              onMouseEnter={() => setHoveredNode(3)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`absolute bottom-2 left-2 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 z-30 w-[240px] sm:w-[270px] p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                hoveredNode === 3
                  ? "bg-[#0b1322] border-cyan-400/60 shadow-lg scale-[1.02]"
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
            </div>

            <div
              onMouseEnter={() => setHoveredNode(4)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`absolute bottom-2 right-2 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-30 w-[240px] sm:w-[270px] p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                hoveredNode === 4
                  ? "bg-[#0b1322] border-cyan-400/60 shadow-lg scale-[1.02]"
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
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center p-6">
              
              <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-dashed border-cyan-500/25 animate-[spin_28s_linear_infinite] pointer-events-none" />
              
              <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-white/[0.05] pointer-events-none" />

              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-[#050b14]/95 border border-cyan-500/35 p-4 flex flex-col items-center justify-center text-center shadow-[0_0_35px_rgba(6,182,212,0.12)] select-none">
                
                <div className="absolute inset-2 rounded-full border border-white/[0.06] pointer-events-none" />
                
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] mb-2"></span>

                <h3 className="font-mono font-bold text-sm sm:text-base tracking-[0.22em] text-white uppercase">
                  V.A.R.U.N.A.
                </h3>
                <span className="font-mono text-[9px] sm:text-[9.5px] text-cyan-300/90 tracking-wider uppercase mt-1 leading-tight font-medium">
                  FORENSIC INTELLIGENCE ENGINE
                </span>

                <span className="mt-2 text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  CORRELATING
                </span>

              </div>
            </div>

          </div>

          <div className="w-full max-w-md mt-6 flex flex-col items-center z-20">
            
            <div className="w-px h-8 bg-gradient-to-b from-cyan-500/40 to-white/10" />

            <div className="w-full bg-[#070c14]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-3">
                <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                  SYSTEM OUTPUT PIPELINE
                </span>
                <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                  DEFENSIBLE EVIDENCE
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {outputStages.map((stage, idx) => (
                  <React.Fragment key={stage.name}>
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
                      <span className="flex items-center gap-2 text-slate-300 font-semibold tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
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
            </div>

          </div>

        </div>

        <div className="w-full mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-white/[0.08] flex flex-col items-center text-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400 mb-5">
            THE ATTRIBUTION PARADIGM
          </span>
          
          <div className="space-y-3 sm:space-y-4 max-w-5xl">
            <h3 className="font-display font-bold text-2xl sm:text-4xl lg:text-5xl text-slate-400 uppercase tracking-tight">
              NOT ANOTHER <br className="sm:hidden" />DETECTION TOOL.
            </h3>
            
            <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-400 uppercase tracking-tight leading-[1.04]">
              AN ENGINE FOR <br className="sm:hidden" />ATTRIBUTION.
            </h2>
          </div>

          <p className="font-sans text-xs sm:text-sm text-slate-400 mt-6 max-w-xl leading-relaxed">
            From raw satellite signals to evidence-based maritime accountability.
          </p>
        </div>

      </section>

      <section
        ref={finalRef}
        className="relative w-full pt-16 sm:pt-24 min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] flex flex-col justify-end items-center overflow-hidden bg-[#04070D] select-none z-20"
      >
        <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-20" />

        <div className="relative w-full flex justify-center items-end overflow-hidden">
          <h1
            className={`font-display font-black text-[17.5vw] tracking-tight sm:tracking-normal leading-[0.74] text-[#e2e8f0]/90 uppercase select-none transition-all duration-[1000ms] ease-out pointer-events-none whitespace-nowrap ${
              finalActive
                ? "translate-y-[26%] opacity-100"
                : "translate-y-[65%] opacity-30"
            }`}
            style={{
              fontFeatureSettings: '"salt" on, "ss01" on',
              textRendering: "optimizeLegibility"
            }}
          >
            V A R U N A
          </h1>
        </div>
      </section>

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
