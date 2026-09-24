/**
 * 防抖函数 - 等待 wait 毫秒后执行，在 wait 毫秒内重复触发则重新计时
 * 每次被新调用取代时，前一次返回的 Promise 会以 DebounceSupersededError 被 reject
 * @param fn 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行第一次调用
 */

export class DebounceSupersededError extends Error {
  constructor() {
    super('debounce: superseded by a newer call');
    this.name = 'DebounceSupersededError';
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  immediate?: boolean,
): ((
  ...args: Parameters<T>
) => Promise<Awaited<ReturnType<T>>> | ReturnType<T>) & { cancel(): void } {
  let timeout: number | null = null;
  let pendingReject: ((reason: unknown) => void) | null = null;
  let result: ReturnType<T>;

  const debounced = function (this: any, ...args: Parameters<T>): any {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }

    if (pendingReject) {
      pendingReject(new DebounceSupersededError());
      pendingReject = null;
    }

    if (immediate) {
      const callNow = timeout === null;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait) as unknown as number;
      if (callNow) {
        result = fn.apply(this, args);
      }
      return result;
    } else {
      return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
        pendingReject = reject;
        timeout = setTimeout(() => {
          pendingReject = null;
          timeout = null;
          try {
            const res = fn.apply(this, args) as ReturnType<T>;
            if (
              res != null &&
              typeof (res as { then?: unknown }).then === 'function'
            ) {
              (res as unknown as Promise<Awaited<ReturnType<T>>>).then(
                resolve,
                reject,
              );
            } else {
              resolve(res as Awaited<ReturnType<T>>);
            }
          } catch (error) {
            reject(error);
          }
        }, wait) as unknown as number;
      });
    }
  };

  debounced.cancel = function () {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (pendingReject) {
      pendingReject(new DebounceSupersededError());
      pendingReject = null;
    }
  };

  return debounced;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
