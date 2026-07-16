(function () {
  const subjects = [
    { text: "Dein warmes Lächeln", mood: "smile" },
    { text: "Die Ruhe in deiner Stimme", mood: "warmth" },
    { text: "Wie aufmerksam du zuhörst,", mood: "warmth" },
    { text: "Deine ehrliche Art", mood: "courage" },
    { text: "Dein Blick für die kleinen Dinge", mood: "smile" },
    { text: "Dein wunderschönes Herz", mood: "warmth" },
    { text: "Wie du andere Menschen siehst,", mood: "warmth" },
    { text: "Deine neugierige Art", mood: "courage" },
    { text: "Dein leises Lachen", mood: "smile" },
    { text: "Wie echt du immer bleibst,", mood: "courage" },
    { text: "Deine liebevolle Geduld", mood: "warmth" },
    { text: "Dein Mut, du selbst zu sein,", mood: "courage" },
    { text: "Die Wärme, die du ausstrahlst,", mood: "warmth" },
    { text: "Deine kleinen verrückten Ideen", mood: "smile" },
    { text: "Wie du dich begeistern kannst,", mood: "smile" },
    { text: "Deine sanfte Stärke", mood: "courage" },
    { text: "Dein Sinn für Humor", mood: "smile" },
    { text: "Wie du aus Kleinigkeiten Erinnerungen machst,", mood: "warmth" },
    { text: "Deine klugen Gedanken", mood: "courage" },
    { text: "Deine ganz eigene Art zu träumen", mood: "warmth" },
    { text: "Das Funkeln in deinen Augen", mood: "smile" },
    { text: "Wie fürsorglich du bist,", mood: "warmth" },
    { text: "Deine spontane Seite", mood: "smile" },
    { text: "Wie viel Gefühl in dir steckt,", mood: "warmth" },
    { text: "Deine Offenheit", mood: "courage" },
    { text: "Wie du Nähe besonders machst,", mood: "warmth" },
    { text: "Dein wunderschönes Chaos", mood: "smile" },
    { text: "Die Geborgenheit in deinen Worten", mood: "warmth" },
    { text: "Deine kleinen Gesten", mood: "warmth" },
    { text: "Wie du mich zum Lächeln bringst,", mood: "smile" },
    { text: "Deine entschlossene Seite", mood: "courage" },
    { text: "Wie leicht sich Gespräche mit dir anfühlen,", mood: "warmth" },
    { text: "Dein liebevoller Blick auf die Welt", mood: "warmth" },
    { text: "Deine verspielte Neugier", mood: "smile" },
    { text: "Wie du selbst stillen Momenten Bedeutung gibst,", mood: "warmth" },
    { text: "Deine Fähigkeit, immer wieder aufzustehen,", mood: "courage" },
    { text: "Wie du Nähe und Freiheit verbindest,", mood: "courage" },
    { text: "Dein feines Gespür für Menschen", mood: "warmth" },
    { text: "Die kleinen Pausen zwischen deinem Lachen", mood: "smile" },
    { text: "Wie mutig du fühlen kannst,", mood: "courage" },
    { text: "Deine wunderbare Direktheit", mood: "courage" },
    { text: "Wie du einem Tag plötzlich Farbe gibst,", mood: "smile" },
    { text: "Deine zärtliche Aufmerksamkeit", mood: "warmth" },
    { text: "Dein Vertrauen in das Gute", mood: "courage" },
    { text: "Wie besonders dein Name für mich klingt,", mood: "warmth" },
    { text: "Deine kleinen Freudentänze", mood: "smile" },
    { text: "Wie viel Zuhause in dir steckt,", mood: "warmth" },
    { text: "Deine leuchtende Persönlichkeit", mood: "smile" },
    { text: "Wie du mich an schöne Möglichkeiten erinnerst,", mood: "courage" },
    { text: "Ein Gedanke an dich", mood: "warmth" }
  ];

  const endings = [
    "macht selbst gewöhnliche Momente besonders.",
    "ist einer der Gründe, warum ich immer wieder lächeln muss.",
    "fühlt sich für mich wie ein kleines Stück Zuhause an.",
    "erinnert mich daran, wie wundervoll du wirklich bist."
  ];

  const compliments = [];
  subjects.forEach((subject, subjectIndex) => {
    endings.forEach((ending, endingIndex) => {
      const id = subjectIndex * endings.length + endingIndex;
      let rarity = "normal";
      if (id === 99 || id === 199) rarity = "golden";
      else if (id % 41 === 0) rarity = "very-rare";
      else if (id % 23 === 0) rarity = "rare";
      else if (id % 9 === 0) rarity = "special";

      compliments.push({
        id,
        text: `${subject.text} ${ending}`,
        mood: subject.mood,
        rarity,
        emotional: id % 17 === 0 || id === 99 || id === 199
      });
    });
  });

  const treasures = [
    { id: "first-compliment", icon: "♡", title: "Der erste Herzensgrund", hint: "Das erste Kompliment öffnen" },
    { id: "first-hug", icon: "⌁", title: "Kuschelumarmung unterwegs", hint: "Eine Umarmung senden" },
    { id: "milestone-25", icon: "25", title: "25-mal gelächelt", hint: "25 Komplimente entdecken" },
    { id: "milestone-100", icon: "100", title: "Hundert Herzensgründe", hint: "100 Komplimente entdecken" },
    { id: "secret-corner", icon: "♥", title: "Das geduldige Herz", hint: "Ein stilles Geheimnis finden", secret: true },
    { id: "secret-star", icon: "✦", title: "Ein Stern nur für Linn", hint: "Ein leises Geheimnis finden", secret: true },
    { id: "secret-curious", icon: "?", title: "Offiziell zu neugierig", hint: "Ein verspieltes Geheimnis finden", secret: true },
    { id: "secret-longpress", icon: "🎟", title: "Geheimer Kuschelgutschein", hint: "Ein verborgenes Geschenk finden", secret: true },
    { id: "secret-night", icon: "☾", title: "Mondscheinbotschaft", hint: "Ein nächtliches Geheimnis finden", secret: true },
    { id: "golden-heart", icon: "◆", title: "Seltenes goldenes Herz", hint: "Eine sehr seltene Entdeckung machen", secret: true },
    { id: "all-compliments", icon: "∞", title: "Alle 200 Herzensgründe", hint: "Die ganze Reise erleben" }
  ];

  window.LINN_DATA = { compliments, treasures };
})();
