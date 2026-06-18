/**
 * oops. Creative Agency - Main JS Logic & Fallbacks
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroScrollReveal();
  initHeroAudio();
  initScrollHeaderFallback();
  initScrollRevealFallback();
  initFormValidation();
});

/**
 * Mobile Hamburger Navigation Menu Toggle
 */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('main-nav');
  if (!hamburger || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = document.body.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  hamburger.addEventListener('click', toggleMenu);

  // Close menu when navigation links are clicked
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Hero Video Scrollytelling Scroll-Progress Reveal Fallback
 * Calculates window scroll progress relative to the first viewport height
 */
function initHeroScrollReveal() {
  const container = document.querySelector('.hero-scroll-container');
  if (!container) return;

  const checkProgress = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const revealRange = viewportHeight * 0.8; // 80vh
    
    // Calculate progress fraction from 0 to 1
    const progress = Math.min(Math.max(scrollY / revealRange, 0), 1);
    
    // Write CSS property so styling can track it dynamically
    document.documentElement.style.setProperty('--hero-scroll-progress', progress);
    
    // Manual fallbacks for the sound button if native scroll-driven animations are missing
    if (!CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')) {
      const btnOpacity = Math.max(0, (progress - 0.3) / 0.7); // Fades in from 30% to 100% of range
      document.documentElement.style.setProperty('--sound-toggle-opacity', btnOpacity);
      document.documentElement.style.setProperty('--sound-toggle-pointer', progress > 0.3 ? 'auto' : 'none');
    } else {
      // Browsers with support use native CSS animations, so we reset JS variables
      document.documentElement.style.setProperty('--sound-toggle-opacity', 'initial');
      document.documentElement.style.setProperty('--sound-toggle-pointer', 'initial');
    }
  };

  window.addEventListener('scroll', checkProgress, { passive: true });
  checkProgress(); // Run once initially

  const scrollArrow = container.querySelector('.scroll-arrow-btn');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', (e) => {
      e.preventDefault();
      const viewportHeight = window.innerHeight;
      window.scrollTo({
        top: viewportHeight * 0.8, // Scroll exactly to the end of the reveal range (80vh)
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Hero Background Video Audio Toggle Controls (Mute/Unmute)
 */
function initHeroAudio() {
  const video = document.getElementById('hero-video');
  const soundToggle = document.getElementById('sound-toggle');
  if (!video || !soundToggle) return;

  const mutedIcon = soundToggle.querySelector('.sound-muted-icon');
  const playingIcon = soundToggle.querySelector('.sound-playing-icon');

  soundToggle.addEventListener('click', () => {
    video.muted = !video.muted;
    
    if (video.muted) {
      mutedIcon.style.display = 'block';
      playingIcon.style.display = 'none';
      soundToggle.setAttribute('aria-label', 'Unmute Background Video');
      soundToggle.title = 'Unmute Video';
    } else {
      mutedIcon.style.display = 'none';
      playingIcon.style.display = 'block';
      soundToggle.setAttribute('aria-label', 'Mute Background Video');
      soundToggle.title = 'Mute Video';
    }
  });
}

/**
 * 1. Shrinking Header Scroll Timeline Fallback
 * For browsers that don't support declarative CSS scroll-driven animations (e.g. Firefox)
 */
function initScrollHeaderFallback() {
  const supportsScrollTimeline = CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)');
  
  if (!supportsScrollTimeline) {
    const header = document.getElementById('main-header');
    
    const checkScroll = () => {
      if (window.scrollY > 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll(); // Run once on load
  }
}

/**
 * 2. Project Card Scroll Entrance View Timeline Fallback
 * For browsers that do not support view() timelines (e.g. Firefox)
 */
function initScrollRevealFallback() {
  const supportsViewTimeline = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  
  if (!supportsViewTimeline) {
    const projectCards = document.querySelectorAll('.project-card');
    
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target); // Reveal animation once
        }
      });
    }, observerOptions);
    
    projectCards.forEach(card => {
      // Set initial styles for fallback browsers
      card.style.opacity = '0';
      card.style.transform = 'translateY(60px) scale(0.96)';
      card.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
      observer.observe(card);
    });
  }
}

