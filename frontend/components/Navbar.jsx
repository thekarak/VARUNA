function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-white hover:text-sky-400 transition-colors">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase font-mono">
            V.A.R.U.N.A
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Mission</a>
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Technology</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </nav>

        <div>
          <button 
            onClick={() => alert("V.A.R.U.N.A. Platform Access Requested")}
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Request early access</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

window.Navbar = Navbar;
