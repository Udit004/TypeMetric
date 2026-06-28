import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";


interface SharedTypingSessionResponse {
  username: string;
  avatar: string | null;
  wpm: number;
  accuracy: number;
  consistency: number;
  rawWpm: number;
  duration: number;
  language: string;
  createdAt: string;
  shareUrl: string;
}

async function getSharedSession(shareId: string): Promise<SharedTypingSessionResponse | null> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1").replace("localhost", "127.0.0.1");
  
  try {
    const res = await fetch(`${baseUrl}/typing-sessions/share/${shareId}`, {
      next: { revalidate: 60 },
    });
    
    if (res.status === 404) {
      return null;
    }
    
    if (!res.ok) {
      throw new Error(`Failed to fetch typing session: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error fetching shared session:", error);
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  
  try {
    const session = await getSharedSession(shareId);
    
    if (!session) {
      return {
        title: "Result Not Found | TypeMetric",
        description: "This typing result could not be found or is private.",
      };
    }

    const roundedWpm = Math.round(session.wpm);
    const accuracy = session.accuracy.toFixed(1).replace(/\.0$/, '');
    
    const title = `${session.username} typed ${roundedWpm} WPM on TypeMetric`;
    const description = `Accuracy ${accuracy}%. Can you beat this score?`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "TypeMetric",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (e) {
    return {
      title: "TypeMetric",
      description: "Test your typing speed",
    };
  }
}

export default async function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const session = await getSharedSession(shareId);
  
  if (!session) {
    notFound();
  }
  
  const dateFormatted = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(session.createdAt));

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[50%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0 shadow-lg shadow-black/50">
            {session.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={session.avatar} 
                alt={`${session.username}'s avatar`} 
                width={48} 
                height={48} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xl uppercase">
                {session.username.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {session.username}
              <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                Typing Result
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              Completed on {dateFormatted} &bull; {session.language}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-2xl mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="flex flex-col items-center text-center">
              <span className="text-slate-400 font-medium tracking-widest uppercase text-sm mb-2">
                Speed
              </span>
              <div className="flex items-baseline gap-2 group-hover:scale-105 transition-transform duration-500">
                <span className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-cyan-300 to-blue-500 drop-shadow-sm">
                  {Math.round(session.wpm)}
                </span>
                <span className="text-2xl font-semibold text-cyan-500/80 tracking-tighter">WPM</span>
              </div>
              {session.rawWpm > session.wpm && (
                <div className="text-slate-500 text-sm mt-2 font-medium">
                  Raw: {Math.round(session.rawWpm)}
                </div>
              )}
            </div>

            <div className="w-px h-32 bg-slate-800 hidden md:block"></div>
            <div className="h-px w-full bg-slate-800 block md:hidden"></div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium text-xs uppercase tracking-widest mb-1">Accuracy</span>
                <span className="text-3xl font-bold text-white tracking-tight">{session.accuracy}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium text-xs uppercase tracking-widest mb-1">Consistency</span>
                <span className="text-3xl font-bold text-white tracking-tight">{session.consistency}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium text-xs uppercase tracking-widest mb-1">Duration</span>
                <span className="text-3xl font-bold text-white tracking-tight">{session.duration}s</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium text-xs uppercase tracking-widest mb-1">Test Type</span>
                <span className="text-xl font-bold text-slate-300 tracking-tight mt-1 capitalize">{session.duration}s {session.language}</span>
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-center">
          <Link 
            href="/typing-test" 
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-slate-800 hover:bg-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/25 border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
            <span className="relative flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try to Beat This Score
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
