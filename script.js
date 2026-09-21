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
const priceMap = { Goa: 5999, 'Jammu and Kashmir': 7999, Agra: 5999, Bombay: 3999, Amritsar: 3499, Rajasthan: 4999, Hyderabad: 6999 };
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

localStorage.removeItem('travelIndiaBookings');

const getBookings = () => JSON.parse(localStorage.getItem('travelIndiaBookings') || '[]');
const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

function displayBookings() {
    const bookings = getBookings();
    savedBookings.innerHTML = '<h3>Saved bookings</h3>' + (
        bookings.length ? bookings.map((booking, index) => `
            <article class="booking-card"><p><strong>${booking.location}</strong> — ${booking.guests} guest(s), ${booking.arrival} to ${booking.departure}<br>
            Estimated total: ${money(booking.total)}<br>Booked on ${booking.date}</p>
            <button class="btn small-btn" data-cancel="${index}">Cancel</button>
            <button class="btn small-btn" data-print="${index}">Print receipt</button></article>`).join('') : '<p>No bookings yet.</p>'
    );
}

function updateEstimate() {
    const location = $('#booking-location').value.trim();
    const guests = Number($('#booking-guests').value) || 0;
    const service = Number($('#booking-service').value) || 0;
    $('#booking-total').textContent = money(((priceMap[location] || 0) + service) * guests);
}

displayBookings();
$('#booking-location').addEventListener('input', updateEstimate);
$('#booking-guests').addEventListener('input', updateEstimate);
$('#booking-service').addEventListener('change', updateEstimate);

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const arrival = $('#booking-arrival').value;
    const departure = $('#booking-departure').value;
    const phone = $('#booking-phone').value.trim();
    if (new Date(departure) <= new Date(arrival)) {
        bookingMessage.textContent = 'Departure date must be after arrival date.';
        bookingMessage.className = 'error-message';
        return;
    }
    if (!/^[+]?[0-9\s-]{7,15}$/.test(phone)) {
        bookingMessage.textContent = 'Please enter a valid phone number.';
        bookingMessage.className = 'error-message';
        return;
    }
    const location = $('#booking-location').value.trim();
    const guests = Number($('#booking-guests').value);
    const service = Number($('#booking-service').value) || 0;
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
    localStorage.setItem('travelIndiaBookings', JSON.stringify(bookings));
    bookingMessage.textContent = 'Booking saved successfully.';
    bookingMessage.className = '';
    bookingForm.reset();
    updateEstimate();
    displayBookings();
});

savedBookings.addEventListener('click', (event) => {
    const index = event.target.dataset.cancel ?? event.target.dataset.print;
    if (index === undefined) return;
    const bookings = getBookings();
    if (event.target.dataset.cancel !== undefined) {
        bookings.splice(Number(index), 1);
        localStorage.setItem('travelIndiaBookings', JSON.stringify(bookings));
        displayBookings();
    } else {
        const booking = bookings[Number(index)];
        const receipt = `TravelIndia receipt\n${booking.location} | ${booking.guests} guest(s)\n${booking.arrival} to ${booking.departure}\nEstimated total: ${money(booking.total)}`;
        const receiptWindow = window.open('', '_blank');
        if (receiptWindow) {
            receiptWindow.document.write(`<pre>${receipt}</pre>`);
            receiptWindow.print();
        }
    }
});

$$('.packages .box').forEach((card) => {
    const destination = card.dataset.destination || card.querySelector('h3').textContent.replace('', '').trim();
    const price = Number(card.dataset.price || card.querySelector('.price').textContent.replace(/[^0-9]/g, ''));
    card.dataset.destination = destination;
    card.dataset.price = price;
    card.querySelector('.btn').addEventListener('click', (event) => {
        event.preventDefault();
        $('#booking-location').value = destination;
        updateEstimate();
        $('#book').scrollIntoView({ behavior: 'smooth' });
    });
});

function filterPackages() {
    const search = $('#package-search').value.toLowerCase();
    const limit = $('#price-filter').value;
    $$('.packages .box').forEach(card => {
        card.hidden = !card.dataset.destination.toLowerCase().includes(search) || (limit !== 'all' && Number(card.dataset.price) > Number(limit));
    });
}

$('#package-search').addEventListener('input', filterPackages);
$('#price-filter').addEventListener('change', filterPackages);

function openDestinationModal(card) {
    const destination = card.dataset.destination;
    $('#destination-title').textContent = destination;
    $('#destination-description').textContent = destinationDetails[destination] || 'Create a memorable journey with a flexible TravelIndia package.';
    $('#destination-image').src = card.querySelector('img').src;
    $('#destination-image').alt = destination;
    destinationModal.classList.add('active');
    destinationModal.setAttribute('aria-hidden', 'false');
}

$$('.packages .box .content h3').forEach(title => title.addEventListener('click', () => openDestinationModal(title.closest('.box'))));
$('#modal-close').addEventListener('click', () => {
    destinationModal.classList.remove('active');
    destinationModal.setAttribute('aria-hidden', 'true');
});

destinationModal.addEventListener('click', event => {
    if (event.target === destinationModal) $('#modal-close').click();
});
$('#modal-book').addEventListener('click', () => $('#modal-close').click());

const backToTop = $('#back-to-top');
window.addEventListener('scroll', () => backToTop.classList.toggle('visible', window.scrollY > 500));
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function closeMenu() {
    menu.classList.remove('fa-times');
    menu.classList.add('fa-bars');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation menu');
    navbar.classList.remove('active');
}

menu.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('active');
    menu.classList.toggle('fa-bars', !isOpen);
    menu.classList.toggle('fa-times', isOpen);
    menu.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

navbar.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => {
    closeMenu();
    loginForm.classList.remove('active');
});

formBtn.addEventListener('click', () => loginForm.classList.add('active'));
formClose.addEventListener('click', () => loginForm.classList.remove('active'));
$('.login-form-container form').addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Demo login submitted.');
});

$$('.img-btn').forEach(btn => btn.addEventListener('click', () => {
    $('.controls .active').classList.remove('active');
    btn.classList.add('active');
    $('#img-slider').src = btn.dataset.src;
}));

const themeToggle = $('#theme-toggle');
if (localStorage.getItem('travelIndiaTheme') === 'dark') document.body.classList.add('dark-mode');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('travelIndiaTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

$('#contact-form').addEventListener('submit', (event) => {
    event.preventDefault();
    $('#contact-message').textContent = 'Thank you. Your message has been received.';
    event.target.reset();
});

$('#newsletter-form').addEventListener('submit', (event) => {
    event.preventDefault();
    $('#newsletter-message').textContent = 'You are subscribed for travel updates.';
    event.target.reset();
});

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

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('visible', entry.isIntersecting));
}, { threshold: 0.12 });

$$('section').forEach(section => {
    section.classList.add('reveal');
    observer.observe(section);
});
