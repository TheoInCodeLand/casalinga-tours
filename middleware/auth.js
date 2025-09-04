// middleware/auth.js

// Middleware to check if a user is authenticated (logged in)
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        // Store the original URL they were trying to access
        req.session.returnTo = req.originalUrl;
        
        // Set a message to inform them they need to login
        req.session.message = {
            type: 'error',
            text: 'Please log in to access this page.'
        };
        
        return res.redirect('/auth/login');
    }
    next(); // User is authenticated, proceed to the next middleware/route
};

// Middleware to check if a user is an administrator
const requireAdmin = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl;
        req.session.message = {
            type: 'error',
            text: 'Please log in to access this page.'
        };
        return res.redirect('/auth/login');
    }
    
    if (req.session.userRole !== 'admin') {
        // User is logged in but not an admin
        req.session.message = {
            type: 'error',
            text: 'Access denied. Administrator privileges required.'
        };
        return res.redirect('/');
    }
    next(); // User is an admin, proceed
};

// Middleware to check if a user is a customer (not admin)
const requireCustomer = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl;
        req.session.message = {
            type: 'error',
            text: 'Please log in to access this page.'
        };
        return res.redirect('/auth/login');
    }
    
    if (req.session.userRole !== 'customer') {
        // User is logged in but not a customer (likely an admin)
        req.session.message = {
            type: 'error',
            text: 'This page is for customer accounts only.'
        };
        return res.redirect('/admin/dashboard');
    }
    next(); // User is a customer, proceed
};

// Middleware to make user data available to all views
const userInViews = (req, res, next) => {
    res.locals.user = {
        isAuthenticated: !!req.session.userId,
        id: req.session.userId,
        name: req.session.userName,
        role: req.session.userRole
    };
    next();
};

// Middleware to check if user is already authenticated (for login/register pages)
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        // If user is already logged in, redirect them to appropriate dashboard
        const redirectPath = req.session.userRole === 'admin' 
            ? '/admin/dashboard' 
            : '/';
        return res.redirect(redirectPath);
    }
    next(); // User is not authenticated, proceed to login/register page
};

// Middleware to display flash messages
const flashMessages = (req, res, next) => {
    // Make flash messages available to templates
    res.locals.message = req.session.message;
    
    // Clear the message after making it available
    delete req.session.message;
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireCustomer,
    userInViews,
    redirectIfAuthenticated,
    flashMessages
};