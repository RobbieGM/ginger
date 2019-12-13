export function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
  let timeout: number | undefined;
  return ((...args: any[]) => {
    const delayed = ((...innerArgs: any[]) => {
      timeout = undefined;
      return func(...innerArgs);
    }) as T;
    clearTimeout(timeout);
    timeout = window.setTimeout(delayed.bind(null, ...args), delay);
  }) as T;
}
