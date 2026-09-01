const page = document.querySelector('.birthday-page');
const themeButton = document.querySelector('.theme-toggle');
themeButton.addEventListener('click', () => {
  const evening = page.classList.toggle('evening');
  themeButton.textContent = evening ? 'bring back daylight' : 'turn down the lights';
  themeButton.setAttribute('aria-pressed', String(evening));
});

document.querySelector('.chime-button').addEventListener('click', () => {
  if (!('AudioContext' in window)) return;
  const context = new AudioContext();
  const start = context.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const at = start + index * 0.16;
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.13, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);
    oscillator.connect(gain).connect(context.destination); oscillator.start(at); oscillator.stop(at + 0.43);
  });
  window.setTimeout(() => context.close(), 1100);
});

const lightbox = document.querySelector('.memory-lightbox');
const preview = lightbox.querySelector('img');
const previewCaption = lightbox.querySelector('p');
document.querySelectorAll('.memory-frame').forEach((frame) => frame.addEventListener('click', () => {
  const image = frame.querySelector('img');
  preview.src = image.src; preview.alt = image.alt; previewCaption.textContent = frame.dataset.caption;
  lightbox.showModal();
}));
document.querySelector('.close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && lightbox.open) lightbox.close(); });
