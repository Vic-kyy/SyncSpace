import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { CheckCircle2, Circle, Clock, Plus, X, Trash2, Loader2 } from 'lucide-react';

const STATUS_ORDER = ['Pending', 'In Progress', 'Completed'];
const STATUS_STYLE = {
    Pending: { bg: 'rgba(148,163,184,0.15)', color: 'var(--ss-text-muted)', label: 'Pending' },
    'In Progress': { bg: 'rgba(59,130,246,0.2)', color: '#3B82F6', label: 'In Progress' },
    Completed: { bg: 'rgba(34,197,94,0.2)', color: '#22C55E', label: 'Completed' },
};

export default function TaskPanel({ roomId, onClose }) {
    const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
    const { user } = useAuthStore();
    const [showAdd, setShowAdd] = useState(false);
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (roomId) fetchTasks(roomId);
    }, [roomId]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        await createTask(roomId, { title, deadline: deadline || undefined });
        setTitle('');
        setDeadline('');
        setShowAdd(false);
    };

    const cycleStatus = (task) => {
        const idx = STATUS_ORDER.indexOf(task.status);
        const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
        updateTask(task._id, { status: next });
    };

    const handleDelete = async (task) => {
        if (!window.confirm('Delete this task?')) return;
        setDeletingId(task._id);
        await deleteTask(task._id);
        setDeletingId(null);
    };

    const isOverdue = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date() && !isNaN(new Date(deadline).getTime());
    };

    return (
        <div style={{
            width: 320, background: 'var(--ss-surface)', borderLeft: '1px solid var(--ss-border)',
            display: 'flex', flexDirection: 'column', zIndex: 10,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
        }}>
            {/* Header */}
            <div style={{
                height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--ss-border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ background: 'var(--ss-primary)', width: 8, height: 8, borderRadius: '50%' }} />
                    <span style={{ fontWeight: 600, color: 'var(--ss-text)' }}>Room Tasks</span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ss-text-muted)', cursor: 'pointer' }}>
                    <X size={18} />
                </button>
            </div>

            {/* List */}
            <div className="ss-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {/* Add Section */}
                {!showAdd ? (
                    <button
                        onClick={() => setShowAdd(true)}
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px dashed var(--ss-border)',
                            background: 'none', color: 'var(--ss-text-muted)', fontSize: 13,
                            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 16,
                            transition: 'all 0.15s',
                        }}
                    >
                        <Plus size={16} /> Add Task
                    </button>
                ) : (
                    <form onSubmit={handleCreate} style={{ padding: 12, background: 'var(--ss-bg)', borderRadius: 12, border: '1px solid var(--ss-border)', marginBottom: 16 }}>
                        <input
                            type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Task title..."
                            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--ss-text)', fontSize: 14, outline: 'none', marginBottom: 12 }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                            <Clock size={14} style={{ color: 'var(--ss-text-muted)' }} />
                            <input
                                type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'var(--ss-text-muted)', fontSize: 12, outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--ss-text-muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" disabled={!title.trim()} style={{ background: 'var(--ss-primary)', border: 'none', borderRadius: 6, padding: '4px 12px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Add</button>
                        </div>
                    </form>
                )}

                {/* Task Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tasks.map(task => {
                        const overdue = isOverdue(task.deadline) && task.status !== 'Completed';
                        const style = STATUS_STYLE[task.status] || STATUS_STYLE.Pending;
                        return (
                            <div key={task._id} style={{
                                padding: '12px', borderRadius: 10, background: 'var(--ss-surface-bright)',
                                border: '1px solid var(--ss-border-light)',
                                opacity: task.status === 'Completed' ? 0.75 : 1,
                            }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <button
                                        onClick={() => cycleStatus(task)}
                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: task.status === 'Completed' ? '#22C55E' : 'var(--ss-text-muted)', marginTop: 2, flexShrink: 0 }}
                                        title="Change status"
                                    >
                                        {task.status === 'Completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                    </button>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 14, color: 'var(--ss-text)', fontWeight: 500,
                                            textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                                            marginBottom: 6
                                        }}>
                                            {task.title}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => cycleStatus(task)}
                                                style={{
                                                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                                                    background: style.bg, color: style.color, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5
                                                }}
                                            >
                                                {style.label}
                                            </button>
                                            {task.deadline && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: overdue ? '#EF4444' : 'var(--ss-text-muted)' }}>
                                                    <Clock size={12} />
                                                    {new Date(task.deadline).toLocaleDateString()}
                                                    {overdue && ' (Overdue)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(task)}
                                        disabled={deletingId === task._id}
                                        style={{ background: 'none', border: 'none', padding: 4, cursor: deletingId === task._id ? 'default' : 'pointer', color: 'var(--ss-text-muted)', flexShrink: 0 }}
                                        title="Delete task"
                                    >
                                        {deletingId === task._id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
