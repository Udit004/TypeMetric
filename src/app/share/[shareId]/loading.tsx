export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[50%] w-[500px] h-[500px] bg-slate-800/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>

      <div className="z-10 w-full max-w-2xl animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0"></div>
          <div className="flex flex-col gap-2">
            <div className="w-48 h-6 bg-slate-800 rounded"></div>
            <div className="w-32 h-4 bg-slate-800 rounded"></div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 md:p-12 mb-8 h-64">
          <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-12 opacity-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-4 bg-slate-800 rounded"></div>
              <div className="w-32 h-20 bg-slate-800 rounded"></div>
            </div>
            
            <div className="w-px h-32 bg-slate-800 hidden md:block"></div>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div className="w-20 h-12 bg-slate-800 rounded"></div>
              <div className="w-20 h-12 bg-slate-800 rounded"></div>
              <div className="w-20 h-12 bg-slate-800 rounded"></div>
              <div className="w-20 h-12 bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-64 h-14 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