/**
 * 3. Form Validation: :user-invalid Fallback and Syncing
 * Implements the "Validate Input After Interaction" best practices
 */
function initFormValidation() {
  const form = document.getElementById('project-form');
  if (!form) return;

  const formFields = form.querySelectorAll('input, textarea, select');
  const supportsUserInvalid = CSS.supports('selector(:user-invalid)');
  
  // Track interactive dirtiness of fields using a WeakMap
  const fieldInteractionState = new WeakMap();

  // Helper to sync aria-invalid and apply fallback visual classes
  const validateField = (field) => {
    const isValid = field.checkValidity();
    
    // Fallback dirty-class if CSS doesn't support :user-invalid selector
    if (!supportsUserInvalid) {
      field.classList.toggle('user-invalid-fallback', !isValid);
      field.classList.toggle('user-valid-fallback', isValid);
    }
    
    // Accessibility: Sync validity states with screen readers
    if (!isValid) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
  };

  // Event handler for user edits and interactions
  const handleFieldInteraction = (e) => {
    const field = e.target;
    if (!field.checkValidity) return;

    let state = fieldInteractionState.get(field);
    if (!state) {
      state = { hasInteracted: false, hasBlurred: false };
      fieldInteractionState.set(field, state);
    }

    if (e.type === 'input' || e.type === 'change') {
      state.hasInteracted = true;
      // If user corrected an error after blurring, clear it immediately
      if (state.hasBlurred) {
        validateField(field);
      }
    } else if (e.type === 'blur') {
      state.hasBlurred = true;
      // Only show validation errors if the user has actually written or selected something
      if (state.hasInteracted || field.value !== '') {
        validateField(field);
      }
    }
  };

  // Attach event listeners to track user input
  formFields.forEach(field => {
    field.addEventListener('input', handleFieldInteraction);
    field.addEventListener('change', handleFieldInteraction);
    field.addEventListener('blur', handleFieldInteraction);
  });

  // Handle Form Submission Interceptor
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isFormValid = true;

    // Force validation on all fields upon submission attempt
    formFields.forEach(field => {
      // Mark as fully interacted to trigger fallback validation classes
      fieldInteractionState.set(field, { hasInteracted: true, hasBlurred: true });
      validateField(field);
      
      if (!field.checkValidity()) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      const submitBtn = document.getElementById('form-submit-btn');
      const successAlert = document.getElementById('form-success');
      
      // Visual feedback loading state
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending...';
      
      // Simulate API submission call
      setTimeout(() => {
        // Reset form variables
        form.reset();
        
        // Clear all validation visual classes
        formFields.forEach(field => {
          field.classList.remove('user-invalid-fallback', 'user-valid-fallback');
          field.removeAttribute('aria-invalid');
          fieldInteractionState.delete(field);
        });
        
        // Show custom success screen with ARIA alert support
        successAlert.classList.add('show');
        successAlert.setAttribute('aria-hidden', 'false');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send Brief';
        
        // Auto-hide success screen after a duration
        setTimeout(() => {
          successAlert.classList.remove('show');
          successAlert.setAttribute('aria-hidden', 'true');
        }, 5000);
        
      }, 1500);
    } else {
      // Accessibility: Focus the first invalid field
      const firstInvalidField = form.querySelector(':invalid');
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    }
  });

  // Handle Form Reset Event
  form.addEventListener('reset', () => {
    formFields.forEach(field => {
      field.classList.remove('user-invalid-fallback', 'user-valid-fallback');
      field.removeAttribute('aria-invalid');
      fieldInteractionState.delete(field);
    });
  });
}
