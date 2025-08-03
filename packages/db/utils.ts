// Username generation utilities
const adjectives = [
  // Original 50
  'Crazy', 'Wizard', 'Epic', 'Mystic', 'Shadow', 'Golden', 'Silver', 'Crimson', 'Azure', 'Emerald',
  'Cosmic', 'Lunar', 'Solar', 'Thunder', 'Lightning', 'Frost', 'Blaze', 'Storm', 'Phoenix', 'Dragon',
  'Wolf', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Shark', 'Dolphin', 'Penguin', 'Owl', 'Raven',
  'Ninja', 'Samurai', 'Knight', 'Warrior', 'Mage', 'Archer', 'Rogue', 'Paladin', 'Bard', 'Monk',
  'Chef', 'Baker', 'Artist', 'Musician', 'Scientist', 'Engineer', 'Doctor', 'Teacher', 'Writer', 'Poet',
  'Gamer', 'Coder', 'Hacker', 'Designer', 'Creator', 'Builder', 'Explorer', 'Adventurer', 'Traveler', 'Pioneer',
  
  // Extended adjectives (150 more)
  'Mighty', 'Swift', 'Brave', 'Clever', 'Wise', 'Bold', 'Fierce', 'Gentle', 'Wild', 'Calm',
  'Bright', 'Dark', 'Light', 'Heavy', 'Quick', 'Slow', 'Strong', 'Weak', 'Tall', 'Small',
  'Big', 'Tiny', 'Huge', 'Massive', 'Giant', 'Mini', 'Micro', 'Mega', 'Ultra', 'Super',
  'Hyper', 'Turbo', 'Rapid', 'Fast', 'Quick', 'Speedy', 'Swift', 'Fleet', 'Agile', 'Nimble',
  'Graceful', 'Elegant', 'Smooth', 'Rough', 'Sharp', 'Dull', 'Bright', 'Shiny', 'Glowing', 'Radiant',
  'Sparkling', 'Twinkling', 'Glimmering', 'Shimmering', 'Dazzling', 'Brilliant', 'Magnificent', 'Glorious', 'Majestic', 'Regal',
  'Royal', 'Noble', 'Honorable', 'Virtuous', 'Pure', 'Sacred', 'Divine', 'Celestial', 'Ethereal', 'Mystical',
  'Enchanted', 'Magical', 'Spellbinding', 'Hypnotic', 'Mesmerizing', 'Captivating', 'Charming', 'Alluring', 'Bewitching', 'Enchanting',
  'Fascinating', 'Intriguing', 'Mysterious', 'Cryptic', 'Obscure', 'Hidden', 'Secret', 'Covert', 'Stealth', 'Silent',
  'Quiet', 'Loud', 'Noisy', 'Boisterous', 'Rambunctious', 'Energetic', 'Vibrant', 'Dynamic', 'Active', 'Lively',
  'Spirited', 'Enthusiastic', 'Passionate', 'Fervent', 'Zealous', 'Ardent', 'Devoted', 'Loyal', 'Faithful', 'Dedicated',
  'Committed', 'Determined', 'Resolute', 'Steadfast', 'Unwavering', 'Persistent', 'Tenacious', 'Relentless', 'Unstoppable', 'Invincible',
  'Unbeatable', 'Unconquerable', 'Indomitable', 'Fearless', 'Courageous', 'Valiant', 'Heroic', 'Legendary', 'Mythical', 'Fabled',
  'Famous', 'Renowned', 'Celebrated', 'Distinguished', 'Eminent', 'Prominent', 'Notable', 'Remarkable', 'Extraordinary', 'Exceptional',
  'Outstanding', 'Superior', 'Excellent', 'Perfect', 'Flawless', 'Immaculate', 'Pristine', 'Untouched', 'Pure', 'Clean',
  'Fresh', 'New', 'Modern', 'Contemporary', 'Current', 'Latest', 'Recent', 'Updated', 'Advanced', 'Progressive',
  'Innovative', 'Creative', 'Imaginative', 'Artistic', 'Expressive', 'Emotional', 'Sensitive', 'Intuitive', 'Perceptive', 'Insightful',
  'Intelligent', 'Brilliant', 'Genius', 'Mastermind', 'Scholar', 'Academic', 'Intellectual', 'Philosophical', 'Theoretical', 'Practical',
  'Logical', 'Rational', 'Analytical', 'Systematic', 'Methodical', 'Organized', 'Structured', 'Orderly', 'Neat', 'Tidy',
  'Precise', 'Accurate', 'Exact', 'Perfect', 'Flawless', 'Immaculate', 'Pristine', 'Untouched', 'Pure', 'Clean'
];

