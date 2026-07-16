const pool = require('../db');

const getTasks = async (req, res) => {
  try {
    const {status} = req.query;
    
    if(!status){
      const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    if(status !== "completed" && status !== "pending"){
      return res.status(400).json({error:'Invalid status choose: complete or pending'});
    }

    const is_done = status === 'completed';

    const result = await pool.query(
      'SELECT * FROM tasks WHERE is_done = $1 ORDER BY created_at DESC',
      [is_done]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({error: 'Server Error'});
  }
};

const getTaskById = async (req, res) => {
  try {
    const {id} = req.params;

    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if(result.rows.length === 0){
      return res.status(404).json({ error : 'No Task Found' });
    }

    res.json(result.rows[0]);
  } catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const searchTask = async (req, res) => {
  try{
    const {q} = req.query;
    
    if(!q || q.trim() === ""){
      return res.status(400).json({error:'Query parameter q is required'});
    }

    const searchTerm = `%${q.trim()}%`;

    const result = await pool.query(
      'SELECT * FROM tasks WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC',
      [searchTerm]
    );

    res.json(result.rows);
  } catch(err) {
    console.error(err.message);
    res.status(500).json({error: 'Server error' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if(!title){
      return res.status(400).json({error: 'Title is required'});
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1,$2) RETURNING *',
      [title, description]
    );

    res.status(201).json(result.rows[0]);
  } catch(err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const putTask = async (req, res) => {
  try {
    const {id} = req.params;
    const {title, description, is_done} = req.body;

    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, is_done = $3 WHERE id = $4 RETURNING *',
      [title, description, is_done, id]
    );

    if(result.rows.length === 0){
      return res.status(404).json({error: 'Task not found'});
    }

    res.json(result.rows[0]);
  } catch(err) {
    console.error(err.message);
    res.status(500).json({error: 'Server error'});
  }
};

const deleteTask = async (req, res) => {
  try{
    const {id} = req.params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    
    if(result.rows.length === 0){
      return res.status(404).json({error: 'Task not found'});
    }

    res.json({ message: 'Task deleted successfully' });
  } catch(err) {
    console.error(err.message);
    res.status(500).json({error: 'Server error'});
  }
};

const clearCompletedTask = async (req, res) => {
  try{
    const result = await pool.query('DELETE FROM tasks WHERE is_done = true RETURNING *');
    res.json({message: `Successfully deleted ${result.rowCount} tasks`});
  } catch(err) {
    console.error(err.message);
    res.status(500).json({error: 'Server error'});
  }
};

const patchTask = async (req, res) => {
  try{
    const {id} = req.params;
    const updates = req.body;

    const keys = Object.keys(updates);

    if(keys.length === 0){
      return res.status(400).json({error: 'No update field provided'});
    }

    const setCaluse = keys.map((key, index) => `${key} = $${index+1}`).join(', ');
    const values = Object.values(updates);

    values.push(id);
    const idPlaceholder = values.length;

    const query = `UPDATE tasks SET ${setCaluse} WHERE id = $${idPlaceholder} RETURNING *`;

    const result = await pool.query(query, values);

    if(result.rows.length === 0){
      return res.status(404).json({error: 'Task not found'});
    }

    res.json(result.rows[0]);
  } catch(err) {
    console.error(err.message);
    res.status(500).json({error: 'Server error'});
  }
};

module.exports = {
  getTasks,
  getTaskById,
  searchTask,
  createTask,
  putTask,
  deleteTask,
  clearCompletedTask,
  patchTask
};
