/**
 * Extracts transaction hash and status from a transaction receipt
 * @param receipt The transaction receipt object
 * @returns Object containing transaction details
 */
export function extractTransactionInfo(receipt: any): { 
  transactionHash: string;
  status: number | string;
  from: string;
  to: string;
  amount: string;
} {
  return {
    transactionHash: receipt.transactionHash,
    status: receipt.status,
    from: receipt.from,
    to: receipt.to,
    amount: receipt.events?.[0]?.args?.[2]?.toString() || "0"
  };
}

/**
 * Password validation utility
 * Checks if a password meets security requirements
 */
export function check_password(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for digit
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Determine strength
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength = 'strong';
    } else {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Validates if a string is a valid Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates if a string is a valid Tron address
 */
export function isValidTronAddress(address: string): boolean {
  return /^T[A-Za-z1-9]{33}$/.test(address);
}

/**
 * Validates if a string is a valid private key
 */
export function isValidPrivateKey(privateKey: string): boolean {
  // Remove 0x prefix if present
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  return /^[a-fA-F0-9]{64}$/.test(cleanKey);
}

/**
 * Formats a balance string to a specific number of decimal places
 */
export function formatBalance(balance: string | number, decimals: number = 4): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return num.toFixed(decimals);
}

/**
 * Converts Wei to Ether
 */
export function weiToEther(wei: string | number): string {
  const weiNum = typeof wei === 'string' ? BigInt(wei) : BigInt(wei.toString());
  const etherValue = Number(weiNum) / Math.pow(10, 18);
  return etherValue.toString();
}

/**
 * Converts Ether to Wei
 */
export function etherToWei(ether: string | number): string {
  const etherNum = typeof ether === 'string' ? parseFloat(ether) : ether;
  const weiValue = BigInt(Math.floor(etherNum * Math.pow(10, 18)));
  return weiValue.toString();
}

/**
 * Truncates an address for display purposes
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Validates if a string is a valid transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Generates a random hex string of specified length
 */
export function generateRandomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleeps for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(jsonString: string): { data: T | null; error: string | null } {
  try {
    const data = JSON.parse(jsonString) as T;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown parsing error' };
  }
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a timestamp to a readable date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Gets current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes a string by removing potentially harmful characters
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>'"&]/g, '');
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError!;
} 