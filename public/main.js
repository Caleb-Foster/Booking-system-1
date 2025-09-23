'use strict';

const bookings = {}; // { 'YYYY-MM-DD': { '8am-9am': 'Alice', ... } }
let selectedDate = null;

const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevButton = document.getElementById('prevBtn');
const nextButton = document.getElementById('nextBtn');
const timeSelect = document.getElementById('time');
const form = document.querySelector('form');

let currentDate = new Date();

// --- Data loading ---
async function loadBookings() {
  try {
    const res = await fetch('/bookings');
    if (!res.ok) throw new Error('Failed to fetch /bookings');
    const data = await res.json();
    
    console.log('Raw data from server:', data); // ADD THIS LINE

    // Reset and populate as date -> time -> name
    for (const k in bookings) delete bookings[k];
    data.forEach((row) => {
      const date = row.date;
      const time = row.time;
      const name = row.name || 'Unknown';
      if (!bookings[date]) bookings[date] = {};
      bookings[date][time] = name;
    });
    
    console.log('Processed bookings object:', bookings); // ADD THIS LINE
  } catch (e) {
    console.error(e);
    alert('Could not load bookings from server.');
  }
}

// --- Helpers ---
function formatDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// --- UI rendering ---
function updateCalendar() {
  if (!monthYearElement || !datesElement) return;

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  monthYearElement.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${y}`;
  datesElement.innerHTML = '';

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  // Leading blanks
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'blank';
    datesElement.appendChild(blank);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(y, m, day);
    const dateStr = formatDate(dateObj);
    const dayDiv = document.createElement('div');
    dayDiv.textContent = day;
    dayDiv.className = 'date-cell';

    if (selectedDate === dateStr) dayDiv.classList.add('selected');

    const bookedForDay = bookings[dateStr] || {};
    const bookedTimes = Object.keys(bookedForDay);

    if (bookedTimes.length >= 2) {
      dayDiv.classList.add('fully-booked');
      dayDiv.title = 'Fully booked';
    } else if (bookedTimes.length > 0) {
      dayDiv.classList.add('partially-booked');
    }

    // Show names on hover
    if (bookedTimes.length > 0) {
      dayDiv.title = bookedTimes.map(time => `${time}: ${bookedForDay[time]}`).join('\n');
    }

    dayDiv.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      const prevSelected = selectedDate;
      selectedDate = dateStr;

      updateCalendar();
      updateTimeOptions(true);

      if (prevSelected === selectedDate) return;
    });

    datesElement.appendChild(dayDiv);
  }
}

function updateTimeOptions(preservePreviousSelection = true) {
  if (!timeSelect) return;

  const prev = timeSelect.value;

  timeSelect.innerHTML = `
    <option value="">Select a time</option>
    <option value="8am-9am">8am-9am</option>
    <option value="9am-10am">9am-10am</option>
    <option value="4pm-5pm">4pm-5pm</option>
    <option value="5pm-6pm">5pm-6pm</option>
    <option value="6pm-7pm">6pm-7pm</option>
  `;

  if (!selectedDate) return;

  const bookedForDay = bookings[selectedDate] || {};
  for (const opt of timeSelect.options) {
    if (!opt.value) continue;
    if (bookedForDay[opt.value]) {
      opt.disabled = true;
      const bookerName = bookedForDay[opt.value];
      opt.textContent += ` (Booked: ${bookerName})`;
    }
  }

  // Try to restore previous time if still valid
  if (preservePreviousSelection && prev) {
    const match = Array.from(timeSelect.options).find(o => o.value === prev && !o.disabled);
    if (match) timeSelect.value = prev;
  }
}

// --- Navigation ---
if (prevButton) {
  prevButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
    updateTimeOptions(true);
  });
}

if (nextButton) {
  nextButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
    updateTimeOptions(true);
  });
}

// --- Form submission ---
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('fullname');
    const name = nameEl ? nameEl.value.trim() : '';
    const time = timeSelect ? timeSelect.value : '';
    const date = selectedDate;

    if (!name || !date || !time) {
      alert('Please fill out all fields and select a date.');
      return;
    }

    try {
      const res = await fetch('/submit-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, time })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert('Booking failed! Reason: ' + (data.message || 'Unknown error'));
        return;
      }

      alert('Booking successful!');
      await loadBookings();
      updateCalendar();
      updateTimeOptions(true);
      form.reset();
      // Keep selectedDate so user sees the slot disabled immediately
    } catch (err) {
      console.error(err);
      alert('Booking failed! Reason: Invalid server response');
    }
  });
}

// --- Boot ---
(async function init() {
  await loadBookings();
  updateCalendar();
  updateTimeOptions(true);
})();