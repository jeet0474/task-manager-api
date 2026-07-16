const express = require('express');
const router = express.Router();
const { 
  getTasks,
  getTaskById,
  createTask,
  putTask,
  deleteTask,
  clearCompletedTask,
  patchTask,
  searchTask
} = require('../controllers/task.js');

router.get('/', getTasks);
router.get('/search', searchTask);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', putTask);
router.delete('/:id', deleteTask);
router.delete('/completed/clear', clearCompletedTask);
router.patch('/:id', patchTask);

module.exports = router;
