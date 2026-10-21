import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';

// The app uses Next's compiler for ES modules; load the pure helper without
// changing the package module type or pulling UI code into this test.
const source = await readFile(new URL('../src/lib/webhookSignature.js', import.meta.url), 'utf8');
const { verifySignature } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('webhook signature is fail-closed, length-safe, and verifies payload integrity', () => {
  const old = process.env.WEBHOOK_SECRET;
  try {
    const body = { slug: 'test' };
    delete process.env.WEBHOOK_SECRET;
    assert.equal(verifySignature(body, 'a'.repeat(64)), false);
    process.env.WEBHOOK_SECRET = 'test-only-secret';
    assert.equal(verifySignature(undefined, 'a'.repeat(64)), false);
    for (const signature of [undefined, '', 'bad', ['a'.repeat(64)], 'z'.repeat(64)]) {
      assert.equal(verifySignature(body, signature), false);
    }
    const signature = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
    assert.equal(verifySignature(body, signature), true);
    assert.equal(verifySignature({ slug: 'tampered' }, signature), false);
  } finally {
    if (old === undefined) delete process.env.WEBHOOK_SECRET;
    else process.env.WEBHOOK_SECRET = old;
  }
});
