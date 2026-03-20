export function HomeHeader() {
  return (
    <div className="text-center space-y-8 mb-20 mt-10">
      <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-black/50">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-neutral-300">Main System Online</span>
      </div>
      
      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Welcome to
          <br />
          <span className="inline-block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
            Ghifary Web
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 font-light leading-relaxed">
          An integrated control center to manage data storage, access rights, daily notes, and other essential services.
        </p>
      </div>
    </div>
  );
}
