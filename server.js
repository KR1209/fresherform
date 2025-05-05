const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/hiring_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define user schema and model
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Define applicant schema for form submissions
const applicantSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    qualification: String,
    skills: [String]
});

const Applicant = mongoose.model('Applicant', applicantSchema);

// Middleware
app.use(express.static('public')); // Serving static files (HTML, CSS, JS)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Route for registration
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.redirect('/login'); // Redirect to login after successful registration
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during registration.");
    }
});

// Route for login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send("No user found with this email.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        req.session.user = user;
        res.redirect('/form'); // Redirect to form page after successful login
    } else {
        res.status(400).send("Invalid credentials.");
    }
});

// Route to access the form (requires login)
app.get('/form', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve form if logged in
});

// Route to handle form submission
app.post('/submit', async (req, res) => {
    const { name, email, phone, qualification, skills } = req.body;

    try {
        const applicant = new Applicant({ name, email, phone, qualification, skills });
        await applicant.save();
        res.send("Thank you for applying! We’ll be in touch.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error submitting your application.");
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error logging out.");
        }
        res.redirect('/login'); // Redirect to login page after logout
    });
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Start server
app.listen(3000, () => console.log("Server running at http://localhost:3000"));

const mongoose = require("mongoose");

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/fresher_db";

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));