const nouns = [
  // Original 50
  'Chicken', 'Wizard', 'Chef', 'Dragon', 'Phoenix', 'Eagle', 'Wolf', 'Lion', 'Tiger', 'Bear',
  'Shark', 'Dolphin', 'Penguin', 'Owl', 'Raven', 'Ninja', 'Samurai', 'Knight', 'Warrior', 'Mage',
  'Archer', 'Rogue', 'Paladin', 'Bard', 'Monk', 'Baker', 'Artist', 'Musician', 'Scientist', 'Engineer',
  'Doctor', 'Teacher', 'Writer', 'Poet', 'Gamer', 'Coder', 'Hacker', 'Designer', 'Creator', 'Builder',
  'Explorer', 'Adventurer', 'Traveler', 'Pioneer', 'Hero', 'Legend', 'Master', 'Guru', 'Sage', 'Prophet',
  'Guardian', 'Protector', 'Defender', 'Champion', 'Victor', 'Conqueror', 'Emperor', 'King', 'Queen', 'Prince',
  
  // Extended nouns (150 more)
  'Warrior', 'Fighter', 'Soldier', 'Commander', 'General', 'Captain', 'Lieutenant', 'Sergeant', 'Private', 'Recruit',
  'Scout', 'Ranger', 'Hunter', 'Tracker', 'Pathfinder', 'Navigator', 'Pilot', 'Driver', 'Rider', 'Runner',
  'Sprinter', 'Marathoner', 'Athlete', 'Player', 'Competitor', 'Contender', 'Challenger', 'Opponent', 'Rival', 'Adversary',
  'Ally', 'Partner', 'Companion', 'Friend', 'Buddy', 'Mate', 'Comrade', 'Colleague', 'Associate', 'Partner',
  'Helper', 'Assistant', 'Aide', 'Supporter', 'Backer', 'Sponsor', 'Patron', 'Benefactor', 'Donor', 'Contributor',
  'Investor', 'Entrepreneur', 'Businessman', 'Executive', 'Manager', 'Director', 'Supervisor', 'Leader', 'Boss', 'Chief',
  'Head', 'Chairman', 'President', 'Governor', 'Mayor', 'Senator', 'Representative', 'Delegate', 'Ambassador', 'Diplomat',
  'Negotiator', 'Mediator', 'Arbitrator', 'Judge', 'Lawyer', 'Attorney', 'Counselor', 'Advisor', 'Consultant', 'Expert',
  'Specialist', 'Professional', 'Practitioner', 'Operator', 'Technician', 'Mechanic', 'Engineer', 'Architect', 'Designer', 'Planner',
  'Strategist', 'Tactician', 'Analyst', 'Researcher', 'Investigator', 'Detective', 'Inspector', 'Examiner', 'Reviewer', 'Critic',
  'Commentator', 'Reporter', 'Journalist', 'Correspondent', 'Broadcaster', 'Announcer', 'Presenter', 'Host', 'Moderator', 'Facilitator',
  'Instructor', 'Trainer', 'Coach', 'Mentor', 'Tutor', 'Professor', 'Lecturer', 'Speaker', 'Orator', 'Debater',
  'Advocate', 'Defender', 'Protector', 'Guardian', 'Custodian', 'Keeper', 'Warden', 'Overseer', 'Supervisor', 'Manager',
  'Administrator', 'Coordinator', 'Organizer', 'Planner', 'Scheduler', 'Arranger', 'Dispatcher', 'Controller', 'Operator', 'Handler',
  'Processor', 'Compiler', 'Interpreter', 'Translator', 'Converter', 'Transformer', 'Modifier', 'Adjuster', 'Calibrator', 'Tuner',
  'Optimizer', 'Enhancer', 'Amplifier', 'Booster', 'Accelerator', 'Catalyst', 'Trigger', 'Activator', 'Initiator', 'Starter',
  'Launcher', 'Deployer', 'Releaser', 'Publisher', 'Distributor', 'Supplier', 'Provider', 'Vendor', 'Merchant', 'Trader',
  'Broker', 'Agent', 'Representative', 'Spokesperson', 'Spokesman', 'Spokeswoman', 'Mouthpiece', 'Voice', 'Speaker', 'Talker',
  'Communicator', 'Messenger', 'Courier', 'Carrier', 'Bearer', 'Deliverer', 'Transporter', 'Shipper', 'Mover', 'Relocator',
  'Migrator', 'Traveler', 'Voyager', 'Navigator', 'Pilot', 'Captain', 'Commander', 'Leader', 'Guide', 'Escort',
  'Guard', 'Sentinel', 'Watchman', 'Lookout', 'Observer', 'Monitor', 'Supervisor', 'Overseer', 'Manager', 'Controller',
  'Director', 'Conductor', 'Orchestrator', 'Coordinator', 'Facilitator', 'Enabler', 'Empowerer', 'Motivator', 'Inspirer', 'Encourager',
  'Supporter', 'Backer', 'Sponsor', 'Patron', 'Benefactor', 'Donor', 'Contributor', 'Investor', 'Stakeholder', 'Shareholder',
  'Owner', 'Proprietor', 'Landlord', 'Tenant', 'Resident', 'Inhabitant', 'Citizen', 'National', 'Patriot', 'Loyalist',
  'Devotee', 'Follower', 'Disciple', 'Student', 'Learner', 'Scholar', 'Academic', 'Intellectual', 'Thinker', 'Philosopher',
  'Sage', 'Wise', 'Oracle', 'Prophet', 'Seer', 'Visionary', 'Dreamer', 'Imaginer', 'Creator', 'Inventor',
  'Innovator', 'Pioneer', 'Trailblazer', 'Pathfinder', 'Explorer', 'Discoverer', 'Finder', 'Seeker', 'Hunter', 'Tracker',
  'Pursuer', 'Chaser', 'Runner', 'Sprinter', 'Racer', 'Competitor', 'Contender', 'Challenger', 'Opponent', 'Rival',
  'Adversary', 'Enemy', 'Foe', 'Antagonist', 'Villain', 'Nemesis', 'Archrival', 'Sworn', 'Mortal', 'Deadly',
  'Lethal', 'Dangerous', 'Risky', 'Hazardous', 'Perilous', 'Treacherous', 'Deceitful', 'Cunning', 'Sly', 'Clever',
  'Smart', 'Intelligent', 'Brilliant', 'Genius', 'Mastermind', 'Brain', 'Mind', 'Thinker', 'Philosopher', 'Sage'
];

