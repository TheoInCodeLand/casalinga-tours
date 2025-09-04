// routes/payments.js
const express = require('express');
const router = express.Router();
const db = require('../database/init');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    next();
};

// GET - Payment page for a booking (would integrate with PayFast)
router.get('/new', requireAuth, (req, res) => {
    const bookingId = req.query.booking_id;
    
    if (!bookingId) {
        return res.redirect('/user/dashboard');
    }
    
    // Verify this booking belongs to the logged-in user
    db.get(
        `SELECT b.*, t.title, t.price 
         FROM bookings b 
         JOIN tours t ON b.tour_id = t.id 
         WHERE b.id = ? AND b.user_id = ?`,
        [bookingId, req.session.userId],
        (err, booking) => {
            if (err || !booking) {
                console.error(err);
                req.session.message = { type: 'error', text: 'Booking not found.' };
                return res.redirect('/user/dashboard');
            }
            
            // Calculate total amount
            const totalAmount = booking.price * booking.participants;
            
            res.render('pages/payment', { 
                title: 'Payment - Casalinga Tours', 
                booking,
                totalAmount
                // In a real implementation, we would generate PayFast payment data here
            });
        }
    );
});

// POST - Process payment (would handle PayFast ITN)
router.post('/process', requireAuth, (req, res) => {
    // This would handle the payment processing logic
    // For now, we'll just simulate a successful payment
    
    const bookingId = req.body.booking_id;
    
    // Update booking status to 'confirmed'
    db.run(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['confirmed', bookingId],
        function(err) {
            if (err) {
                console.error(err);
                req.session.message = { type: 'error', text: 'Payment processing failed.' };
                return res.redirect('/user/dashboard');
            }
            
            // Record payment in payments table
            db.run(
                `INSERT INTO payments (booking_id, amount, payment_method, status, transaction_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [bookingId, req.body.amount, 'payfast', 'completed', 'simulated_transaction_123'],
                function(err) {
                    if (err) {
                        console.error(err);
                    }
                    
                    req.session.message = { 
                        type: 'success', 
                        text: 'Payment successful! Your booking is now confirmed.' 
                    };
                    res.redirect('/user/dashboard');
                }
            );
        }
    );
});

module.exports = router;