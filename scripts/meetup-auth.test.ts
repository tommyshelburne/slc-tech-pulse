import { describe, it, expect } from 'vitest';
import { createVerify, generateKeyPairSync } from 'node:crypto';
import { isConfigured, readAuthEnv, signMeetupJwt } from './meetup-auth';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const PRIVATE_PEM = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const PUBLIC_PEM = publicKey.export({ type: 'spki', format: 'pem' }).toString();

const CONFIG = {
  consumerKey: 'consumer-abc',
  signingKeyId: 'kid-xyz',
  privateKeyPem: PRIVATE_PEM,
  memberId: '123456',
};

const NOW = new Date('2026-04-26T12:00:00Z');

function decode(part: string): Record<string, unknown> {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

describe('signMeetupJwt', () => {
  it('produces a three-part JWT', () => {
    const jwt = signMeetupJwt(CONFIG, { now: NOW });
    expect(jwt.split('.')).toHaveLength(3);
  });

  it('encodes the expected header claims', () => {
    const [headerPart] = signMeetupJwt(CONFIG, { now: NOW }).split('.');
    const header = decode(headerPart);
    expect(header.alg).toBe('RS256');
    expect(header.typ).toBe('JWT');
    expect(header.kid).toBe('kid-xyz');
  });

  it('encodes the expected payload claims', () => {
    const [, payloadPart] = signMeetupJwt(CONFIG, { now: NOW, ttlSeconds: 90 }).split('.');
    const payload = decode(payloadPart);
    expect(payload.iss).toBe('consumer-abc');
    expect(payload.sub).toBe('123456');
    expect(payload.aud).toBe('api.meetup.com');
    expect(payload.iat).toBe(Math.floor(NOW.getTime() / 1000));
    expect(payload.exp).toBe(Math.floor(NOW.getTime() / 1000) + 90);
  });

  it('caps ttl at 120 seconds (Meetup max)', () => {
    const [, payloadPart] = signMeetupJwt(CONFIG, { now: NOW, ttlSeconds: 9999 }).split('.');
    const payload = decode(payloadPart);
    expect((payload.exp as number) - (payload.iat as number)).toBe(120);
  });

  it('signs with RS256 and the signature verifies against the matching public key', () => {
    const jwt = signMeetupJwt(CONFIG, { now: NOW });
    const [h, p, sig] = jwt.split('.');
    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${h}.${p}`);
    const sigBuf = Buffer.from(sig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    expect(verifier.verify(PUBLIC_PEM, sigBuf)).toBe(true);
  });

  it('is deterministic given the same inputs (RSA PKCS#1 v1.5 is deterministic)', () => {
    const a = signMeetupJwt(CONFIG, { now: NOW });
    const b = signMeetupJwt(CONFIG, { now: NOW });
    expect(a).toBe(b);
  });
});

describe('readAuthEnv + isConfigured', () => {
  it('reads all four env vars by name', () => {
    const env = readAuthEnv({
      MEETUP_CLIENT_KEY: 'k',
      MEETUP_SIGNING_KEY_ID: 's',
      MEETUP_MEMBER_ID: 'm',
      MEETUP_PRIVATE_KEY: 'p',
    });
    expect(env).toEqual({
      consumerKey: 'k',
      signingKeyId: 's',
      memberId: 'm',
      privateKeyPem: 'p',
    });
  });

  it('isConfigured returns false when any var is missing', () => {
    expect(isConfigured(readAuthEnv({}))).toBe(false);
    expect(
      isConfigured(
        readAuthEnv({
          MEETUP_CLIENT_KEY: 'k',
          MEETUP_SIGNING_KEY_ID: 's',
          MEETUP_MEMBER_ID: 'm',
        }),
      ),
    ).toBe(false);
  });

  it('isConfigured returns true when all four are present', () => {
    expect(
      isConfigured(
        readAuthEnv({
          MEETUP_CLIENT_KEY: 'k',
          MEETUP_SIGNING_KEY_ID: 's',
          MEETUP_MEMBER_ID: 'm',
          MEETUP_PRIVATE_KEY: 'p',
        }),
      ),
    ).toBe(true);
  });
});
