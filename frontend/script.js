// script.js - Premium SaaS landing page animations

// Create floating particles
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  const numParticles = 30;

  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 20) + 's';
    particle.style.width = particle.style.height = Math.random() * 3 + 1 + 'px';
    particlesContainer.appendChild(particle);
  }
}

// Animation sequence on load
window.addEventListener('load', () => {
  createParticles();

  // 1. Navbar fades in (opacity + slight Y)
  const navbar = document.querySelector('.navbar');
  navbar.style.opacity = '0';
  navbar.style.transform = 'translateX(-50%) translateY(-10px)';
  setTimeout(() => {
    navbar.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    navbar.style.opacity = '1';
    navbar.style.transform = 'translateX(-50%) translateY(0)';
  }, 100);

  // 2. Hero headline reveals (slide up) - already handled by CSS animation
  // 3. Subheading fades in - already handled by CSS animation
  // 4. CTA buttons animate in - already handled by CSS animation
  // 5. Background visuals start continuous motion
  setTimeout(() => {
    animateKineticSystem();
  }, 1500);

  // Scroll-triggered animations
  setupScrollAnimations();
});

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-menu a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, observerOptions);

  // Observe sections
  document.querySelectorAll('.features, .brands, .footer').forEach(section => {
    observer.observe(section);
  });
}

// Kinetic system animations using requestAnimationFrame with physics-based motion
let animationId;
const kineticElements = {
  rings: document.querySelectorAll('.ring'),
  nodes: document.querySelectorAll('.node'),
  pipes: document.querySelectorAll('.pipe'),
  connectors: document.querySelectorAll('.connector'),
  floatingElements: document.querySelectorAll('.floating-element')
};

// Physics parameters for premium feel
const physics = {
  ringSpeed: 0.2, // Slower for premium
  nodeAmplitude: 2,
  pipeScaleFactor: 0.03,
  connectorPulse: 0.1,
  floatingSpeed: 0.3
};

function animateKineticSystem() {
  const time = Date.now() * 0.001; // Convert to seconds

  // Animate rings - slow rotation
  kineticElements.rings.forEach((ring, index) => {
    const speed = physics.ringSpeed + index * 0.05;
    const rotation = time * speed * 3;
    ring.style.transform = `rotate(${rotation}deg)`;
  });

  // Animate nodes - floating motion with physics
  kineticElements.nodes.forEach((node, index) => {
    const xOffset = Math.sin(time * physics.floatingSpeed + index) * physics.nodeAmplitude;
    const yOffset = Math.cos(time * physics.floatingSpeed + index * 1.5) * physics.nodeAmplitude;
    node.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
  });

  // Animate pipes - minimal scaling
  kineticElements.pipes.forEach((pipe, index) => {
    const scale = 1 + Math.sin(time * 1.5 + index) * physics.pipeScaleFactor;
    const rotation = Math.sin(time * physics.floatingSpeed + index) * 0.5;
    pipe.style.transform = `scaleY(${scale}) rotate(${rotation}deg)`;
  });

  // Animate connectors - pulsing with damping
  kineticElements.connectors.forEach((connector, index) => {
    const scale = 1 + Math.sin(time * 2 + index) * physics.connectorPulse;
    connector.style.transform = `scale(${scale})`;
  });

  // Animate floating elements - slow complex motion
  kineticElements.floatingElements.forEach((elem, index) => {
    const x = Math.sin(time * physics.floatingSpeed + index * 2) * 12;
    const y = Math.cos(time * physics.floatingSpeed + index * 1.5) * 8;
    const rotation = time * 5 + index * 45;
    elem.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
  });

  animationId = requestAnimationFrame(animateKineticSystem);
}

// Enhanced parallax with multiple layers for depth
function updateParallax() {
  const scrolled = window.pageYOffset;
  
  // Background layer (slowest)
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.1}px)`; // Very slow background movement
  }
  
  // Kinetic system (medium)
  const kineticSystem = document.querySelector('.kinetic-system');
  if (kineticSystem) {
    kineticSystem.style.transform = `translateY(${scrolled * 0.3}px)`; // Medium parallax
  }
  
  // Hero content (fastest for depth)
  const heroLeft = document.querySelector('.hero-left');
  if (heroLeft) {
    heroLeft.style.transform = `translateY(${scrolled * 0.5}px)`; // Faster foreground movement
  }
  
  // Testimonials parallax
  const testimonials = document.querySelector('.testimonials');
  if (testimonials) {
    testimonials.style.transform = `translateY(${scrolled * 0.2}px)`;
  }
  
  // Brands parallax
  const brands = document.querySelector('.brands');
  if (brands) {
    brands.style.transform = `translateY(${scrolled * 0.15}px)`;
  }
}

// Throttle scroll events for performance
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

window.addEventListener('scroll', throttle(updateParallax, 16));

// Button hover effects
document.querySelectorAll('.login-btn, .cta-btn, .hero-cta').forEach(btn => {
  btn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-2px)';
  });

  btn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// Form submission placeholder
document.querySelector('.hero-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you for your interest! We\'ll be in touch soon.');
});

// Testimonial auto-scroll
let testimonialScroll = 0;
function scrollTestimonials() {
  const container = document.querySelector('.testimonial-container');
  if (container) {
    testimonialScroll += 0.5;
    if (testimonialScroll >= container.scrollWidth - container.clientWidth) {
      testimonialScroll = 0;
    }
    container.scrollLeft = testimonialScroll;
  }
  requestAnimationFrame(scrollTestimonials);
}

// Initialize animations on load
window.addEventListener('load', () => {
  animateKineticSystem();
  scrollTestimonials();
});

// Performance: Pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationId);
  } else {
    animateKineticSystem();
  }
});

// Responsive adjustments
function handleResize() {
  const kineticSystem = document.querySelector('.kinetic-system');
  if (window.innerWidth < 768 && kineticSystem) {
    kineticSystem.style.transform = 'scale(0.8)';
  } else if (kineticSystem) {
    kineticSystem.style.transform = 'scale(1)';
  }
}

window.addEventListener('resize', throttle(handleResize, 100));
