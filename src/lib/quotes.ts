export interface Quote {
  text: string;
  author: string;
}

export const quotes: Quote[] = [
  // Steve Jobs
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "Stay hungry, stay foolish.",
    author: "Steve Jobs"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  
  // Marcus Aurelius
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    text: "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
    author: "Marcus Aurelius"
  },
  {
    text: "When you arise in the morning think of what a privilege it is to be alive, to think, to breathe.",
    author: "Marcus Aurelius"
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius"
  },
  
  // Naval Ravikant
  {
    text: "Learn to be happy alone, then you can be happy with anyone.",
    author: "Naval Ravikant"
  },
  {
    text: "Read what you love, until you love what you read.",
    author: "Naval Ravikant"
  },
  {
    text: "Happiness is a skill, something you have to work on every day.",
    author: "Naval Ravikant"
  },
  {
    text: "If you can't decide, the answer is no.",
    author: "Naval Ravikant"
  },
  
  // Elon Musk
  {
    text: "When something's important enough, you do it even if the odds are against you.",
    author: "Elon Musk"
  },
  {
    text: "I think it's very important to have a feedback loop, where you're constantly thinking about what you've done and how you could be doing it better.",
    author: "Elon Musk"
  },
  {
    text: "Persistence is very important. You should not give up unless you are forced to give up.",
    author: "Elon Musk"
  },
  {
    text: "If something's important enough, you do it even if the odds are not in your favor.",
    author: "Elon Musk"
  },
  
  // Sokrates
  {
    text: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.",
    author: "Sokrates"
  },
  {
    text: "I know that I know nothing.",
    author: "Sokrates"
  },
  {
    text: "The unexamined life is not worth living.",
    author: "Sokrates"
  },
  {
    text: "Strong minds discuss ideas, average minds discuss events, weak minds discuss people.",
    author: "Sokrates"
  },
  
  // Alex Hormozi
  {
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Alex Hormozi"
  },
  {
    text: "Most people overestimate what they can do in one year and underestimate what they can do in ten years.",
    author: "Alex Hormozi"
  },
  {
    text: "If you're not willing to suffer for your dreams, your dreams will suffer.",
    author: "Alex Hormozi"
  },
  {
    text: "Your network determines your net worth.",
    author: "Alex Hormozi"
  }
];

// Get a random quote
export function getRandomQuote(): Quote {
  try {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  } catch (error) {
    console.error('Error getting random quote:', error);
    return {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    };
  }
}
