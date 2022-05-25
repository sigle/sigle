/**
 * Required when mocking Date objects. Jest is creating some issues with fastify.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fakeTimerConfigDate: any = {
  doNotFake: [
    'hrtime',
    'nextTick',
    'performance',
    'queueMicrotask',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'requestIdleCallback',
    'cancelIdleCallback',
    'setImmediate',
    'clearImmediate',
    'setInterval',
    'clearInterval',
    'setTimeout',
    'clearTimeout',
  ],
};
