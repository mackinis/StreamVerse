
import crypto from 'crypto';

const ITERATIONS = 10000;
const KEYLEN = 64;
const DIGEST = 'sha512';

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return { salt, hash };
}

export async function verifyPassword(password: string, storedSalt: string, storedHash: string): Promise<boolean> {
  const hashToCompare = crypto.pbkdf2Sync(password, storedSalt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(hashToCompare, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch (error) {
    // This can happen if buffers have different lengths, which means they are not equal.
    return false;
  }
}

export async function generateVerificationToken(length: number = 24): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    token += chars[randomBytes[i] % chars.length];
  }
  return token;
}
