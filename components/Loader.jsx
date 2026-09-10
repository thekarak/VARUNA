const { useState, useEffect, useRef } = React;

function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [telemetryText, setTelemetryText] = useState("CALIBRATING ORBITAL SAR SENSORS");

  // Audit fix (loader stuck at 0%): requestAnimationFrame halts in
  // background/hidden tabs, freezing progress forever. Drive the bar with
  // elapsed wall-clock time on a timer instead, nudge on visibility change,
  // and force completion on an absolute deadline no matter what stalls.
  useEffect(() => {
    const startTime = (typeof performance !== "undefined" && performance.now)
      ? performance.now()
      : Date.now();
    const duration = 2000;
    const deadline = 6000;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      setIsExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    };

    const tick = () => {
      if (finished) return;
      const now = (typeof performance !== "undefined" && performance.now)
        ? performance.now()
        : Date.now();
      const elapsed = now - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(rawPct);

      if (rawPct < 20) {
        setTelemetryText("ORBITAL SAR RADAR // SENTINEL-1 C-BAND POLARIMETRY");
      } else if (rawPct < 40) {
        setTelemetryText("LAGRANGIAN HYDRODYNAMIC VECTOR MESH SYNCHRONIZED");
      } else if (rawPct < 65) {
        setTelemetryText("AIS DARK FLEET TRAJECTORY KINEMATICS ENGAGED");
      } else if (rawPct < 85) {
        setTelemetryText("NEURAL ANOMALY DETECTION ENGINE CALIBRATED");
      } else {
        setTelemetryText("V.A.R.U.N.A PLATFORM VERIFIED // SYSTEM ONLINE");
      }

      if (elapsed >= duration) {
        finish();
      }
    };

    const timerId = setInterval(tick, 50);
    const onVis = () => tick();
    if (typeof document !== "undefined" && document.addEventListener) {
      document.addEventListener("visibilitychange", onVis);
    }
    const deadlineId = setTimeout(finish, deadline);
    tick();
    return () => {
      clearInterval(timerId);
      clearTimeout(deadlineId);
      if (typeof document !== "undefined" && document.removeEventListener) {
        document.removeEventListener("visibilitychange", onVis);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#04070D",
        zIndex: 99999
      }}
      className={`fixed inset-0 z-[100] bg-[#04070D] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-500 ease-out ${
        isExiting ? "opacity-0 -translate-y-6 scale-[1.02] pointer-events-none" : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      <div className="absolute inset-0 bg-grid-subtle opacity-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        
        <div className="w-full flex items-center justify-between font-mono text-[10px] text-slate-400 border-b border-white/10 pb-2 mb-8 tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{"SYS // BOOT SEQUENCE"}</span>
          </div>
          <span className="text-cyan-400">{"CH-01 // ACTIVE"}</span>
        </div>

        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-white/10 animate-[spin_14s_linear_infinite_reverse]" />
          <div className="absolute inset-10 rounded-full border border-cyan-400/20" />
          
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />

          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div 
              className="w-full h-full origin-center animate-[spin_3s_linear_infinite]"
              style={{
                background: "conic-gradient(from 0deg, rgba(56, 189, 248, 0.25) 0deg, transparent 60deg, transparent 360deg)"
              }}
            />
          </div>

          <div className="relative z-10 w-36 h-36 rounded-full bg-[#070c14]/90 border border-cyan-400/50 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(56,189,248,0.2)]">
            <span className="font-mono text-3xl font-black text-white tracking-tighter">
              {progress}%
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] text-cyan-400 uppercase mt-0.5">
              INITIALIZING
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm mt-8 flex flex-col items-center space-y-3">
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden border border-white/[0.08] p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(56,189,248,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="w-full flex items-center justify-between font-mono text-[10px] text-slate-400">
            <span className="truncate max-w-[280px] text-slate-300">
              {telemetryText}
            </span>
            <span className="text-cyan-400 font-bold ml-2">
              V.A.R.U.N.A
            </span>
          </div>
        </div>

        <div className="w-full flex items-center justify-between font-mono text-[9px] text-slate-500 border-t border-white/10 pt-2 mt-8 tracking-wider">
          <span>{"COORDINATES // 24°38'N 54°19'E"}</span>
          <span className="text-emerald-400">STATUS: NORMAL</span>
        </div>

      </div>
    </div>
  );
}

window.Loader = Loader;
