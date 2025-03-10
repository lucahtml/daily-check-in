export interface Quote {
  text: string;
  author: string;
  id: string;
}

// Zitate-Pool
export const quotes: Quote[] = [
  // Naval Ravikant
  {
    id: 'naval-1',
    text: "The purpose of life is to be happy, the time to be happy is now, and the way to be happy is to make others happy.",
    author: "Naval Ravikant"
  },
  {
    id: 'naval-2',
    text: "All the real benefits in life come from compound interest.",
    author: "Naval Ravikant"
  },
  {
    id: 'naval-3',
    text: "Learn to sell. Learn to build. If you can do both, you will be unstoppable.",
    author: "Naval Ravikant"
  },
  {
    id: 'naval-4',
    text: "A calm mind, a fit body, and a house full of love. These things cannot be bought. They must be earned.",
    author: "Naval Ravikant"
  },
  {
    id: 'naval-5',
    text: "The most important skill for getting rich is becoming a perpetual learner.",
    author: "Naval Ravikant"
  },
  
  // Steve Jobs
  {
    id: 'jobs-1',
    text: "Stay hungry, stay foolish.",
    author: "Steve Jobs"
  },
  {
    id: 'jobs-2',
    text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs"
  },
  {
    id: 'jobs-3',
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    id: 'jobs-4',
    text: "I'm convinced that about half of what separates successful entrepreneurs from the non-successful ones is pure perseverance.",
    author: "Steve Jobs"
  },
  {
    id: 'jobs-5',
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  
  // Elon Musk
  {
    id: 'musk-1',
    text: "When something is important enough, you do it even if the odds are not in your favor.",
    author: "Elon Musk"
  },
  {
    id: 'musk-2',
    text: "I think it's very important to have a feedback loop, where you're constantly thinking about what you've done and how you could be doing it better.",
    author: "Elon Musk"
  },
  {
    id: 'musk-3',
    text: "Failure is an option here. If things are not failing, you are not innovating enough.",
    author: "Elon Musk"
  },
  {
    id: 'musk-4',
    text: "The first step is to establish that something is possible; then probability will occur.",
    author: "Elon Musk"
  },
  {
    id: 'musk-5',
    text: "Great companies are built on great products.",
    author: "Elon Musk"
  },
  
  // Marcus Aurelius
  {
    id: 'aurelius-1',
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    id: 'aurelius-2',
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius"
  },
  {
    id: 'aurelius-3',
    text: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius"
  },
  {
    id: 'aurelius-4',
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius"
  },
  {
    id: 'aurelius-5',
    text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.",
    author: "Marcus Aurelius"
  },
  
  // Alex Hormozi
  {
    id: 'hormozi-1',
    text: "The gap between knowledge and execution is greater than the gap between ignorance and knowledge.",
    author: "Alex Hormozi"
  },
  {
    id: 'hormozi-2',
    text: "Most people overestimate what they can do in one year and underestimate what they can do in ten years.",
    author: "Alex Hormozi"
  },
  {
    id: 'hormozi-3',
    text: "Your network determines your net worth.",
    author: "Alex Hormozi"
  },
  {
    id: 'hormozi-4',
    text: "If you're not willing to suffer for your dreams, your dreams will suffer.",
    author: "Alex Hormozi"
  },
  {
    id: 'hormozi-5',
    text: "The best investment you can make is in yourself.",
    author: "Alex Hormozi"
  },
  
  // Jordan Peterson
  {
    id: 'peterson-1',
    text: "Compare yourself to who you were yesterday, not to who someone else is today.",
    author: "Jordan Peterson"
  },
  {
    id: 'peterson-2',
    text: "The purpose of life is finding the largest burden that you can bear and bearing it.",
    author: "Jordan Peterson"
  },
  {
    id: 'peterson-3',
    text: "If you fulfill your obligations everyday you don't need to worry about the future.",
    author: "Jordan Peterson"
  },
  {
    id: 'peterson-4',
    text: "You're going to pay a price for every bloody thing you do and everything you don't do.",
    author: "Jordan Peterson"
  },
  {
    id: 'peterson-5',
    text: "To stand up straight with your shoulders back is to accept the terrible responsibility of life.",
    author: "Jordan Peterson"
  }
];

const RECENT_QUOTES_KEY = 'recentQuotes';
const DAYS_BEFORE_REPEAT = 30;

interface RecentQuote {
  id: string;
  date: string;
}

// Lade kürzlich verwendete Zitate aus dem localStorage
function getRecentQuotes(): RecentQuote[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const recentQuotes = localStorage.getItem(RECENT_QUOTES_KEY);
    if (!recentQuotes) return [];
    
    const parsed = JSON.parse(recentQuotes) as RecentQuote[];
    
    // Entferne Zitate, die älter als DAYS_BEFORE_REPEAT Tage sind
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DAYS_BEFORE_REPEAT);
    
    return parsed.filter(quote => new Date(quote.date) > thirtyDaysAgo);
  } catch (error) {
    console.error('Error loading recent quotes:', error);
    return [];
  }
}

// Speichere ein verwendetes Zitat
function saveQuoteUsage(quoteId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const recentQuotes = getRecentQuotes();
    recentQuotes.push({
      id: quoteId,
      date: new Date().toISOString()
    });
    
    localStorage.setItem(RECENT_QUOTES_KEY, JSON.stringify(recentQuotes));
  } catch (error) {
    console.error('Error saving quote usage:', error);
  }
}

// Hole ein zufälliges Zitat, das nicht kürzlich verwendet wurde
export function getRandomQuote(): Quote {
  try {
    const recentQuotes = getRecentQuotes();
    const recentQuoteIds = new Set(recentQuotes.map(q => q.id));
    
    // Filtere verfügbare Zitate
    const availableQuotes = quotes.filter(quote => !recentQuoteIds.has(quote.id));
    
    // Wenn alle Zitate verwendet wurden, verwende das älteste
    if (availableQuotes.length === 0) {
      const oldestQuote = quotes.find(q => q.id === recentQuotes[0].id);
      if (oldestQuote) {
        saveQuoteUsage(oldestQuote.id);
        return oldestQuote;
      }
    }
    
    // Wähle ein zufälliges verfügbares Zitat
    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
    const selectedQuote = availableQuotes[randomIndex];
    
    // Speichere die Verwendung
    saveQuoteUsage(selectedQuote.id);
    
    return selectedQuote;
  } catch (error) {
    console.error('Error getting random quote:', error);
    // Fallback zu einem Standard-Zitat
    return {
      id: 'naval-1',
      text: "The purpose of life is to be happy, the time to be happy is now, and the way to be happy is to make others happy.",
      author: "Naval Ravikant"
    };
  }
}
