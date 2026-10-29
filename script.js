const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const formBtn = $('#login-btn');
const loginForm = $('.login-form-container');
const formClose = $('#form-close');
const menu = $('#menu-bar');
const navbar = $('.navbar');
const bookingForm = $('#booking-form');
const bookingMessage = $('#booking-message');
const savedBookings = $('.saved-bookings-list');
const priceMap = {
  Goa: 5999,
  'Jammu and Kashmir': 7999,
  Agra: 5999,
  Bombay: 3999,
  Amritsar: 3499,
  Rajasthan: 4999,
  Hyderabad: 6999
};

const destinationModal = $('#destination-modal');
const destinationDetails = {
  Goa: 'Relax on beautiful beaches, enjoy coastal food, and discover vibrant local markets.',
  'Jammu and Kashmir': 'Experience mountain landscapes, peaceful lakes, and unforgettable Himalayan views.',
  Agra: 'Explore the Taj Mahal, Agra Fort, and the rich history of the Mughal era.',
  Bombay: 'Discover Mumbai’s harbour, Gateway of India, markets, and energetic city life.',
  Amritsar: 'Visit the Golden Temple and experience the welcoming culture of Punjab.',
  Rajasthan: 'See golden forts, desert sunsets, colourful markets, and historic palaces.',
  Hyderabad: 'Enjoy historic monuments, local cuisine, and the character of Telangana’s capital.'
};

const getBookings = () => {
  try {
    return JSON.parse(localStorage.getItem('travelIndiaBookings') || '[]');
  } catch {
    return [];
  }
};

const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

function displayBookings() {
  if (!savedBookings) return;

  const bookings = getBookings();
  savedBookings.innerHTML = '<h3>Saved bookings</h3>' + (
    bookings.length
      ? bookings.map((booking, index) => `
          <article class="booking-card">
            <p>
              <strong>${booking.location}</strong> — ${booking.guests} guest(s), ${booking.arrival} to ${booking.departure}<br>
              Estimated total: ${money(booking.total)}<br>
              Booked on ${booking.date}
            </p>
            <button class="btn small-btn" data-cancel="${index}">Cancel</button>
            <button class="btn small-btn" data-print="${index}">Print receipt</button>
          </article>
        `).join('')
      : '<p>No bookings yet.</p>'
  );
}

function updateEstimate() {
  const locationInput = $('#booking-location');
  const guestsInput = $('#booking-guests');
  const serviceInput = $('#booking-service');
  const totalEl = $('#booking-total');

  if (!locationInput || !guestsInput || !serviceInput || !totalEl) return;

  const location = locationInput.value.trim();
  const guests = Number(guestsInput.value) || 0;
  const service = Number(serviceInput.value) || 0;

  totalEl.textContent = money(((priceMap[location] || 0) + service) * guests);
}

displayBookings();

const bookingLocation = $('#booking-location');
const bookingGuests = $('#booking-guests');
const bookingService = $('#booking-service');

if (bookingLocation) bookingLocation.addEventListener('input', updateEstimate);
if (bookingGuests) bookingGuests.addEventListener('input', updateEstimate);
if (bookingService) bookingService.addEventListener('change', updateEstimate);

if (bookingForm) {
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const arrival = $('#booking-arrival')?.value;
    const departure = $('#booking-departure')?.value;
    const phone = $('#booking-phone')?.value.trim();
    const location = $('#booking-location')?.value.trim();
    const guests = Number($('#booking-guests')?.value);
    const service = Number($('#booking-service')?.value) || 0;

    if (!arrival || !departure || !phone || !location) {
      if (bookingMessage) {
        bookingMessage.textContent = 'Please fill in all required booking details.';
        bookingMessage.className = 'error-message';
      }
      return;
    }

    if (new Date(departure) <= new Date(arrival)) {
      if (bookingMessage) {
        bookingMessage.textContent = 'Departure date must be after arrival date.';
        bookingMessage.className = 'error-message';
      }
      return;
    }

    if (!/^[+]?[0-9\s-]{7,15}$/.test(phone)) {
      if (bookingMessage) {
        bookingMessage.textContent = 'Please enter a valid phone number.';
        bookingMessage.className = 'error-message';
      }
      return;
    }

    const booking = {
      location,
      guests,
      phone,
      arrival,
      departure,
      total: ((priceMap[location] || 0) + service) * guests,
      date: new Date().toLocaleDateString()
    };

    const bookings = getBookings();
    bookings.push(booking);

    try {
      localStorage.setItem('travelIndiaBookings', JSON.stringify(bookings));
    } catch (error) {
      console.error('Error saving booking:', error);
    }

    if (bookingMessage) {
      bookingMessage.textContent = 'Booking saved successfully.';
      bookingMessage.className = '';
    }

    bookingForm.reset();
    updateEstimate();
    displayBookings();
  });
}

if (savedBookings) {
  savedBookings.addEventListener('click', (event) => {
    const target = event.target;
    const cancelIndex = target.dataset.cancel;
    const printIndex = target.dataset.print;

    if (cancelIndex === undefined && printIndex === undefined) return;

    const bookings = getBookings();
    const index = Number(cancelIndex ?? printIndex);

    if (cancelIndex !== undefined) {
      bookings.splice(index, 1);
      localStorage.setItem('travelIndiaBookings', JSON.stringify(bookings));
      displayBookings();
      return;
    }

    const booking = bookings[index];
    if (!booking) return;

    const receipt = `TravelIndia receipt\n${booking.location} | ${booking.guests} guest(s)\n${booking.arrival} to ${booking.departure}\nEstimated total: ${money(booking.total)}`;

    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`<pre>${receipt}</pre>`);
      receiptWindow.print();
    }
  });
}

