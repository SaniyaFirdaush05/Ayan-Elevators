// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

setInterval(nextSlide, 5000);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe all animatable elements
document.querySelectorAll('.service-card, .project-card, .stat, .contact-item').forEach(el => {
    observer.observe(el);
});

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat h4');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace('+', ''));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current) + (target > 100 ? '+' : '');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + (target > 100 ? '+' : '');
            }
        };
        
        updateCounter();
    });
}

// Trigger counters when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Form Submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Here you would typically send to your backend
        // await fetch('/api/contact', { method: 'POST', body: formData });
        
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        contactForm.reset();
    } catch (error) {
        showNotification('Oops! Something went wrong. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Animate out after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // You can add a progress bar element if desired
    // document.querySelector('.scroll-progress').style.width = scrollPercent + '%';
});

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSlides = document.querySelectorAll('.slide img');
    heroSlides.forEach(img => {
        const speed = 0.5;
        img.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Preloader (if you want to add one)
window.addEventListener('load', () => {
    // Hide preloader if you have one
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
    }
    
    // Initialize animations after load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Typing Effect for Hero Title (Optional)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing effect after page load
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => typeWriter(heroTitle, originalText), 500);
    }
});

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const { Pool } = require('pg'); // PostgreSQL (optional)
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Rate limiting (prevent spam)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Data Directory
const DATA_DIR = path.join(__dirname, 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        console.log('Data directory already exists');
    }
}

// Email Transporter (Gmail - configure your own)
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'ayanelevator363@gmail.com',
        pass: process.env.EMAIL_PASS || 'AYAN@786'
    }
});

// Optional: PostgreSQL Database (uncomment if using)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Save to JSON file
async function saveToFile(data) {
    try {
        const contacts = [];
        try {
            const fileData = await fs.readFile(CONTACTS_FILE, 'utf8');
            contacts.push(...JSON.parse(fileData));
        } catch (err) {
            // File doesn't exist yet
        }
        
        contacts.push({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...data
        });
        
        await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
        return true;
    } catch (error) {
        console.error('File save error:', error);
        return false;
    }
}


// Send Email Notification
async function sendEmail(data) {
    try {
        const mailOptions = {
            from: `"Ayan Elevators" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || 'ayanelevator363@gmail.com',
            cc: process.env.CC_EMAIL || '',
            subject: `🔔 New Contact Form - ${data.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Contact Form Submission</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>👤 Name:</strong> ${data.name}</p>
                        <p><strong>📧 Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                        <p><strong>📱 Phone:</strong> ${data.phone || 'Not provided'}</p>
                        <p><strong>💬 Message:</strong></p>
                        <p style="background: white; padding: 15px; border-left: 4px solid #007bff; border-radius: 5px;">
                            ${data.message.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                    <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Ayan Elevators Contact Form<br>
                        This is an automated message.
                    </p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

// API Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required'
            });
        }
        
        const contactData = { name, email, phone, message };
        
        // Save to multiple locations
        const fileSaved = await saveToFile(contactData);
        let dbSaved = false;
        
        // Uncomment to enable database
        // dbSaved = await saveToDatabase(contactData);
        
        const emailSent = await sendEmail(contactData);
        
        console.log('Contact saved:', {
            file: fileSaved,
            database: dbSaved,
            email: emailSent,
            data: contactData
        });
        
        res.json({
            success: true,
            message: 'Thank you! We\'ll get back to you within 24 hours.',
            savedTo: {
                file: fileSaved,
                email: emailSent
            }
        });
        
    } catch (error) {
        console.error('Contact API error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
});

// Get all contacts (Admin only)
app.get('/api/contacts', async (req, res) => {
    try {
        const data = await fs.readFile(CONTACTS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize
ensureDataDir().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 Data saved to: ${DATA_DIR}`);
        console.log(`📧 Email notifications enabled`);
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

{
  "name": "Ayan-Elevators-Backend",
  "version": "1.0.0",
  "description": "Ayan Elevators Contact Form Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:migrate": "node db-migrate.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "nodemailer": "^6.9.4",
    "express-rate-limit": "^6.10.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}