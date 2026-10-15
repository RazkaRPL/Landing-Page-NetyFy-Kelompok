// Nomor WhatsApp tujuan pesanan (format internasional tanpa +)
const WA_NUMBER = '6281234567890';
const THEME_KEY = 'netyfy-theme';

const root = document.documentElement;
const contactBox = document.getElementById('contactbox');
const orderBox = document.getElementById('orderbox');
const menuToggle = document.getElementById('menu-toggle');
const menuList = document.getElementById('menu-list');
const menuOverlay = document.getElementById('sidebar-overlay');

/* ================= Tema terang / gelap ================= */
function getTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function updateThemeUI(theme) {
    const next = theme === 'light' ? 'gelap' : 'terang';
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
        btn.setAttribute('aria-label', 'Ganti ke tema ' + next);
    });
    document.querySelectorAll('.menu-item[data-theme-toggle]').forEach(function (btn) {
        btn.setAttribute('aria-checked', String(theme === 'light'));
    });
}

function applyTheme(theme) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
        root.classList.add('theme-anim');
        setTimeout(function () { root.classList.remove('theme-anim'); }, 350);
    }
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* abaikan */ }
    updateThemeUI(theme);
}

document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
        applyTheme(getTheme() === 'light' ? 'dark' : 'light');
    });
});
updateThemeUI(getTheme());

/* ================= Popup (Contact & Pemesanan) ================= */
let lastFocused = null;

function openBox(box, returnTo) {
    lastFocused = returnTo || document.activeElement;
    box.classList.add('showed');
    box.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    box.querySelector('.contact-close').focus();
}

function closeBox(box) {
    box.classList.remove('showed');
    box.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
}

document.querySelectorAll('.contactbox').forEach(function (box) {
    box.querySelectorAll('.contact-close, .contact-done').forEach(function (btn) {
        btn.addEventListener('click', function () { closeBox(box); });
    });
    box.addEventListener('click', function (e) {
        if (e.target === box) closeBox(box);
    });
});

/* ================= Sidebar hamburger (klik logo Home) ================= */
function openMenu() {
    menuList.classList.add('open');
    menuOverlay.classList.add('open');
    document.body.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Tutup menu');
    menuList.querySelector('.sidebar-close').focus();
}

function closeMenu(returnFocus) {
    menuList.classList.remove('open');
    menuOverlay.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu');
    if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', function () {
    if (menuList.classList.contains('open')) {
        closeMenu();
    } else {
        openMenu();
    }
});

// Tombol X dan klik area gelap menutup sidebar
menuList.querySelector('.sidebar-close').addEventListener('click', function () { closeMenu(true); });
menuOverlay.addEventListener('click', function () { closeMenu(); });

// Klik link di dalam sidebar menutup sidebar
menuList.querySelectorAll('a.menu-item').forEach(function (link) {
    link.addEventListener('click', function () { closeMenu(); });
});

/* ================= Tombol Contact (navbar & menu) ================= */
document.querySelectorAll('[data-open-contact]').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const fromMenu = menuList.contains(btn);
        if (fromMenu) closeMenu();
        openBox(contactBox, fromMenu ? menuToggle : btn);
    });
});

/* ================= Popup Pemesanan ================= */
const orderModal = orderBox.querySelector('.order-modal');
let selected = null;

document.querySelectorAll('.btn-order').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        selected = btn.dataset;

        document.getElementById('order-service').textContent = selected.service;
        document.getElementById('order-title').textContent = selected.plan;
        document.getElementById('order-price').textContent = selected.price;
        document.getElementById('order-note').textContent = selected.note;
        document.getElementById('order-icon').src = selected.icon;

        orderModal.style.setProperty('--accent', selected.accent);
        orderModal.style.setProperty('--on-accent', selected.on);
        // teks judul memakai warna yang kontrasnya cukup di tema aktif
        orderModal.style.setProperty(
            '--accent-text',
            getTheme() === 'light' ? selected.accentLight : selected.accent
        );

        openBox(orderBox);
    });
});

document.getElementById('order-submit').addEventListener('click', function () {
    if (!selected) return;
    const payment = orderBox.querySelector('input[name="payment"]:checked').value;
    const text = 'Halo NetyFy, saya mau pesan paket ' + selected.service + ' ' + selected.plan +
        ' (' + selected.price + ') dengan pembayaran ' + payment + '.';
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    closeBox(orderBox);
});

/* ================= Keyboard: Escape & jebakan Tab ================= */
document.addEventListener('keydown', function (e) {
    const openModal = document.querySelector('.contactbox.showed');
    const menuOpen = menuList.classList.contains('open');

    if (e.key === 'Escape') {
        if (openModal) {
            closeBox(openModal);
        } else if (menuOpen) {
            closeMenu(true);
        }
        return;
    }

    const trap = openModal || (menuOpen ? menuList : null);
    if (e.key === 'Tab' && trap) {
        const items = trap.querySelectorAll('button, a[href], input:not([type="radio"]), input[type="radio"]:checked');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});