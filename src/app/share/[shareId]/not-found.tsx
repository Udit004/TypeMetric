import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[50%] left-[50%] w-[500px] h-[500px] bg-slate-800/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="z-10 max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative">
        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-400 to-slate-600 mb-4">
          404
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Result not found</h2>
        <p className="text-slate-400 mb-8">
          This typing result doesn't exist, or it has been set to private by the user.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="w-full inline-block py-3 px-6 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
