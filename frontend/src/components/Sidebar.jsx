import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Search, MoreVertical, MessageSquarePlus, LogOut, MessageSquare, Hash } from 'lucide-react';
import api from '../api/axios';
import { useRoomStore } from '../store/useRoomStore';
import RoomPanel from './RoomPanel';

export default function Sidebar() {
    const { conversations, fetchConversations, setActiveConversation, activeConversation } = useChatStore();
    const { user, logout } = useAuthStore();
    const { fetchRooms, activeRoom, setActiveRoom } = useRoomStore();
    const isAdmin = user?.role === 'ADMIN';
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) console.log('[Sidebar] user.role =', user.role, 'isAdmin =', isAdmin);
    }, [user?.role, isAdmin]);
    const [searchResults, setSearchResults] = useState([]);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'rooms'

    useEffect(() => {
        fetchConversations();
        fetchRooms();
    }, []);

    const handleSearch = async (val) => {
        setSearchTerm(val);
        if (val.length > 1) {
            try {
                const { data } = await api.get(`/chat/users?search=${val}`);
                setSearchResults(data);
            } catch (error) { console.error(error); }
        } else {
            setSearchResults([]);
        }
    };

    const startConversation = async (userId) => {
        try {
            const { data } = await api.post('/chat/conversations', { userId });
            setActiveConversation(data);
            setActiveRoom(null);
            setSearchTerm('');
            setSearchResults([]);
            fetchConversations();
            setActiveTab('chats');
        } catch (error) { console.error(error); }
    };

    const displayName = user?.username || 'User';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* ── Header ──────────────────────────── */}
            <div style={{
                height: 64, padding: '0 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--ss-border)',
                background: 'var(--ss-gradient-header)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'var(--ss-gradient-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 15, color: '#fff',
                        boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                    }}>
                        {displayName[0]?.toUpperCase() || 'G'}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ss-text)' }}>{displayName}</div>
                        <div style={{ fontSize: 11, color: 'var(--ss-online)', fontWeight: 500 }}>● Online</div>
                    </div>
                </div>
                <button onClick={logout} title="Logout" style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 8, borderRadius: 8, color: 'var(--ss-text-muted)',
                    display: 'flex', transition: 'color 0.15s',
                }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--ss-text-muted)'}
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* ── Tabs ────────────────────────────── */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--ss-border)', background: 'var(--ss-surface)' }}>
                <button
                    onClick={() => setActiveTab('chats')}
                    style={{
                        flex: 1, padding: '12px 0', border: 'none', background: 'none',
                        color: activeTab === 'chats' ? 'var(--ss-primary)' : 'var(--ss-text-muted)',
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                        cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                >
                    <MessageSquare size={14} /> Chats
                    {activeTab === 'chats' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--ss-primary)' }} />}
                </button>
                <button
                    onClick={() => setActiveTab('rooms')}
                    style={{
                        flex: 1, padding: '12px 0', border: 'none', background: 'none',
                        color: activeTab === 'rooms' ? 'var(--ss-primary)' : 'var(--ss-text-muted)',
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                        cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                >
                    <Hash size={14} /> Rooms
                    {activeTab === 'rooms' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--ss-primary)' }} />}
                </button>
            </div>

            {/* ── Search ──────────────────────────── */}
            {activeTab === 'chats' && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ss-border)' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'var(--ss-surface)', borderRadius: 10, padding: '0 14px',
                        border: '1px solid var(--ss-border)',
                        transition: 'border-color 0.15s',
                    }}>
                        <Search size={15} style={{ color: 'var(--ss-text-muted)', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search people..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="ss-input-focus"
                            style={{
                                flex: 1, border: 'none', outline: 'none',
                                background: 'transparent', padding: '10px 0',
                                fontSize: 13, color: 'var(--ss-text)',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ── List Area ─────────────────────────── */}
            <div className="ss-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                {activeTab === 'rooms' ? (
                    <RoomPanel />
                ) : searchTerm.length > 1 ? (
                    <>
                        <div style={{ padding: '14px 20px 6px', fontSize: 11, fontWeight: 700, color: 'var(--ss-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Results
                        </div>
                        {searchResults.length === 0 && (
                            <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--ss-text-muted)', fontSize: 13 }}>
                                No users found
                            </div>
                        )}
                        {searchResults.map(u => (
                            <button
                                key={u._id}
                                onClick={() => startConversation(u._id)}
                                className="ss-conv-item"
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center',
                                    gap: 12, padding: '12px 20px', border: 'none',
                                    background: 'transparent', cursor: 'pointer', textAlign: 'left',
                                }}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: 'var(--ss-surface)', color: 'var(--ss-text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 600, fontSize: 16, flexShrink: 0,
                                    border: '1px solid var(--ss-border-light)',
                                }}>
                                    {u.username?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--ss-text)' }}>
                                        {u.username || 'Unknown'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--ss-text-muted)', marginTop: 1 }}>
                                        {u.email || 'Tap to start chatting'}
                                    </div>
                                </div>
                                <MessageSquarePlus size={16} style={{ color: 'var(--ss-primary)', flexShrink: 0 }} />
                            </button>
                        ))}
                    </>
                ) : (
                    <>
                        <div style={{ padding: '14px 20px 6px', fontSize: 11, fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Conversations
                        </div>
                        {conversations.length === 0 && (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ss-text-muted)', fontSize: 13, lineHeight: 1.7 }}>
                                No conversations yet.<br />Search for someone to begin.
                            </div>
                        )}
                        {conversations.map(conv => {
                            const otherUser = conv.participants?.find(p => p._id !== user?._id);
                            const isActive = activeConversation?._id === conv._id;
                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => {
                                        setActiveConversation(conv);
                                        setActiveRoom(null);
                                    }}
                                    className="ss-conv-item"
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center',
                                        gap: 12, padding: '14px 20px', border: 'none',
                                        background: isActive ? 'var(--ss-surface)' : 'transparent',
                                        cursor: 'pointer', textAlign: 'left',
                                        borderLeft: isActive ? '3px solid var(--ss-primary)' : '3px solid transparent',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 12,
                                            background: isActive ? 'var(--ss-primary)' : 'var(--ss-surface)',
                                            color: isActive ? '#fff' : 'var(--ss-text-secondary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 600, fontSize: 16,
                                            border: '1px solid var(--ss-border-light)',
                                            transition: 'all 0.15s ease',
                                        }}>
                                            {otherUser?.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        {otherUser?.isOnline && (
                                            <div style={{
                                                position: 'absolute', bottom: -1, right: -1,
                                                width: 12, height: 12, borderRadius: '50%',
                                                background: 'var(--ss-online)',
                                                border: '2px solid var(--ss-bg)',
                                            }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--ss-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {otherUser?.username || 'Unknown'}
                                            </span>
                                            {conv.updatedAt && (
                                                <span style={{ fontSize: 11, color: 'var(--ss-text-muted)', flexShrink: 0, marginLeft: 8 }}>
                                                    {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: 13, color: 'var(--ss-text-muted)', marginTop: 3,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {conv.lastMessage?.text || 'No messages yet'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </>
                )}
            </div>

            {/* ── Footer brand ─────────────────────── */}
            <div style={{
                padding: '12px 20px', borderTop: '1px solid var(--ss-border)',
                textAlign: 'center',
            }}>
                <span className="ss-gradient-text" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    SyncSpace
                </span>
            </div>
        </div>
    );
}
