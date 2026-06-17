"use client";

import { useEffect, useState } from "react";

type Scene = "TYPING" | "RESULT" | "LEADERBOARD" | "MP_LOBBY" | "MP_RACING" | "MP_RESULT";

const DEMO_TEXT = "The quick brown fox jumps over the lazy dog.".split("");

export function HomeDemoSection() {
  const [scene, setScene] = useState<Scene>("TYPING");
  const [typedIndex, setTypedIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [time, setTime] = useState(30);

  // Multiplayer specific
  const [playersReady, setPlayersReady] = useState(1);
  const [opponentsProgress, setOpponentsProgress] = useState([0, 0, 0]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (scene === "TYPING") {
      setTypedIndex(0);
      setWpm(0);
      setTime(15);
      
      interval = setInterval(() => {
        setTypedIndex((prev) => {
          if (prev >= DEMO_TEXT.length - 1) {
            clearInterval(interval);
            setTimeout(() => setScene("RESULT"), 500);
            return prev + 1;
          }
          return prev + 1;
        });
        setWpm(Math.floor(90 + Math.random() * 20)); // Stable 90-110 WPM
        setTime((prev) => Math.max(0, prev - (Math.random() > 0.8 ? 1 : 0))); // fake timer
      }, 100);
    } 
    else if (scene === "RESULT") {
      timeout = setTimeout(() => setScene("LEADERBOARD"), 3000);
    }
    else if (scene === "LEADERBOARD") {
      timeout = setTimeout(() => setScene("MP_LOBBY"), 4000);
    }
    else if (scene === "MP_LOBBY") {
      setPlayersReady(1);
      interval = setInterval(() => {
        setPlayersReady(p => {
          if (p >= 4) {
            clearInterval(interval);
            setTimeout(() => setScene("MP_RACING"), 800);
            return 4;
          }
          return p + 1;
        });
      }, 800);
    }
    else if (scene === "MP_RACING") {
      setTypedIndex(0);
      setWpm(0);
      setTime(15);
      setOpponentsProgress([0, 0, 0]);
      
      interval = setInterval(() => {
        setTypedIndex((prev) => {
          if (prev >= DEMO_TEXT.length - 1) {
            clearInterval(interval);
            setTimeout(() => setScene("MP_RESULT"), 1000);
            return prev + 1;
          }
          return prev + 1;
        });
        setWpm(Math.floor(110 + Math.random() * 15)); // Faster in MP
        
        // Update opponents
        setOpponentsProgress(prev => prev.map(p => Math.min(100, p + Math.random() * 3.5)));
      }, 90);
    }
    else if (scene === "MP_RESULT") {
      timeout = setTimeout(() => setScene("TYPING"), 4000);
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [scene]);

  // Render helpers
  const renderTyping = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between text-slate-300">
        <div className="flex gap-6 font-mono text-xl font-bold">
          <div className="text-cyan-400 w-24">{wpm > 0 ? wpm : '--'} WPM</div>
          <div className="text-slate-400">{time}s</div>
        </div>
      </div>
      <div className="font-mono text-2xl leading-relaxed text-slate-500">
        {DEMO_TEXT.map((char, index) => {
          let colorClass = "text-slate-600";
          if (index < typedIndex) colorClass = "text-white";
          else if (index === typedIndex) colorClass = "border-b-2 border-cyan-400 text-slate-300";
          return <span key={index} className={`transition-colors duration-75 ${colorClass}`}>{char}</span>;
        })}
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center gap-6 py-4 animate-in fade-in zoom-in duration-300">
      <div className="text-sm font-bold tracking-widest text-cyan-400 uppercase">Test Complete</div>
      <div className="grid grid-cols-2 gap-12 text-center">
        <div>
          <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{wpm}</div>
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mt-2">WPM</div>
        </div>
        <div>
          <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">98%</div>
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mt-2">Accuracy</div>
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => {
    // Sort so "You" is placed correctly based on WPM
    const entries = [
      { rank: 1, name: "NeonTyper", wpm: 152, acc: 99, isMe: false },
      { rank: 2, name: "SpeedDemon", wpm: 145, acc: 98, isMe: false },
      { rank: 3, name: "You (Guest)", wpm: wpm, acc: 98, isMe: true }, 
      { rank: 4, name: "AverageJoe", wpm: 80, acc: 95, isMe: false }, 
    ].sort((a,b) => b.wpm - a.wpm).slice(0, 3); // show top 3

    return (
      <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500 w-full max-w-xl mx-auto">
        <div className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-2 text-center">Global Leaderboard</div>
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => {
             const actualRank = i + 1;
             return (
               <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${entry.isMe ? 'bg-cyan-900/40 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-[1.02] transition-transform' : 'bg-slate-800/40 border-white/5'}`}>
                 <div className="flex items-center gap-4">
                   <div className={`font-black ${actualRank === 1 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : actualRank === 2 ? 'text-slate-300' : 'text-amber-600'}`}>
                     #{actualRank}
                   </div>
                   <div className={`font-medium ${entry.isMe ? 'text-cyan-200' : 'text-slate-200'}`}>{entry.name}</div>
                 </div>
                 <div className="flex gap-4 font-mono text-sm sm:text-base">
                   <div className="font-bold text-cyan-300">{entry.wpm} wpm</div>
                   <div className="text-slate-400">{entry.acc}%</div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    );
  };

  const renderMpLobby = () => (
    <div className="flex flex-col items-center justify-center gap-8 py-8 animate-in fade-in duration-300">
      <div className="text-xl font-bold text-white tracking-wide">Matchmaking...</div>
      <div className="flex gap-4 mt-4">
        {[1,2,3,4].map(p => (
          <div key={p} className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${p <= playersReady ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'border-slate-700 bg-slate-800/50 text-slate-600 scale-100'}`}>
             {p <= playersReady ? (
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             ) : (
               <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
             )}
          </div>
        ))}
      </div>
      <div className="text-sm font-semibold tracking-widest text-slate-400 uppercase mt-2">{playersReady}/4 Players Ready</div>
    </div>
  );

  const renderMpRacing = () => (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Race Progress */}
      <div className="flex flex-col gap-4">
        {[
          { name: "You", progress: Math.min(100, (typedIndex / DEMO_TEXT.length) * 100), color: "bg-cyan-400" },
          { name: "Player 2", progress: opponentsProgress[0], color: "bg-purple-400" },
          { name: "Player 3", progress: opponentsProgress[1], color: "bg-amber-400" },
          { name: "Player 4", progress: opponentsProgress[2], color: "bg-rose-400" },
        ].sort((a,b) => b.progress - a.progress).map((p, i) => (
          <div key={p.name} className="flex items-center gap-4">
             <div className={`w-20 text-xs font-bold uppercase tracking-wider truncate ${p.name === 'You' ? 'text-cyan-400' : 'text-slate-500'}`}>{p.name}</div>
             <div className="flex-1 h-4 bg-slate-800/80 rounded-full overflow-hidden border border-white/5 relative">
               <div className={`h-full ${p.color} transition-all duration-100 ease-linear shadow-[0_0_10px_currentColor]`} style={{ width: `${p.progress}%` }} />
             </div>
          </div>
        ))}
      </div>

      {/* Mini typing area */}
      <div className="font-mono text-lg leading-relaxed text-slate-500 line-clamp-2 mt-4 bg-slate-950/30 p-4 rounded-2xl border border-white/5">
        {DEMO_TEXT.map((char, index) => {
          let colorClass = "text-slate-600";
          if (index < typedIndex) colorClass = "text-white";
          else if (index === typedIndex) colorClass = "border-b-2 border-cyan-400 text-slate-300";
          return <span key={index} className={`transition-colors duration-75 ${colorClass}`}>{char}</span>;
        })}
      </div>
    </div>
  );

  const renderMpResult = () => {
    const sorted = [
      { name: "You", progress: 100, wpm: wpm },
      { name: "Player 2", progress: opponentsProgress[0], wpm: 105 },
      { name: "Player 3", progress: opponentsProgress[1], wpm: 95 },
      { name: "Player 4", progress: opponentsProgress[2], wpm: 80 },
    ].sort((a,b) => b.progress - a.progress); 

    return (
      <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 fade-in duration-500 w-full max-w-md mx-auto">
        <div className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-2 text-center">Race Results</div>
        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => (
             <div key={p.name} className={`flex items-center justify-between rounded-xl px-5 py-3 border ${p.name === 'You' ? 'bg-cyan-900/40 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15)] scale-[1.02] transition-transform' : 'bg-slate-800/40 border-white/5'}`}>
               <div className="flex items-center gap-4">
                 <div className={`font-black text-lg ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                   #{i + 1}
                 </div>
                 <div className={`font-bold ${p.name === 'You' ? 'text-cyan-200' : 'text-slate-300'}`}>{p.name}</div>
               </div>
               <div className="font-mono text-base font-bold text-cyan-300">{p.wpm} wpm</div>
             </div>
          ))}
        </div>
      </div>
    );
  };

  const getSceneTitle = () => {
    switch (scene) {
      case "TYPING": return "Single Player Session";
      case "RESULT": return "Session Overview";
      case "LEADERBOARD": return "Global Leaderboard";
      case "MP_LOBBY": return "Multiplayer Matchmaking";
      case "MP_RACING": return "Live Multiplayer Race";
      case "MP_RESULT": return "Multiplayer Standings";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-3xl border border-sky-200/20 bg-slate-900/45 shadow-[0_20px_60px_rgba(2,6,23,0.7)] backdrop-blur-xl overflow-hidden flex flex-col relative">
        {/* Glow effect behind the component */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
        
        {/* Header bar mimicking app top bar */}
        <div className="bg-slate-950/60 px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-rose-500/80 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-amber-500/80 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-emerald-500/80 transition-colors" />
          </div>
          <div className="text-xs font-bold tracking-widest text-cyan-400/80 uppercase flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {getSceneTitle()}
          </div>
          <div className="flex gap-1.5">
            {/* Dots to indicate progression roughly */}
            {(["TYPING", "RESULT", "LEADERBOARD", "MP_LOBBY", "MP_RACING", "MP_RESULT"] as Scene[]).map((s) => (
              <div key={s} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${scene === s ? 'bg-cyan-400 scale-125' : 'bg-slate-700 scale-100'}`} />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12 min-h-[380px] flex flex-col justify-center relative z-10">
          {scene === "TYPING" && renderTyping()}
          {scene === "RESULT" && renderResult()}
          {scene === "LEADERBOARD" && renderLeaderboard()}
          {scene === "MP_LOBBY" && renderMpLobby()}
          {scene === "MP_RACING" && renderMpRacing()}
          {scene === "MP_RESULT" && renderMpResult()}
        </div>
      </div>
    </div>
  );
}
