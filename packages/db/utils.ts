// Username generation utilities
const adjectives = [
  'Crazy', 'Wizard', 'Epic', 'Mystic', 'Shadow', 'Golden', 'Silver', 'Crimson', 'Azure', 'Emerald',
  'Cosmic', 'Lunar', 'Solar', 'Thunder', 'Lightning', 'Frost', 'Blaze', 'Storm', 'Phoenix', 'Dragon',
  'Wolf', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Shark', 'Dolphin', 'Penguin', 'Owl', 'Raven',
  'Ninja', 'Samurai', 'Knight', 'Warrior', 'Mage', 'Archer', 'Rogue', 'Paladin', 'Bard', 'Monk',
  'Chef', 'Baker', 'Artist', 'Musician', 'Scientist', 'Engineer', 'Doctor', 'Teacher', 'Writer', 'Poet',
  'Gamer', 'Coder', 'Hacker', 'Designer', 'Creator', 'Builder', 'Explorer', 'Adventurer', 'Traveler', 'Pioneer'
];

const nouns = [
  'Chicken', 'Wizard', 'Chef', 'Dragon', 'Phoenix', 'Eagle', 'Wolf', 'Lion', 'Tiger', 'Bear',
  'Shark', 'Dolphin', 'Penguin', 'Owl', 'Raven', 'Ninja', 'Samurai', 'Knight', 'Warrior', 'Mage',
  'Archer', 'Rogue', 'Paladin', 'Bard', 'Monk', 'Baker', 'Artist', 'Musician', 'Scientist', 'Engineer',
  'Doctor', 'Teacher', 'Writer', 'Poet', 'Gamer', 'Coder', 'Hacker', 'Designer', 'Creator', 'Builder',
  'Explorer', 'Adventurer', 'Traveler', 'Pioneer', 'Hero', 'Legend', 'Master', 'Guru', 'Sage', 'Prophet',
  'Guardian', 'Protector', 'Defender', 'Champion', 'Victor', 'Conqueror', 'Emperor', 'King', 'Queen', 'Prince'
];

/**
 * Generates a random Xbox-style username
 * Format: Adjective + Noun + Random 2-digit number
 * Examples: CrazyChicken43, WizardChef28, EpicDragon91
 */
export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 90) + 10; // 10-99
  
  return `${adjective}${noun}${number}`;
}

/**
 * Generates multiple unique usernames
 */
export function generateUniqueUsernames(count: number): string[] {
  const usernames = new Set<string>();
  
  while (usernames.size < count) {
    usernames.add(generateRandomUsername());
  }
  
  return Array.from(usernames);
}

/**
 * Checks if a username is valid (alphanumeric, 3-20 characters)
 */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9]{3,20}$/.test(username);
} 