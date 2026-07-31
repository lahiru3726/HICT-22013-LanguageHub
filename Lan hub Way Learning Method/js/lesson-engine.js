/*
   One generic engine drives all 4 language lessons and this content differs,
   mechanics don't. Supported step types:
   "choice"- multiple choice translation
   "listen_choice"- plays audio first, then multiple choice
   "fill_blank" - multiple choice styled as filling a blank
   "build_sentence" - tap word tiles in order to build the answer
*/

(function () {
  const params = new URLSearchParams(window.location.search);
  const LANG = (params.get('lang') || 'italian').toLowerCase();
  const STAGE_ID = Number(params.get('stage') || 1);

  const els = {
    card: document.getElementById('lessonCard'),
    progressFill: document.getElementById('stepProgressFill'),
    livePoints: document.getElementById('livePoints'),
    hintBtn: document.getElementById('hintBtn'),
    actionBtn: document.getElementById('actionBtn'),
    feedback: document.getElementById('lessonFeedback'),
    complete: document.getElementById('lessonComplete'),
    continueBtn: document.getElementById('continueBtn'),
    closeBtn: document.getElementById('closeBtn')
  };

  let lessonSteps = null;
  let voiceLang = 'en-US';
  let stepIndex = 0;
  let currentAnswerState = null; // checked, correct, slotWords, selectedOption
  let hintUses = 0;

  els.closeBtn.href = `way.html?lang=${LANG}`;
  els.continueBtn.href = `way.html?lang=${LANG}`;

//Load lesson data

  loadScript(`data/lessons-${LANG}.js`)
    .then(() => {
      if (!window.LANHUB_LESSONS) throw new Error('Lesson data missing for ' + LANG);
      const data = window.LANHUB_LESSONS;
      voiceLang = data.voiceLang || 'en-US';
      lessonSteps = data.lessons[String(STAGE_ID)];
      if (!lessonSteps) throw new Error('No lesson for stage ' + STAGE_ID);
      renderStep(0);
      refreshPoints();
    })
    .catch((err) => {
      console.error(err);
      els.card.innerHTML = `<p style="text-align:center;color:#A3A3A3;">This lesson isn't available yet. (${err.message})</p>`;
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

//voice cuts 

  function speak(text, onEnd) {
    if (!('speechSynthesis' in window) || !text) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = voiceLang;
    utter.rate = 0.92;
    if (onEnd) utter.onend = onEnd;
    window.speechSynthesis.speak(utter);
  }

  function wireSpeakerBtn(btn, text) {
    btn.addEventListener('click', () => {
      btn.classList.add('is-playing');
      speak(text, () => btn.classList.remove('is-playing'));
    });
  }

//next step rendering

  function renderStep(index) {
    stepIndex = index;
    hintUses = 0;
    currentAnswerState = { checked: false, correct: false, slotWords: [], selectedOption: null };
    updateTopProgress();
    setActionButton('Check', true);
    setFeedback('', null);
    els.hintBtn.disabled = false;

    const step = lessonSteps[index];
    els.card.innerHTML = '';
    els.card.appendChild(buildStepUI(step));

// auto-play audio for listening-style steps
    if (step.type === 'listen_choice' && step.speak) {
      setTimeout(() => speak(step.speak), 450);
    }
  }

  function buildStepUI(step) {
    const wrap = document.createElement('div');

    const prompt = document.createElement('div');
    prompt.className = 'exercise-prompt';
    prompt.textContent = step.prompt;
    wrap.appendChild(prompt);

    if (step.subprompt) {
      const sub = document.createElement('div');
      sub.className = 'exercise-subprompt';
      sub.textContent = step.subprompt;
      wrap.appendChild(sub);
    }

    if (step.type === 'listen_choice') {
      const speakerBtn = document.createElement('button');
      speakerBtn.type = 'button';
      speakerBtn.className = 'speaker-btn';
      speakerBtn.innerHTML = speakerIconSVG();
      wireSpeakerBtn(speakerBtn, step.speak);
      wrap.appendChild(speakerBtn);
    }

    if (step.type === 'choice' || step.type === 'listen_choice' || step.type === 'fill_blank') {
      wrap.appendChild(buildOptionList(step));
    } else if (step.type === 'build_sentence') {
      wrap.appendChild(buildSentenceUI(step));
    }

    return wrap;
  }

  function buildOptionList(step) {
    const list = document.createElement('div');
    list.className = 'option-list' + (step.options.length <= 2 ? ' is-single-col' : '');

    step.options.forEach((opt) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'option-card';
      card.textContent = opt;

      if (step.type !== 'build_sentence' && step.speakOptions) {

        const mini = document.createElement('span');
        mini.className = 'speaker-btn-inline';
        mini.innerHTML = speakerIconSVG(14);
        mini.addEventListener('click', (e) => {
          e.stopPropagation();
          speak(opt);
        });
        card.appendChild(mini);
      }

      card.addEventListener('click', () => {
        if (currentAnswerState.checked) return;
        list.querySelectorAll('.option-card').forEach((c) => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        currentAnswerState.selectedOption = opt;
        setActionButton('Check', false);
      });

      list.appendChild(card);
    });

    return list;
  }

  function buildSentenceUI(step) {
    const container = document.createElement('div');

    const slot = document.createElement('div');
    slot.className = 'answer-slot';
    slot.id = 'answerSlot';

    const bank = document.createElement('div');
    bank.className = 'tile-bank';
    bank.id = 'tileBank';

    const shuffled = shuffle(step.tiles.slice());
    shuffled.forEach((word, i) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.textContent = word;
      tile.dataset.word = word;
      tile.dataset.uid = 'tile-' + i;

      tile.addEventListener('click', () => {
        if (currentAnswerState.checked || tile.classList.contains('is-used')) return;
        tile.classList.add('is-used');
        currentAnswerState.slotWords.push({ word, uid: tile.dataset.uid });
        speak(word);
        renderSlot(slot, bank, step);
        setActionButton('Check', currentAnswerState.slotWords.length === 0);
      });

      bank.appendChild(tile);
    });

    container.appendChild(slot);
    container.appendChild(bank);
    return container;
  }

  function renderSlot(slot, bank, step) {
    slot.innerHTML = '';
    currentAnswerState.slotWords.forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'tile in-slot';
      chip.textContent = item.word;
      chip.addEventListener('click', () => {
        if (currentAnswerState.checked) return;
        currentAnswerState.slotWords = currentAnswerState.slotWords.filter((w) => w.uid !== item.uid);
        const bankTile = bank.querySelector(`[data-uid="${item.uid}"]`);
        if (bankTile) bankTile.classList.remove('is-used');
        renderSlot(slot, bank, step);
        setActionButton('Check', currentAnswerState.slotWords.length === 0);
      });
      slot.appendChild(chip);
    });
  }

 //checking the anser and if the answer right then the continue button appearing

  els.actionBtn.addEventListener('click', () => {
    if (!currentAnswerState) return;
    if (!currentAnswerState.checked) {
      checkAnswer();
    } else {
      goNext();
    }
  });

  function checkAnswer() {
    const step = lessonSteps[stepIndex];
    let correct = false;

    if (step.type === 'build_sentence') {
      const built = currentAnswerState.slotWords.map((w) => w.word).join(' ').trim();
      correct = normalize(built) === normalize(step.answer);
    } else {
      correct = normalize(currentAnswerState.selectedOption || '') === normalize(step.answer);
    }

    currentAnswerState.checked = true;
    currentAnswerState.correct = correct;

    if (correct) {
      markCorrectUI(step);
      setFeedback('Correct! Nicely done.', 'correct');
      setActionButton('Continue', false);
    } else {
      markWrongUI(step);
      setFeedback("Not quite — give it another go.", 'wrong');
      setActionButton('Check', true);
      setTimeout(() => resetForRetry(step), 1000);
    }
  }

  function markCorrectUI(step) {
    if (step.type === 'build_sentence') {
      document.querySelectorAll('#answerSlot .tile').forEach((t) => t.classList.add('is-correct'));
      speak(step.answer);
    } else {
      document.querySelectorAll('.option-card').forEach((c) => {
        if (c.classList.contains('is-selected')) c.classList.add('is-correct');
        else c.classList.add('is-disabled');
      });
    }
  }

  function markWrongUI(step) {
    if (step.type === 'build_sentence') {
      document.querySelectorAll('#answerSlot .tile').forEach((t) => t.classList.add('is-wrong'));
    } else {
      document.querySelectorAll('.option-card.is-selected').forEach((c) => c.classList.add('is-wrong'));
    }
  }

  function resetForRetry(step) {
    currentAnswerState.checked = false;
    currentAnswerState.correct = false;
    setFeedback('', null);

    if (step.type === 'build_sentence') {
      currentAnswerState.slotWords = [];
      document.querySelectorAll('#tileBank .tile').forEach((t) => t.classList.remove('is-used'));
      document.getElementById('answerSlot').innerHTML = '';
    } else {
      currentAnswerState.selectedOption = null;
      document.querySelectorAll('.option-card').forEach((c) => {
        c.classList.remove('is-selected', 'is-wrong', 'is-correct', 'is-disabled');
      });
    }
    setActionButton('Check', true);
  }

  function goNext() {
    if (stepIndex + 1 < lessonSteps.length) {
      renderStep(stepIndex + 1);
    } else {
      finishLesson();
    }
  }

  function finishLesson() {
    LanHubState.completeStage(LANG, STAGE_ID);
    refreshPoints();
    els.complete.classList.add('is-visible');
  }

  //hint shower

  els.hintBtn.addEventListener('click', () => {
    if (currentAnswerState && currentAnswerState.checked) return;
    if (!LanHubState.canAffordHint()) {
      setFeedback('Not enough points for a hint yet.', 'wrong');
      return;
    }
    const step = lessonSteps[stepIndex];
    const spent = LanHubState.spendPoints(LanHubState.HINT_COST);
    if (!spent) return;
    refreshPoints();
    hintUses += 1;
    applyHint(step);
  });

  function applyHint(step) {
    if (step.type === 'build_sentence') {
// reveal the next correct word into the slot automatically
      const answerWords = step.answer.split(' ');
      const nextWord = answerWords[currentAnswerState.slotWords.length];
      if (!nextWord) return;
      const bank = document.getElementById('tileBank');
      const tile = Array.from(bank.querySelectorAll('.tile:not(.is-used)')).find(
        (t) => normalize(t.dataset.word) === normalize(nextWord)
      );
      if (tile) tile.click();
    } else {
      const wrongCards = Array.from(document.querySelectorAll('.option-card')).filter(
        (c) => normalize(c.textContent) !== normalize(step.answer) && !c.classList.contains('is-disabled')
      );
      if (wrongCards.length > 1) {
        wrongCards[0].classList.add('is-disabled');
      } else {
        setFeedback('Hint: look closely, you can narrow it to the last two.', null);
      }
    }
  }


  function updateTopProgress() {
    const pct = (stepIndex / lessonSteps.length) * 100;
    els.progressFill.style.width = pct + '%';
  }

  function setActionButton(label, disabled) {
    els.actionBtn.textContent = label;
    els.actionBtn.disabled = disabled;
  }

  function setFeedback(text, kind) {
    els.feedback.textContent = text;
    els.feedback.className = 'lesson-feedback' + (kind ? ` is-${kind}` : '');
  }

  function refreshPoints() {
    els.livePoints.textContent = LanHubState.getState().points;
  }

  function normalize(str) {
    return str.toLowerCase().replace(/[.,!?]/g, '').trim();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function speakerIconSVG(size) {
    const s = size || 24;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="currentColor"/>
      <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M19 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
    </svg>`;
  }
})();
