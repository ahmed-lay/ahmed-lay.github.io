document.documentElement.classList.add('js');

// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
const setMenu = (open) => {
  menu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.textContent = open ? 'Fermer' : 'Menu';
};
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') setMenu(false); });

// Console KQL : les lignes apparaissent une à une, puis l'alerte
const steps = document.querySelectorAll('.console .ln, .console .alert');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
steps.forEach((el, i) => {
  if (reduce) el.classList.add('on');
  else setTimeout(() => el.classList.add('on'), 500 + i * 450);
});
