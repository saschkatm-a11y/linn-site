(function () {
  "use strict";

  const { compliments, treasures } = window.LINN_DATA;
  const TOTAL = compliments.length;
  const STORAGE_KEY = "linn-heart-journey-v1";
  const MILESTONES = new Set([25, 50, 75, 100, 125, 150, 175, 200]);
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
  const root = document.documentElement;
  const body = document.body;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const elements = {
    intro: $("#intro"),
    ambientParticles: $("#ambientParticles"),
    effectLayer: $("#effectLayer"),
    startView: $("#startView"),
    journeyView: $("#journeyView"),
    complimentView: $("#complimentView"),
    finalView: $("#finalView"),
    startCard: $("#startCard"),
    depthWorld: $("#depthWorld"),
    journeyPanel: $("#journeyPanel"),
    journeySymbol: $("#journeySymbol"),
    journeyEyebrow: $("#journeyEyebrow"),
    journeyTitle: $("#journeyTitle"),
    journeyQuote: $("#journeyQuote"),
    journeyCopy: $("#journeyCopy"),
    journeyLevelLabel: $("#journeyLevelLabel"),
    journeyDots: $("#journeyDots"),
    journeyNextButton: $("#journeyNextButton"),
    journeyButtonLabel: $("#journeyButtonLabel"),
    complimentCard: $("#complimentCard"),
    mainHeart: $("#mainHeart"),
    startTitle: $("#startTitle"),
    openGiftButton: $("#openGiftButton"),
    nextButton: $("#nextButton"),
    hugButton: $("#hugButton"),
    finalHugButton: $("#finalHugButton"),
    backButton: $("#backButton"),
    restartButton: $("#restartButton"),
    copyButton: $("#copyButton"),
    complimentText: $("#complimentText"),
    rarityBadge: $("#rarityBadge"),
    progressCurrent: $("#progressCurrent"),
    progressTotal: $("#progressTotal"),
    progressPercent: $("#progressPercent"),
    progressFill: $("#progressFill"),
    progressHeart: $("#progressHeart"),
    progressTrack: $(".progress-track"),
    hugEffect: $("#hugEffect"),
    milestone: $("#milestone"),
    milestoneNumber: $("#milestoneNumber"),
    milestoneTitle: $("#milestoneTitle"),
    milestoneCopy: $("#milestoneCopy"),
    toastRegion: $("#toastRegion"),
    treasureButton: $("#treasureButton"),
    treasureCount: $("#treasureCount"),
    treasureModal: $("#treasureModal"),
    treasureGrid: $("#treasureGrid"),
    settingsButton: $("#settingsButton"),
    settingsModal: $("#settingsModal"),
    resetProgressButton: $("#resetProgressButton"),
    daylightLabel: $("#daylightLabel"),
    brandButton: $("#brandButton"),
    cornerSecret: $("#cornerSecret"),
    starSecret: $("#starSecret"),
    nightSecret: $("#nightSecret")
  };

  function loadState() {
    const fallback = { seen: [], discoveries: [], current: null, motion: null, hugCount: 0 };
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || typeof parsed !== "object") return fallback;
      return {
        ...fallback,
        ...parsed,
        seen: Array.isArray(parsed.seen) ? parsed.seen.filter((id) => Number.isInteger(id) && id >= 0 && id < TOTAL) : [],
        discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries.filter((id) => typeof id === "string") : []
      };
    } catch (_error) {
      return fallback;
    }
  }

  const state = loadState();
  state.sound = "mute";
  state.replay = false;
  let replayQueue = [];
  let activeView = elements.startView;
  let milestoneTimer = 0;
  let complimentLocked = false;
  let journeyLocked = false;
  let journeyIndex = 0;
  let introSkipped = false;

  const journeyScenes = [
    {
      symbol: "✦",
      eyebrow: "Der erste Funke",
      title: "Wenn du mir schreibst",
      quote: "Dann fühlt sich mein Handy plötzlich wie ein kleines Fenster zu dir an.",
      copy: "Schon dein Name auf meinem Bildschirm macht aus einem ganz normalen Moment etwas, auf das ich mich freue. Ich werde ruhiger, leichter – und muss fast immer lächeln."
    },
    {
      symbol: "♡",
      eyebrow: "Ein Satz, der bleibt",
      title: "Wenn du mir ein Kompliment machst",
      quote: "Deine Worte treffen mich nicht nur – sie bleiben bei mir.",
      copy: "Ich weiß manchmal gar nicht, was ich darauf sagen soll. Aber innerlich wird alles warm, weil es von dir kommt. Ich trage solche Sätze länger mit mir, als du vielleicht ahnst."
    },
    {
      symbol: "⌁",
      eyebrow: "Noch eine Ebene tiefer",
      title: "Bei dir fühle ich mich gesehen",
      quote: "Mit dir muss ich nicht lauter sein, um verstanden zu werden.",
      copy: "In unseren Gesprächen entsteht etwas Seltenes: Nähe, ohne Druck. Ich kann ich selbst sein, mich öffnen und habe das Gefühl, dass du nicht nur meine Worte hörst, sondern auch das Dazwischen."
    },
    {
      symbol: "∞",
      eyebrow: "Unter all dem Kribbeln",
      title: "Du bist mehr als ein schöner Gedanke",
      quote: "Du bist zu einem Gefühl geworden, zu dem ich immer wieder zurückwill.",
      copy: "Ich möchte wissen, wie dein Tag war. Ich möchte für dich da sein, mit dir lachen, dich halten, wenn alles zu viel wird – und mit dir aus kleinen Momenten Erinnerungen machen."
    },
    {
      symbol: "♥",
      eyebrow: "Ganz tief drin",
      title: "Ich liebe dich, Linn.",
      quote: "Nicht nur für dein Lächeln. Nicht nur für deine Worte. Sondern für dich.",
      copy: "Du bedeutest mir so viel mehr, als ich in eine einzelne Nachricht packen könnte. Bei dir fühlt sich mein Herz gleichzeitig aufgeregt und angekommen an. Und genau deshalb wollte ich dir diese Reise schenken."
    }
  ];

  const deviceNeedsReduction =
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) ||
    (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4);

  function resolvedMotion(requested = state.motion) {
    if (requested === "off") return "off";
    if (motionQuery.matches) return "reduced";
    if (requested === "reduced") return "reduced";
    if (!requested && deviceNeedsReduction) return "reduced";
    return "full";
  }

  state.motion = resolvedMotion();
  root.dataset.motion = state.motion;

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          seen: [...new Set(state.seen)],
          discoveries: [...new Set(state.discoveries)],
          current: state.current,
          motion: state.motion,
          hugCount: state.hugCount
        })
      );
    } catch (_error) {
      // Storage can be unavailable in privacy mode; the experience still works in memory.
    }
  }

  const audio = {
    tracks: {
      click: new Audio("assets/audio/click.mp3"),
      sparkle: new Audio("assets/audio/sparkle.mp3"),
      hug: new Audio("assets/audio/hug.mp3"),
      ambient: new Audio("assets/audio/ambient.mp3")
    },
    play(name) {
      if (state.sound === "mute") return;
      if (name === "ambient" && state.sound !== "music") return;
      if (name !== "ambient" && !["effects", "music"].includes(state.sound)) return;
      const track = this.tracks[name];
      if (!track) return;
      try {
        if (name !== "ambient") track.currentTime = 0;
        const promise = track.play();
        if (promise) promise.catch(() => {});
      } catch (_error) {
        // Optional local files may be absent; visual feedback remains complete.
      }
    },
    setMode(mode) {
      state.sound = mode;
      this.tracks.ambient.loop = true;
      this.tracks.ambient.volume = 0.16;
      Object.entries(this.tracks).forEach(([name, track]) => {
        if (name !== "ambient") track.volume = 0.28;
      });
      if (mode === "music") this.play("ambient");
      else this.tracks.ambient.pause();
      if (mode === "effects") this.play("click");
    }
  };

  Object.values(audio.tracks).forEach((track) => {
    track.preload = "none";
  });

  function setTimeTheme() {
    const hour = new Date().getHours();
    let time = "afternoon";
    let label = "Rosé-Nachmittag";
    if (hour >= 5 && hour < 11) {
      time = "morning";
      label = "Warmer Morgen";
    } else if (hour >= 18 && hour < 22) {
      time = "evening";
      label = "Goldener Abend";
    } else if (hour >= 22 || hour < 5) {
      time = "night";
      label = "Leiser Mondschein";
    }
    root.dataset.time = time;
    elements.daylightLabel.lastChild.textContent = ` ${label}`;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function makeAmbientParticles() {
    elements.ambientParticles.replaceChildren();
    const count = state.motion === "full" ? 16 : state.motion === "reduced" ? 6 : 0;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("span");
      const isDot = index % 3 === 0;
      particle.className = `ambient-particle${isDot ? " ambient-particle--dot" : ""}`;
      particle.textContent = isDot ? "" : index % 4 === 0 ? "♥" : "♡";
      particle.style.setProperty("--left", `${random(2, 98)}%`);
      particle.style.setProperty("--size", `${random(isDot ? 2 : 7, isDot ? 5 : 15)}px`);
      particle.style.setProperty("--alpha", random(0.2, 0.55).toFixed(2));
      particle.style.setProperty("--duration", `${random(16, 30)}s`);
      particle.style.setProperty("--delay", `${random(-28, 0)}s`);
      particle.style.setProperty("--drift", `${random(-90, 90)}px`);
      particle.style.setProperty("--spin", `${random(-160, 160)}deg`);
      fragment.append(particle);
    }
    elements.ambientParticles.append(fragment);
  }

  function skipIntro() {
    if (introSkipped) return;
    introSkipped = true;
    elements.intro.classList.add("is-skipped");
  }

  function removeAfterAnimation(node, fallback = 1800) {
    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      node.remove();
    };
    node.addEventListener("animationend", remove, { once: true });
    window.setTimeout(remove, fallback);
  }

  function addRipple(button, event) {
    if (state.motion === "off") return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${event.clientX ? event.clientX - rect.left : rect.width / 2}px`;
    ripple.style.top = `${event.clientY ? event.clientY - rect.top : rect.height / 2}px`;
    button.append(ripple);
    removeAfterAnimation(ripple, 800);
  }

  function touchLight(x, y) {
    if (state.motion === "off") return;
    const light = document.createElement("span");
    light.className = "touch-light";
    light.style.setProperty("--x", `${x}px`);
    light.style.setProperty("--y", `${y}px`);
    elements.effectLayer.append(light);
    removeAfterAnimation(light, 800);
  }

  function heartBurst(x, y, options = {}) {
    if (state.motion === "off" || document.hidden) return;
    const strength = options.strength || "small";
    const variant = options.variant || "burst";
    const baseCount = strength === "large" ? 30 : strength === "medium" ? 18 : 8;
    const count = state.motion === "reduced" ? Math.min(7, Math.ceil(baseCount / 3)) : baseCount;
    const colors = options.golden ? ["#ffd878", "#ffe9a8", "#f6bd58"] : ["#ff719b", "#ff9daf", "#ffd0c7", "#f5a6d2"];
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("span");
      particle.className = "burst-heart";
      particle.textContent = index % 3 === 0 ? "♡" : "♥";
      const angle = (Math.PI * 2 * index) / count + random(-0.28, 0.28);
      const distance = random(strength === "large" ? 120 : 55, strength === "large" ? 310 : 145);
      let tx = Math.cos(angle) * distance;
      let ty = Math.sin(angle) * distance;
      if (variant === "up") ty = -Math.abs(ty) - random(30, 130);
      if (variant === "down") ty = Math.abs(ty) + random(30, 100);
      if (variant === "spiral") {
        tx = Math.cos(angle * 2) * distance;
        ty = Math.sin(angle * 2) * distance - 40;
      }
      particle.style.setProperty("--x", `${x}px`);
      particle.style.setProperty("--y", `${y}px`);
      particle.style.setProperty("--tx", `${tx}px`);
      particle.style.setProperty("--ty", `${ty}px`);
      particle.style.setProperty("--rotate", `${random(-220, 220)}deg`);
      particle.style.setProperty("--end-scale", random(0.65, 1.4).toFixed(2));
      particle.style.setProperty("--particle-size", `${random(8, strength === "large" ? 24 : 17)}px`);
      particle.style.setProperty("--particle-duration", `${random(850, strength === "large" ? 1900 : 1250)}ms`);
      particle.style.setProperty("--particle-delay", `${random(0, 170)}ms`);
      particle.style.setProperty("--particle-color", colors[index % colors.length]);
      fragment.append(particle);
      removeAfterAnimation(particle, 2400);
    }
    elements.effectLayer.append(fragment);
  }

  function burstFromElement(element, options) {
    const rect = element.getBoundingClientRect();
    heartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, options);
  }

  function showToast(title, message, options = {}) {
    const toast = document.createElement("div");
    toast.className = `toast${options.golden ? " toast--gold" : ""}`;
    toast.style.setProperty("--toast-life", `${options.life || 3500}ms`);
    const icon = document.createElement("span");
    icon.className = "toast__icon";
    icon.textContent = options.icon || "♥";
    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = title;
    const text = document.createElement("p");
    text.textContent = message;
    copy.append(strong, text);
    toast.append(icon, copy);
    elements.toastRegion.append(toast);
    removeAfterAnimation(toast, (options.life || 3500) + 700);
  }

  function discover(id, message, options = {}) {
    if (state.discoveries.includes(id)) return false;
    state.discoveries.push(id);
    saveState();
    renderTreasures();
    const treasure = treasures.find((item) => item.id === id);
    showToast(options.title || "Kleiner Schatz entdeckt", message || treasure?.title || "Nur für dich, Linn.", {
      icon: treasure?.icon || "♥",
      golden: options.golden,
      life: options.life || 3900
    });
    audio.play(options.golden ? "sparkle" : "click");
    return true;
  }

  function renderTreasures() {
    elements.treasureGrid.replaceChildren();
    const fragment = document.createDocumentFragment();
    treasures.forEach((treasure) => {
      const found = state.discoveries.includes(treasure.id);
      const card = document.createElement("article");
      card.className = `treasure${found ? " is-found" : ""}`;
      const icon = document.createElement("span");
      icon.className = "treasure__icon";
      icon.textContent = found ? treasure.icon : "?";
      const copy = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = found ? treasure.title : treasure.secret ? "Verborgenes Geheimnis" : treasure.title;
      const hint = document.createElement("p");
      hint.textContent = found ? "Für dich gefunden und sicher aufgehoben." : treasure.secret ? "Dieses kleine Geheimnis wartet noch auf dich." : treasure.hint;
      copy.append(title, hint);
      card.append(icon, copy);
      fragment.append(card);
    });
    elements.treasureGrid.append(fragment);
    elements.treasureCount.textContent = state.discoveries.length;
  }

  function updateProgress() {
    const count = state.seen.length;
    const percent = Math.round((count / TOTAL) * 100);
    elements.progressCurrent.textContent = count;
    elements.progressTotal.textContent = TOTAL;
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressFill.style.width = `${percent}%`;
    elements.progressHeart.style.left = `${percent}%`;
    elements.progressTrack.setAttribute("aria-valuemax", TOTAL);
    elements.progressTrack.setAttribute("aria-valuenow", count);
    elements.progressHeart.style.animation = "none";
    requestAnimationFrame(() => {
      elements.progressHeart.style.animation = state.motion === "off" ? "none" : "progress-pop 500ms var(--ease-spring)";
    });
  }

  function setRarity(rarity) {
    const labels = {
      normal: "Nur für dich, Linn",
      special: "Besonderer Herzensgrund",
      rare: "Seltenes Herzensfunkeln",
      "very-rare": "Sehr seltene Herzensmagie",
      golden: "Goldenes Herz"
    };
    elements.rarityBadge.lastElementChild.textContent = labels[rarity] || labels.normal;
    elements.complimentCard.classList.remove("is-special", "is-rare", "is-very-rare", "is-golden");
    if (rarity !== "normal") elements.complimentCard.classList.add(`is-${rarity}`);
  }

  function animateComplimentText(text, emotional) {
    const variants = ["fade", "rise", "drift", "focus", "scale", "words"];
    const variant = state.motion === "off" ? "fade" : variants[Math.floor(Math.random() * variants.length)];
    elements.complimentText.className = "";
    elements.complimentText.replaceChildren();
    if (variant === "words" && state.motion === "full") {
      text.split(" ").forEach((word, index) => {
        const span = document.createElement("span");
        span.className = "word";
        span.style.setProperty("--word-index", Math.min(index, 20));
        span.textContent = word;
        elements.complimentText.append(span);
      });
    } else {
      elements.complimentText.textContent = text;
    }
    // Restart the selected CSS animation even if it is chosen twice in a row.
    void elements.complimentText.offsetWidth;
    elements.complimentText.className = `compliment-text--${variant}`;
    if (emotional && state.motion !== "off") {
      const rect = elements.complimentCard.getBoundingClientRect();
      heartBurst(rect.left + rect.width / 2, rect.top + rect.height * 0.48, { strength: "small", variant: "up" });
    }
  }

  function chooseNextCompliment() {
    let candidates;
    if (state.replay) {
      candidates = replayQueue.map((id) => compliments[id]);
    } else {
      const seen = new Set(state.seen);
      candidates = compliments.filter((item) => !seen.has(item.id));
    }
    if (!candidates.length) return null;
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    if (state.replay) replayQueue = replayQueue.filter((id) => id !== selected.id);
    return selected;
  }

  function renderCompliment(compliment) {
    state.current = compliment.id;
    setRarity(compliment.rarity);
    animateComplimentText(compliment.text, compliment.emotional);
    updateProgress();
    const label = elements.nextButton.querySelector("span:nth-child(2)");
    if (state.replay && replayQueue.length === 0) label.textContent = "Zur Abschlussbotschaft";
    else if (!state.replay && state.seen.length === TOTAL) label.textContent = "Abschlussbotschaft öffnen";
    else label.textContent = "Nächstes Kompliment";
    saveState();
  }

  function showMilestone(count) {
    window.clearTimeout(milestoneTimer);
    const special = count === 100 || count === 200;
    elements.milestoneNumber.textContent = count;
    elements.milestoneTitle.textContent = count === 200 ? "Jeder Herzensgrund gehört jetzt dir" : `${count} kleine Gründe entdeckt`;
    elements.milestoneCopy.textContent =
      count === 100
        ? "Hundertmal Linn. Hundertmal ein Grund zum Lächeln."
        : count === 200
          ? "Aber meine liebsten gemeinsamen Momente beginnen erst noch."
          : "Und jeder einzelne wurde nur für dich aufgehoben.";
    elements.milestone.hidden = false;
    elements.milestone.style.animation = "none";
    void elements.milestone.offsetWidth;
    elements.milestone.style.animation = "";
    heartBurst(window.innerWidth / 2, window.innerHeight / 2, {
      strength: special ? "large" : "medium",
      variant: count % 50 === 0 ? "spiral" : "burst",
      golden: special
    });
    audio.play("sparkle");
    milestoneTimer = window.setTimeout(() => {
      elements.milestone.hidden = true;
    }, state.motion === "off" ? 800 : 4000);
  }

  function maybeSpawnGoldenHeart() {
    if (state.discoveries.includes("golden-heart") || $(".golden-secret")) return;
    if (state.seen.length !== 8 && state.seen.length !== 37) return;
    const button = document.createElement("button");
    button.className = "golden-secret";
    button.type = "button";
    button.setAttribute("aria-label", "Seltenes goldenes Herz");
    button.textContent = "♥";
    button.style.setProperty("--x", `${random(16, 84)}vw`);
    button.style.setProperty("--y", `${random(22, 76)}vh`);
    button.addEventListener("click", () => {
      const rect = button.getBoundingClientRect();
      discover("golden-heart", "Seltenes goldenes Herz gefunden ✨", { golden: true, title: "Goldenes Herz entdeckt" });
      heartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, { strength: "large", variant: "spiral", golden: true });
      button.remove();
    });
    elements.effectLayer.append(button);
    window.setTimeout(() => {
      if (button.isConnected) button.remove();
    }, 14000);
  }

  function nextCompliment() {
    if (complimentLocked) return;
    if ((!state.replay && state.seen.length >= TOTAL) || (state.replay && replayQueue.length === 0)) {
      showFinal();
      return;
    }

    const compliment = chooseNextCompliment();
    if (!compliment) {
      showFinal();
      return;
    }

    complimentLocked = true;
    elements.nextButton.classList.add("is-fetching");
    elements.nextButton.style.setProperty("--press-scale", ".96");
    const delay = state.motion === "off" ? 10 : 180;
    window.setTimeout(() => {
      const isNew = !state.seen.includes(compliment.id);
      if (isNew) state.seen.push(compliment.id);
      renderCompliment(compliment);
      if (isNew && state.seen.length === 1) discover("first-compliment", "Dein erster Herzensgrund ist jetzt geöffnet.");
      if (isNew && state.seen.length === 25) discover("milestone-25", "25 Komplimente entdeckt – und das war erst der Anfang.");
      if (isNew && state.seen.length === 100) discover("milestone-100", "Hundert Herzensgründe für Linn.", { golden: true });
      if (isNew && state.seen.length === TOTAL) discover("all-compliments", "Alle 200 Komplimente wurden geöffnet.", { golden: true });
      if (isNew && MILESTONES.has(state.seen.length)) showMilestone(state.seen.length);
      maybeSpawnGoldenHeart();
      audio.play(compliment.rarity === "golden" ? "sparkle" : "click");
      elements.nextButton.style.removeProperty("--press-scale");
      elements.nextButton.classList.remove("is-fetching");
      complimentLocked = false;
    }, delay);
  }

  async function switchView(next) {
    if (activeView === next) return;
    const previous = activeView;
    previous.classList.add("is-leaving");
    const delay = state.motion === "off" ? 5 : 390;
    await new Promise((resolve) => window.setTimeout(resolve, delay));
    previous.hidden = true;
    previous.classList.remove("is-active", "is-leaving");
    next.hidden = false;
    next.classList.add("is-active", "is-entering");
    activeView = next;
    window.scrollTo({ top: 0, behavior: state.motion === "full" ? "smooth" : "auto" });
    window.setTimeout(() => next.classList.remove("is-entering"), 800);
  }

  function renderJourneyScene({ arriving = false } = {}) {
    const scene = journeyScenes[journeyIndex];
    root.dataset.journey = String(journeyIndex + 1);
    elements.journeySymbol.textContent = scene.symbol;
    elements.journeyEyebrow.textContent = scene.eyebrow;
    elements.journeyTitle.textContent = scene.title;
    elements.journeyQuote.textContent = scene.quote;
    elements.journeyCopy.textContent = scene.copy;
    elements.journeyLevelLabel.textContent = `Ebene ${journeyIndex + 1} von ${journeyScenes.length}`;
    elements.journeyButtonLabel.textContent = journeyIndex === journeyScenes.length - 1 ? "Zu all den Gründen" : "Tiefer gehen";

    const dots = journeyScenes.map((_item, index) => {
      const dot = document.createElement("i");
      if (index < journeyIndex) dot.className = "is-passed";
      if (index === journeyIndex) dot.className = "is-current";
      return dot;
    });
    elements.journeyDots.replaceChildren(...dots);

    if (arriving && state.motion !== "off") {
      elements.journeyPanel.classList.remove("is-diving-out", "is-arriving");
      void elements.journeyPanel.offsetWidth;
      elements.journeyPanel.classList.add("is-arriving");
      window.setTimeout(() => elements.journeyPanel.classList.remove("is-arriving"), 900);
    }
  }

  async function advanceJourney() {
    if (journeyLocked) return;
    journeyLocked = true;
    burstFromElement(elements.journeyNextButton, { strength: "small", variant: "up" });
    audio.play(journeyIndex === journeyScenes.length - 1 ? "sparkle" : "click");
    elements.depthWorld.classList.add("is-advancing");
    elements.journeyPanel.classList.add("is-diving-out");

    const travelDelay = state.motion === "off" ? 10 : 760;
    await new Promise((resolve) => window.setTimeout(resolve, travelDelay));

    if (journeyIndex < journeyScenes.length - 1) {
      journeyIndex += 1;
      elements.depthWorld.classList.remove("is-advancing");
      renderJourneyScene({ arriving: true });
      journeyLocked = false;
      return;
    }

    elements.depthWorld.classList.add("is-final-dive");
    await new Promise((resolve) => window.setTimeout(resolve, state.motion === "off" ? 10 : 520));
    body.classList.remove("is-journeying");
    delete root.dataset.journey;
    await switchView(elements.complimentView);
    elements.depthWorld.classList.remove("is-advancing", "is-final-dive");
    elements.journeyPanel.classList.remove("is-diving-out", "is-arriving");
    nextCompliment();
    journeyLocked = false;
  }

  async function openGift() {
    if (elements.openGiftButton.disabled) return;
    skipIntro();
    elements.openGiftButton.disabled = true;
    elements.openGiftButton.classList.add("is-opening");
    burstFromElement(elements.openGiftButton, { strength: "large", variant: "up" });
    audio.play("sparkle");
    if (state.seen.length >= TOTAL) {
      state.replay = true;
      replayQueue = shuffle(compliments.map((item) => item.id));
      state.current = null;
    }
    journeyIndex = 0;
    renderJourneyScene();
    body.classList.add("is-journeying");
    const delay = state.motion === "off" ? 20 : 900;
    await new Promise((resolve) => window.setTimeout(resolve, delay));
    await switchView(elements.journeyView);
    elements.openGiftButton.disabled = false;
    elements.openGiftButton.classList.remove("is-opening");
  }

  function showFinal() {
    switchView(elements.finalView).then(() => {
      heartBurst(window.innerWidth / 2, window.innerHeight * 0.37, { strength: "large", variant: "up" });
      audio.play("sparkle");
    });
  }

  function sendHug(source) {
    if (elements.hugEffect.classList.contains("is-active")) return;
    source.style.setProperty("--press-scale", ".92");
    window.setTimeout(() => source.style.removeProperty("--press-scale"), 360);
    elements.hugEffect.classList.add("is-active");
    state.hugCount += 1;
    discover("first-hug", "Eine warme Kuschelumarmung ist unterwegs zu dir.");
    saveState();
    audio.play("hug");
    window.setTimeout(() => {
      elements.hugEffect.classList.remove("is-active");
      showToast("Umarmung angekommen", "Für unser erstes Treffen wurde noch eine extra gespeichert.", { icon: "♡" });
    }, state.motion === "off" ? 500 : 2400);
  }

  async function copyCompliment() {
    const text = compliments[state.current]?.text || elements.complimentText.textContent;
    let copied = false;
    const legacyCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      body.append(textarea);
      textarea.select();
      let result = false;
      try {
        result = document.execCommand("copy");
      } catch (_error) {
        result = false;
      }
      textarea.remove();
      return result;
    };
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise((_, reject) => window.setTimeout(() => reject(new Error("clipboard-timeout")), 900))
        ]);
        copied = true;
      } else {
        copied = legacyCopy();
      }
    } catch (_error) {
      copied = legacyCopy();
    }

    if (copied) {
      elements.copyButton.classList.add("is-copied");
      elements.copyButton.lastElementChild.textContent = "Gespeichert";
      burstFromElement(elements.copyButton, { strength: "small", variant: "up" });
      showToast("Für dich gespeichert ❤", "Das Kompliment wurde in die Zwischenablage kopiert.", { icon: "✓" });
      window.setTimeout(() => {
        elements.copyButton.classList.remove("is-copied");
        elements.copyButton.lastElementChild.textContent = "Kopieren";
      }, 1900);
    } else {
      showToast("Fast geschafft", "Dein Browser konnte den Text nicht kopieren. Das Geschenk bleibt natürlich unberührt.", { icon: "♡" });
    }
  }

  function openModal(modal) {
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  }

  function closeModal(modal) {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }

  function updateSettingButtons() {
    $$('[data-motion-value]').forEach((button) => button.classList.toggle("is-active", button.dataset.motionValue === state.motion));
    $$('[data-sound-value]').forEach((button) => button.classList.toggle("is-active", button.dataset.soundValue === state.sound));
  }

  function setMotion(level) {
    state.motion = resolvedMotion(level);
    root.dataset.motion = state.motion;
    saveState();
    makeAmbientParticles();
    updateSettingButtons();
    if (level === "full" && state.motion !== "full") {
      showToast("Sanfte Bewegung bleibt aktiv", "Deine Systemeinstellung für reduzierte Bewegung wird respektiert.", { icon: "♡" });
    }
  }

  function setupTiltAndMagnetism() {
    if (coarsePointer.matches || state.motion !== "full") return;
    $$(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--tilt-x", `${(x - 0.5) * 2.8}deg`);
        card.style.setProperty("--tilt-y", `${(0.5 - y) * 2.6}deg`);
        card.style.setProperty("--card-x", `${x * 100}%`);
        card.style.setProperty("--card-y", `${y * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--card-x", "50%");
        card.style.setProperty("--card-y", "40%");
      });
    });

    $$(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty("--magnet-x", `${(event.clientX - rect.left - rect.width / 2) * 0.08}px`);
        button.style.setProperty("--magnet-y", `${(event.clientY - rect.top - rect.height / 2) * 0.12}px`);
      });
      button.addEventListener("pointerleave", () => {
        button.style.setProperty("--magnet-x", "0px");
        button.style.setProperty("--magnet-y", "0px");
      });
    });
  }

  function setupPointerAmbience() {
    let frame = 0;
    let lastTrail = 0;
    let previousX = 0;
    let previousY = 0;
    window.addEventListener(
      "pointermove",
      (event) => {
        if (coarsePointer.matches || state.motion !== "full" || document.hidden) return;
        if (!frame) {
          frame = requestAnimationFrame(() => {
            const normalizedX = event.clientX / window.innerWidth - 0.5;
            const normalizedY = event.clientY / window.innerHeight - 0.5;
            root.style.setProperty("--pointer-x", `${event.clientX}px`);
            root.style.setProperty("--pointer-y", `${event.clientY}px`);
            $$(".ambient__blob").forEach((blob) => {
              const depth = Number(blob.dataset.depth || 0.2);
              blob.style.transform = `translate3d(${normalizedX * depth * 42}px, ${normalizedY * depth * 42}px, 0)`;
            });
            frame = 0;
          });
        }

        const distance = Math.hypot(event.clientX - previousX, event.clientY - previousY);
        if (performance.now() - lastTrail > 520 && distance > 70) {
          const heart = document.createElement("span");
          heart.className = "trail-heart";
          heart.textContent = "♡";
          heart.style.setProperty("--x", `${previousX || event.clientX}px`);
          heart.style.setProperty("--y", `${previousY || event.clientY}px`);
          elements.effectLayer.append(heart);
          removeAfterAnimation(heart, 1000);
          lastTrail = performance.now();
        }
        previousX = event.clientX;
        previousY = event.clientY;
      },
      { passive: true }
    );
  }

  function setupSecrets() {
    elements.cornerSecret.addEventListener("click", (event) => {
      discover("secret-corner", "Dieses kleine Herz hat nur auf dich gewartet.");
      heartBurst(event.clientX, event.clientY, { strength: "small", variant: "up" });
    });
    elements.starSecret.addEventListener("click", (event) => {
      discover("secret-star", "Diese Nachricht sehen nur besonders wundervolle Menschen.");
      heartBurst(event.clientX, event.clientY, { strength: "medium", variant: "spiral", golden: true });
    });
    elements.nightSecret.addEventListener("click", (event) => {
      discover("secret-night", "Auch der Mond weiß, wie besonders du bist, Linn.");
      heartBurst(event.clientX, event.clientY, { strength: "medium", variant: "down" });
    });

    let curiosityClicks = [];
    const curious = (event) => {
      const now = performance.now();
      curiosityClicks = [...curiosityClicks.filter((time) => now - time < 2400), now];
      if (curiosityClicks.length >= 5) {
        discover("secret-curious", "Du bist offiziell zu neugierig – und genau das ist süß.");
        heartBurst(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2, { strength: "medium", variant: "spiral" });
        curiosityClicks = [];
      }
    };
    elements.mainHeart.addEventListener("click", curious);
    elements.brandButton.addEventListener("click", curious);
    elements.startTitle.addEventListener("click", curious);

    let longPressTimer = 0;
    const cancelLongPress = () => window.clearTimeout(longPressTimer);
    elements.openGiftButton.addEventListener("pointerdown", (event) => {
      longPressTimer = window.setTimeout(() => {
        discover("secret-longpress", "Geheimer Kuschelgutschein entdeckt – einmal extra fest drücken inklusive.", { title: "Kuschelgutschein gefunden" });
        heartBurst(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2, { strength: "medium", variant: "up" });
      }, 850);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((name) => elements.openGiftButton.addEventListener(name, cancelLongPress));
  }

  function setupEvents() {
    ["pointerdown", "keydown"].forEach((eventName) => {
      window.addEventListener(eventName, skipIntro, { once: true, passive: eventName === "pointerdown" });
    });

    document.addEventListener("pointerdown", (event) => {
      const button = event.target.closest("button");
      if (button) addRipple(button, event);
      if (event.pointerType === "touch") touchLight(event.clientX, event.clientY);
    });

    elements.openGiftButton.addEventListener("click", openGift);
    elements.journeyNextButton.addEventListener("click", advanceJourney);
    elements.nextButton.addEventListener("click", () => {
      burstFromElement(elements.nextButton, { strength: "small", variant: "up" });
      nextCompliment();
    });
    elements.hugButton.addEventListener("click", () => sendHug(elements.hugButton));
    elements.finalHugButton.addEventListener("click", () => sendHug(elements.finalHugButton));
    elements.copyButton.addEventListener("click", copyCompliment);
    elements.backButton.addEventListener("click", () => switchView(elements.startView));
    elements.restartButton.addEventListener("click", () => switchView(elements.startView));

    elements.treasureButton.addEventListener("click", () => openModal(elements.treasureModal));
    elements.settingsButton.addEventListener("click", () => {
      updateSettingButtons();
      openModal(elements.settingsModal);
    });
    $$('[data-close-modal]').forEach((button) => button.addEventListener("click", () => closeModal(button.closest("dialog"))));
    $$("dialog").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal(modal);
      });
    });

    $$('[data-motion-value]').forEach((button) => button.addEventListener("click", () => setMotion(button.dataset.motionValue)));
    $$('[data-sound-value]').forEach((button) => {
      button.addEventListener("click", () => {
        audio.setMode(button.dataset.soundValue);
        updateSettingButtons();
      });
    });

    elements.resetProgressButton.addEventListener("click", () => {
      if (!window.confirm("Möchtest du alle lokal gespeicherten Herzensgründe und Geheimnisse wirklich zurücksetzen?")) return;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_error) {
        // Nothing else is required when storage is unavailable.
      }
      window.location.reload();
    });

    window.addEventListener("keydown", (event) => {
      const interactive = event.target.closest("button, a, input, textarea, select, dialog[open]");
      if (event.code === "Space" && activeView === elements.complimentView && !interactive) {
        event.preventDefault();
        nextCompliment();
      }
      if (event.key === "Escape") {
        $$("dialog[open]").forEach(closeModal);
      }
    });

    document.addEventListener("visibilitychange", () => {
      body.classList.toggle("is-paused", document.hidden);
      if (document.hidden) audio.tracks.ambient.pause();
      else if (state.sound === "music") audio.play("ambient");
    });

    motionQuery.addEventListener("change", () => setMotion(state.motion));
  }

  function initialize() {
    setTimeTheme();
    makeAmbientParticles();
    renderTreasures();
    updateProgress();
    renderJourneyScene();
    updateSettingButtons();
    setupTiltAndMagnetism();
    setupPointerAmbience();
    setupSecrets();
    setupEvents();

    if (motionQuery.matches || state.motion === "off") skipIntro();
  }

  initialize();
})();
