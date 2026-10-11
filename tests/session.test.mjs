import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSession, readSession, clearSession } from '../src/services/session.js';

const response = { access_token: 'test-fixture-token', token_type: 'Bearer', expires_in: 28800, role: 'admin' };
test('official login response creates an eight-hour session', () => {
  assert.deepEqual(parseSession(response, 1000), { token: response.access_token, role: 'admin', expiresAt: 28801000 });
});
test('an explicit data envelope is supported without inventing fields', () => {
  assert.equal(parseSession({ data: response }, 0).expiresAt, 28800000);
});
test('malformed responses, unknown roles and missing expiry are rejected', () => {
  for (const invalid of [{}, { ...response, access_token: '' }, { ...response, role: 'student' }, { ...response, expires_in: undefined }, { ...response, expires_in: '28800' }, { ...response, expires_in: 0 }, { ...response, token_type: 'Basic' }]) assert.throws(() => parseSession(invalid));
});
test('expired and incomplete persisted sessions are rejected and logout clears only session keys', t => {
  const values = new Map([['token', 'test-fixture-token'], ['role', 'admin'], ['expiresAt', '11000'], ['preference', 'keep']]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, removeItem: key => values.delete(key) };
  t.mock.method(Date, 'now', () => 10000);
  assert.equal(readSession().role, 'admin');
  values.set('expiresAt', '9000'); assert.equal(readSession(), null);
  values.set('expiresAt', '11000'); values.set('role', 'student'); assert.equal(readSession(), null);
  clearSession(); assert.deepEqual([...values], [['preference', 'keep']]);
});
