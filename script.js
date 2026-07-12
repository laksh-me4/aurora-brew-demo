/**
 * Aurora Brew House - Interactive Scripts
 * 
 * 1. Performance-Optimized Scroll Listener (Navbar & Parallax)
 * 2. 3D Tilt Effect on Menu Cards
 * 3. Mobile Navigation Menu Toggle & UX Controls
 * 4. Scroll-Based Active Navigation Link Highlighter
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. Navbar State & Parallax Scroll Handler
    // =========================================
    const navbar = document.getElementById('navbar');
    const heroBg = document.getElementById('hero-bg');
    const heroIllustration = document.querySelector('.hero-illustration');
    let scrollTicking = false;

    function handleScrollEffects() {
        const scrollVal = window.scrollY;

        // Sticky Navbar Toggle
        if (scrollVal > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Only run scroll animations if the Hero section is currently in the viewport
        if (scrollVal < window.innerHeight) {
            // 1. Parallax translation on the backdrop photo
            if (heroBg) {
                heroBg.style.transform = `translateY(${scrollVal * 0.3}px)`;
            }

            // 2. Parallax translation on the mug illustration for layered depth
            if (heroIllustration) {
                heroIllustration.style.transform = `translateY(${scrollVal * 0.12}px)`;
            }
        }
    }

    // =========================================
    // 2. Automatic Coffee Mug Fill Animation (Entrance)
    // =========================================
    const coffeeLiquid = document.getElementById('coffee-liquid');
    const steamGroup = document.querySelector('.steam-group');
    
    if (coffeeLiquid) {
        let fillStartTime = null;
        const fillDuration = 2500; // Animate filling over 2.5 seconds
        
        function animateMugFill(timestamp) {
            if (!fillStartTime) fillStartTime = timestamp;
            const elapsed = timestamp - fillStartTime;
            
            // Progress percentage from 0 to 1
            const progress = Math.min(elapsed / fillDuration, 1);
            
            // Cubic Out easing function for a premium, deceleration feel
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const liquidMaxHeight = 76; // Total inner height of the mug cavity in SVG
            const currentHeight = easeProgress * liquidMaxHeight;
            const currentY = 148 - currentHeight; // Bottom Y coordinate of liquid is 148
            
            coffeeLiquid.setAttribute('height', currentHeight);
            coffeeLiquid.setAttribute('y', currentY);
            
            // Activate rising steam once the cup is 90% or more full
            if (steamGroup) {
                if (easeProgress >= 0.90) {
                    const steamFadeProgress = (easeProgress - 0.90) / 0.10;
                    steamGroup.style.opacity = 0.35 * steamFadeProgress; // Target 0.35 opacity
                } else {
                    steamGroup.style.opacity = 0;
                }
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(animateMugFill);
            }
        }
        
        // Start filling animation after a short entrance delay
        setTimeout(() => {
            window.requestAnimationFrame(animateMugFill);
        }, 500);
    }

    // Bind event with requestAnimationFrame throttling for optimal 60fps scrolling
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                handleScrollEffects();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    // Run once at load to set initial state based on current page position
    handleScrollEffects();


    // =========================================
    // 2. 3D Tilt Effect on Menu Cards
    // =========================================
    const menuCards = document.querySelectorAll('.menu-card');

    menuCards.forEach(card => {
        // Track mouse movements over each menu card
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // X and Y mouse coordinates relative to the card dimensions
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Midpoints (center coordinates) of the card
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            
            // Calculate tilt angles. Max tilt set to 12 degrees.
            const maxTilt = 12;
            // Dividing offset from center by half-width/height maps range to [-1, 1]
            const rotateX = -((y - midY) / midY) * maxTilt;
            const rotateY = ((x - midX) / midX) * maxTilt;
            
            // Set transitions to fast for responsive mouse follow
            card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
        });

        // Reset positions when mouse leaves card boundaries
        card.style.willChange = 'transform'; // Optimizes rendering execution
        card.addEventListener('mouseleave', () => {
            // Eased transition for a fluid spring-back effect
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, border-color 0.3s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });

        // Accessibility Focus Reset (Fix 2): Clear inline mousemove styles on keyboard blur
        card.addEventListener('blur', () => {
            card.style.transform = '';
        });
    });


    // =========================================
    // 3. Mobile Navigation Controls
    // =========================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu open/close on click
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents immediate close from global body click listener
        mobileToggle.classList.toggle('open');
        navLinksContainer.classList.toggle('open');
    });

    // Close menu when clicking on any menu link (anchored scroll)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('open');
            navLinksContainer.classList.remove('open');
        });
    });

    // UX Enhancement: Close menu drawer when tapping anywhere outside the navigation block
    document.addEventListener('click', (e) => {
        const isClickInsideMenu = navLinksContainer.contains(e.target);
        const isClickOnToggle = mobileToggle.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && navLinksContainer.classList.contains('open')) {
            mobileToggle.classList.remove('open');
            navLinksContainer.classList.remove('open');
        }
    });


    // =========================================
    // 4. Scroll-Based Active Section Highlighter
    // =========================================
    // Target sections and the hero to dynamically match with header link anchors
    const observedElements = document.querySelectorAll('section, #hero');
    
    // Intersection Observer parameters
    const observerOptions = {
        root: null, // Relative to device viewport
        rootMargin: '-30% 0px -50% 0px', // Triggers when section occupies the focal view
        threshold: 0
    };

    const activeLinkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    // Normalize active status on all links
                    link.classList.remove('active');
                    
                    // Match link href string (e.g. "#about") to current element ID (e.g. "about")
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    observedElements.forEach(element => {
        activeLinkObserver.observe(element);
    });

    // =========================================
    // 5. Scroll-Reveal Animation Observer
    // =========================================
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -8% 0px', // Trigger slightly before entering viewport
        threshold: 0.05 // Trigger when at least 5% of the element is visible
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, revealObserverOptions);
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
});
