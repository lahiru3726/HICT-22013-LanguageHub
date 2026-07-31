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

