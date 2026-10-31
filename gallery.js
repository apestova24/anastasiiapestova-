'use strict';
const links = [...document.querySelectorAll('.artwork-link')];
const viewer = document.querySelector('#artwork-viewer');
const photo = document.querySelector('#viewer-image');
const title = document.querySelector('#viewer-title');
const counter = document.querySelector('#viewer-count');
const original = document.querySelector('#viewer-original');
let current = 0;
let returnFocus = null;
let savedOverflow = '';

function showArtwork(index) {
  current = (index + links.length) % links.length;
  const link = links[current];
  const thumbnail = link.querySelector('img');
  photo.src = thumbnail.currentSrc || thumbnail.src;
  const requestedIndex = current;
  const fullSize = new Image();
  fullSize.onload = () => {
    if (current === requestedIndex) photo.src = fullSize.src;
  };
  fullSize.src = link.href;
  photo.alt = thumbnail.alt;
  title.textContent = link.dataset.title;
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(links.length).padStart(2, '0')}${link.dataset.position ? ` · ${link.dataset.position}` : ''}`;
  original.href = link.href;
}

if (typeof viewer.showModal === 'function') {
  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      returnFocus = link;
      showArtwork(index);
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      viewer.showModal();
    });
  });
}

document.querySelector('#viewer-close').addEventListener('click', () => viewer.close());
document.querySelector('#viewer-prev').addEventListener('click', () => showArtwork(current - 1));
document.querySelector('#viewer-next').addEventListener('click', () => showArtwork(current + 1));
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showArtwork(current - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showArtwork(current + 1); }
});
viewer.addEventListener('close', () => {
  document.body.style.overflow = savedOverflow;
  returnFocus?.focus({ preventScroll: true });
});

let touchStartX = null;
let touchStartY = null;
photo.addEventListener('touchstart', event => {
  if (event.touches.length !== 1) { touchStartX = null; return; }
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });
photo.addEventListener('touchend', event => {
  if (touchStartX === null || !event.changedTouches.length) return;
  const x = event.changedTouches[0].clientX - touchStartX;
  const y = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(x) > 65 && Math.abs(x) > Math.abs(y) * 1.5) showArtwork(current + (x < 0 ? 1 : -1));
  touchStartX = null;
}, { passive: true });
