require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jago_agri',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Routes

// SIGNUP Endpoint
app.post('/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate required fields
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);

    // Insert user into database
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Username or Email already exists.' });
        }
        return res.status(500).json({ message: 'Server error.', error: err });
      }

      res.status(201).json({ message: 'User created successfully.' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Hashing error.', error });
  }
});

// SIGNIN Endpoint
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error.', error: err });
    }

    if (results.length === 0) {
      console.log('Invalid username:', username);
      return res.status(404).json({ message: 'Invalid credentials.' });
    }

    const user = results[0];
    console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({
      message: 'Sign in successful.',
      user: { id: user.id, username: user.username, email: user.email },
    });
  });
});

// RESET EMAIL Endpoint
app.put('/reset-email', (req, res) => {
  const { username, newEmail } = req.body;

  if (!username || !newEmail) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const sql = 'UPDATE users SET email = ? WHERE username = ?';
  db.query(sql, [newEmail, username], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Email updated successfully.' });
  });
});

// RESET PASSWORD Endpoint
app.put('/reset-password', async (req, res) => {
  const { username, newPassword, confirmPassword } = req.body;

  if (!username || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const sql = 'UPDATE users SET password = ? WHERE username = ?';
  db.query(sql, [hashedPassword, username], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Password updated successfully.' });
  });
});

// DELETE ALL USERS Endpoint
app.delete('/delete-all', (req, res) => {
  const sqlDelete = 'DELETE FROM users';
  db.query(sqlDelete, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.', error: err });
    }

    // Check if no users are left
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No users to delete.' });
    }

    // Reset AUTO_INCREMENT to 1 if all users are deleted
    const sqlResetAutoIncrement = 'ALTER TABLE users AUTO_INCREMENT = 1';
    db.query(sqlResetAutoIncrement, (err, resetResult) => {
      if (err) {
        return res.status(500).json({ message: 'Error resetting AUTO_INCREMENT.', error: err });
      }

      res.status(200).json({ message: 'All users deleted, and ID sequence reset successfully.' });
    });
  });
});

// DELETE USER Endpoint
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  const sqlDelete = 'DELETE FROM users WHERE id = ?';
  db.query(sqlDelete, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Reset AUTO_INCREMENT to avoid gaps in the id sequence
    const sqlResetAutoIncrement = 'ALTER TABLE users AUTO_INCREMENT = 1';
    db.query(sqlResetAutoIncrement, (err, resetResult) => {
      if (err) {
        return res.status(500).json({ message: 'Error resetting AUTO_INCREMENT.', error: err });
      }

      res.status(200).json({ message: 'User deleted and ID sequence reset successfully.' });
    });
  });
});

// LIST USERS Endpoint
app.get('/users', (req, res) => {
  const sql = 'SELECT id, username, email, created_at FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.', error: err });
    }

    res.status(200).json(results);
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
