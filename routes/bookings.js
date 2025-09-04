// routes/bookings.js
const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAuth, requireCustomer } = require('../middleware/auth');

// GET - Booking Form for a specific tour
router.get('/new', requireAuth, (req, res) => {
    const tourId = req.query.tour_id;
    
    if (!tourId) {
        return res.redirect('/tours');
    }
    
    // Get tour details
    db.get('SELECT * FROM tours WHERE id = ? AND available = 1', [tourId], (err, tour) => {
        if (err || !tour) {
            console.error(err);
            req.session.message = { type: 'error', text: 'Tour not found or unavailable.' };
            return res.redirect('/tours');
        }
        
        res.render('pages/booking-form', { 
            title: 'Book ' + tour.title + ' - Casalinga Tours', 
            tour 
        });
    });
});

// POST - Process Booking
router.post('/create', requireAuth, (req, res) => {
    const { tour_id, booking_date, participants, special_requests } = req.body;
    const userId = req.session.userId;
    
    // Basic validation
    if (!tour_id || !booking_date || !participants) {
        req.session.message = { type: 'error', text: 'Please fill in all required fields.' };
        return res.redirect(`/bookings/new?tour_id=${tour_id}`);
    }
    
    // Insert booking into database
    db.run(
        `INSERT INTO bookings (user_id, tour_id, booking_date, participants, special_requests) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, tour_id, booking_date, participants, special_requests || ''],
        function(err) {
            if (err) {
                console.error(err);
                req.session.message = { type: 'error', text: 'Booking failed. Please try again.' };
                return res.redirect(`/bookings/new?tour_id=${tour_id}`);
            }
            
            // Success - redirect to a confirmation page or user dashboard
            req.session.message = { 
                type: 'success', 
                text: 'Booking request submitted successfully! We will contact you to confirm availability and payment details.' 
            };
            res.redirect('/user/dashboard');
        }
    );
});

// GET - User's booking history (simple version)
router.get('/my-bookings', requireAuth, requireCustomer, (req, res) => {
    const query = `
        SELECT b.*, t.title as tour_title, t.price as tour_price 
        FROM bookings b 
        JOIN tours t ON b.tour_id = t.id 
        WHERE b.user_id = ? 
        ORDER BY b.created_at DESC
    `;
    
    db.all(query, [req.session.userId], (err, bookings) => {
        if (err) {
            console.error(err);
            bookings = [];
        }
        
        res.render('pages/my-bookings', { 
            title: 'My Bookings - Casalinga Tours', 
            bookings 
        });
    });
});

module.exports = router;