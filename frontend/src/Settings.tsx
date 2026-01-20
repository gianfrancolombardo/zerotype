import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Keyboard, Cpu, Save, Zap, Activity, Brain, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import './App.css';

interface ElectronAPI {
    onStatusUpdate: (callback: (data: { status: string; model?: string; text?: string; message?: string }) => void) => void;
    saveSettings: (settings: { hotkey: string; model: string }) => void;
    getSettings: () => Promise<{ hotkey: string; model: string }>;
    relaunchApp: () => void;
    quitApp: () => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

function Settings() {
    const [hotkey, setHotkey] = useState('F4');
    const [model, setModel] = useState('tiny');
    const [initialModel, setInitialModel] = useState('tiny');
    const [initialHotkey, setInitialHotkey] = useState('f4');
    const [isSaving, setIsSaving] = useState(false);
    const [isQuitting, setIsQuitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.getSettings().then((settings: any) => {
                if (settings) {
                    const m = settings.model || 'tiny';
                    const h = settings.hotkey || 'f4';
                    setHotkey(h);
                    setInitialHotkey(h);
                    setModel(m);
                    setInitialModel(m);
                }
            });
        }
    }, []);

    useEffect(() => {
        if (!isRecording) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Format key name consistent with keyboard library in Python
            let key = e.key.toLowerCase();
            if (key === 'control') return;
            if (key === 'shift') return;
            if (key === 'alt') return;
            if (key === 'meta') return;

            setHotkey(key);
            setIsRecording(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecording]);

    const handleSave = () => {
        setIsSaving(true);
        if (window.electronAPI) {
            window.electronAPI.saveSettings({ hotkey, model });

            if (model !== initialModel || hotkey !== initialHotkey) {
                setTimeout(() => {
                    setIsQuitting(true);
                    setTimeout(() => {
                        window.electronAPI.quitApp();
                    }, 3000);
                }, 800);
            } else {
                setTimeout(() => {
                    setIsSaving(false);
                }, 1000);
            }
        }
    };

    const handleClose = () => {
        window.close();
    };

    const models = [
        { id: 'tiny', name: 'Tiny', speed: 'Ultra Rápido', accuracy: 'Básica', icon: <Zap size={16} color="#eab308" /> },
        { id: 'base', name: 'Base', speed: 'Rápido', accuracy: 'Buena', icon: <Activity size={16} color="#3b82f6" /> },
        { id: 'small', name: 'Small', speed: 'Moderado', accuracy: 'Alta', icon: <Brain size={16} color="#a855f7" /> },
    ];

    return (
        <div className="settings-window" style={{
            background: '#121212',
            height: '100vh',
            width: '100vw',
            color: '#e0e0e0',
            fontFamily: '"Inter", sans-serif',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
        }}>
            {/* Barra de Título Personalizada */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                WebkitAppRegion: 'drag',
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            } as any}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SettingsIcon size={18} color="#a855f7" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Ajustes de Zerotype</span>
                </div>
                <button
                    onClick={handleClose}
                    style={{
                        WebkitAppRegion: 'no-drag',
                        background: 'transparent',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    } as any}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4b4b')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                >
                    <X size={18} />
                </button>
            </header>

            <div className="settings-content" style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                overflow: 'hidden'
            }}>
                {/* Fila Horizontal para Atajo (Estadísticas ocultas) */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Sección de Hotkey */}
                    <section style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', opacity: 0.5 }}>
                            <Keyboard size={12} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Atajo de Teclado</span>
                        </div>
                        <div
                            onClick={() => setIsRecording(true)}
                            style={{
                                background: isRecording ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${isRecording ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.04)'}`,
                                borderRadius: '16px',
                                padding: '10px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                height: '48px',
                                boxSizing: 'border-box',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.8 }}>
                                {isRecording ? 'Presiona una tecla...' : 'Modificar atajo'}
                            </span>
                            <kbd style={{
                                background: '#111',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                borderBottom: '2px solid #000',
                                fontSize: '0.85rem',
                                color: isRecording ? '#fff' : '#a855f7',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                border: isRecording ? '1px solid rgba(168, 85, 247, 0.5)' : 'none'
                            }}>{isRecording ? '?' : hotkey.toUpperCase()}</kbd>
                        </div>
                    </section>
                </div>

                {/* Sección de Motor Neuronal */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', opacity: 0.5 }}>
                        <Cpu size={12} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Motor Neuronal</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {models.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => setModel(m.id)}
                                style={{
                                    background: model === m.id ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                    border: `1px solid ${model === m.id ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.04)'}`,
                                    borderRadius: '14px',
                                    padding: '10px 6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    background: model === m.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.2)',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {m.icon}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: model === m.id ? '#fff' : '#aaa' }}>{m.name}</div>
                                <div style={{ fontSize: '0.6rem', opacity: model === m.id ? 0.7 : 0.3 }}>{m.speed.split(' ')[0]}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Área de Información */}
                <div style={{
                    marginTop: 'auto',
                    background: 'rgba(168, 85, 247, 0.03)',
                    border: '1px solid rgba(168, 85, 247, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Activity size={16} color="#a855f7" />
                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6, lineHeight: 1.4 }}>
                        Modelo: <strong>{model.toUpperCase()}</strong>. Los cambios requieren reiniciar la aplicación.
                    </p>
                </div>
            </div>

            {/* Botón de Guardar */}
            <footer style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.01)' }}>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isQuitting}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: isQuitting ? '#ef4444' : (isSaving ? '#22c55e' : '#a855f7'),
                        border: 'none',
                        color: 'white',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease',
                        boxShadow: isQuitting ? '0 4px 12px rgba(239, 68, 68, 0.2)' : (isSaving ? '0 4px 12px rgba(34, 197, 94, 0.2)' : '0 4px 12px rgba(168, 85, 247, 0.2)'),
                    }}
                >
                    {isQuitting ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} />
                                <span>Cerrando para aplicar cambios...</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', opacity: 0.9, marginTop: '2px', fontWeight: 400 }}>
                                Por favor, abre el programa manualmente.
                            </span>
                        </div>
                    ) : (isSaving ? (
                        <>
                            <CheckCircle2 size={18} />
                            Cambios Aplicados
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Aplicar Cambios
                        </>
                    ))}
                </button>
            </footer>
        </div>
    );
}

export default Settings;
