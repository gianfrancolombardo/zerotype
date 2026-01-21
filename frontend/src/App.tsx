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
        const duration = 3 + Math.random() * 2; // Majestic movement

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

  useEffect(() => {
    // Show welcome message for 2500ms
    const timer = setTimeout(() => {
      setStatus('idle');
    }, 2500);

    return () => clearTimeout(timer);
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
            {status === 'welcome' && <Mic size={24} color="var(--color-accent)" style={{ opacity: 0.8 }} />}
            {(status === 'idle' || status === '') && <Mic size={24} color="var(--color-secondary)" style={{ opacity: 0.3 }} />}
          </div>
        </div>
        {status === 'welcome' && (
          <div className="status-label welcome-text">
            Zerotype está listo cuando tú lo estés.
          </div>
        )}
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
