const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth } = require('../middleware/auth');

// GET - Homepage
router.get('/', (req, res) => {
    const query = `SELECT * FROM tours WHERE available = 1 LIMIT 6`;
    
    db.all(query, [], (err, tours) => {
        if (err) {
            console.error(err);
            tours = []; // If there's an error, set tours to empty array
        }
        res.render('pages/home', { title: 'Casalinga Tours - Home', tours });
    });
});

// GET - About Us Page
router.get('/about', (req, res) => {
    res.render('pages/about', { title: 'About Us - Casalinga Tours' });
});

// GET - All Tours Page
router.get('/tours', (req, res) => {
    const query = `SELECT * FROM tours WHERE available = 1 ORDER BY created_at DESC`;
    
    db.all(query, [], (err, tours) => {
        if (err) {
            console.error(err);
            tours = [];
        }
        res.render('pages/tours', { title: 'Our Tours - Casalinga Tours', tours });
    });
});

// GET - Single Tour Detail Page
router.get('/tours/:id', (req, res) => {
    const tourId = req.params.id;
    const query = `SELECT * FROM tours WHERE id = ? AND available = 1`;
    
    db.get(query, [tourId], (err, tour) => {
        if (err) {
            console.error(err);
            return res.redirect('/tours');
        }
        if (!tour) {
            // If no tour is found with that ID, redirect to tours list
            return res.redirect('/tours');
        }
        res.render('pages/tour-detail', { title: tour.title + ' - Casalinga Tours', tour });
    });
});

// GET - Contact Us Page
router.get('/contact', (req, res) => {
    res.render('pages/contact', { 
        title: 'Contact Us - Casalinga Tours',
        message: null // Add this to prevent similar errors
    });
});

// POST - Contact Form Submission
router.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // In a real application, you would save this to a 'contact_messages' table
    // and send an email using Nodemailer
    console.log('New contact form submission:', { name, email, message });
    
    // Set a flash message (we'll simulate this with a query parameter for now)
    req.session.message = { type: 'success', text: 'Thank you for your message! We will get back to you soon.' };
    res.redirect('/contact');
});

// GET - Blog/Resources Page
router.get('/blog', (req, res) => {
    // For now, we'll just render a static page
    // Later, we can query a 'blog_posts' table
    res.render('pages/blog', { title: 'Blog & Resources - Casalinga Tours' });
});

// GET - Maps Debug Page
router.get('/maps-debug', (req, res) => {
    res.render('pages/maps-debug', { 
        title: 'Maps Debug - Casalinga Tours' 
    });
});

router.get('/user/dashboard', requireAuth, (req, res) => {
    const userId = req.session.userId;
    
    // Get recent bookings
    const bookingsQuery = `
        SELECT b.*, t.title as tour_title 
        FROM bookings b 
        JOIN tours t ON b.tour_id = t.id 
        WHERE b.user_id = ? 
        ORDER BY b.created_at DESC 
        LIMIT 5
    `;
    
    // Get user details
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    
    db.all(bookingsQuery, [userId], (err, recentBookings) => {
        if (err) {
            console.error(err);
            recentBookings = [];
        }
        
        db.get(userQuery, [userId], (err, user) => {
            if (err) {
                console.error(err);
                return res.redirect('/');
            }
            
            res.render('pages/user-dashboard', {
                title: 'My Dashboard - Casalinga Tours',
                recentBookings: recentBookings || [],
                user: user
            });
        });
    });
});

module.exports = router;