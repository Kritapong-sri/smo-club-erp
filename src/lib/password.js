import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const HASH_PREFIX = 'scrypt';

function verifyLegacyPassword(password, expectedPassword) {
  const actualDigest = createHash('sha256').update(password, 'utf8').digest();
  const expectedDigest = createHash('sha256').update(expectedPassword, 'utf8').digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

export function isPasswordHash(value) {
  return typeof value === 'string' && value.startsWith(`${HASH_PREFIX}$`);
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS);

  return [
    HASH_PREFIX,
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    salt.toString('base64url'),
    Buffer.from(derivedKey).toString('base64url'),
  ].join('$');
}

export async function verifyPassword(password, storedPassword, fallbackPassword = '') {
  if (!isPasswordHash(storedPassword)) {
    return verifyLegacyPassword(password, storedPassword || fallbackPassword);
  }

  const [, nValue, rValue, pValue, saltValue, hashValue] = storedPassword.split('$');
  const N = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);

  if (!N || !r || !p || !saltValue || !hashValue) return false;

  try {
    const expectedKey = Buffer.from(hashValue, 'base64url');
    const derivedKey = Buffer.from(
      await scrypt(password, Buffer.from(saltValue, 'base64url'), expectedKey.length, { N, r, p })
    );

    return derivedKey.length === expectedKey.length && timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}
