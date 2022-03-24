/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as polyfill from 'abort-controller'

if (!globalThis.AbortController) {
  globalThis.AbortController = polyfill.AbortController
}
if (!globalThis.AbortSignal) {
  globalThis.AbortSignal = polyfill.AbortSignal
}

import { abortable, abortedReasonSymbol, isAborted } from '../src'

function delayResolve<T = any>(value: T, time = 0): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(resolve, time, value)
  })
}

function delayReject<T = any>(reason: T, time = 0): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(reject, time, reason)
  })
}

describe('abortable', () => {
  describe('isAborted()', () => {
    test('matches symbol', () => {
      expect(isAborted(abortedReasonSymbol)).toBe(true)
    })

    test('does not match symbol', () => {
      expect(isAborted(Symbol('aborted'))).toBe(false)
    })
  })

  describe('abortable()', () => {
    describe('resolves the source promise when not aborted', () => {
      test('sync', async () => {
        const controller = new AbortController()
        const promise = Promise.resolve('ok')
        await expect(abortable(promise, controller.signal)).resolves.toBe('ok')
      })

      test('async', async () => {
        const controller = new AbortController()
        const abortTimer = setTimeout(() => {
          controller.abort()
        }, 5)
        await expect(abortable(delayResolve('ok'), controller.signal)).resolves.toBe('ok')
        clearTimeout(abortTimer)
      })
    })

    describe('rejects the source promise when not aborted', () => {
      test('sync', async () => {
        const controller = new AbortController()
        await expect(abortable(Promise.reject('foo'), controller.signal)).rejects.toBe('foo')
      })

      test('async', async () => {
        const controller = new AbortController()
        const abortTimer = setTimeout(() => {
          controller.abort()
        }, 5)
        await expect(abortable(delayReject('foo'), controller.signal)).rejects.toBe('foo')
        clearTimeout(abortTimer)
      })
    })

    describe('rejects with the aborted reason', () => {
      test('sync', async () => {
        const controller = new AbortController()
        controller.abort()
        await expect(abortable(Promise.resolve('ok'), controller.signal)).rejects.toBe(
          abortedReasonSymbol
        )
      })

      test('async', async () => {
        const controller = new AbortController()
        const abortTimer = setTimeout(() => {
          controller.abort()
        }, 5)
        await expect(abortable(delayReject('foo', 10), controller.signal)).rejects.toBe(
          abortedReasonSymbol
        )
        clearTimeout(abortTimer)
      })
    })
  })
})
