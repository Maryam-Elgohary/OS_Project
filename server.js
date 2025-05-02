const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://mongo:27017/todoDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Todo Schema and Model
const todoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  done: { type: Boolean, default: false }
}, {
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});
const Todo = mongoose.model('Todo', todoSchema);


// Create a todo

//curl -X POST http://localhost:3070/todos -H "Content-Type: application/json" -d "{\"task\":\"Test Docker\"}"
app.post('/todos', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task is required' });
    
    const todo = await Todo.create({ task });
    res.status(201).json(todo);
  } catch (error) {
    console.error('POST /todos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all todos
//curl http://localhost:3070/todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (error) {
    console.error('GET /todos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a todo
app.put('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task, done } = req.body;
    
    const todo = await Todo.findByIdAndUpdate(
      id,
      { task, done },
      { new: true, runValidators: true }
    );
    
    if (!todo) return res.status(404).json({ error: 'Todo is not found' });
    res.status(200).json(todo);
  } catch (error) {
    console.error('PUT /todos/:id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a todo
//curl -X DELETE http://localhost:3070/todos/id
// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndDelete(id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo is not found' });
    }
    
    res.status(204).send(); // Use 204 and send no content
  } catch (error) {
    console.error('DELETE /todos/:id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
