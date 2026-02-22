import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, User, Loader2, UserPlus, Shield, Users } from 'lucide-react';

const ROLES = [
    { value: 'MEMBER', label: 'Member', description: 'Join rooms you\'re assigned to', Icon: Users },
    { value: 'ADMIN', label: 'Admin', description: 'Create rooms and manage teams', Icon: Shield },
];

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [error, setError] = useState('');
    const { signup, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await signup(username, email, password, role);
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
            {/* Left: form (signup-specific) */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
                background: 'var(--ss-bg)',
            }}>
                <div style={{
                    width: '100%', maxWidth: 440,
                    background: 'var(--ss-surface)', border: '1px solid var(--ss-border)',
                    borderRadius: 20, padding: 40,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}>
                    <div style={{ marginBottom: 28 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ss-text)', marginBottom: 4 }}>Create account</h2>
                        <p style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>Choose your role and sign up</p>
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
                        {/* Role selection */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 10 }}>
                                I am signing up as
                            </label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {ROLES.map((r) => {
                                    const Icon = r.Icon;
                                    const isSelected = role === r.value;
                                    return (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            style={{
                                                flex: 1, padding: '14px 12px', borderRadius: 12, border: `2px solid ${isSelected ? 'var(--ss-primary)' : 'var(--ss-border)'}`,
                                                background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--ss-bg)',
                                                color: isSelected ? 'var(--ss-primary)' : 'var(--ss-text-muted)',
                                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Icon size={18} />
                                                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</span>
                                            </div>
                                            <span style={{ fontSize: 11, opacity: 0.9 }}>{r.description}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                                Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ss-text-muted)' }} />
                                <input
                                    type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe" required
                                    className="ss-input-focus"
                                    style={{
                                        width: '100%', background: 'var(--ss-bg)', border: '1px solid var(--ss-border)',
                                        borderRadius: 10, padding: '11px 12px 11px 38px', fontSize: 14,
                                        color: 'var(--ss-text)', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ss-text-muted)' }} />
                                <input
                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com" required
                                    className="ss-input-focus"
                                    style={{
                                        width: '100%', background: 'var(--ss-bg)', border: '1px solid var(--ss-border)',
                                        borderRadius: 10, padding: '11px 12px 11px 38px', fontSize: 14,
                                        color: 'var(--ss-text)', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ss-text-muted)' }} />
                                <input
                                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••" required minLength={6}
                                    className="ss-input-focus"
                                    style={{
                                        width: '100%', background: 'var(--ss-bg)', border: '1px solid var(--ss-border)',
                                        borderRadius: 10, padding: '11px 12px 11px 38px', fontSize: 14,
                                        color: 'var(--ss-text)', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                            background: loading ? 'var(--ss-surface)' : 'var(--ss-primary)',
                            color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--ss-text-muted)', fontSize: 13 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--ss-primary)', textDecoration: 'none', fontWeight: 600 }}>
                            Log in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right: brand panel (signup-specific) */}
            <div style={{
                flex: '0 0 42%', minWidth: 300,
                background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)',
                borderLeft: '1px solid var(--ss-border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48,
            }}>
                <div style={{ width: '100%', maxWidth: 320 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16, marginBottom: 24,
                        background: 'var(--ss-gradient-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(20,184,166,0.35)',
                    }}>
                        <UserPlus size={28} style={{ color: '#fff' }} />
                    </div>
                    <h1 className="ss-gradient-text" style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>SyncSpace</h1>
                    <p style={{ color: 'var(--ss-text-muted)', fontSize: 15, lineHeight: 1.6 }}>
                        Create your account as a <strong>Member</strong> to join assigned rooms, or as <strong>Admin</strong> to create and manage project rooms.
                    </p>
                </div>
            </div>
        </div>
    );
}
