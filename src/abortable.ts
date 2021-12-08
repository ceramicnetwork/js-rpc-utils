export const abortableHandlerSymbol = Symbol('abortable')

export const abortedReasonSymbol = Symbol('aborted')

export function abortable<T>(source: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    return Promise.reject(abortedReasonSymbol)
  }

  let rejectAborted: (reason: typeof abortedReasonSymbol) => void
  const abortion = new Promise<never>((_resolve, reject) => {
    rejectAborted = reject
  })
  signal.addEventListener('abort', () => {
    rejectAborted(abortedReasonSymbol)
  })
  return Promise.race([source, abortion])
}

export function isAborted(reason: unknown): boolean {
  return reason === abortedReasonSymbol
}
