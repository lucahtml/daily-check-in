export interface Quote {
  text: string;
  author: string;
}

export const quotes: Quote[] = [
  // Steve Jobs
  {
    text: "Deine Zeit ist begrenzt, also verschwende sie nicht damit, das Leben eines anderen zu leben.",
    author: "Steve Jobs"
  },
  {
    text: "Bleib hungrig, bleib töricht.",
    author: "Steve Jobs"
  },
  {
    text: "Innovation unterscheidet zwischen einem Anführer und einem Nachfolger.",
    author: "Steve Jobs"
  },
  {
    text: "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was du tust.",
    author: "Steve Jobs"
  },
  
  // Marcus Aurelius
  {
    text: "Du hast Macht über deinen Geist - nicht über äußere Ereignisse. Erkenne dies, und du wirst Stärke finden.",
    author: "Marcus Aurelius"
  },
  {
    text: "Alles, was wir hören, ist eine Meinung, keine Tatsache. Alles, was wir sehen, ist eine Perspektive, nicht die Wahrheit.",
    author: "Marcus Aurelius"
  },
  {
    text: "Wenn du dich über etwas ärgerst, verlierst du etwas anderes: deine Zeit.",
    author: "Marcus Aurelius"
  },
  {
    text: "Sehr oft ist es nicht das, was wir tun, sondern das, was wir nicht tun, was uns das Glück kostet.",
    author: "Marcus Aurelius"
  },
  
  // Naval Ravikant
  {
    text: "Lerne, glücklich allein zu sein. Dann kannst du in jeder Situation glücklich sein.",
    author: "Naval Ravikant"
  },
  {
    text: "Lese das, was du liebst, bis du das liebst, was du liest.",
    author: "Naval Ravikant"
  },
  {
    text: "Glück ist eine Entscheidung, die du triffst, und eine Fähigkeit, die du entwickelst.",
    author: "Naval Ravikant"
  },
  {
    text: "Wenn du nicht entscheiden kannst, ist die Antwort nein.",
    author: "Naval Ravikant"
  },
  
  // Elon Musk
  {
    text: "Wenn etwas wichtig genug ist, machst du es, auch wenn die Chancen nicht in deiner Gunst stehen.",
    author: "Elon Musk"
  },
  {
    text: "Ich denke, es ist möglich für gewöhnliche Menschen, sich zu entscheiden, außergewöhnlich zu sein.",
    author: "Elon Musk"
  },
  {
    text: "Ausdauer ist sehr wichtig. Du solltest nicht aufgeben, es sei denn, du bist gezwungen aufzugeben.",
    author: "Elon Musk"
  },
  {
    text: "Wenn du morgens aufwachst und denkst, die Zukunft wird besser sein, ist das ein schöner Tag.",
    author: "Elon Musk"
  },
  
  // Sokrates
  {
    text: "Das Geheimnis des Wandels ist, deine ganze Energie nicht darauf zu richten, das Alte zu bekämpfen, sondern das Neue aufzubauen.",
    author: "Sokrates"
  },
  {
    text: "Ich weiß, dass ich nichts weiß.",
    author: "Sokrates"
  },
  {
    text: "Ein nicht hinterfragtes Leben ist nicht lebenswert.",
    author: "Sokrates"
  },
  {
    text: "Starke Geister diskutieren Ideen, mittelmäßige Geister diskutieren Ereignisse, schwache Geister diskutieren Menschen.",
    author: "Sokrates"
  },
  
  // Alex Hormozi
  {
    text: "Disziplin ist die Brücke zwischen Zielen und Erfolg.",
    author: "Alex Hormozi"
  },
  {
    text: "Die meisten Menschen überschätzen, was sie in einem Jahr erreichen können, und unterschätzen, was sie in einem Jahrzehnt erreichen können.",
    author: "Alex Hormozi"
  },
  {
    text: "Wenn du nicht bereit bist, für deine Träume zu leiden, werden deine Träume leiden.",
    author: "Alex Hormozi"
  },
  {
    text: "Dein Netzwerk bestimmt deinen Nettowert.",
    author: "Alex Hormozi"
  }
];

// Get a random quote
export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};
