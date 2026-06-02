// script.js - Kisan Shuttering & Scaffolding
// Handlers for interactive features, modal popups, FAQ accordions, and lead generation

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFaqs();
  initForms();
  initStickyHeader();
  initQuoteModal();
  animateOnScroll();
});

// Mobile Menu toggle with proper ARIA accessibility
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
      menuBtn.setAttribute('aria-expanded', 'true');
    });
  }
  
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('translate-x-full');
      document.body.style.overflow = '';
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // Close mobile menu on clicking any links
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('translate-x-full');
      document.body.style.overflow = '';
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Custom Accordion logic for FAQs with slide animations
function initFaqs() {
  const faqHeaders = document.querySelectorAll('.faq-header');
  
  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      const panelId = header.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      
      // Close all other FAQs in the same container
      const container = header.closest('.faq-container') || document;
      const allHeadersInContainer = container.querySelectorAll('.faq-header');
      allHeadersInContainer.forEach(h => {
        if (h !== header) {
          h.setAttribute('aria-expanded', 'false');
          const p = document.getElementById(h.getAttribute('aria-controls'));
          if (p) {
            p.classList.add('hidden');
            p.style.maxHeight = null;
          }
        }
      });

      if (isExpanded) {
        header.setAttribute('aria-expanded', 'false');
        if (panel) {
          panel.classList.add('hidden');
          panel.style.maxHeight = null;
        }
      } else {
        header.setAttribute('aria-expanded', 'true');
        if (panel) {
          panel.classList.remove('hidden');
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      }
    });
  });
}

// Form field validation & submit handler with local logging (Leads Panel)
function initForms() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Field validations
      const name = form.querySelector('[name="name"]');
      const company = form.querySelector('[name="company_name"]');
      const mobile = form.querySelector('[name="mobile_number"]');
      const city = form.querySelector('[name="city"]');
      const material = form.querySelector('[name="material_requirement"]');
      const size = form.querySelector('[name="project_size"]');
      const message = form.querySelector('[name="message"]');
      
      let isValid = true;
      
      // Validate Mobile Number (Indian match: 10 digits, starting with 6-9)
      const mobilePattern = /^[6-9]\d{9}$/;
      if (mobile && !mobilePattern.test(mobile.value.trim())) {
        showFieldError(mobile, "Please enter a valid 10-digit Indian mobile number");
        isValid = false;
      } else if (mobile) {
        clearFieldError(mobile);
      }
      
      // Validate Name
      if (name && name.value.trim().length < 3) {
        showFieldError(name, "Name must be at least 3 characters");
        isValid = false;
      } else if (name) {
        clearFieldError(name);
      }

      // Check materials selected or typed
      if (material && material.value === "") {
        showFieldError(material, "Please select or describe your material needs");
        isValid = false;
      } else if (material) {
        clearFieldError(material);
      }
      
      if (!isValid) return;
      
      // Create lead payload
      const lead = {
        id: 'LID-' + Date.now(),
        name: name ? name.value.trim() : 'Anonymous',
        company: company ? company.value.trim() : 'Not Specified',
        mobile: mobile ? mobile.value.trim() : '',
        city: city ? city.value : 'General',
        material: material ? material.value : 'General Requirement',
        size: size ? size.value : 'Not Specified',
        message: message ? message.value.trim() : '',
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };
      
      // Store to local storage
      const existingLeads = JSON.parse(localStorage.getItem('kisan_leads') || '[]');
      existingLeads.unshift(lead);
      localStorage.setItem('kisan_leads', JSON.stringify(existingLeads));
      
      // Submit to server-side Google Forms proxy
      fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lead)
      })
      .then(res => res.json())
      .then(data => {
        console.log('Lead submitted to server & Google Forms sync status:', data);
      })
      .catch(err => {
        console.error('Error syncing lead to server:', err);
      });
      
      // Dispatch custom event to update dashboard
      window.dispatchEvent(new Event('leads_updated'));
      
      // Show Success Modal / Alert
      showSuccessPopup(lead);
      form.reset();
    });
  });
}

function showFieldError(input, msg) {
  input.classList.add('border-red-500', 'ring-1', 'ring-red-500');
  let errLabel = input.parentElement.querySelector('.error-msg');
  if (!errLabel) {
    errLabel = document.createElement('span');
    errLabel.className = 'error-msg text-xs text-red-500 mt-1 block';
    input.parentElement.appendChild(errLabel);
  }
  errLabel.textContent = msg;
}

