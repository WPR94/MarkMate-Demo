// Password strength validation for UK GDPR security requirements
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check (NCSC recommendation: 8+ characters)
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Character variety checks
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const varietyCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (varietyCount >= 3) {
    score += 1;
  } else {
    feedback.push('Include uppercase, lowercase, numbers, and special characters');
  }

  // Common password check (basic list)
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'Password1', 
    'password123', 'admin123', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score = 0;
    feedback.push('Password is too common and easily guessable');
  }

  // Repeated characters check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters (e.g., "aaa" or "111")');
    score = Math.max(0, score - 1);
  }

  // Sequential characters check
  const sequences = ['abc', '123', 'qwe', 'xyz'];
  if (sequences.some(seq => password.toLowerCase().includes(seq))) {
    feedback.push('Avoid sequential characters');
  }

  // Final validation
  const isValid = score >= 2 && feedback.length === 0;

  if (isValid && feedback.length === 0) {
    feedback.push('Strong password!');
  }

  return {
    score: Math.min(score, 4),
    feedback,
    isValid,
  };
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Weak';
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-blue-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
}
