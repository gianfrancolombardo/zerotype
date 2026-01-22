import { useState, useEffect } from 'react';
import { Keyboard, Cpu, Save, Zap, Activity, Brain, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import './App.css';

interface ElectronAPI {
    onStatusUpdate: (callback: (data: { status: string; model?: string; text?: string; message?: string }) => void) => void;
    saveSettings: (settings: { hotkey: string; model: string; language: string }) => void;
    getSettings: () => Promise<{ hotkey: string; model: string; language: string }>;
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
    const [language, setLanguage] = useState('es');
    const [initialModel, setInitialModel] = useState('tiny');
    const [initialHotkey, setInitialHotkey] = useState('f4');
    const [initialLanguage, setInitialLanguage] = useState('es');
    const [isSaving, setIsSaving] = useState(false);
    const [isQuitting, setIsQuitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.getSettings().then((settings: any) => {
                if (settings) {
                    const m = settings.model || 'tiny';
                    const h = settings.hotkey || 'f4';
                    const l = settings.language || 'es';
                    setHotkey(h);
                    setInitialHotkey(h);
                    setModel(m);
                    setInitialModel(m);
                    setLanguage(l);
                    setInitialLanguage(l);
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
            window.electronAPI.saveSettings({ hotkey, model, language });

            if (model !== initialModel || hotkey !== initialHotkey || language !== initialLanguage) {
                setTimeout(() => {
                    setIsQuitting(true);
                    setTimeout(() => {
                        window.electronAPI.relaunchApp();
                    }, 1500);
                }, 400);
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
        <div className="settings-window glass" style={{
            height: '100vh',
            width: '100vw',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-body)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
        }}>
            {/* Barra de Título Personalizada */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                WebkitAppRegion: 'drag',
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid var(--color-dark-border)'
            } as any}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                        src="./logo.png"
                        alt="Zerotype"
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '8px',
                            boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    />
                    <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.01em'
                    }}>Ajustes de Zerotype</span>
                </div>
                <button
                    onClick={handleClose}
                    style={{
                        WebkitAppRegion: 'no-drag',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-secondary)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    } as any}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-secondary)')}
                >
                    <X size={20} />
                </button>
            </header>

            <div className="settings-content" style={{
                flex: 1,
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                overflow: 'hidden'
            }}>
                {/* Sección de Hotkey */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.6 }}>
                        <Keyboard size={12} color="var(--color-accent)" />
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)'
                        }}>Atajo de Teclado</span>
                    </div>
                    <div
                        onClick={() => setIsRecording(true)}
                        style={{
                            background: isRecording ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isRecording ? 'var(--color-accent)' : 'var(--color-dark-border)'}`,
                            borderRadius: '10px',
                            padding: '8px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-secondary)' }}>
                            {isRecording ? 'Presiona una tecla...' : 'Modificar atajo'}
                        </span>
                        <kbd style={{
                            background: '#000',
                            padding: '3px 10px',
                            borderRadius: '5px',
                            fontSize: '0.8rem',
                            color: isRecording ? '#fff' : 'var(--color-accent)',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            boxShadow: isRecording ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>{isRecording ? '?' : hotkey.toUpperCase()}</kbd>
                    </div>
                </section>

                {/* Sección de Motor Neuronal */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.6 }}>
                        <Cpu size={12} color="var(--color-accent)" />
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)'
                        }}>Modelo de IA</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {models.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => setModel(m.id)}
                                style={{
                                    background: model === m.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                    border: `1px solid ${model === m.id ? 'var(--color-accent)' : 'var(--color-dark-border)'}`,
                                    borderRadius: '12px',
                                    padding: '10px 8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'center',
                                    boxShadow: model === m.id ? '0 4px 15px rgba(99, 102, 241, 0.15)' : 'none'
                                }}
                            >
                                <div style={{
                                    background: model === m.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: model === m.id ? 'white' : 'var(--color-accent)',
                                    marginBottom: '2px'
                                }}>
                                    {m.id === 'tiny' ? <Zap size={14} /> : m.id === 'base' ? <Activity size={14} /> : <Brain size={14} />}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: model === m.id ? '#fff' : 'var(--color-secondary)' }}>{m.name}</div>
                                <div style={{ fontSize: '0.55rem', fontWeight: 500, opacity: model === m.id ? 0.9 : 0.4 }}>{m.speed}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sección de Idioma */}
                <section f-id="idioma-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.6 }}>
                        <Activity size={12} color="var(--color-accent)" />
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)'
                        }}>Idioma de Dictado</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {[
                            { id: 'es', name: 'Español' },
                            { id: 'en', name: 'Inglés' },
                            { id: 'auto', name: 'Automático' }
                        ].map((l) => (
                            <div
                                key={l.id}
                                onClick={() => setLanguage(l.id)}
                                style={{
                                    background: language === l.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                    border: `1px solid ${language === l.id ? 'var(--color-accent)' : 'var(--color-dark-border)'}`,
                                    borderRadius: '12px',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: language === l.id ? '#fff' : 'var(--color-secondary)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {l.name}
                            </div>
                        ))}
                    </div>
                </section>

                <div style={{
                    marginTop: 'auto',
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Activity size={14} color="var(--color-accent)" />
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-secondary)', lineHeight: 1.4 }}>
                        Configuración actual: <strong style={{ color: '#fff' }}>{model.toUpperCase()}</strong> ({language.toUpperCase()})
                    </p>
                </div>
            </div>

            {/* Botón de Guardar */}
            <footer style={{
                padding: '16px 24px 24px',
                borderTop: '1px solid var(--color-dark-border)',
                background: 'rgba(255, 255, 255, 0.01)'
            }}>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isQuitting}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: isQuitting ? '#ef4444' : (isSaving ? '#22c55e' : 'var(--color-accent)'),
                        border: 'none',
                        color: 'white',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isQuitting ? '0 8px 16px rgba(239, 68, 68, 0.3)' : (isSaving ? '0 8px 16px rgba(34, 197, 94, 0.3)' : '0 8px 20px rgba(99, 102, 241, 0.3)'),
                        fontFamily: 'var(--font-display)'
                    }}
                >
                    {isQuitting ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={20} />
                                <span>Reiniciando aplicación...</span>
                            </div>
                        </div>
                    ) : (isSaving ? (
                        <>
                            <CheckCircle2 size={20} />
                            Aplicado Correctamente
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Guardar Cambios
                        </>
                    ))}
                </button>
            </footer>
        </div>
    );
}

export default Settings;
