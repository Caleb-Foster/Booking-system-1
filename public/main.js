const bookings = {};
let selectedDate = 'MM/DD/YYYY';

const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevButton = document.getElementById('prevBtn');
const nextButton = document.getElementById('nextBtn');

let currentDate = new Date();

function updateCalendar() {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();

    const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthYearElement.textContent = monthYearString;

    let datesHTML = '';

    // Previous month's trailing days (empty)
    for (let i = 0; i < firstDayIndex; i++) {
        datesHTML += `<div class="date inactive"></div>`;
    }

    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const dateString = date.toISOString().split('T')[0];
        const isFullyBooked = bookings[dateString] && bookings[dateString].length >= 2;
        const activeClass = (selectedDate === dateString) ? 'active' : '';
        const inactiveClass = isFullyBooked ? 'inactive' : '';
        datesHTML += `<div class="date ${activeClass} ${inactiveClass}" data-date="${dateString}">${i}</div>`;
    }

    // Fill the rest of the grid (to always have 6 rows)
    const totalCells = firstDayIndex + totalDays;
    const nextDays = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < nextDays; i++) {
        datesHTML += `<div class="date inactive"></div>`;
    }

    datesElement.innerHTML = datesHTML;

    // Add click listeners to selectable dates
    document.querySelectorAll('.date').forEach(el => {
        if (!el.classList.contains('inactive') && el.hasAttribute('data-date')) {
            el.onclick = () => {
                document.querySelectorAll('.date').forEach(d => d.classList.remove('active'));
                el.classList.add('active');
                selectedDate = el.getAttribute('data-date');
            };
        }
    });
}

document.querySelector('form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const time = document.getElementById('time').value;
    const name = document.getElementById('fullname').value;
    if (!selectedDate || !time || !name) {
        alert('Please select a date, time, and enter your name.');
        return;
    }
    bookings[selectedDate] = bookings[selectedDate] || [];
    if (bookings[selectedDate].length >= 2) {
        alert('This day is fully booked.');
        return;
    }
    if (bookings[selectedDate].includes(time)) {
        alert('This time slot is already taken.');
        return;
    }
fetch('/submit-booking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: document.getElementById('fullname').value,
    date: selectedDate, // or whatever your date variable is
    time: document.getElementById('time').value
  })
})
    .then(async res => {
        let data;
        try {
            data = await res.json();
        } catch {
            data = { success: false, message: 'Invalid server response' };
        }
        if (res.ok && data.success) {
            bookings[selectedDate].push(time);
            alert('Booking successful!');
            updateCalendar();
            document.querySelector('form').reset();
            selectedDate = null;
        } else {
            alert('Booking failed!' + (data.message ? ` Reason: ${data.message}` : ''));
        }
    })
    .catch(() => alert('Booking failed! Network or server error.'));
});

prevButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

updateCalendar();