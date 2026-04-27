import { createPrivateKey, createSign } from 'node:crypto';

export interface MeetupAuthConfig {
  consumerKey: string;     // OAuth consumer client_id; doubles as JWT iss
  signingKeyId: string;    // kid for the public key uploaded to your consumer
  privateKeyPem: string;   // RSA private key (PKCS#8 or PKCS#1 PEM)
  memberId: string;        // Meetup member id of the user who authorized the consumer
}

export interface SignJwtOptions {
  now: Date;
  ttlSeconds?: number;     // max 120 per Meetup; default 60
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function signMeetupJwt(config: MeetupAuthConfig, options: SignJwtOptions): string {
  const { consumerKey, signingKeyId, privateKeyPem, memberId } = config;
  const ttl = Math.min(options.ttlSeconds ?? 60, 120);
  const iat = Math.floor(options.now.getTime() / 1000);

  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: signingKeyId,
  };

  const payload = {
    iss: consumerKey,
    sub: memberId,
    aud: 'api.meetup.com',
    iat,
    exp: iat + ttl,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = createPrivateKey(privateKeyPem);
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer.sign(key);

  return `${signingInput}.${base64url(signature)}`;
}

export interface MeetupTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export async function exchangeJwtForAccessToken(jwt: string): Promise<MeetupTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  const res = await fetch('https://secure.meetup.com/oauth2/access', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meetup token exchange failed: HTTP ${res.status} — ${text}`);
  }

  return (await res.json()) as MeetupTokenResponse;
}

export async function getAccessToken(config: MeetupAuthConfig, now: Date = new Date()): Promise<string> {
  const jwt = signMeetupJwt(config, { now });
  const token = await exchangeJwtForAccessToken(jwt);
  return token.access_token;
}

export interface MeetupAuthEnv {
  consumerKey: string | undefined;
  signingKeyId: string | undefined;
  memberId: string | undefined;
  privateKeyPem: string | undefined;
}

export function readAuthEnv(env: NodeJS.ProcessEnv = process.env): MeetupAuthEnv {
  return {
    consumerKey: env.MEETUP_CLIENT_KEY,
    signingKeyId: env.MEETUP_SIGNING_KEY_ID,
    memberId: env.MEETUP_MEMBER_ID,
    privateKeyPem: env.MEETUP_PRIVATE_KEY,
  };
}

export function isConfigured(env: MeetupAuthEnv): env is MeetupAuthConfig {
  return !!(env.consumerKey && env.signingKeyId && env.memberId && env.privateKeyPem);
}
