import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--ss-bg)',
            display: 'flex', flexDirection: 'row', alignItems: 'stretch',
        }}>
            {/* Left: brand panel (login-specific) */}
            <div style={{
                flex: '0 0 44%', minWidth: 320,
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #020617 100%)',
                borderRight: '1px solid var(--ss-border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48,
            }}>
                <div style={{ width: '100%', maxWidth: 340 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16, marginBottom: 24,
                        background: 'var(--ss-gradient-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                    }}>
                        <LogIn size={28} style={{ color: '#fff' }} />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ss-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        Welcome back
                    </h1>
                    <p style={{ color: 'var(--ss-text-muted)', fontSize: 15, lineHeight: 1.6 }}>
                        Sign in to your SyncSpace account to continue to your workspace and project rooms.
                    </p>
                </div>
            </div>

            {/* Right: form */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
                background: 'var(--ss-bg)',
            }}>
                <div style={{
                    width: '100%', maxWidth: 380,
                    background: 'var(--ss-surface)', border: '1px solid var(--ss-border)',
                    borderRadius: 20, padding: 40,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}>
                    <div style={{ marginBottom: 28 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ss-text)', marginBottom: 4 }}>Log in</h2>
                        <p style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>Enter your credentials</p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#FCA5A5', padding: '10px 14px', borderRadius: 10, marginBottom: 20, fontSize: 13,
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ss-text-muted)' }} />
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com" required
                                    className="ss-input-focus"
                                    style={{
                                        width: '100%', background: 'var(--ss-bg)', border: '1px solid var(--ss-border)',
                                        borderRadius: 12, padding: '12px 14px 12px 44px', fontSize: 14,
                                        color: 'var(--ss-text)', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ss-text-muted)' }} />
                                <input
                                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" required
                                    className="ss-input-focus"
                                    style={{
                                        width: '100%', background: 'var(--ss-bg)', border: '1px solid var(--ss-border)',
                                        borderRadius: 12, padding: '12px 14px 12px 44px', fontSize: 14,
                                        color: 'var(--ss-text)', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                            background: loading ? 'var(--ss-surface)' : 'var(--ss-primary)',
                            color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p style={{ marginTop: 28, textAlign: 'center', color: 'var(--ss-text-muted)', fontSize: 13 }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: 'var(--ss-primary)', textDecoration: 'none', fontWeight: 600 }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
