// Server-side room access: allow if user.role === 'ADMIN' OR userId is in room.participants (do not restrict admin)
function canAccessRoom(user, room) {
    if (!user || !room) return false;
    if (user.role === 'ADMIN') return true;
    const userId = (user._id && user._id.toString && user._id.toString()) || String(user._id);
    const participantIds = (room.participants || []).map((p) => (p && p._id ? p._id.toString() : (p && p.toString && p.toString()) || String(p)));
    return participantIds.includes(userId);
}

module.exports = { canAccessRoom };
