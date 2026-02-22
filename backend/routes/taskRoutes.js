const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Global task operations (room-scoped list/create are under /api/rooms/:id/tasks)
router.post('/from-message', taskController.convertMessageToTask);
router.route('/:id')
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;
