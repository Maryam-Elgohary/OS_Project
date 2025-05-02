const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//connect 
mongoose.connect('mongodb://mongo:27017/express-mongo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

//schema
const todoSchema =new mongoose.Schema({
    task:{type:String,required:true},
    done:{type:Boolean,default:false}
});
const Todo=mongoose.model('Todo',todoSchema);


//1-get all
app.get('/todos',async (req,res)=>{
    const todos=await Todo.find();
    res.json(todos);
});
//2-post
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

//get by id
app.get('/todos/:id',async (req,res)=>{
    
    const todo=await Todo.findById(req.params.id);
    if(!todo){
        return res.status(404).json({message:' Todo is  not found '});
    }
    res.json(todo);
});
//put 
app.put('/todos/:id',async (req,res)=>{
    const{id}=req.params;
    const UpdatedTodo=await Todo.findByIdAndUpdate(id,req.body,{new:true});
    if(!UpdatedTodo){
        return res.status(404).json({message:'this  Todo is  not found '});
    }
    res.json(UpdatedTodo);
});
//delete
app.delete('/todos/:id',async (req,res)=>{
    const{id}=req.params;
    const DeletedTodo=await Todo.findByIdAndDelete(id);
    if(!DeletedTodo){
        return res.status(404).json({message:' Todo is  not found '});
    }
    res.status(204).send(); 
});
// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));