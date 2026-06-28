import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TypeMetric Typing Result";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getSharedSession(shareId: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1").replace("localhost", "127.0.0.1");
  try {
    const res = await fetch(`${baseUrl}/typing-sessions/share/${shareId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error generating OG image:", error);
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const session = await getSharedSession(shareId);
  
  if (!session) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', backgroundColor: '#0f172a', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: 60, fontFamily: 'sans-serif' }}>Result Not Found</h1>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #020617)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '-30%', left: '20%', width: 800, height: 800, background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(147,51,234,0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
        
        {/* Header/Logo */}
        <div style={{ position: 'absolute', top: 50, left: 60, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 36, fontWeight: 'bold', color: '#fff', letterSpacing: '-0.02em' }}>TypeMetric</span>
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40, zIndex: 10 }}>
          {session.avatar ? (
            <img src={session.avatar} alt="avatar" style={{ width: 88, height: 88, borderRadius: 44, marginRight: 24, border: '4px solid #1e293b' }} />
          ) : (
            <div style={{ width: 88, height: 88, borderRadius: 44, marginRight: 24, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 'bold' }}>
              {session.username.charAt(0)}
            </div>
          )}
          <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.01em' }}>{session.username}</span>
        </div>

        {/* WPM Display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 60, zIndex: 10 }}>
          <div style={{ fontSize: 24, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, fontWeight: 500 }}>Typing Speed</div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 180, fontWeight: 900, color: '#22d3ee', lineHeight: 1, letterSpacing: '-0.03em' }}>{Math.round(session.wpm)}</span>
            <span style={{ fontSize: 44, fontWeight: 600, color: '#06b6d4', marginLeft: 20 }}>WPM</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'flex', gap: 70, zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(30,41,59,0.5)', padding: '24px 40px', borderRadius: 24, border: '1px solid rgba(51,65,85,0.8)' }}>
            <span style={{ fontSize: 20, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Accuracy</span>
            <span style={{ fontSize: 42, fontWeight: 700 }}>{session.accuracy.toFixed(1).replace(/\.0$/, '')}%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(30,41,59,0.5)', padding: '24px 40px', borderRadius: 24, border: '1px solid rgba(51,65,85,0.8)' }}>
            <span style={{ fontSize: 20, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Consistency</span>
            <span style={{ fontSize: 42, fontWeight: 700 }}>{session.consistency}%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(30,41,59,0.5)', padding: '24px 40px', borderRadius: 24, border: '1px solid rgba(51,65,85,0.8)' }}>
            <span style={{ fontSize: 20, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Duration</span>
            <span style={{ fontSize: 42, fontWeight: 700 }}>{session.duration}s</span>
          </div>
        </div>

      </div>
    ),
    {
      ...size,
    }
  );
}
