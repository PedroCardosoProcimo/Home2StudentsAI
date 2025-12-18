export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates password against security requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Checks if password and confirmation match
 */
export const validatePasswordsMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

/**
 * Gets a user-friendly strength indicator for the password
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const validation = validatePassword(password);

  if (!validation.isValid) {
    return 'weak';
  }

  // Check for additional criteria
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 12;

  if (hasSpecialChar && isLongEnough) {
    return 'strong';
  }

  if (hasSpecialChar || isLongEnough) {
    return 'medium';
  }

  return 'weak';
};
