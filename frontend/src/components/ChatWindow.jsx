import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { useFocusStore } from '../store/useFocusStore';
import { getSocket } from '../socket';
import { Send, Smile, Search, MoreVertical, Target, ListTodo, PlusSquare } from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';
import { useTaskStore } from '../store/useTaskStore';
import TaskPanel from './TaskPanel';

export default function ChatWindow() {
    const { activeConversation, messages, sendMessage, initSocket, setActiveRoom: setChatRoom } = useChatStore();
    const { user } = useAuthStore();
    const { isFocusMode, toggleFocusMode } = useFocusStore();
    const { activeRoom, subscribeToRoomDeleted } = useRoomStore();
    const { convertMessageToTask, receiveTaskUpdate } = useTaskStore();

    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showTasks, setShowTasks] = useState(false);
    const scrollRef = useRef();

    // ── Socket init ──────────────────────────────
    useEffect(() => {
        if (user?._id) initSocket(user);
    }, [user]);

    // ── Room deleted: clear active room and chat view if we were in it ──────────────────────────────
    useEffect(() => {
        const unsub = subscribeToRoomDeleted(() => {
            setChatRoom(null);
        });
        return unsub;
    }, [subscribeToRoomDeleted, setChatRoom]);

    // ── Auto-scroll ──────────────────────────────
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Task listeners ───────────────────────────
    useEffect(() => {
        const s = getSocket();
        if (!s) return;
        s.on('task_received', receiveTaskUpdate);
        return () => s.off('task_received');
    }, []);

    // ── Typing listeners ─────────────────────────
    useEffect(() => {
        const s = getSocket();
        if (!s) return;
        const refId = activeConversation?._id || activeRoom?._id;
        const onTyping = (room) => { if (room === refId) setIsTyping(true); };
        const onStopTyping = (room) => { if (room === refId) setIsTyping(false); };
        s.on('typing', onTyping);
        s.on('stop_typing', onStopTyping);
        return () => { s.off('typing', onTyping); s.off('stop_typing', onStopTyping); };
    }, [activeConversation?._id, activeRoom?._id]);

    // ── Handlers ─────────────────────────────────
    const handleSend = (e) => {
        e.preventDefault();
        const activeId = activeConversation?._id || activeRoom?._id;
        if (!text.trim() || !activeId) return;

        const type = activeRoom ? 'room' : 'chat';
        sendMessage(text, activeId, type);

        setText('');
        const s = getSocket();
        if (s?.connected) s.emit('stop_typing', activeId);
    };

    const handleTyping = (e) => {
        setText(e.target.value);
        const s = getSocket();
        const activeId = activeConversation?._id || activeRoom?._id;
        if (!s?.connected || !activeId) return;
        s.emit('typing', activeId);
        clearTimeout(window.__syncTypingTimeout);
        window.__syncTypingTimeout = setTimeout(() => {
            s.emit('stop_typing', activeId);
        }, 2500);
    };

    const handleCreateTask = (msg) => {
        if (!activeRoom) return;
        convertMessageToTask({
            messageId: msg._id,
            roomId: activeRoom._id,
            title: msg.text.substring(0, 50),
        });
        setShowTasks(true);
    };

    const timeFormat = (d) => {
        try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return ''; }
    };

    // ── Empty state ──────────────────────────────
    if (!activeConversation && !activeRoom) {
        return (
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--ss-chat-bg)',
            }}>
                <div style={{ textAlign: 'center', maxWidth: 360 }}>
                    <div style={{
                        width: 120, height: 120, borderRadius: 30, margin: '0 auto 28px',
                        background: 'var(--ss-surface)', border: '1px solid var(--ss-border-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--ss-glow)',
                    }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6366F1" />
                                    <stop offset="100%" stopColor="#14B8A6" />
                                </linearGradient>
                            </defs>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h2 className="ss-gradient-text" style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
                        SyncSpace
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--ss-text-muted)', lineHeight: 1.8 }}>
                        Real-time engineering collaboration.<br />
                        Select a chat or project room to begin.
                    </p>
                </div>
            </div>
        );
    }

    const isRoom = !!activeRoom;
    const currentActive = activeRoom || activeConversation;
    const otherUser = isRoom ? null : currentActive.participants?.find(p => p._id !== user?._id);
    const title = isRoom ? currentActive.name : (otherUser?.username || 'Unknown');
    const subtitle = isRoom ? `${currentActive.participants?.length || 0} members` : (otherUser?.isOnline ? '● online' : 'offline');

    return (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div className={isFocusMode ? 'ss-focus-active' : ''} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: isFocusMode ? 4 : 0 }}>

                {/* ── Header ──────────────────────────── */}
                <div style={{
                    height: 64, padding: '0 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--ss-gradient-header)',
                    borderBottom: '1px solid var(--ss-border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: isRoom ? 'rgba(20,184,166,0.1)' : 'var(--ss-surface)',
                            color: isRoom ? 'var(--ss-secondary)' : 'var(--ss-text-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 600, fontSize: 15,
                            border: '1px solid var(--ss-border-light)',
                        }}>
                            {title[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ss-text)' }}>
                                {title}
                            </div>
                            <div style={{ fontSize: 12, color: isTyping ? 'var(--ss-secondary)' : (isRoom ? 'var(--ss-text-muted)' : (otherUser?.isOnline ? 'var(--ss-online)' : 'var(--ss-text-muted)')), fontWeight: 500, transition: 'color 0.15s' }}>
                                {isTyping ? 'typing…' : subtitle}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isRoom && (
                            <button onClick={() => setShowTasks(!showTasks)} title="Room Tasks" style={{
                                background: showTasks ? 'rgba(99,102,241,0.15)' : 'none',
                                border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8,
                                color: showTasks ? 'var(--ss-primary)' : 'var(--ss-text-muted)',
                                display: 'flex', transition: 'all 0.15s',
                            }}>
                                <ListTodo size={18} />
                            </button>
                        )}
                        <button onClick={toggleFocusMode} title="Focus Mode" style={{
                            background: isFocusMode ? 'rgba(99,102,241,0.15)' : 'none',
                            border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8,
                            color: isFocusMode ? 'var(--ss-primary)' : 'var(--ss-text-muted)',
                            display: 'flex', transition: 'all 0.15s',
                        }}>
                            <Target size={18} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: 'var(--ss-text-muted)', display: 'flex' }}>
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Messages ────────────────────────── */}
                <div className="ss-scrollbar ss-chat-area" style={{ flex: 1, overflowY: 'auto', padding: '20px 48px 12px' }}>
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender?._id === user?._id;
                        const showGap = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;
                        return (
                            <div
                                key={msg._id || idx}
                                className="ss-msg-animate"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start',
                                    marginTop: showGap ? 16 : 3,
                                }}
                            >
                                {!isMe && showGap && isRoom && (
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ss-text-muted)', marginLeft: 12, marginBottom: 4 }}>
                                        {msg.sender?.username}
                                    </span>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, group: 'true' }} className="ss-msg-group">
                                    {isMe && isRoom && !isFocusMode && (
                                        <button
                                            onClick={() => handleCreateTask(msg)}
                                            style={{ opacity: 0, transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
                                            className="ss-msg-action"
                                            title="Convert to Task"
                                        >
                                            <PlusSquare size={14} />
                                        </button>
                                    )}
                                    <div style={{
                                        maxWidth: '420px', padding: '10px 14px',
                                        borderRadius: 'var(--ss-radius-msg)',
                                        borderTopRightRadius: isMe && showGap ? 4 : 'var(--ss-radius-msg)',
                                        borderTopLeftRadius: !isMe && showGap ? 4 : 'var(--ss-radius-msg)',
                                        background: isMe ? 'var(--ss-bubble-out)' : 'var(--ss-bubble-in)',
                                        color: isMe ? 'var(--ss-text-on-accent)' : 'var(--ss-text)',
                                        boxShadow: 'var(--ss-shadow-sm)',
                                        position: 'relative'
                                    }}>
                                        <div style={{ fontSize: 14.2, lineHeight: 1.5, wordBreak: 'break-word', letterSpacing: '-0.005em' }}>
                                            {msg.text}
                                        </div>
                                        <div style={{
                                            fontSize: 10.5, marginTop: 4, textAlign: 'right',
                                            color: isMe ? 'rgba(255,255,255,0.55)' : 'var(--ss-text-muted)',
                                            fontWeight: 500,
                                        }}>
                                            {timeFormat(msg.createdAt)}
                                        </div>
                                    </div>
                                    {!isMe && isRoom && !isFocusMode && (
                                        <button
                                            onClick={() => handleCreateTask(msg)}
                                            style={{ opacity: 0, transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ss-text-muted)' }}
                                            className="ss-msg-action"
                                            title="Convert to Task"
                                        >
                                            <PlusSquare size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {isTyping && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
                            <div style={{
                                background: 'var(--ss-bubble-in)', borderRadius: 'var(--ss-radius-msg)',
                                padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 5,
                                boxShadow: 'var(--ss-shadow-sm)',
                            }}>
                                <span className="ss-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ss-primary)', display: 'inline-block' }} />
                                <span className="ss-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ss-primary)', display: 'inline-block' }} />
                                <span className="ss-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ss-primary)', display: 'inline-block' }} />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* ── Input ───────────────────────────── */}
                <div style={{
                    padding: '10px 20px', borderTop: '1px solid var(--ss-border)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--ss-gradient-header)',
                }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: 'var(--ss-text-muted)', display: 'flex' }}>
                        <Smile size={22} />
                    </button>
                    <form onSubmit={handleSend} style={{ flex: 1, display: 'flex' }}>
                        <input
                            type="text"
                            value={text}
                            onChange={handleTyping}
                            placeholder={isRoom ? `Message in #${title}...` : "Type a message..."}
                            className="ss-input-focus"
                            style={{
                                flex: 1, border: '1px solid var(--ss-border)',
                                borderRadius: 'var(--ss-radius)', padding: '11px 16px',
                                fontSize: 14, background: 'var(--ss-surface)',
                                color: 'var(--ss-text)', outline: 'none',
                                transition: 'border-color 0.15s',
                            }}
                        />
                    </form>
                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: text.trim() ? 'var(--ss-primary)' : 'var(--ss-surface)',
                            border: 'none', cursor: text.trim() ? 'pointer' : 'default',
                            color: text.trim() ? '#fff' : 'var(--ss-text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: text.trim() ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Right Sidebar: Tasks */}
            {isRoom && showTasks && (
                <TaskPanel roomId={activeRoom._id} onClose={() => setShowTasks(false)} />
            )}
        </div>
    );
}
