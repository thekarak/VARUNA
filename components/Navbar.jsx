function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-white hover:text-sky-400 transition-colors">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase font-mono">
            V.A.R.U.N.A
          </span>
        </a>

        <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-slate-400">
          <a href="#problem" className="hover:text-white transition-colors">Mission</a>
          <a href="#solution" className="hover:text-white transition-colors">How it works</a>
          <a href="#solution" className="hover:text-white transition-colors">Technology</a>
          <a href="dashboard.html" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Forensic Dashboard
          </a>
        </nav>
      </div>
    </header>
  );
}

window.Navbar = Navbar;
