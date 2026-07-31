(function () {
  const params = new URLSearchParams(window.location.search);
  const LANG = (params.get('lang') || 'italian').toLowerCase();
  const LOCK_SVG = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="14" height="10" rx="2" fill="#A3A3A3"/>
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#A3A3A3" stroke-width="2" fill="none"/>
    </svg>`;

  let nodeRefs = [];
  let stagesData = null;
  let sectionEl, svgEl, grayPathEl, greenPathEl, travelerEl, stagesLayerEl, propsLayerEl;

  //Loading the course data for the selected language
  loadScript(`data/course-${LANG}.js`)
    .then(() => {
      if (!window.LANHUB_COURSE) throw new Error('Course data missing for ' + LANG);
      const data = window.LANHUB_COURSE;
      stagesData = data;
      init(data);
    })
    .catch((err) => {
      console.error(err);
      document.getElementById('stagesLayer').innerHTML =
        `<p style="padding:40px;color:#A3A3A3;font-family:sans-serif;">Couldn't load the course for "${LANG}". (${err.message})</p>`;
    });

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  }

 function init(data) {
    document.title = `Lan Hub Learning — ${data.label}`;
    document.getElementById('courseSubtitle').textContent = `Lesson series · ${data.label}`;

    sectionEl = document.querySelector('.way-path-section');
    svgEl = document.getElementById('pathSvg');
    grayPathEl = document.getElementById('pathGray');
    greenPathEl = document.getElementById('pathGreen');
    travelerEl = document.getElementById('traveler');
    stagesLayerEl = document.getElementById('stagesLayer');
    propsLayerEl = document.getElementById('propsLayer');

    const state = LanHubState.getState();
    const totalLessons = data.stages.filter((s) => !s.isFinal).length;
    const trueCompleted = (state.progress[LANG] && state.progress[LANG].completedStages) || [];
    const justCompleted = LanHubState.consumeJustCompleted();
    const cameFromThisLanguage = justCompleted && justCompleted.language === LANG;

    buildStageDom(data.stages);
    layoutAndDrawPath();

    if (cameFromThisLanguage) {
      const oldCompleted = trueCompleted.filter((id) => id !== justCompleted.stageId);
      const oldPoints = Math.max(0, state.points - LanHubState.STAGE_REWARD);
      renderState(data, oldCompleted, totalLessons, oldPoints);
      setTimeout(() => {
        renderState(data, trueCompleted, totalLessons, state.points);
      }, 600);
    } else {
      renderState(data, trueCompleted, totalLessons, state.points);
    }

    initProfilePanel(data, totalLessons);
    initFoldOnScroll();
    initStayedTimer();
    initLangDropdown();

    window.addEventListener('resize', debounce(layoutAndDrawPath, 200));
  }

  function initLangDropdown() {
    const dropdown = document.getElementById('langDropdown');
    const toggle = document.getElementById('langToggle');
    if (!dropdown || !toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  //Builde stage DOM (built once; later updates only toggle classes)
  function buildStageDom(stages) {
    stagesLayerEl.innerHTML = '';
    nodeRefs = [];

    stages.forEach((stage, i) => {
      const side = i % 2 === 0 ? 'left' : 'right';
      const row = document.createElement('div');
      row.className = `way-row way-row--${side}` + (i === 0 ? ' way-row--first' : '');

      const node = document.createElement('div');
      node.className = 'way-stage' + (stage.isFinal ? ' is-final' : '');

      const platformWrap = document.createElement('div');
      platformWrap.className = 'way-stage__platform-wrap';

      const platformImg = document.createElement('img');
      platformImg.className = stage.isFinal ? 'way-stage__completed-icon' : 'way-stage__platform';
      platformImg.src = stage.isFinal ? 'assets/way/completed-icon.svg' : 'assets/way/stage.svg';
      platformImg.alt = stage.isFinal ? 'Course completed' : 'Stage platform';
      platformWrap.appendChild(platformImg);

      const lock = document.createElement('div');
      lock.className = 'way-stage__lock';
      lock.innerHTML = LOCK_SVG;
      platformWrap.appendChild(lock);

      node.appendChild(platformWrap);

      const card = document.createElement('div');
      card.className = 'way-stage__card';

      const title = document.createElement('h3');
      title.className = 'way-stage__title';
      title.textContent = stage.title;

      const summary = document.createElement('p');
      summary.className = 'way-stage__summary';
      summary.textContent = stage.summary;

      card.appendChild(title);
      card.appendChild(summary);

      let btn = null;
      if (!stage.isFinal) {
        btn = document.createElement('a');
        btn.className = 'btn btn--primary way-stage__btn';
        btn.textContent = 'Start';
        btn.href = `lesson.html?lang=${LANG}&stage=${stage.id}`;
        card.appendChild(btn);
      }

      // Node + card order flips so the card always sits on the
      // opposite side from where the node lands in the row.
      if (side === 'left') {
        row.appendChild(node);
        row.appendChild(card);
      } else {
        row.appendChild(card);
        row.appendChild(node);
      }

      stagesLayerEl.appendChild(row);

      nodeRefs.push({ stage, node, platformImg, lock, title, summary, btn, cx: 0, cy: 0 });
    });

    // Decorative prop clusters near stage 2 and stage 5 (indices 1 & 4)
    propsLayerEl.innerHTML = '';
    addProp('assets/way/items-01.svg', 1, 'left');
    addProp('assets/way/items-02.svg', 4, 'right');
  }

  function addProp(src, nearIndex, side) {
    const img = document.createElement('img');
    img.className = 'way-prop';
    img.src = src;
    img.alt = '';
    img.dataset.nearIndex = nearIndex;
    img.dataset.side = side;
    propsLayerEl.appendChild(img);
  }

//measure real node positions, draw the winding path, and place decorative props relative to the measurements.
function layoutAndDrawPath() {
    if (!sectionEl || window.innerWidth <= 768) return; // path hidden on mobile

    const sectionRect = sectionEl.getBoundingClientRect();

    nodeRefs.forEach((ref) => {
      const r = ref.platformImg.getBoundingClientRect();
      ref.cx = r.left + r.width / 2 - sectionRect.left;
      ref.cy = r.top + r.height / 2 - sectionRect.top;
      ref.platformTop = r.top - sectionRect.top;
    });

    const sectionHeight = sectionEl.scrollHeight;
    const sectionWidth = sectionEl.clientWidth;
    svgEl.setAttribute('width', sectionWidth);
    svgEl.setAttribute('height', sectionHeight);
    svgEl.style.height = sectionHeight + 'px';

    let d = '';
    nodeRefs.forEach((ref, i) => {
      if (i === 0) {
        d += `M ${ref.cx} ${ref.cy} `;
      } else {
        const prev = nodeRefs[i - 1];
        const midY = (prev.cy + ref.cy) / 2;
        d += `C ${prev.cx} ${midY}, ${ref.cx} ${midY}, ${ref.cx} ${ref.cy} `;
      }
    });

    grayPathEl.setAttribute('d', d);
    greenPathEl.setAttribute('d', d);

    const totalLength = greenPathEl.getTotalLength();
    greenPathEl.dataset.totalLength = totalLength;
    greenPathEl.style.strokeDasharray = totalLength;

    // Position decorative props just beside their reference node, at the same height as the platform (not floating above it)

    document.querySelectorAll('.way-prop').forEach((img) => {
      const idx = Number(img.dataset.nearIndex);
      const ref = nodeRefs[idx];
      if (!ref) return;
      const side = img.dataset.side;
      const offsetX = side === 'left' ? -130 : 130;
      img.style.left = ref.cx + offsetX + 'px';
      img.style.top = ref.cy + 'px';
      img.style.transform = 'translate(-50%, -50%)';
    });
    // Re-apply whatever unlock state is currently active so the freshly measured traveler/path positions line up immediately.

    if (stagesData) applyVisualState(currentCompletedCache, currentTotalCache);
  }
  
//Render stage — unlock classes, traveler position, green path, progress panel numbers.
  let currentCompletedCache = [];
  let currentTotalCache = 1;

  function renderState(data, completedStages, totalLessons, pointsOverride) {
    currentCompletedCache = completedStages;
    currentTotalCache = totalLessons;
    applyVisualState(completedStages, totalLessons);
    updateProgressNumbers(data, completedStages, totalLessons, pointsOverride);
  }

  function applyVisualState(completedStages, totalLessons) {
    nodeRefs.forEach((ref) => {
      const id = ref.stage.id;
      const unlocked = id === 1 || completedStages.includes(id - 1) || (ref.stage.isFinal && completedStages.length >= totalLessons);
      ref.node.classList.toggle('is-unlocked', !!unlocked);

      if (ref.btn) {
        const isDone = completedStages.includes(id);
        if (!unlocked) {
          ref.btn.textContent = 'Locked';
          ref.btn.classList.add('is-locked');
          ref.btn.removeAttribute('href');
        } else {
          ref.btn.textContent = isDone ? 'Review' : 'Start';
          ref.btn.classList.remove('is-locked');
          ref.btn.href = `lesson.html?lang=${LANG}&stage=${id}`;
        }
      }
    });

    document.querySelectorAll('.way-prop').forEach((img) => {
      const idx = Number(img.dataset.nearIndex);
      const ref = nodeRefs[idx];
      if (!ref) return;
      const unlocked = ref.node.classList.contains('is-unlocked');
      img.classList.toggle('is-unlocked', unlocked);
    });

    const currentIndex = Math.min(completedStages.length, nodeRefs.length - 1);
    const currentRef = nodeRefs[currentIndex];
    if (currentRef && currentRef.cx) {
      travelerEl.style.left = currentRef.cx + 'px';
      // Stand on the platform's own top edge (measured live), plus a
      // small tunable nudge (--traveler-y-offset in way.css) rather
      // than a guessed fixed offset from the platform's center.
      travelerEl.style.top = `calc(${currentRef.platformTop}px + var(--traveler-y-offset, 10px))`;
    }

    if (greenPathEl.dataset.totalLength) {
      const totalLength = Number(greenPathEl.dataset.totalLength);
      const fraction = totalLessons ? Math.min(1, completedStages.length / totalLessons) : 0;
      greenPathEl.style.strokeDashoffset = totalLength * (1 - fraction);
    }
  }

  // Progress Panel Numbers counting
function updateProgressNumbers(data, completedStages, totalLessons, pointsOverride) {
    const state = LanHubState.getState();
    const points = pointsOverride != null ? pointsOverride : state.points;
    const percent = totalLessons ? Math.round((completedStages.length / totalLessons) * 100) : 0;
    const stayed = LanHubState.getStayedSeconds(LANG);
    const timeStr = LanHubState.formatStayedTime(stayed);

    setText('mainPoints', points);
    setText('popPoints', points);
    setText('mainStatus', `${100 - percent}% to go`);
    setText('popStatus', `${100 - percent}% to go`);
    setText('mainTime', timeStr);
    setText('popTime', timeStr);

    const fillPct = percent === 100 ? 100 : percent;
    document.getElementById('mainProgressFill').style.width = fillPct + '%';
    document.getElementById('popProgressFill').style.width = fillPct + '%';

    if (percent >= 100) {
      document.getElementById('mainProgressFill').style.background = 'var(--color-green)';
    }
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  //Profile panel — name/avatar initials
  function initProfilePanel(data, totalLessons) {
    const state = LanHubState.getState();
    const initials = state.profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    setText('mainAvatar', initials);
    setText('chipAvatar', initials);
    setText('mainName', state.profile.name);
    setText('popName', state.profile.name);

//folding and unfolding process
function initFoldOnScroll() {
    const sentinel = document.getElementById('foldSentinel');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          document.body.classList.toggle('is-docked', !entry.isIntersecting && entry.boundingClientRect.top < 0);
        });
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
  }

// Stayed time counting
function initStayedTimer() {
    let secondsSinceSave = 0;
    const tick = setInterval(() => {
      secondsSinceSave += 1;
      const totalNow = LanHubState.getStayedSeconds(LANG) + secondsSinceSave;
      setText('mainTime', LanHubState.formatStayedTime(totalNow));
      setText('popTime', LanHubState.formatStayedTime(totalNow));

      if (secondsSinceSave >= 5) {
        LanHubState.addStayedSeconds(LANG, secondsSinceSave);
        secondsSinceSave = 0;
      }
    }, 1000);

    window.addEventListener('pagehide', () => {
      if (secondsSinceSave > 0) LanHubState.addStayedSeconds(LANG, secondsSinceSave);
      clearInterval(tick);
    });
  }

 function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
}})();
