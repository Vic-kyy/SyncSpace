import React, { useState } from 'react';

export default function UsernameModal({ onSubmit }) {
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) onSubmit(username.trim());
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
        }}>
            <div style={{
                width: 400, background: '#1E293B', borderRadius: 16,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                overflow: 'hidden',
            }}>
                {/* Gradient accent bar */}
                <div style={{ height: 4, background: 'var(--ss-gradient-accent)' }} />

                <div style={{ padding: '32px 32px 28px' }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'var(--ss-gradient-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <span className="ss-gradient-text" style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>
                            SyncSpace
                        </span>
                    </div>

                    <p style={{ fontSize: 14, color: 'var(--ss-text-muted)', margin: '16px 0 24px', lineHeight: 1.6 }}>
                        Enter your name to start messaging. No account required.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                            Display Name
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. Alex"
                            required
                            maxLength={20}
                            className="ss-input-focus"
                            style={{
                                width: '100%', padding: '12px 16px',
                                background: 'var(--ss-bg)', border: '1px solid var(--ss-border-light)',
                                borderRadius: 10, fontSize: 15, color: 'var(--ss-text)',
                                outline: 'none', transition: 'border-color 0.15s',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!username.trim()}
                            style={{
                                width: '100%', marginTop: 20, padding: '12px 0',
                                background: username.trim() ? 'var(--ss-primary)' : 'var(--ss-surface)',
                                color: username.trim() ? '#fff' : 'var(--ss-text-muted)',
                                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                                cursor: username.trim() ? 'pointer' : 'default',
                                transition: 'all 0.2s ease',
                                boxShadow: username.trim() ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                                letterSpacing: 0.2,
                            }}
                        >
                            Start Chatting →
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
