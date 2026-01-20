import { useState, useEffect } from 'react'
import { Mic, Loader2, Check, AlertCircle } from 'lucide-react'
import './App.css'

function App() {
  const [status, setStatus] = useState<string>('idle');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onStatusUpdate((data: { status: string; model?: string }) => {
        if (data.model) {
          (window as any).currentModel = data.model;
        }
        setStatus(data.status);
      });
    }
  }, []);

  const getStatusContent = () => {
    switch (status) {
      case 'recording':
        return (
          <div className="status-container recording">
            <Mic size={64} className="icon-pulse" color="#ef4444" />
          </div>
        );
      case 'transcribing':
        return (
          <div className="status-container transcribing">
            <Loader2 size={64} className="spin" color="#3b82f6" />
          </div>
        );
      case 'done':
        return (
          <div className="status-container done">
            <Check size={64} color="#22c55e" />
          </div>
        );
      case 'error':
        return (
          <div className="status-container error">
            <AlertCircle size={64} color="#ef4444" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {getStatusContent()}
    </div>
  )
}

export default App
