// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { requireAdmin } = require('../middleware/auth');

// GET - Admin Dashboard
router.get('/dashboard', requireAdmin, (req, res) => {
    // Get stats for the dashboard
    const queries = {
        totalBookings: 'SELECT COUNT(*) as count FROM bookings',
        pendingBookings: 'SELECT COUNT(*) as count FROM bookings WHERE status = "pending"',
        totalTours: 'SELECT COUNT(*) as count FROM tours',
        totalUsers: 'SELECT COUNT(*) as count FROM users'
    };
    
    // Using Promise.all to handle multiple async queries
    Promise.all([
        new Promise((resolve) => db.get(queries.totalBookings, [], (err, row) => resolve(row ? row.count : 0))),
        new Promise((resolve) => db.get(queries.pendingBookings, [], (err, row) => resolve(row ? row.count : 0))),
        new Promise((resolve) => db.get(queries.totalTours, [], (err, row) => resolve(row ? row.count : 0))),
        new Promise((resolve) => db.get(queries.totalUsers, [], (err, row) => resolve(row ? row.count : 0)))
    ]).then(([totalBookings, pendingBookings, totalTours, totalUsers]) => {
        res.render('admin/dashboard', {
            title: 'Admin Dashboard - Casalinga Tours',
            stats: { totalBookings, pendingBookings, totalTours, totalUsers }
        });
    }).catch(err => {
        console.error(err);
        res.render('admin/dashboard', {
            title: 'Admin Dashboard - Casalinga Tours',
            stats: { totalBookings: 0, pendingBookings: 0, totalTours: 0, totalUsers: 0 }
        });
    });
});

// GET - Manage Tours
router.get('/tours', requireAdmin, (req, res) => {
    db.all('SELECT * FROM tours ORDER BY created_at DESC', [], (err, tours) => {
        if (err) {
            console.error(err);
            tours = [];
        }
        res.render('admin/tours', { 
            title: 'Manage Tours - Casalinga Tours', 
            tours 
        });
    });
});

// GET - Add New Tour Form
router.get('/tours/new', requireAdmin, (req, res) => {
    res.render('admin/tour-form', { 
        title: 'Add New Tour - Casalinga Tours',
        tour: null // Empty tour object for new tour
    });
});

// POST - Create New Tour
router.post('/tours', requireAdmin, (req, res) => {
    const { title, description, detailed_description, price, duration, category, available } = req.body;
    
    db.run(
        `INSERT INTO tours (title, description, detailed_description, price, duration, category, available) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, detailed_description, price, duration, category, available ? 1 : 0],
        function(err) {
            if (err) {
                console.error(err);
                req.session.message = { type: 'error', text: 'Failed to create tour.' };
                return res.render('admin/tour-form', { 
                    title: 'Add New Tour - Casalinga Tours',
                    tour: null
                });
            }
            
            req.session.message = { type: 'success', text: 'Tour created successfully!' };
            res.redirect('/admin/tours');
        }
    );
});

// GET - Edit Tour Form
router.get('/tours/:id/edit', requireAdmin, (req, res) => {
    const tourId = req.params.id;
    
    db.get('SELECT * FROM tours WHERE id = ?', [tourId], (err, tour) => {
        if (err || !tour) {
            console.error(err);
            req.session.message = { type: 'error', text: 'Tour not found.' };
            return res.redirect('/admin/tours');
        }
        
        res.render('admin/tour-form', { 
            title: 'Edit Tour - Casalinga Tours',
            tour 
        });
    });
});

// POST - Update Tour
router.post('/tours/:id', requireAdmin, (req, res) => {
    const tourId = req.params.id;
    const { title, description, detailed_description, price, duration, category, available } = req.body;
    
    db.run(
        `UPDATE tours 
         SET title = ?, description = ?, detailed_description = ?, price = ?, duration = ?, category = ?, available = ?
         WHERE id = ?`,
        [title, description, detailed_description, price, duration, category, available ? 1 : 0, tourId],
        function(err) {
            if (err) {
                console.error(err);
                req.session.message = { type: 'error', text: 'Failed to update tour.' };
                return res.redirect(`/admin/tours/${tourId}/edit`);
            }
            
            req.session.message = { type: 'success', text: 'Tour updated successfully!' };
            res.redirect('/admin/tours');
        }
    );
});

// GET - View All Bookings
router.get('/bookings', requireAdmin, (req, res) => {
    const query = `
        SELECT b.*, u.name as user_name, u.email, t.title as tour_title 
        FROM bookings b 
        JOIN users u ON b.user_id = u.id 
        JOIN tours t ON b.tour_id = t.id 
        ORDER BY b.created_at DESC
    `;
    
    db.all(query, [], (err, bookings) => {
        if (err) {
            console.error(err);
            bookings = [];
        }
        res.render('admin/bookings', { 
            title: 'Manage Bookings - Casalinga Tours', 
            bookings 
        });
    });
});

// POST - Update Booking Status
router.post('/bookings/:id/status', requireAdmin, (req, res) => {
    const bookingId = req.params.id;
    const { status } = req.body;
    
    db.run(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, bookingId],
        function(err) {
            if (err) {
                console.error(err);
                req.session.message = { type: 'error', text: 'Failed to update booking status.' };
            } else {
                req.session.message = { type: 'success', text: 'Booking status updated successfully!' };
            }
            res.redirect('/admin/bookings');
        }
    );
});

// GET - View All Users
router.get('/users', requireAdmin, (req, res) => {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    
    db.all(query, [], (err, users) => {
        if (err) {
            console.error(err);
            users = [];
        }
        res.render('admin/users', { 
            title: 'User Management - Casalinga Tours', 
            users 
        });
    });
});

// POST - Make User Admin
router.post('/users/:id/make-admin', requireAdmin, (req, res) => {
    const userId = req.params.id;
    
    db.run(
        'UPDATE users SET role = ? WHERE id = ?',
        ['admin', userId],
        function(err) {
            if (err) {
                console.error(err);
                req.session.message = { type: 'error', text: 'Failed to update user role.' };
            } else {
                req.session.message = { type: 'success', text: 'User role updated to admin successfully!' };
            }
            res.redirect('/admin/users');
        }
    );
});

// POST - Delete User
router.post('/users/:id/delete', requireAdmin, (req, res) => {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.session.userId) {
        req.session.message = { type: 'error', text: 'You cannot delete your own account.' };
        return res.redirect('/admin/users');
    }
    
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
            console.error(err);
            req.session.message = { type: 'error', text: 'Failed to delete user.' };
        } else {
            req.session.message = { type: 'success', text: 'User deleted successfully!' };
        }
        res.redirect('/admin/users');
    });
});

// GET - View User Details (optional - if you want a detailed view)
router.get('/users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    const bookingsQuery = `
        SELECT b.*, t.title as tour_title 
        FROM bookings b 
        JOIN tours t ON b.tour_id = t.id 
        WHERE b.user_id = ? 
        ORDER BY b.created_at DESC
    `;
    
    db.get(userQuery, [userId], (err, user) => {
        if (err || !user) {
            console.error(err);
            req.session.message = { type: 'error', text: 'User not found.' };
            return res.redirect('/admin/users');
        }
        
        db.all(bookingsQuery, [userId], (err, userBookings) => {
            if (err) {
                console.error(err);
                userBookings = [];
            }
            
            res.render('admin/user-detail', {
                title: 'User Details - Casalinga Tours',
                user,
                bookings: userBookings
            });
        });
    });
});

module.exports = router;