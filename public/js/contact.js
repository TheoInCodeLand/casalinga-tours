// Contact page specific JavaScript

// Scroll reveal animations for contact page
const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// Hero section animations
ScrollReveal().reveal(".contact-hero__content h1", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".contact-hero__content .section__description", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".contact-hero__image img", {
  ...scrollRevealOption,
  origin: "right",
  delay: 1500,
});

// Contact methods animations
ScrollReveal().reveal(".contact-method", {
  ...scrollRevealOption,
  interval: 300,
});

// Form section animations
ScrollReveal().reveal(".form__content .section__subheader", {
  ...scrollRevealOption,
});
ScrollReveal().reveal(".form__content .section__header", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".form__content .section__description", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".contact__form", {
  ...scrollRevealOption,
  delay: 1500,
});
ScrollReveal().reveal(".form__image img", {
  ...scrollRevealOption,
  origin: "right",
  delay: 2000,
});

// FAQ section animations
ScrollReveal().reveal(".faq__section .section__subheader", {
  ...scrollRevealOption,
});
ScrollReveal().reveal(".faq__section .section__header", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".faq__item", {
  ...scrollRevealOption,
  delay: 1000,
  interval: 300,
});

// Map section animations
ScrollReveal().reveal(".map__section .section__subheader", {
  ...scrollRevealOption,
});
ScrollReveal().reveal(".map__section .section__header", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".map__embed", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".map__info", {
  ...scrollRevealOption,
  delay: 1500,
});

// FAQ Accordion functionality
document.querySelectorAll('.faq__question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    item.classList.toggle('active');
  });
});

// Form validation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Basic validation
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    
    let isValid = true;
    
    if (!name.value.trim()) {
      showError(name, 'Please enter your name');
      isValid = false;
    } else {
      clearError(name);
    }
    
    if (!email.value.trim() || !isValidEmail(email.value)) {
      showError(email, 'Please enter a valid email address');
      isValid = false;
    } else {
      clearError(email);
    }
    
    if (!message.value.trim()) {
      showError(message, 'Please enter your message');
      isValid = false;
    } else {
      clearError(message);
    }
    
    if (isValid) {
      // Form is valid - you would typically send data to server here
      alert('Thank you for your message! We will contact you within 24 hours.');
      contactForm.reset();
    }
  });
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showError(input, message) {
  const formGroup = input.closest('.input__group');
  let error = formGroup.querySelector('.error-message');
  
  if (!error) {
    error = document.createElement('div');
    error.className = 'error-message';
    formGroup.appendChild(error);
  }
  
  error.textContent = message;
  input.style.borderColor = '#ff3860';
}

function clearError(input) {
  const formGroup = input.closest('.input__group');
  const error = formGroup.querySelector('.error-message');
  
  if (error) {
    error.remove();
  }
  
  input.style.borderColor = '#ddd';
}

// Add styles for error messages
const style = document.createElement('style');
style.textContent = `
  .error-message {
    color: #ff3860;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
`;
document.head.appendChild(style);