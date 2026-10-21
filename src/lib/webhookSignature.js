import crypto from 'crypto';

export function verifySignature(payload, signature) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{64}$/.test(signature)) return false;
  try {
    const body = JSON.stringify(payload);
    if (typeof body !== 'string') return false;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