$$('.packages .box').forEach((card) => {
  const destination = card.dataset.destination || card.querySelector('h3')?.textContent.replace('', '').trim() || '';
  const price = Number(card.dataset.price || card.querySelector('.price')?.textContent.replace(/[^0-9]/g, '') || 0);
  card.dataset.destination = destination;
  card.dataset.price = price;

  const bookBtn = card.querySelector('.btn');
  if (bookBtn) {
    bookBtn.addEventListener('click', (event) => {
      event.preventDefault();
      const bookingLocationInput = $('#booking-location');
      if (bookingLocationInput) {
        bookingLocationInput.value = destination;
        updateEstimate();
      }
      document.querySelector('#book')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
});

function filterPackages() {
  const searchInput = $('#package-search');
  const priceFilter = $('#price-filter');

  if (!searchInput || !priceFilter) return;

  const search = searchInput.value.toLowerCase();
  const limit = priceFilter.value;

  $$('.packages .box').forEach((card) => {
    const destination = (card.dataset.destination || '').toLowerCase();
    const price = Number(card.dataset.price || 0);

    const matchesSearch = destination.includes(search);
    const matchesPrice = limit === 'all' || price <= Number(limit);

    card.hidden = !(matchesSearch && matchesPrice);
  });
}

const packageSearch = $('#package-search');
const priceFilter = $('#price-filter');

if (packageSearch) packageSearch.addEventListener('input', filterPackages);
if (priceFilter) priceFilter.addEventListener('change', filterPackages);

function openDestinationModal(card) {
  if (!card || !destinationModal) return;

  const destination = card.dataset.destination;
  const titleEl = $('#destination-title');
  const descriptionEl = $('#destination-description');
  const imageEl = $('#destination-image');

  if (!titleEl || !descriptionEl || !imageEl) return;

  titleEl.textContent = destination;
  descriptionEl.textContent = destinationDetails[destination] || 'Create a memorable journey with a flexible TravelIndia package.';
  imageEl.src = card.querySelector('img')?.src || '';
  imageEl.alt = destination;

  destinationModal.classList.add('active');
  destinationModal.setAttribute('aria-hidden', 'false');
}

$$('.packages .box .content h3').forEach((title) => {
  title.addEventListener('click', () => openDestinationModal(title.closest('.box')));
});

const modalClose = $('#modal-close');
if (modalClose) {
  modalClose.addEventListener('click', () => {
    if (destinationModal) {
      destinationModal.classList.remove('active');
      destinationModal.setAttribute('aria-hidden', 'true');
    }
  });
}

if (destinationModal) {
  destinationModal.addEventListener('click', (event) => {
    if (event.target === destinationModal) {
      modalClose?.click();
    }
  });
}

const modalBook = $('#modal-book');
if (modalBook) {
  modalBook.addEventListener('click', () => modalClose?.click());
}

const backToTop = $('#back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function closeMenu() {
  if (!menu || !navbar) return;

  menu.classList.remove('fa-times');
  menu.classList.add('fa-bars');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation menu');
  navbar.classList.remove('active');
}

if (menu) {
  menu.addEventListener('click', () => {
    if (!navbar) return;

    const isOpen = navbar.classList.toggle('active');
    menu.classList.toggle('fa-bars', !isOpen);
    menu.classList.toggle('fa-times', isOpen);
    menu.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });
}

if (navbar) {
  navbar.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}

window.addEventListener('scroll', () => {
  closeMenu();
  if (loginForm) loginForm.classList.remove('active');
});

if (formBtn) {
  formBtn.addEventListener('click', () => {
    if (loginForm) loginForm.classList.add('active');
  });
}

if (formClose) {
  formClose.addEventListener('click', () => {
    if (loginForm) loginForm.classList.remove('active');
  });
}

const loginFormElement = $('.login-form-container form');
if (loginFormElement) {
  loginFormElement.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Demo login submitted.');
  });
}

$$('.img-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const activeBtn = $('.controls .active');
    if (activeBtn) activeBtn.classList.remove('active');

    btn.classList.add('active');

    const imageSlider = $('#img-slider');
    if (imageSlider) {
      imageSlider.src = btn.dataset.src;
    }
  });
});

const themeToggle = $('#theme-toggle');
if (localStorage.getItem('travelIndiaTheme') === 'dark') {
  document.body.classList.add('dark-mode');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('travelIndiaTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });
}

const contactForm = $('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const contactMessage = $('#contact-message');
    if (contactMessage) {
      contactMessage.textContent = 'Thank you. Your message has been received.';
    }

    event.target.reset();
  });
}

const newsletterForm = $('#newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newsletterMessage = $('#newsletter-message');
    if (newsletterMessage) {
      newsletterMessage.textContent = 'You are subscribed for travel updates.';
    }

    event.target.reset();
  });
}

if (window.Swiper) {
  new Swiper('.review-slider', {
    spaceBetween: 20,
    loop: true,
    autoplay: { delay: 2500, disableOnInteraction: false },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.12 });

  $$('section').forEach((section) => {
    section.classList.add('reveal');
    observer.observe(section);
  });
} else {
  $$('section').forEach((section) => {
    section.classList.add('visible');
  });
}
