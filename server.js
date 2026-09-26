const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todo_db'
});

db.connect((err) => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Successfully connected to MySQL database!');
});

// Register
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (err, result) => {
        if (err) return res.status(500).json({ error: 'Email already registered or Database Error' });
        res.json({ message: 'User registered successfully!' });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ message: 'Login successful', user: results[0] });
        } else {
            res.status(401).json({ error: 'Invalid email or password!' });
        }
    });
});

// READ Tasks
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// CREATE Task
app.post('/tasks', (req, res) => {
    const { task } = req.body;
    db.query('INSERT INTO tasks (task, status) VALUES (?, ?)', [task, 'Pending'], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, task, status: 'Pending' });
    });
});

// UPDATE Task text or status
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { task, status } = req.body;
    
    let sql = 'UPDATE tasks SET ';
    let params = [];

    if (task !== undefined) {
        sql += 'task = ? ';
        params.push(task);
    } else if (status !== undefined) {
        sql += 'status = ? ';
        params.push(status);
    }
    sql += 'WHERE id = ?';
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Updated successfully' });
    });
});

// DELETE Task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Task deleted successfully' });
    });
});

app.listen(5000, () => {
    console.log('Server is running on Port 5000...');
});
// Serve static files (CSS, JS, Images)
app.use(express.static(__dirname));

// Home Page Route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// app.listen সবার শেষে থাকবে
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});