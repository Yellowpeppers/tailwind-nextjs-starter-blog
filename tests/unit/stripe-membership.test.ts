import test from 'node:test'
import assert from 'node:assert/strict'

import { computeProfileMembership } from '../../lib/stripe-membership'

test('computeProfileMembership: 无订阅 => free', () => {
  const result = computeProfileMembership([])
  assert.equal(result.subscriptionStatus, 'free')
  assert.equal(result.isPro, false)
})

test('computeProfileMembership: active => premium', () => {
  const result = computeProfileMembership([
    { id: 'sub_1', status: 'active', created: 100, current_period_end: 200 },
  ])
  assert.equal(result.subscriptionStatus, 'premium')
  assert.equal(result.isPro, true)
  assert.equal(result.primarySubscriptionId, 'sub_1')
})

test('computeProfileMembership: trialing => premium', () => {
  const result = computeProfileMembership([
    { id: 'sub_1', status: 'trialing', created: 100, current_period_end: 200 },
  ])
  assert.equal(result.subscriptionStatus, 'premium')
  assert.equal(result.isPro, true)
})

test('computeProfileMembership: canceled => free', () => {
  const result = computeProfileMembership([
    { id: 'sub_1', status: 'canceled', created: 100, current_period_end: 200 },
  ])
  assert.equal(result.subscriptionStatus, 'free')
  assert.equal(result.isPro, false)
})

test('computeProfileMembership: 多条订阅时优先最新的 active/trialing', () => {
  const result = computeProfileMembership([
    { id: 'sub_old', status: 'trialing', created: 10, current_period_end: 20 },
    { id: 'sub_new', status: 'active', created: 99, current_period_end: 200 },
    { id: 'sub_cancel', status: 'canceled', created: 120, current_period_end: 300 },
  ])
  assert.equal(result.subscriptionStatus, 'premium')
  assert.equal(result.isPro, true)
  assert.equal(result.primarySubscriptionId, 'sub_new')
})