function clearFieldError(input) {
  input.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
  const errLabel = input.parentElement.querySelector('.error-msg');
  if (errLabel) errLabel.remove();
}

// Floating alert or beautifully styled full screen popup confirming details
function showSuccessPopup(lead) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300';
  modal.innerHTML = `
    <div class="bg-[#1E1E1E] border-t-4 border-[#FFC107] text-white p-8 rounded-xl max-w-md w-full shadow-2xl relative text-center transform scale-95 transition-transform duration-300">
      <div class="w-16 h-16 bg-[#FFC107]/10 text-[#FFC107] flex items-center justify-center rounded-full mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-2xl font-bold font-sans text-white mb-2">Quote Request Submitted!</h3>
      <p class="text-gray-300 text-sm mb-6">Thank you, <strong>${lead.name}</strong>. Our rental dispatch team is reviewing your requirements for <strong>${lead.material}</strong> in <strong>${lead.city === 'General' ? 'your city' : lead.city}</strong>.</p>
      
      <div class="bg-black/40 rounded-lg p-4 mb-6 text-left border border-white/5 space-y-2 text-xs font-mono">
        <div class="flex justify-between text-gray-400"><span>Lead ID:</span> <span class="text-white">${lead.id}</span></div>
        <div class="flex justify-between text-gray-400"><span>Mobile:</span> <span class="text-white">+91 ${lead.mobile}</span></div>
        <div class="flex justify-between text-gray-400"><span>Delivery Queue:</span> <span class="text-[#FFC107]">Same-Day Priority</span></div>
      </div>
      
      <p class="text-xs text-gray-400 mb-6">Our coordinator will connect with you on +91 ${lead.mobile} within 15 minutes to share direct pricing.</p>
      
      <button class="w-full bg-[#FFC107] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#E0A800] transition duration-200 uppercase tracking-wider text-sm outline-none" id="close-success-btn">
        Back to Site
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('close-success-btn');
  closeBtn.addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });
}

// Header behavior when scrolling
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('shadow-xl', 'bg-[#121212]/95');
    } else {
      header.classList.remove('shadow-xl', 'bg-[#121212]/95');
    }
  });
}

// General Quote Action Modal Trigger for customizable CTAs
function initQuoteModal() {
  const quoteBtns = document.querySelectorAll('a[href="#quote-modal"], button[data-action="quote"]');
  quoteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openQuoteModal(btn.dataset.material || '');
    });
  });
}

function openQuoteModal(prefillMaterial = '') {
  let modal = document.getElementById('global-quote-modal');
  if (modal) modal.remove();
  
  const pLower = prefillMaterial.toLowerCase();
  let materialDisplay = 'Premium Scaffolding & Shuttering Materials';
  if (pLower.includes('shuttering') || pLower.includes('plate') || pLower.includes('farma')) {
    materialDisplay = 'Heavy Centering Shuttering Plates & Farma';
  } else if (pLower.includes('cuplock') || pLower.includes('vertical')) {
    materialDisplay = 'Heavy Cuplock Scaffolding Systems';
  } else if (pLower.includes('scaffolding')) {
    materialDisplay = 'Heavy Scaffold Pipes, Couplers & Standards';
  } else if (pLower.includes('jack') || pLower.includes('prop') || pLower.includes('span')) {
    materialDisplay = 'Adjustable Prop Jacks & Spans';
  } else if (pLower.includes('challi') || pLower.includes('walk') || pLower.includes('plank')) {
    materialDisplay = 'Anti-Skid Walkway Planks / MS Challi';
  }

  let currentCityForPre = window.location.pathname.split('/').pop().replace('.html', '');
  if (currentCityForPre.startsWith('scaffolding-rental-')) {
    currentCityForPre = currentCityForPre.replace('scaffolding-rental-', '');
  }
  const activeCity = currentCityForPre && currentCityForPre !== 'index' ? currentCityForPre.charAt(0).toUpperCase() + currentCityForPre.slice(1) : '';
  const citySuffix = activeCity ? ` under ${activeCity} region` : '';

  modal = document.createElement('div');
  modal.id = 'global-quote-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#1E1E1E] text-white rounded-xl border border-white/10 max-w-md w-full overflow-hidden shadow-2xl transform scale-95 transition-all duration-300">
      <div class="p-6 border-b border-white/10 flex justify-between items-center bg-[#181818]">
        <h3 class="text-lg font-bold font-sans flex items-center text-[#FFC107]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#FFC107]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Direct Connection Desk
        </h3>
        <button class="text-gray-400 hover:text-white text-2xl font-semibold leading-none focus:outline-none" id="close-modal-btn">&times;</button>
      </div>
      
      <div class="p-6 space-y-5">
        <div class="bg-black/30 border border-white/5 p-4 rounded-lg">
          <span class="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">INQUIRY CONTEXT</span>
          <p class="text-sm font-semibold text-white">${materialDisplay}${citySuffix}</p>
        </div>

        <p class="text-xs text-gray-400 leading-relaxed font-sans">
          To receive instant rates, share details of your layout/sizes, or inspect inventory stocks - connect directly through our official hotlines below.
        </p>

        <div class="space-y-3 pt-1">
          <!-- Call Option -->
          <a href="tel:+917988862842" class="flex items-center justify-between bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#FFC107]/50 text-white rounded-lg p-3.5 transition duration-150 transform hover:-translate-y-0.5 shadow-lg group">
            <div class="flex items-center space-x-3">
              <div class="bg-amber-500/15 p-2 rounded-lg text-[#FFC107] group-hover:bg-[#FFC107] group-hover:text-black transition duration-200">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div class="text-left">
                <span class="block text-[9px] uppercase font-bold tracking-wider text-[#FFC107] font-mono leading-none">Immediate Connection</span>
                <span class="text-sm font-extrabold text-white group-hover:text-[#FFC107] transition duration-200">+91 79888 62842</span>
              </div>
            </div>
            <span class="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded uppercase text-gray-300">Call</span>
          </a>

          <!-- WhatsApp Option -->
          <a href="https://wa.me/917988862842?text=Greetings%20Kisan%20Shuttering,%20I%20have%20an%20urgent%20requirement%20for%20${encodeURIComponent(materialDisplay)}${citySuffix ? '%20in%20' + activeCity : ''}." target="_blank" rel="noopener noreferrer" class="flex items-center justify-between bg-[#15803D] hover:bg-[#166534] text-white rounded-lg p-3.5 transition duration-150 transform hover:-translate-y-0.5 shadow-lg">
            <div class="flex items-center space-x-3">
              <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.054 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.503 8.484-.008 6.66-5.345 11.997-11.958 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.451 5.403 0 9.798-4.4 9.802-9.81.002-2.623-1.01-5.086-2.853-6.93C16.57 1.94 14.116.927 12.012.927c-5.41 0-9.803 4.397-9.806 9.807-.001 1.928.496 3.551 1.442 5.11l-.953 3.478 3.552-.924zm11.365-7.318c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-3.518-1.564-4.572-2.937-5.144-3.926-.33-.56.059-.533.39-.197.165.167.3.3.45.45.15.15.2.25.3.45.1.2.05.375-.025.525-.075.15-.675 1.625-.925 2.225-.244.589-.491.508-.675.499-.174-.008-.375-.01-.575-.01-.2 0-.525.075-.8 1.05s-1.125 1.1-1.125 2.15c0 .35.075.688.225.98.6 1.213 1.83 2.15 3.325 2.8s2.5.55 3.65.375c.95-.15 1.78-.65 2.05-1.35.275-.7.275-1.3.2-1.425-.075-.125-.275-.2-.575-.35z"/>
              </svg>
              <div class="text-left">
                <span class="block text-[9px] uppercase font-bold tracking-wider opacity-60 font-mono">Share Requirements</span>
                <span class="text-sm font-extrabold text-white">WhatsApp Chat Desk</span>
              </div>
            </div>
            <span class="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded uppercase">Chat</span>
          </a>

          <!-- Email Option -->
          <a href="mailto:kisanshuttering@gmail.com?subject=Material%20Rental%20Query%20-%20${encodeURIComponent(materialDisplay)}" class="flex items-center justify-between bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 text-white rounded-lg p-3.5 transition duration-150 transform hover:-translate-y-0.5 shadow-lg">
            <div class="flex items-center space-x-3">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <div class="text-left">
                <span class="block text-[9px] uppercase font-bold tracking-wider text-gray-500 font-mono">Official Invoice Request</span>
                <span class="text-xs font-bold text-gray-300 font-mono">kisanshuttering@gmail.com</span>
              </div>
            </div>
            <span class="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded uppercase">Email</span>
          </a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Event handlers to close
  const closeBtn = document.getElementById('close-modal-btn');
  closeBtn.addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });

  // Handle outside click close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  });
}

// Fade in elements nicely on viewport exit
function animateOnScroll() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (elements.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(el => observer.observe(el));
}