/**
 * Generates a random Xbox-style username
 * Multiple formats for maximum variety:
 * 1. Adjective + Noun + Number (e.g., CrazyChicken143)
 * 2. Noun + Adjective + Number (e.g., DragonEpic728)
 * 3. Adjective + Number + Noun (e.g., Swift123Wolf)
 * 4. Number + Adjective + Noun (e.g., 456MightyBear)
 * 5. Adjective + Noun + Number + X (e.g., CrazyChicken143X)
 * 6. Adjective + Noun + Number + Z (e.g., CrazyChicken143Z)
 * 7. Adjective + Noun + Number + 0 (e.g., CrazyChicken1430)
 * 8. Adjective + Noun + Number + 1 (e.g., CrazyChicken1431)
 */
export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // Multiple number ranges for more variety
  const numberRanges = [
    { min: 10, max: 99 },    // 2-digit: 10-99 (90 options)
    { min: 100, max: 999 },  // 3-digit: 100-999 (900 options)
    { min: 1000, max: 9999 } // 4-digit: 1000-9999 (9000 options)
  ];
  
  const selectedRange = numberRanges[Math.floor(Math.random() * numberRanges.length)];
  const number = Math.floor(Math.random() * (selectedRange.max - selectedRange.min + 1)) + selectedRange.min;
  
  // Randomly choose one of 8 formats
  const format = Math.floor(Math.random() * 8);
  
  switch (format) {
    case 0: return `${adjective}${noun}${number}`; // CrazyChicken143
    case 1: return `${noun}${adjective}${number}`; // DragonEpic728
    case 2: return `${adjective}${number}${noun}`; // Swift123Wolf
    case 3: return `${number}${adjective}${noun}`; // 456MightyBear
    case 4: return `${adjective}${noun}${number}X`; // CrazyChicken143X
    case 5: return `${adjective}${noun}${number}Z`; // CrazyChicken143Z
    case 6: return `${adjective}${noun}${number}0`; // CrazyChicken1430
    case 7: return `${adjective}${noun}${number}1`; // CrazyChicken1431
    default: return `${adjective}${noun}${number}`;
  }
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
 
 