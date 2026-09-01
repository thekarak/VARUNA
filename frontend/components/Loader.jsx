const { useState, useEffect, useRef } = React;

function Loader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);
  
  const wavePathRef = useRef(null);
  const boatGroupRef = useRef(null);
  const animFrameRef = useRef(null);

  const DURATION = 2200;

  useEffect(() => {
    const waveEl = wavePathRef.current;
    const boatEl = boatGroupRef.current;
    if (!waveEl || !boatEl) return;

    const totalLen = waveEl.getTotalLength();
    waveEl.style.strokeDasharray = `${totalLen}`;
    waveEl.style.strokeDashoffset = `${totalLen}`;

    const pt0 = waveEl.getPointAtLength(0);
    const pt1 = waveEl.getPointAtLength(2);
    const angle0 = Math.atan2(pt1.y - pt0.y, pt1.x - pt0.x) * (180 / Math.PI);
    boatEl.setAttribute('transform', `translate(${pt0.x}, ${pt0.y}) rotate(${angle0})`);

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(1, elapsed / DURATION);

      const easedProgress = rawProgress < 0.5 
        ? 4 * rawProgress * rawProgress * rawProgress 
        : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      const currentLen = easedProgress * totalLen;
      waveEl.style.strokeDashoffset = `${totalLen - currentLen}`;

      const pt = waveEl.getPointAtLength(currentLen);
      const nextLen = Math.min(totalLen, currentLen + 2);
      const ptNext = waveEl.getPointAtLength(nextLen);
      const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x) * (180 / Math.PI);

      boatEl.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);

      if (rawProgress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 850);
        }, 180);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#04070D] flex flex-col items-center justify-center select-none overflow-hidden transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isExiting ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ willChange: "transform" }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        <div className="w-full relative py-2">
          <svg
            viewBox="0 0 600 180"
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="thickWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="45%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            <path
              d="M 40,90 C 90,30 140,30 190,90 S 290,150 340,90 S 440,30 490,90 S 540,60 560,90"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="4"
              strokeDasharray="6 6"
            />

            <path
              ref={wavePathRef}
              d="M 40,90 C 90,30 140,30 190,90 S 290,150 340,90 S 440,30 490,90 S 540,60 560,90"
              fill="none"
              stroke="url(#thickWaveGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.8)) drop-shadow(0 0 16px rgba(2, 132, 199, 0.5))",
                willChange: "stroke-dashoffset"
              }}
            />

            <g
              ref={boatGroupRef}
              style={{ willChange: "transform" }}
            >
              <path
                d="M -16,3 Q -24,7 -30,4"
                stroke="#38bdf8"
                strokeWidth="2"
                opacity="0.8"
                fill="none"
              />
              <path
                d="M -16,-3 Q -24,-7 -30,-4"
                stroke="#38bdf8"
                strokeWidth="2"
                opacity="0.8"
                fill="none"
              />

              <path
                d="M -18,0 L -13,9 C -6,11 8,11 17,6 L 22,0 Z"
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth="1.5"
              />

              <path
                d="M -15,0 L 19,0"
                stroke="#0ea5e9"
                strokeWidth="1.8"
              />

              <rect
                x="-10"
                y="-10"
                width="13"
                height="10"
                rx="2"
                fill="#0ea5e9"
                stroke="#ffffff"
                strokeWidth="1"
              />
              <rect
                x="-6"
                y="-8"
                width="5"
                height="4"
                rx="0.5"
                fill="#04070d"
              />

              <line
                x1="-3"
                y1="-10"
                x2="-3"
                y2="-17"
                stroke="#ffffff"
                strokeWidth="1.8"
              />
              <circle
                cx="-3"
                cy="-17"
                r="2.5"
                fill="#22d3ee"
                className="animate-pulse"
              />

              <circle
                cx="21"
                cy="0"
                r="2.2"
                fill="#38bdf8"
              />
            </g>
          </svg>
        </div>

        <div className="mt-6 flex items-center justify-center font-mono text-xs sm:text-sm tracking-[0.28em] text-slate-300 uppercase">
          <span>V.A.R.U.N.A loading</span>
          <span className="inline-flex ml-1 text-cyan-400 font-bold">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse delay-100">.</span>
            <span className="animate-pulse delay-200">.</span>
          </span>
        </div>

      </div>
    </div>
  );
}

window.Loader = Loader;
