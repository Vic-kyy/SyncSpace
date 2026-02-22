const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    startFocusSession,
    stopFocusSession,
    getFocusStats,
} = require('../controllers/focusController');

const router = express.Router();

router.use(protect);
router.post('/start', startFocusSession);
router.post('/stop', stopFocusSession);
router.get('/stats', getFocusStats);

module.exports = router;
