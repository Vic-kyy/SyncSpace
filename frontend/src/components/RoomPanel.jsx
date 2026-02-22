import React, { useState, useEffect } from 'react';
import { useRoomStore } from '../store/useRoomStore';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { Plus, Hash, Lock, Trash2, X } from 'lucide-react';

export default function RoomPanel() {
    const { rooms, createRoom, activeRoom, setActiveRoom, deleteRoom } = useRoomStore();
    const setActiveRoomInChat = useChatStore((s) => s.setActiveRoom);
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [accessRestrictedRoom, setAccessRestrictedRoom] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (showCreateModal && isAdmin) {
            api.get('/chat/members').then(({ data }) => setMembers(data || [])).catch(() => setMembers([]));
        }
    }, [showCreateModal, isAdmin]);

    const handleDeleteRoom = async (e, room) => {
        e.stopPropagation();
        if (!window.confirm(`Delete room "${room.name}"? This cannot be undone.`)) return;
        setDeletingId(room._id);
        const res = await deleteRoom(room._id);
        setDeletingId(null);
        if (!res?.success) console.error('Delete room failed:', res?.error);
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipantIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Room name is required');
            return;
        }
        setCreating(true);
        const res = await createRoom({
            name: name.trim(),
            description: description.trim(),
            participants: selectedParticipantIds,
        });
        setCreating(false);
        if (res.success) {
            setName('');
            setDescription('');
            setSelectedParticipantIds([]);
            setShowCreateModal(false);
        } else {
            setError(res.error || 'Failed to create room');
        }
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--ss-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Project Rooms
                </h3>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={() => { setShowCreateModal(true); setError(''); setSelectedParticipantIds([]); }}
                        style={{ background: 'none', border: 'none', color: 'var(--ss-primary)', cursor: 'pointer', display: 'flex', padding: 4 }}
                        aria-label="Create room"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>

            {/* Create Room Modal (ADMIN only) */}
            {showCreateModal && isAdmin && (
                <div
                    style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 20, padding: 24,
                    }}
                    onClick={() => { setShowCreateModal(false); setError(''); }}
                >
                    <div
                        style={{
                            background: 'var(--ss-surface)', borderRadius: 12, padding: 24, maxWidth: 400, width: '100%', border: '1px solid var(--ss-border)',
                            boxShadow: 'var(--ss-shadow-lg)', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ss-text)' }}>Create Room</span>
                            <button type="button" onClick={() => { setShowCreateModal(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--ss-text-muted)', cursor: 'pointer', padding: 4 }}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            {error && (
                                <div style={{ marginBottom: 12, padding: '8px 10px', background: 'rgba(239,68,68,0.15)', borderRadius: 8, color: '#FCA5A5', fontSize: 12 }}>
                                    {error}
                                </div>
                            )}
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: 4 }}>Room Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setError(''); }}
                                placeholder="Room name..."
                                required
                                style={{ width: '100%', background: 'var(--ss-bg)', border: '1px solid var(--ss-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--ss-text)', fontSize: 14, outline: 'none', marginBottom: 16 }}
                                disabled={creating}
                            />
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: 4 }}>Description (optional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Description"
                                style={{ width: '100%', background: 'var(--ss-bg)', border: '1px solid var(--ss-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--ss-text)', fontSize: 14, outline: 'none', resize: 'none', minHeight: 60, marginBottom: 16 }}
                                disabled={creating}
                            />
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: 8 }}>Participants (members)</label>
                            <div className="ss-scrollbar" style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--ss-border)', borderRadius: 8, padding: 8, marginBottom: 20, background: 'var(--ss-bg)' }}>
                                {members.length === 0 && <div style={{ fontSize: 13, color: 'var(--ss-text-muted)', padding: 8 }}>No members found</div>}
                                {members.map((m) => (
                                    <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedParticipantIds.includes(m._id)}
                                            onChange={() => toggleParticipant(m._id)}
                                            disabled={creating}
                                        />
                                        <span style={{ fontSize: 13, color: 'var(--ss-text)' }}>{m.username || m.email}</span>
                                    </label>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button type="button" onClick={() => { setShowCreateModal(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--ss-text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={creating} style={{ background: creating ? 'var(--ss-surface)' : 'var(--ss-primary)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: creating ? 'wait' : 'pointer' }}>
                                    {creating ? 'Creating…' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Room List — ADMIN always has access (no lock); MEMBER: lock + modal if not assigned */}
            <div className="ss-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                {rooms.map(room => {
                    const hasAccess = isAdmin || room.hasAccess === true;
                    const isActive = activeRoom?._id === room._id;
                    return (
                        <div
                            key={room._id}
                            style={{
                                width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                                background: isActive ? 'var(--ss-surface-bright)' : 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    if (!hasAccess) {
                                        setAccessRestrictedRoom(room);
                                        return;
                                    }
                                    setActiveRoom(room);
                                    setActiveRoomInChat(room);
                                }}
                                style={{
                                    flex: 1, padding: 0, display: 'flex', alignItems: 'center', gap: 12, border: 'none',
                                    background: 'none', cursor: hasAccess ? 'pointer' : 'default', textAlign: 'left',
                                    opacity: hasAccess ? 1 : 0.85, minWidth: 0,
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: hasAccess ? 'rgba(20,184,166,0.1)' : 'var(--ss-surface)',
                                    color: hasAccess ? 'var(--ss-secondary)' : 'var(--ss-text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(20,184,166,0.2)', flexShrink: 0
                                }}>
                                    {hasAccess ? <Hash size={20} /> : <Lock size={18} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--ss-text)', marginBottom: 2 }}>{room.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--ss-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {room.participants?.length || 0} members · {room.description || 'No description'}
                                        {!hasAccess && ' · Restricted'}
                                    </div>
                                </div>
                            </button>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteRoom(e, room)}
                                    disabled={deletingId === room._id}
                                    title="Delete room"
                                    style={{
                                        background: 'none', border: 'none', padding: 6, cursor: deletingId === room._id ? 'wait' : 'pointer',
                                        color: 'var(--ss-text-muted)', flexShrink: 0,
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Access Restricted modal */}
            {accessRestrictedRoom && (
                <div
                    style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 20, padding: 24,
                    }}
                    onClick={() => setAccessRestrictedRoom(null)}
                >
                    <div
                        style={{
                            background: 'var(--ss-surface)', borderRadius: 12, padding: 24, maxWidth: 320, border: '1px solid var(--ss-border)',
                            boxShadow: 'var(--ss-shadow-lg)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Lock size={20} style={{ color: '#F87171' }} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ss-text)' }}>Access Restricted</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--ss-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                            You must be assigned to <strong>{accessRestrictedRoom.name}</strong> to enter. Ask your admin to add you as a participant.
                        </p>
                        <button
                            type="button"
                            onClick={() => setAccessRestrictedRoom(null)}
                            style={{
                                width: '100%', padding: '10px 16px', background: 'var(--ss-primary)', border: 'none', borderRadius: 8,
                                color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
