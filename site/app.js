// Life Energy · marketing site
// Formatting mirrors DESIGN.md §5 and the chip tiers in §2.2.
// A work day is fixed at 8 h here; the app uses the person's real work day.

const WORK_DAY_MIN = 8 * 60;
const WORK_WEEK_DAYS = 5;
const NBSP = ' ';

const oneDecimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatLifeEnergy(totalMinutes) {
  const minutes = Math.round(totalMinutes);
  if (minutes < 1) return `<${NBSP}1${NBSP}m`;
  if (minutes < 60) return `${minutes}${NBSP}m`;

  const hours = totalMinutes / 60;
  if (hours <= 40) {
    if (hours >= 10) return `${Math.floor(hours)}${NBSP}h`; // app floors here (src/domain/price/price.ts)
    const h = Math.floor(minutes / 60);
    const m = minutes - h * 60;
    return m === 0 ? `${h}${NBSP}h` : `${h}${NBSP}h${NBSP}${m}${NBSP}m`;
  }

  const days = totalMinutes / WORK_DAY_MIN;
  if (days <= 20) return `${oneDecimal.format(days)} work days`;
  return `${oneDecimal.format(days / WORK_WEEK_DAYS)} work weeks`;
}

function tierFor(totalMinutes) {
  if (totalMinutes < 15) return 0;
  if (totalMinutes < 60) return 1;
  if (totalMinutes <= WORK_DAY_MIN) return 2;
  if (totalMinutes <= WORK_DAY_MIN * WORK_WEEK_DAYS) return 3;
  return 4;
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero figure: count up once on load. The final value is already in the HTML.
function tickHero() {
  const el = document.querySelector('[data-tick]');
  if (!el || reduceMotion) return;
  const target = Number(el.dataset.tick);
  const duration = 1200;
  const start = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = formatLifeEnergy(Math.max(1, target * easeOut(t)));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Calculator
function initCalculator() {
  const form = document.getElementById('calc');
  if (!form) return;
  const wage = form.elements.wage;
  const price = form.elements.price;
  const figure = document.getElementById('calc-figure');
  const chip = document.getElementById('calc-chip');
  const line = document.getElementById('calc-line');
  const error = document.getElementById('calc-error');

  function showError(input, message) {
    input.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    error.hidden = false;
    figure.textContent = '—';
    chip.hidden = true;
    line.textContent = '';
  }

  function update() {
    wage.removeAttribute('aria-invalid');
    price.removeAttribute('aria-invalid');
    error.hidden = true;

    const w = Number.parseFloat(wage.value);
    const p = Number.parseFloat(price.value);
    if (!(w > 0)) return showError(wage, 'Enter an hourly wage above zero.');
    if (!(p >= 0)) return showError(price, 'Enter a price of zero or more.');

    const minutes = (p / w) * 60;
    const label = formatLifeEnergy(minutes);
    figure.textContent = label;
    chip.textContent = label;
    chip.className = `chip chip--t${tierFor(minutes)}`;
    chip.hidden = false;
    line.textContent = 'of your life. Worth it to you?';
  }

  form.addEventListener('input', update);
  form.addEventListener('submit', (event) => event.preventDefault());
  update();
}

tickHero();
initCalculator();
