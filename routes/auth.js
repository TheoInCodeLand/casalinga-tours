// routes/auth.js - UPDATED VERSION
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/init');
const { redirectIfAuthenticated } = require('../middleware/auth');

// GET - Login Form
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('pages/login', { 
        title: 'Login - Casalinga Tours',
        error: null // Add this line
    });
});

// POST - Process Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // 1. Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error(err);
            return res.render('pages/login', { 
                title: 'Login - Casalinga Tours', 
                error: 'An error occurred. Please try again.' 
            });
        }
        
        // 2. Check if user exists and password is correct
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.render('pages/login', { 
                title: 'Login - Casalinga Tours', 
                error: 'Invalid email or password.' 
            });
        }
        
        // 3. Set user session
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userRole = user.role;
        
        // 4. Redirect based on role or to homepage
        const redirectTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(redirectTo);
    });
});

// GET - Registration Form
router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('pages/register', { 
        title: 'Register - Casalinga Tours',
        error: null, // Add this line
        name: '',    // Add these for form field persistence
        email: ''    // Add these for form field persistence
    });
});

// POST - Process Registration
router.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    
    // Basic validation
    if (password !== confirmPassword) {
        return res.render('pages/register', { 
            title: 'Register - Casalinga Tours', 
            error: 'Passwords do not match.',
            name: name,    // Pass back the form data
            email: email   // Pass back the form data
        });
    }
    
    if (password.length < 6) {
        return res.render('pages/register', { 
            title: 'Register - Casalinga Tours', 
            error: 'Password must be at least 6 characters long.',
            name: name,    // Pass back the form data
            email: email   // Pass back the form data
        });
    }
    
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 12);
    
    // Insert into database
    db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.render('pages/register', { 
                        title: 'Register - Casalinga Tours', 
                        error: 'Email already exists. Please login instead.',
                        name: name,    // Pass back the form data
                        email: email   // Pass back the form data
                    });
                }
                console.error(err);
                return res.render('pages/register', { 
                    title: 'Register - Casalinga Tours', 
                    error: 'An error occurred. Please try again.',
                    name: name,    // Pass back the form data
                    email: email   // Pass back the form data
                });
            }
            
            // Auto-login after registration
            req.session.userId = this.lastID;
            req.session.userName = name;
            req.session.userRole = 'customer';
            
            // Set success message
            req.session.message = {
                type: 'success',
                text: 'Registration successful! Welcome to Casalinga Tours.'
            };
            
            res.redirect('/');
        }
    );
});

// GET - Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;