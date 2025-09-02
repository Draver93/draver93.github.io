// Main JavaScript functionality for FFStudio website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initTutorialFilters();
    initSmoothScrolling();
    initMobileMenu();
    initScrollEffects();
});

// Tutorial filter functionality
function initTutorialFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real implementation, you would filter the tutorials here
            console.log('Filtering tutorials by: ' + this.textContent);
            
            // Example: You could add actual filtering logic here
            // filterTutorials(this.textContent);
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// Scroll effects and animations
function initScrollEffects() {
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .tutorial-card, .platform-card');
    animateElements.forEach(el => observer.observe(el));
}

// Utility function to filter tutorials (placeholder for future implementation)
function filterTutorials(category) {
    const tutorialCards = document.querySelectorAll('.tutorial-card');
    
    tutorialCards.forEach(card => {
        // This is where you would implement actual filtering logic
        // For now, just log the category
        console.log('Filtering by category:', category);
    });
}

// Add some interactive features
function addInteractiveFeatures() {
    // Add hover effects for buttons
    const buttons = document.querySelectorAll('.btn, .download-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize interactive features
document.addEventListener('DOMContentLoaded', function() {
    addInteractiveFeatures();
});

// Add loading animation for page elements
function addLoadingAnimations() {
    const elements = document.querySelectorAll('.hero, .section');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Initialize loading animations
window.addEventListener('load', function() {
    addLoadingAnimations();
});
