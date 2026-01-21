import { useState, useEffect } from 'react'
import { Mic, Loader2, Check, AlertCircle } from 'lucide-react'
import './App.css'

const PARTICLE_COUNT = 25;

const ParticleVisualizer = ({ status }: { status: string }) => {
  return (
    <div className={`particle-container ${status}`}>
      {[...Array(PARTICLE_COUNT)].map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360;
        const driftRadius = 150; // Max distance for drift
        const tx = Math.cos((angle * Math.PI) / 180) * driftRadius;
        const ty = Math.sin((angle * Math.PI) / 180) * driftRadius;
        const delay = Math.random() * 2;
        const duration = 4 + Math.random() * 3; // Even more majestic and slow

        return (
          <div
            key={i}
            className="particle"
            style={{
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              '--delay': `${delay}s`,
              '--duration': `${duration}s`,
              '--angle': `${angle}deg`,
            } as any}
          />
        );
      })}
    </div>
  );
};

function App() {
  const [status, setStatus] = useState<string>('welcome');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Stage 1: Wait 1.5s then start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1500);

    // Stage 2: Wait for animation (300ms) plus a safety buffer, then go idle
    // This transition should happen AFTER the window is hidden by Electron
    const idleTimer = setTimeout(() => {
      setStatus('idle');
    }, 2000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(idleTimer);
    };
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onStatusUpdate((data: { status: string; model?: string }) => {
        if (data.model) {
          (window as any).currentModel = data.model;
        }

        // Don't let initial 'idle' from backend override 'welcome' immediately (protect for 2s)
        setStatus(prev => (prev === 'welcome' && data.status === 'idle') ? 'welcome' : data.status);
      });
    }
  }, []);

  const getStatusContent = () => {
    if (status === 'welcome') {
      return (
        <div className="status-container welcome">
          <div className={`welcome-card ${isExiting ? 'exit' : ''}`}>
            <Mic size={16} color="var(--color-accent)" style={{ opacity: 0.8 }} />
            <span className="welcome-text-content">Zerotype está listo cuando tú lo estés.</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`status-container ${status}`}>
        {/* Particles are at z-index 5 */}
        <ParticleVisualizer status={status} />

        {/* Visual Card is at z-index 10, covering particles at the center */}
        <div className="visual-card">
          <div className="icon-wrapper">
            {status === 'recording' && <Mic size={32} color="#ef4444" />}
            {status === 'transcribing' && <Loader2 size={32} className="spin" color="var(--color-accent)" />}
            {status === 'done' && <Check size={32} color="#22c55e" />}
            {status === 'error' && <AlertCircle size={32} color="#ef4444" />}
            {(status === 'idle' || status === '') && <Mic size={24} color="var(--color-secondary)" style={{ opacity: 0.3 }} />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {getStatusContent()}
    </div>
  )
}

export default App
