import { Quote, quotes } from './quotes';

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}

export function shouldUpdateQuote(timestamp: string): boolean {
  if (!timestamp) return true;
  
  const now = new Date();
  const lastUpdate = new Date(timestamp);
  
  // Check if it's a new day (midnight ET)
  const nowET = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const lastUpdateET = new Date(lastUpdate.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  return nowET.getDate() !== lastUpdateET.getDate();
}
