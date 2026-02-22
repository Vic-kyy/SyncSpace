const express = require('express');
const roomController = require('../controllers/roomController');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(roomController.getRooms)
    .post(requireAdmin, roomController.createRoom);

router.route('/:id')
    .get(roomController.getRoom)
    .delete(requireAdmin, roomController.deleteRoom);

router.post('/:id/join', roomController.joinRoom);
router.get('/:id/messages', roomController.getRoomMessages);
router.patch('/:id/archive', requireAdmin, roomController.archiveRoom);
router.put('/:id/participants', requireAdmin, roomController.updateParticipants);

// Room-scoped tasks (plan: GET/POST /api/rooms/:roomId/tasks)
router.get('/:id/tasks', (req, res, next) => {
    req.params.roomId = req.params.id;
    next();
}, taskController.getTasks);
router.post('/:id/tasks', (req, res, next) => {
    req.params.roomId = req.params.id;
    next();
}, taskController.createTask);

module.exports = router;
