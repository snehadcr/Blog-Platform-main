const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Register user
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const user = db.createUser(username, password);
    if (user) {
        res.json({ message: 'User registered successfully' });
    } else {
        res.status(400).json({ message: 'Username already exists' });
    }
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.getUser(username);
    if (user && user.password === password) {
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Create blog post
app.post('/blogs', (req, res) => {
    const { title, content, author } = req.body;
    const blog = db.createBlog(title, content, author);
    res.json(blog);
});

// Get all blog posts
app.get('/blogs', (req, res) => {
    const blogs = db.getAllBlogs();
    res.json(blogs);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
