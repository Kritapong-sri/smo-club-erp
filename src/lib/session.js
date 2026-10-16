import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getSessionKey() {
  const secret = process.env.SESSION_SECRET || 'smo-club-erp-super-secret-key';
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days expiration
    .sign(getSessionKey());
}

export async function decrypt(input) {
  try {
    const { payload } = await jwtVerify(input, getSessionKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(user) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  // Store relevant user details in the session token
  const sessionData = {
    userId: user.id,
    studentId: user.studentId,
    role: user.role,
    positionTitle: user.positionTitle,
    departmentId: user.departmentId,
    name: user.nickname || user.firstNameTh || 'ผู้ใช้งาน',
  };
  
  const session = await encrypt(sessionData);

  // Use next/headers to set cookie
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });
}
