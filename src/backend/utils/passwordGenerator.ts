/**
 * Generates a secure random password for student accounts
 * Uses crypto.getRandomValues() for cryptographic randomness
 *
 * @param length - Password length (default 16 characters)
 * @returns A secure random password string
 */
export const generateSecurePassword = (length: number = 16): string => {
  // Define character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + special;

  // Ensure at least one character from each set
  const requiredChars = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  // Generate remaining random characters
  const remainingLength = length - requiredChars.length;
  const randomChars: string[] = [];

  // Use crypto.getRandomValues for secure random generation
  const randomValues = new Uint32Array(remainingLength);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = randomValues[i] % allChars.length;
    randomChars.push(allChars[randomIndex]);
  }

  // Combine and shuffle all characters
  const allPasswordChars = [...requiredChars, ...randomChars];

  // Shuffle using Fisher-Yates algorithm with crypto random
  const shuffleValues = new Uint32Array(allPasswordChars.length);
  crypto.getRandomValues(shuffleValues);

  for (let i = allPasswordChars.length - 1; i > 0; i--) {
    const j = shuffleValues[i] % (i + 1);
    [allPasswordChars[i], allPasswordChars[j]] = [allPasswordChars[j], allPasswordChars[i]];
  }

  return allPasswordChars.join('');
};
