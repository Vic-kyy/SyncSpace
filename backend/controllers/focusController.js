const FocusSession = require('../models/FocusSession');

exports.startFocusSession = async (req, res) => {
    try {
        // End any existing active sessions for this user
        await FocusSession.updateMany(
            { user: req.user._id, isActive: true },
            { isActive: false, endTime: new Date() }
        );

        const session = await FocusSession.create({
            user: req.user._id,
            startTime: new Date(),
            isActive: true,
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.stopFocusSession = async (req, res) => {
    try {
        const session = await FocusSession.findOneAndUpdate(
            { user: req.user._id, isActive: true },
            { endTime: new Date(), isActive: false },
            { new: true }
        );

        res.status(200).json(session);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getFocusStats = async (req, res) => {
    try {
        const sessions = await FocusSession.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json(sessions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.incrementMessageCount = async (userId) => {
    try {
        await FocusSession.findOneAndUpdate(
            { user: userId, isActive: true },
            { $inc: { messageCount: 1 } }
        );
    } catch (err) {
        console.error('[Focus] incrementMessageCount error:', err.message);
    }
};
