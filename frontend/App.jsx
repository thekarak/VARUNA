function App() {
  return (
    <div className="h-screen w-screen bg-[#04070D] text-white selection:bg-sky-500 selection:text-black relative overflow-hidden font-sans flex flex-col justify-between">
      <Navbar />

      <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden pt-16">
        <Globe />
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
