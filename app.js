require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { userInViews, flashMessages } = require('./middleware/auth');

// Import route handlers
const visitorRoutes = require('./routes/visitors');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');


const app = express();
const PORT = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== MIDDLEWARE =====
app.use(express.static(path.join(__dirname, 'public')));


// Parse incoming request bodies (form data)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Session management
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './database',
        concurrentDB: true
    }),
    secret: process.env.SESSION_SECRET || 'fallback_secret_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week cookie age
}));

// Use our custom middlewares
app.use(userInViews); // Make user data available in all views
app.use(flashMessages); // Handle flash messages

// Make session data available in all EJS templates
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use((req, res, next) => {
    res.locals.process = {
        env: {
            GOOGLE_MAPS_API_KEY: 'AIzaSyBLkzLyjTwNwEJdUL5LQkIsnE0Hm3JvtlA'
        }
    };
    next();
});

// ===== USE ROUTES =====
app.use('/', visitorRoutes);
app.use('/auth', authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);

// Basic 404 error handler
app.use((req, res) => {
    res.status(404).render('pages/404', { title: 'Page Not Found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Casalinga Tours server is running on http://localhost:${PORT}`);
});