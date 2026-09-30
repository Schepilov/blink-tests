const $ = (selector) => document.querySelector(selector);
const phone = $('#phone');
const intro = $('#intro');
const story = $('#story');
const player = $('#player');
const mirror = $('#mirror');
const board = $('#board');
const ending = $('#ending');
const subtitle = $('#subtitle');
const video = $('#video');
const backgroundAudio = $('#background-audio');
let runToken = 0;
let soundOn = true;

function playBackground() {
  if (soundOn && !player.classList.contains('active')) backgroundAudio.play().catch(() => {});
}
document.addEventListener('pointerdown', playBackground, { once: true });
playBackground();

function fit() {
  if (matchMedia('(max-width: 600px)').matches) {
    phone.style.setProperty('--scale-x', innerWidth / 390);
    phone.style.setProperty('--scale-y', innerHeight / 844);
  } else {
    phone.style.setProperty('--scale', Math.min(innerWidth / 390, innerHeight / 844, 1));
  }
}
addEventListener('resize', fit);
window.visualViewport?.addEventListener('resize', fit);
fit();

function show(screen) {
  for (const section of [intro, story, player, mirror, board, ending]) {
    section.classList.toggle('active', section === screen);
  }
}

function delay(ms, token) {
  return new Promise(resolve => setTimeout(() => resolve(token === runToken), ms));
}

async function typeInto(element, text, token) {
  element.textContent = '';
  element.classList.add('typing');
  for (const char of text) {
    if (token !== runToken) {
      element.classList.remove('typing');
      return;
    }
    element.textContent += char;
    await delay(char === ' ' ? 35 : 57, token);
  }
  element.classList.remove('typing');
}

async function begin() {
  playBackground();
  const token = ++runToken;
  show(story);
  story.classList.remove('reveal', 'open', 'mirror-ready', 'board-ready');
  $('#character').classList.remove('visible');
  subtitle.textContent = '';
  await delay(650, token);
  if (token !== runToken) return;
  story.classList.add('reveal');
  await delay(1200, token);
  const lines = [
    'одним обычным осенним утром ты заходишь в свой рабочий кабинет детектива',
    'и находишь странное разбитое зеркало, а вместе с ним — лежащую на столе видеокассету',
    'сперва ты решаешь посмотреть кассету'
  ];
  for (let i = 0; i < lines.length; i++) {
    if (token !== runToken) return;
    if (i === 1) $('#character').classList.add('visible');
    await typeInto(subtitle, lines[i], token);
    if (!(await delay(i === 0 ? 250 : 850, token))) return;
  }
  story.classList.add('open');
}

async function continueAfterVideo() {
  const token = ++runToken;
  video.pause();
  story.classList.add('interlude');
  subtitle.textContent = '';
  story.classList.remove('open', 'mirror-ready', 'board-ready');
  show(story);
  playBackground();
  $('#character').classList.add('visible');
  if (!(await delay(650, token))) return;
  story.classList.remove('interlude');
  if (!(await delay(1100, token))) return;
  await typeInto(subtitle, 'теперь ты осматриваешь разбитое зеркало', token);
  if (!(await delay(850, token))) return;
  story.classList.add('open', 'mirror-ready');
}

async function openMirror() {
  const token = ++runToken;
  show(mirror);
  mirror.classList.remove('clear');
  await typeInto($('#mirror-subtitle'), 'тут пока ничего интересного, возвращайся потом', token);
  if (!(await delay(1100, token))) return;
  mirror.classList.add('clear');
}

async function continueAfterMirror() {
  const token = ++runToken;
  story.classList.add('interlude');
  subtitle.textContent = '';
  story.classList.remove('open', 'mirror-ready', 'board-ready');
  show(story);
  if (!(await delay(650, token))) return;
  story.classList.remove('interlude');
  if (!(await delay(1100, token))) return;
  await typeInto(subtitle, 'нужно опросить свидетелей, к доске срочно!', token);
  if (!(await delay(850, token))) return;
  story.classList.add('open', 'board-ready');
}

async function continueAfterBoard() {
  const token = ++runToken;
  $('#dossier').hidden = true;
  ending.classList.add('interlude');
  ending.classList.remove('open', 'zoomed');
  $('#ending-subtitle').textContent = '';
  show(ending);
  if (!(await delay(650, token))) return;
  ending.classList.remove('interlude');
  if (!(await delay(1100, token))) return;
  await typeInto($('#ending-subtitle'), 'а теперь пиздуйте работать!', token);
  if (!(await delay(1000, token))) return;
  ending.classList.add('open');
  if (!(await delay(1500, token))) return;
  ending.classList.add('zoomed');
}

$('#start').addEventListener('click', begin);
$('#hint-open').addEventListener('click', () => { playBackground(); $('#hint').hidden = false; });
$('#hint-close').addEventListener('click', () => { $('#hint').hidden = true; });
$('#hint').addEventListener('click', event => { if (event.target.id === 'hint') $('#hint').hidden = true; });
$('#cassette').addEventListener('click', () => {
  backgroundAudio.pause();
  show(player);
  video.play().catch(() => {});
});
$('#back').addEventListener('click', continueAfterVideo);
$('#mirror-trigger').addEventListener('click', openMirror);
$('#mirror-back').addEventListener('click', continueAfterMirror);
$('#board-trigger').addEventListener('click', () => { $('#dossier').hidden = true; show(board); });
$('#board-back').addEventListener('click', continueAfterBoard);
for (const card of document.querySelectorAll('.witness')) {
  card.addEventListener('click', () => { $('#dossier').hidden = false; });
}
$('#dossier-close').addEventListener('click', () => { $('#dossier').hidden = true; });
$('#sound').addEventListener('click', () => {
  soundOn = !soundOn;
  video.muted = !soundOn;
  backgroundAudio.muted = !soundOn;
  if (soundOn) playBackground();
  $('#sound').classList.toggle('muted', !soundOn);
  $('#sound').setAttribute('aria-label', soundOn ? 'Выключить звук' : 'Включить звук');
});
video.addEventListener('loadeddata', () => { $('#video-fallback').hidden = true; });
